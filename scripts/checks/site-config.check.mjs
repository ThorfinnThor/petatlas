// M00-03 — Zusicherungen für config/site.ts.
// Vorläufiger Node-Check ohne Testrunner; wird in M01-03 nach Vitest überführt.
// Ausführen: node scripts/checks/site-config.check.mjs
import assert from 'node:assert/strict';
const { createSiteConfig, readBuildMode, DEVELOPMENT_BASE_URL } = await import(new URL("../../config/site.ts", import.meta.url).href);

// development ohne Domain funktioniert
const dev = createSiteConfig('development', {});
assert.equal(dev.baseUrl, DEVELOPMENT_BASE_URL);
assert.equal(dev.brandName, 'PetAtlas');
assert.equal(dev.brandNameIsWorkingTitle, true);

// production ohne echte Domain scheitert
assert.throws(() => createSiteConfig('production', {}), /PUBLIC_SITE_URL/);
assert.throws(() => createSiteConfig('production', { PUBLIC_SITE_URL: DEVELOPMENT_BASE_URL }), /PUBLIC_SITE_URL/);

// production mit Domain, aber ohne Betreiberangaben scheitert
assert.throws(() => createSiteConfig('production', { PUBLIC_SITE_URL: 'https://beispiel.example' }), /Betreiberangaben/);

// production mit Domain und Betreiberangaben funktioniert
const prod = createSiteConfig('production', { PUBLIC_SITE_URL: 'https://beispiel.example' }, {
  legalName: 'X', address: 'Y', contactEmail: 'a@b.example', responsibleForContent: 'Z',
  registerEntry: null, vatId: null,
});
assert.equal(prod.baseUrl, 'https://beispiel.example');

// BUILD_MODE
assert.equal(readBuildMode({}), 'development');
assert.equal(readBuildMode({ BUILD_MODE: 'preview' }), 'preview');
assert.throws(() => readBuildMode({ BUILD_MODE: 'prod' }), /BUILD_MODE/);

console.log('config/site.ts: 9 Zusicherungen erfüllt');
