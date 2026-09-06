// M01-03 — Übernahme der Zusicherungen aus scripts/checks/site-config.check.mjs
// nach Vitest. Prüft die Produktionssperren aus M00-03.
import { describe, expect, it } from 'vitest';

import {
  DEVELOPMENT_BASE_URL,
  createSiteConfig,
  readBuildMode,
  type OperatorInfo,
} from '../config/site.ts';

const COMPLETE_OPERATOR: OperatorInfo = {
  legalName: 'Synthetischer Testbetreiber',
  address: 'Teststraße 1, 00000 Testort',
  contactEmail: 'kontakt@example.invalid',
  responsibleForContent: 'Synthetische Testperson',
  registerEntry: null,
  vatId: null,
};

describe('readBuildMode', () => {
  it('nimmt development an, wenn nichts gesetzt ist', () => {
    expect(readBuildMode({})).toBe('development');
  });

  it('akzeptiert die drei vorgesehenen Modi', () => {
    expect(readBuildMode({ BUILD_MODE: 'preview' })).toBe('preview');
    expect(readBuildMode({ BUILD_MODE: 'production' })).toBe('production');
  });

  it('lehnt einen unbekannten Modus ab, statt still zu raten', () => {
    expect(() => readBuildMode({ BUILD_MODE: 'prod' })).toThrow(/BUILD_MODE/);
  });
});

describe('createSiteConfig', () => {
  it('erlaubt development ohne echte Domain', () => {
    const site = createSiteConfig('development', {});
    expect(site.baseUrl).toBe(DEVELOPMENT_BASE_URL);
    expect(site.defaultMarketId).toBe('DE');
  });

  it('kennzeichnet den Namen als Arbeitstitel', () => {
    expect(createSiteConfig('development', {}).brandNameIsWorkingTitle).toBe(true);
  });

  it('sperrt production ohne konfigurierte Domain', () => {
    expect(() => createSiteConfig('production', {})).toThrow(/PUBLIC_SITE_URL/);
  });

  it('sperrt production mit der Platzhalterdomain', () => {
    expect(() => createSiteConfig('production', { PUBLIC_SITE_URL: DEVELOPMENT_BASE_URL })).toThrow(
      /PUBLIC_SITE_URL/,
    );
  });

  it('sperrt production ohne vollständige Betreiberangaben', () => {
    expect(() =>
      createSiteConfig('production', { PUBLIC_SITE_URL: 'https://beispiel.example' }),
    ).toThrow(/Betreiberangaben/);
  });

  it('lässt production mit Domain und Betreiberangaben zu', () => {
    const site = createSiteConfig(
      'production',
      { PUBLIC_SITE_URL: 'https://beispiel.example' },
      COMPLETE_OPERATOR,
    );
    expect(site.baseUrl).toBe('https://beispiel.example');
    expect(site.operator.legalName).toBe('Synthetischer Testbetreiber');
  });
});
