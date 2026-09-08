// M17-03 — Alle Antworten hier sind erfunden; es wird nichts über das Netz
// geholt. Geprüft wird die eine Eigenschaft, auf die es ankommt: „unverändert“
// darf nur dann herauskommen, wenn die Seite wirklich unverändert ist.
import { describe, expect, it } from 'vitest';

import {
  hashe,
  ladeWatchlist,
  meldepflichtig,
  normalisiere,
  pruefeAlle,
  pruefeEintrag,
} from '../../scripts/monitor/source-drift.ts';
import type { WatchEntry, WatchState } from '../../src/domain/schemas/watchlist.ts';

const EINTRAG: WatchEntry = {
  watchId: 'test-quelle',
  title: 'Testseite',
  url: 'https://example.org/regeln',
  belongsTo: 'Testregelsatz',
  expectedMarker: 'Amtlicher Hinweis',
  meaning: 'Ohne diese Seite gibt es keine Regel.',
  reviewedAt: '2026-09-08',
};

function antwort(
  koerper: string,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  const status = init.status ?? 200;
  if (status === 304) {
    return {
      status,
      ok: false,
      headers: new Headers(init.headers ?? {}),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as Response;
  }
  return new Response(koerper, { status, headers: init.headers ?? {} });
}

function stand(hash: string, etag: string | null = null): WatchState {
  return { watchId: EINTRAG.watchId, contentHash: hash, etag, lastModified: null };
}

const SEITE = '<html><body><h1>Amtlicher Hinweis</h1><p>Inhalt</p></body></html>';

describe('Normalisierung', () => {
  it('entfernt Skripte, Stile und Kommentare', () => {
    const mitLaerm = `<style>a{}</style><script>var t=${Date.now()};</script><!-- Build 42 -->${SEITE}`;
    expect(normalisiere(Buffer.from(mitLaerm))).toBe(normalisiere(Buffer.from(SEITE)));
  });

  it('lässt den eigentlichen Text stehen', () => {
    const geaendert = SEITE.replace('Inhalt', 'Anderer Inhalt');
    expect(normalisiere(Buffer.from(geaendert))).not.toBe(normalisiere(Buffer.from(SEITE)));
  });

  it('kommt mit Latin-1-Bytes zurecht, statt an der Kodierung zu scheitern', () => {
    const latin1 = Buffer.from('Amtlicher Hinweis: Geb\xfchren', 'latin1');
    expect(() => normalisiere(latin1)).not.toThrow();
    expect(normalisiere(latin1)).toContain('Amtlicher Hinweis');
  });
});

describe('Befund je Antwort', () => {
  const hash = hashe(normalisiere(Buffer.from(SEITE)));

  it('meldet bei gleichem Inhalt unveraendert', async () => {
    const ergebnis = await pruefeEintrag(EINTRAG, stand(hash), {
      fetchImpl: async () => antwort(SEITE),
    });
    expect(ergebnis.befund).toBe('unveraendert');
  });

  it('meldet bei 304 unveraendert und behält den alten Stand', async () => {
    const ergebnis = await pruefeEintrag(EINTRAG, stand(hash, '"abc"'), {
      fetchImpl: async () => antwort('', { status: 304 }),
    });
    expect(ergebnis.befund).toBe('unveraendert');
    expect(ergebnis.contentHash).toBe(hash);
  });

  it('schickt ETag und Last-Modified mit, wenn es einen Stand gibt', async () => {
    let gesehen: Headers | undefined;
    await pruefeEintrag(
      EINTRAG,
      {
        watchId: EINTRAG.watchId,
        contentHash: hash,
        etag: '"abc"',
        lastModified: 'Mon, 07 Sep 2026 21:03:11 GMT',
      },
      {
        fetchImpl: async (_url, init) => {
          gesehen = new Headers(init?.headers);
          return antwort('', { status: 304 });
        },
      },
    );
    expect(gesehen?.get('if-none-match')).toBe('"abc"');
    expect(gesehen?.get('if-modified-since')).toBe('Mon, 07 Sep 2026 21:03:11 GMT');
  });

  it('meldet geänderten Text als geaendert', async () => {
    const ergebnis = await pruefeEintrag(EINTRAG, stand(hash), {
      fetchImpl: async () => antwort(SEITE.replace('Inhalt', 'Neuer Inhalt')),
    });
    expect(ergebnis.befund).toBe('geaendert');
    expect(ergebnis.begruendung).toContain(EINTRAG.meaning);
  });

  it('meldet eine Bot-Prüfung als nicht_pruefbar, nicht als unveraendert', async () => {
    const botSeite = '<html><head><title>Site verification</title></head><body>…</body></html>';
    const ergebnis = await pruefeEintrag(EINTRAG, stand(hash), {
      fetchImpl: async () => antwort(botSeite),
    });
    expect(ergebnis.befund).toBe('nicht_pruefbar');
    // Der alte Vergleichsstand bleibt stehen: eine Bot-Seite wird nie zum Soll.
    expect(ergebnis.contentHash).toBe(hash);
  });

  it('meldet eine leere 202-Antwort als nicht_pruefbar', async () => {
    const ergebnis = await pruefeEintrag(EINTRAG, stand(hash), {
      fetchImpl: async () => antwort('', { status: 202 }),
    });
    expect(ergebnis.befund).toBe('nicht_pruefbar');
  });

  it('meldet einen HTTP-Fehler als fehler und behält den Stand', async () => {
    const ergebnis = await pruefeEintrag(EINTRAG, stand(hash), {
      fetchImpl: async () => antwort('weg', { status: 500 }),
    });
    expect(ergebnis.befund).toBe('fehler');
    expect(ergebnis.contentHash).toBe(hash);
  });

  it('meldet einen Netzfehler als fehler statt zu werfen', async () => {
    const ergebnis = await pruefeEintrag(EINTRAG, stand(hash), {
      fetchImpl: async () => {
        throw new Error('getaddrinfo ENOTFOUND');
      },
    });
    expect(ergebnis.befund).toBe('fehler');
  });

  it('meldet ohne Vergleichsstand neu, nicht unveraendert', async () => {
    const ergebnis = await pruefeEintrag(EINTRAG, undefined, {
      fetchImpl: async () => antwort(SEITE),
    });
    expect(ergebnis.befund).toBe('neu');
    expect(ergebnis.contentHash).toBe(hash);
  });

  it('ruft kein http auf', async () => {
    const ergebnis = await pruefeEintrag(
      { ...EINTRAG, url: 'http://example.org/regeln' },
      undefined,
      {
        fetchImpl: async () => {
          throw new Error('hätte nicht abgerufen werden dürfen');
        },
      },
    );
    expect(ergebnis.befund).toBe('fehler');
  });
});

describe('Lauf über die Liste', () => {
  it('fragt die Seiten nacheinander ab, nicht gleichzeitig', async () => {
    let gleichzeitig = 0;
    let hoechststand = 0;
    const eintraege = [EINTRAG, { ...EINTRAG, watchId: 'zweite-quelle' }];
    await pruefeAlle(eintraege, new Map(), {
      fetchImpl: async () => {
        gleichzeitig += 1;
        hoechststand = Math.max(hoechststand, gleichzeitig);
        await new Promise((weiter) => setTimeout(weiter, 5));
        gleichzeitig -= 1;
        return antwort(SEITE);
      },
    });
    expect(hoechststand).toBe(1);
  });

  it('hält nur „unveraendert“ für nicht meldepflichtig', () => {
    for (const befund of ['geaendert', 'nicht_pruefbar', 'fehler', 'neu'] as const) {
      expect(
        meldepflichtig({
          watchId: 'x',
          befund,
          begruendung: '',
          contentHash: null,
          etag: null,
          lastModified: null,
        }),
      ).toBe(true);
    }
    expect(
      meldepflichtig({
        watchId: 'x',
        befund: 'unveraendert',
        begruendung: '',
        contentHash: null,
        etag: null,
        lastModified: null,
      }),
    ).toBe(false);
  });
});

describe('Die echte Beobachtungsliste', () => {
  it('ist gültig und nennt nur https-Adressen', () => {
    const liste = ladeWatchlist();
    expect(liste.entries.length).toBeGreaterThan(0);
    for (const eintrag of liste.entries) {
      expect(eintrag.url.startsWith('https://')).toBe(true);
      // Der Marker wird byteweise gesucht; alles jenseits von ASCII wäre eine
      // Zeichensatzfalle.
      expect(/^[\x20-\x7e]+$/.test(eintrag.expectedMarker)).toBe(true);
    }
  });

  it('hat eindeutige Schlüssel', () => {
    const ids = ladeWatchlist().entries.map((eintrag) => eintrag.watchId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
