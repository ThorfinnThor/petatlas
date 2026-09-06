// M01-05 — Die Modi trennen Test von Produktion. Kernaussage der Tests:
// eine fehlende Umgebungsvariable macht Fixtures nicht versehentlich live.
import { describe, expect, it } from 'vitest';

import { BuildConfigError, resolveBuildConfig, robotsDirective } from '../config/build.ts';
import type { OperatorInfo } from '../config/site.ts';

const COMPLETE_OPERATOR: OperatorInfo = {
  legalName: 'Synthetischer Testbetreiber',
  address: 'Teststraße 1, 00000 Testort',
  contactEmail: 'kontakt@example.invalid',
  responsibleForContent: 'Synthetische Testperson',
  registerEntry: null,
  vatId: null,
};

const REAL_SITE = { PUBLIC_SITE_URL: 'https://beispiel.example' };

describe('Standardverhalten ohne Konfiguration', () => {
  it('fällt auf development zurück, nicht auf production', () => {
    expect(resolveBuildConfig({}).mode).toBe('development');
  });

  it('liefert im Standardfall Fixtures, Testhinweis und noindex', () => {
    const config = resolveBuildConfig({});
    expect(config.dataSource).toBe('fixtures');
    expect(config.showTestDataBanner).toBe(true);
    expect(config.indexable).toBe(false);
    expect(robotsDirective(config)).toBe('noindex, nofollow');
  });

  it('schaltet Affiliate im Standardfall nicht ein', () => {
    expect(resolveBuildConfig({}).affiliateEnabled).toBe(false);
  });
});

describe('preview', () => {
  it('nutzt veröffentlichte Daten und bleibt nicht indexierbar', () => {
    const config = resolveBuildConfig({ BUILD_MODE: 'preview', ...REAL_SITE });
    expect(config.dataSource).toBe('published');
    expect(config.indexable).toBe(false);
    expect(config.showTestDataBanner).toBe(false);
  });

  it('lädt Fixtures nur auf ausdrückliche Anforderung und zeigt dann den Hinweis', () => {
    const config = resolveBuildConfig({ BUILD_MODE: 'preview', USE_FIXTURES: 'true' });
    expect(config.dataSource).toBe('fixtures');
    expect(config.showTestDataBanner).toBe(true);
    expect(config.indexable).toBe(false);
  });

  it('hält Affiliate-Ausgabe aus', () => {
    expect(resolveBuildConfig({ BUILD_MODE: 'preview' }).affiliateEnabled).toBe(false);
  });
});

describe('production verweigert ungeklärte Pflichtkonfiguration', () => {
  it('bricht ab, solange die Launch-Freigabe nicht dokumentiert ist', () => {
    expect(() =>
      resolveBuildConfig({ BUILD_MODE: 'production', ...REAL_SITE }, COMPLETE_OPERATOR),
    ).toThrow(BuildConfigError);
  });

  it('nennt die fehlende Freigabe im Fehlertext', () => {
    expect(() =>
      resolveBuildConfig({ BUILD_MODE: 'production', ...REAL_SITE }, COMPLETE_OPERATOR),
    ).toThrow(/publicRelease\.approved=false/);
  });

  it('lehnt angeforderte Fixtures ab, bevor irgendetwas anderes geprüft wird', () => {
    expect(() =>
      resolveBuildConfig(
        { BUILD_MODE: 'production', USE_FIXTURES: 'true', ...REAL_SITE },
        COMPLETE_OPERATOR,
      ),
    ).toThrow(/USE_FIXTURES/);
  });

  it('lehnt einen unbekannten Modusnamen ab, statt ihn als production zu deuten', () => {
    expect(() => resolveBuildConfig({ BUILD_MODE: 'prod' })).toThrow(/BUILD_MODE/);
  });
});

describe('Fixtures sind offline verfügbar und als synthetisch gekennzeichnet', () => {
  it('lädt die Beispiel-Ortsdaten ohne Netzzugriff', async () => {
    const { readFileSync } = await import('node:fs');
    const raw = readFileSync(new URL('../fixtures/places.de.sample.json', import.meta.url), 'utf8');
    const data = JSON.parse(raw) as { synthetic: boolean; places: { id: string }[] };
    expect(data.synthetic).toBe(true);
    expect(data.places.length).toBeGreaterThan(0);
    expect(data.places.every((place) => place.id.startsWith('synthetic-'))).toBe(true);
  });
});
