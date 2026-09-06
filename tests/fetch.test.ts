// M06-02 — Der Abruf ist eng begrenzt. Alle Antworten hier sind erfunden;
// es wird nichts über das Netz geholt.
import { describe, expect, it, vi } from 'vitest';

import {
  allowedHosts,
  assertAllowedUrl,
  fetchSource,
  safeUrlForLog,
} from '../scripts/ingest/fetch.ts';
import { IngestError } from '../scripts/ingest/types.ts';

const GOT = 'got-2022-gesetze-im-internet';
const HOSTS = allowedHosts();

function antwort(
  body: string | Uint8Array,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  const status = init.status ?? 200;
  const headers = init.headers ?? {};
  // Der Response-Konstruktor verbietet 204/304 mit Körper; für diese Fälle
  // wird eine minimale Attrappe gebaut.
  if (status === 204 || status === 304) {
    return {
      status,
      ok: false,
      headers: new Headers(headers),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as Response;
  }
  const daten: BodyInit = typeof body === 'string' ? body : new Blob([body as BlobPart]);
  return new Response(daten, { status, headers });
}

const sofort = async () => {};

describe('Schädliche und unerlaubte Adressen', () => {
  it.each(['http://example.invalid/x', 'ftp://example.invalid/x'])(
    'lehnt das Schema in %s ab',
    (url) => {
      expect(() => assertAllowedUrl(GOT, url, HOSTS)).toThrow(/Nur https/);
    },
  );

  it.each(['file:///etc/passwd', 'data:text/plain,hallo', 'javascript:alert(1)'])(
    'lehnt %s ab',
    (url) => {
      expect(() => assertAllowedUrl(GOT, url, HOSTS)).toThrow(IngestError);
    },
  );

  it('lehnt einen Host ab, der nicht in der Registry steht', () => {
    expect(() => assertAllowedUrl(GOT, 'https://angreifer.example/feed', HOSTS)).toThrow(
      /nicht in der Source Registry/,
    );
  });

  it('lehnt eine nicht parsebare Adresse ab', () => {
    expect(() => assertAllowedUrl(GOT, 'kein://', HOSTS)).toThrow(IngestError);
  });

  it('akzeptiert die registrierte Distribution', () => {
    const url = assertAllowedUrl(GOT, 'https://www.gesetze-im-internet.de/got_2022/xml.zip', HOSTS);
    expect(url.host).toBe('www.gesetze-im-internet.de');
  });

  it('enthält nur Hosts der erfassten Quellen', () => {
    expect([...HOSTS].sort()).toEqual(['download.geofabrik.de', 'www.gesetze-im-internet.de']);
  });
});

describe('Logs verraten keine Zugangsdaten', () => {
  it('entfernt Query und Fragment', () => {
    expect(safeUrlForLog('https://example.invalid/feed?token=geheim123#abschnitt')).toBe(
      'https://example.invalid/feed',
    );
  });

  it('nennt einen Fehlertext ohne Query', async () => {
    const fetchImpl = vi.fn(async () => antwort('', { status: 500 }));
    await expect(
      fetchSource(GOT, { fetchImpl: fetchImpl as unknown as typeof fetch, sleep: sofort }),
    ).rejects.toThrow(/gesetze-im-internet\.de\/got_2022\/xml\.zip antwortet mit 500/);
  });
});

describe('Weiterleitungen', () => {
  it('folgt einer erlaubten Weiterleitung', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        antwort('', {
          status: 302,
          headers: { location: 'https://www.gesetze-im-internet.de/got_2022/neu.zip' },
        }),
      )
      .mockResolvedValueOnce(antwort('inhalt'));

    const ergebnis = await fetchSource(GOT, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep: sofort,
    });
    expect(ergebnis.status).toBe('fetched');
    expect(ergebnis.resource?.url).toContain('/neu.zip');
  });

  it('lehnt eine Weiterleitung auf einen fremden Host ab', async () => {
    const fetchImpl = vi.fn(async () =>
      antwort('', { status: 302, headers: { location: 'https://angreifer.example/x' } }),
    );
    await expect(
      fetchSource(GOT, { fetchImpl: fetchImpl as unknown as typeof fetch, sleep: sofort }),
    ).rejects.toThrow(/nicht in der Source Registry/);
  });

  it('lehnt eine Weiterleitung auf ein anderes Schema ab', async () => {
    const fetchImpl = vi.fn(async () =>
      antwort('', { status: 302, headers: { location: 'http://www.gesetze-im-internet.de/x' } }),
    );
    await expect(
      fetchSource(GOT, { fetchImpl: fetchImpl as unknown as typeof fetch, sleep: sofort }),
    ).rejects.toThrow(/Nur https/);
  });

  it('bricht bei einer Weiterleitungsschleife ab', async () => {
    const fetchImpl = vi.fn(async () =>
      antwort('', {
        status: 302,
        headers: { location: 'https://www.gesetze-im-internet.de/got_2022/xml.zip' },
      }),
    );
    await expect(
      fetchSource(GOT, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxRedirects: 2,
        sleep: sofort,
      }),
    ).rejects.toThrow(/Mehr als 2 Weiterleitungen/);
  });

  it('lehnt eine Weiterleitung ohne Location ab', async () => {
    const fetchImpl = vi.fn(async () => antwort('', { status: 301 }));
    await expect(
      fetchSource(GOT, { fetchImpl: fetchImpl as unknown as typeof fetch, sleep: sofort }),
    ).rejects.toThrow(/ohne Location/);
  });
});

