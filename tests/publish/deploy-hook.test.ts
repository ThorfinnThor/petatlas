// M17-03 — Der Hook wird hier nie wirklich aufgerufen. Geprüft wird, dass ein
// Fehlschlag als Fehlschlag ankommt und der Token nirgends im Text landet.
import { describe, expect, it } from 'vitest';

import { loeseBuildAus, nurUrsprung } from '../../scripts/publish/deploy-hook.ts';

const HOOK = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/geheim123';

describe('Kürzung für das Log', () => {
  it('lässt nur den Ursprung übrig, weil der Token im Pfad steht', () => {
    expect(nurUrsprung(HOOK)).toBe('https://api.cloudflare.com');
    expect(nurUrsprung(HOOK)).not.toContain('geheim123');
  });

  it('verrät auch bei kaputter Adresse nichts', () => {
    expect(nurUrsprung('kein-url-geheim123')).toBe('<nicht parsebare Adresse>');
  });
});

describe('Auslösen', () => {
  it('überspringt ohne Secret, statt zu scheitern', async () => {
    const ergebnis = await loeseBuildAus(undefined, {
      fetchImpl: async () => {
        throw new Error('hätte nicht aufgerufen werden dürfen');
      },
    });
    expect(ergebnis.befund).toBe('uebersprungen');
  });

  it('überspringt auch bei leerem Secret', async () => {
    const ergebnis = await loeseBuildAus('   ', {
      fetchImpl: async () => {
        throw new Error('hätte nicht aufgerufen werden dürfen');
      },
    });
    expect(ergebnis.befund).toBe('uebersprungen');
  });

  it('schickt den Token nicht an einen fremden Host', async () => {
    let aufgerufen = false;
    const ergebnis = await loeseBuildAus('https://beispiel.invalid/hooks/geheim123', {
      fetchImpl: async () => {
        aufgerufen = true;
        return new Response('', { status: 200 });
      },
    });
    expect(aufgerufen).toBe(false);
    expect(ergebnis.befund).toBe('fehlgeschlagen');
    expect(ergebnis.meldung).not.toContain('geheim123');
  });

  it('lehnt http ab', async () => {
    const ergebnis = await loeseBuildAus('http://api.cloudflare.com/hooks/geheim123', {
      fetchImpl: async () => new Response('', { status: 200 }),
    });
    expect(ergebnis.befund).toBe('fehlgeschlagen');
  });

  it('erkennt einen Fehlschlag des Hooks am Status', async () => {
    const ergebnis = await loeseBuildAus(HOOK, {
      fetchImpl: async () => new Response('nope', { status: 500 }),
    });
    expect(ergebnis.befund).toBe('fehlgeschlagen');
    expect(ergebnis.status).toBe(500);
    expect(ergebnis.meldung).toContain('500');
    expect(ergebnis.meldung).not.toContain('geheim123');
  });

  it('erkennt einen Fehlschlag des Netzes', async () => {
    const ergebnis = await loeseBuildAus(HOOK, {
      fetchImpl: async () => {
        throw new Error('ECONNRESET');
      },
    });
    expect(ergebnis.befund).toBe('fehlgeschlagen');
    expect(ergebnis.status).toBeNull();
  });

  it('nimmt einen angenommenen Aufruf nicht als gelungenen Build', async () => {
    let methode: string | undefined;
    const ergebnis = await loeseBuildAus(HOOK, {
      fetchImpl: async (_url, init) => {
        methode = init?.method;
        return new Response('{"success":true}', { status: 200 });
      },
    });
    expect(methode).toBe('POST');
    expect(ergebnis.befund).toBe('ausgeloest');
    // Der Unterschied zwischen „angestoßen“ und „ausgeliefert“ muss im Text stehen.
    expect(ergebnis.meldung).toContain('Ob der Build durchläuft, sagt dieser Lauf nicht');
    expect(ergebnis.meldung).not.toContain('geheim123');
  });
});
