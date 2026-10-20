import { describe, expect, it } from 'vitest';

import { stadtAllowlist } from '../../src/features/map/city-allowlist.ts';
import { erhobeneStaedte, notdienstFuer } from '../../src/features/map/emergency.ts';
import { SEO_INDEX_BUDGET } from '../../src/features/seo/index-quality.ts';

const VERZEICHNISSE = /gelbeseiten|yelp|11880|dasoertliche|tierarzt-onlinesuche|notdienst-finder/;

describe('Notdienst je Stadt', () => {
  it('ist für jede indexierbare Stadtseite erhoben', () => {
    const indexierbar = stadtAllowlist()
      .cities.filter((s) => (s.measured?.total ?? 0) >= SEO_INDEX_BUDGET.minimumCityPlaces)
      .map((s) => s.slug);
    for (const slug of indexierbar) expect(notdienstFuer(slug), slug).not.toBeNull();
  });

  it('belegt jeden Dienst mit https-Quelle und Zitat, nie mit einem Verzeichnis', () => {
    for (const slug of erhobeneStaedte()) {
      const n = notdienstFuer(slug)!;
      expect(new URL(n.kammer.url).protocol).toBe('https:');
      for (const d of n.dienste) {
        expect(new URL(d.url).protocol, d.name).toBe('https:');
        expect(new URL(d.url).hostname, d.name).not.toMatch(VERZEICHNISSE);
        expect(d.verbatim.length, d.name).toBeLessThanOrEqual(200);
      }
    }
  });

  it('nennt eine Klinik nur, wenn ihr Beleg den Rund-um-die-Uhr-Dienst sagt', () => {
    for (const slug of erhobeneStaedte()) {
      for (const d of notdienstFuer(slug)!.dienste.filter((x) => x.kind === 'klinik-24h')) {
        expect(d.verbatim, d.name).toMatch(/24|rund um die uhr|365|jederzeit|Tag und Nacht/i);
      }
    }
  });

  it('gibt für eine nicht erhobene Stadt keine Angabe statt einer erfundenen', () => {
    expect(notdienstFuer('gibt-es-nicht')).toBeNull();
  });
});