describe('Kaputte und zu große Antworten', () => {
  it('lehnt eine zu groß angekündigte Antwort ab, ohne sie zu lesen', async () => {
    const fetchImpl = vi.fn(async () =>
      antwort('x', { headers: { 'content-length': '999999999' } }),
    );
    await expect(
      fetchSource(GOT, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxBytes: 1024,
        sleep: sofort,
      }),
    ).rejects.toThrow(/kündigt 999999999 Byte an/);
  });

  it('lehnt eine zu große Antwort ohne content-length ab', async () => {
    const gross = new Uint8Array(2048);
    const fetchImpl = vi.fn(async () => antwort(gross));
    await expect(
      fetchSource(GOT, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxBytes: 1024,
        sleep: sofort,
      }),
    ).rejects.toThrow(/Grenze ist 1024/);
  });

  it('lehnt eine leere Antwort ab, statt sie als gültigen Stand zu übernehmen', async () => {
    const fetchImpl = vi.fn(async () => antwort(''));
    await expect(
      fetchSource(GOT, { fetchImpl: fetchImpl as unknown as typeof fetch, sleep: sofort }),
    ).rejects.toThrow(/leer/);
  });

  it('meldet einen Fehlerstatus mit Quelle und Schritt', async () => {
    const fetchImpl = vi.fn(async () => antwort('x', { status: 404 }));
    try {
      await fetchSource(GOT, { fetchImpl: fetchImpl as unknown as typeof fetch, sleep: sofort });
      throw new Error('hätte werfen müssen');
    } catch (fehler) {
      expect(fehler).toBeInstanceOf(IngestError);
      expect((fehler as IngestError).step).toBe('fetch');
    }
  });
});

describe('Rücksicht auf die Quelle', () => {
  it('beachtet Retry-After und versucht es begrenzt erneut', async () => {
    const wartezeiten: number[] = [];
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(antwort('', { status: 429, headers: { 'retry-after': '2' } }))
      .mockResolvedValueOnce(antwort('inhalt'));

    const ergebnis = await fetchSource(GOT, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep: async (ms) => {
        wartezeiten.push(ms);
      },
    });

    expect(wartezeiten).toEqual([2000]);
    expect(ergebnis.status).toBe('fetched');
  });

  it('deckelt eine überlange Retry-After-Angabe', async () => {
    const wartezeiten: number[] = [];
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(antwort('', { status: 503, headers: { 'retry-after': '86400' } }))
      .mockResolvedValueOnce(antwort('inhalt'));

    await fetchSource(GOT, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      maxRetryDelayMs: 30_000,
      sleep: async (ms) => {
        wartezeiten.push(ms);
      },
    });
    expect(wartezeiten).toEqual([30_000]);
  });

  it('gibt nach der erlaubten Zahl von Versuchen auf, statt endlos zu wiederholen', async () => {
    const fetchImpl = vi.fn(async () => antwort('', { status: 429 }));
    await expect(
      fetchSource(GOT, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxRetries: 2,
        sleep: sofort,
      }),
    ).rejects.toThrow(/nach 3 Versuchen/);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('behandelt 304 als reguläres Ergebnis ohne neuen Inhalt', async () => {
    const fetchImpl = vi.fn(async () => antwort('', { status: 304 }));
    const ergebnis = await fetchSource(GOT, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      etag: '"abc"',
      sleep: sofort,
    });
    expect(ergebnis.status).toBe('not_modified');
    expect(ergebnis.resource).toBeNull();
  });

  it('sendet den bedingten Abruf mit', async () => {
    let kopfzeilen: Record<string, string> | undefined;
    const fetchImpl = (async (_eingabe: unknown, init?: RequestInit) => {
      kopfzeilen = init?.headers as Record<string, string> | undefined;
      return antwort('inhalt');
    }) as unknown as typeof fetch;

    await fetchSource(GOT, {
      fetchImpl,
      etag: '"abc"',
      lastModified: 'Fri, 07 Apr 2023 19:30:11 GMT',
      sleep: sofort,
    });
    expect(kopfzeilen?.['if-none-match']).toBe('"abc"');
    expect(kopfzeilen?.['if-modified-since']).toBe('Fri, 07 Apr 2023 19:30:11 GMT');
  });
});

describe('Keine Adresse von außen', () => {
  it('nimmt nur eine Quell-ID entgegen und lehnt Unbekanntes ab', async () => {
    await expect(fetchSource('gibt-es-nicht')).rejects.toThrow(/Unbekannte Quelle/);
  });

  it('ruft genau die registrierte Distribution ab', async () => {
    const aufrufe: string[] = [];
    const fetchImpl = (async (eingabe: unknown) => {
      aufrufe.push(String(eingabe));
      return antwort('inhalt');
    }) as unknown as typeof fetch;

    await fetchSource(GOT, { fetchImpl, sleep: sofort });
    expect(aufrufe).toEqual(['https://www.gesetze-im-internet.de/got_2022/xml.zip']);
  });

  it('hasht den unveränderten Körper', async () => {
    const fetchImpl = vi.fn(async () => antwort('inhalt'));
    const ergebnis = await fetchSource(GOT, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep: sofort,
    });
    expect(ergebnis.resource?.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
