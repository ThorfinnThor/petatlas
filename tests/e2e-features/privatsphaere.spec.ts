// M16-06 — Was der Nutzer eingibt, bleibt bei ihm.
import { expect, test, type Page, type Request } from '@playwright/test';

const PROFIL = '/de-de/mein-tier/';
const MERKLISTE = '/de-de/merkliste/';
const FUTTER = '/de-de/futter/';
const REISE = '/de-de/reisecheck/oesterreich/';
const ANGEBOTE = '/entwicklung/angebotsprobe/';

/** Eindeutige Zeichenkette, die in keiner Anfrage auftauchen darf. */
const KANARIENVOGEL = 'Kanarienvogel7Q4Z';

interface Mitschnitt {
  readonly url: string;
  readonly methode: string;
  readonly koerper: string;
}

function schneideMit(page: Page): Mitschnitt[] {
  const anfragen: Mitschnitt[] = [];
  page.on('request', (anfrage: Request) => {
    anfragen.push({
      url: anfrage.url(),
      methode: anfrage.method(),
      koerper: anfrage.postData() ?? '',
    });
  });
  return anfragen;
}

function fremde(anfragen: readonly Mitschnitt[]): readonly Mitschnitt[] {
  return anfragen.filter((anfrage) => !anfrage.url.startsWith('http://localhost'));
}

test('trägt Profilangaben in keine Anfrage — auch nicht in die eigene', async ({ page }) => {
  const anfragen = schneideMit(page);

  await page.goto(PROFIL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.fill('#profil-name', KANARIENVOGEL);
  await page.fill('#profil-gewicht', '20');
  await page.fill('#profil-rasse', `${KANARIENVOGEL}-Rasse`);
  await page.check('input[value="futter"]');
  await page.click('#profil-speichern');
  await expect(page.locator('.profil__hinweis')).toContainText('Gespeichert');

  // Danach durch die Seiten gehen, die etwas verlinken oder nachladen.
  await page.goto(`${FUTTER}royal-canin-mini-adult-2kg/`);
  await page.locator('button[data-merken="food"]').click();
  await page.goto(MERKLISTE);
  await expect(page.locator('.merk__liste > li')).toHaveCount(1);
  await page.goto(REISE);
  await page.locator('.packliste input[type="checkbox"]').first().check();

  for (const anfrage of anfragen) {
    expect(anfrage.url, `Adresse enthält Eingabe: ${anfrage.url}`).not.toContain(KANARIENVOGEL);
    expect(anfrage.koerper, `Körper enthält Eingabe: ${anfrage.url}`).not.toContain(KANARIENVOGEL);
  }
});

test('schickt überhaupt nichts an fremde Hosts', async ({ page }) => {
  const anfragen = schneideMit(page);

  await page.goto(PROFIL);
  await page.selectOption('#profil-tierart', 'cat');
  await page.fill('#profil-name', KANARIENVOGEL);
  await page.click('#profil-speichern');
  await page.goto(MERKLISTE);
  await page.goto(`${FUTTER}bosch-adult-lamm-reis-15kg/`);

  expect(fremde(anfragen).map((anfrage) => anfrage.url)).toEqual([]);
});

test('sendet keine Daten per POST, Beacon oder Bild', async ({ page }) => {
  const anfragen = schneideMit(page);

  await page.goto(PROFIL);
  await page.fill('#profil-name', KANARIENVOGEL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.click('#profil-speichern');
  await page.click('#profil-loeschen');

  const schreibend = anfragen.filter((anfrage) => anfrage.methode !== 'GET');
  expect(schreibend.map((anfrage) => `${anfrage.methode} ${anfrage.url}`)).toEqual([]);
});

test('hält Profilangaben aus der Adresse heraus', async ({ page }) => {
  await page.goto(PROFIL);
  await page.fill('#profil-name', KANARIENVOGEL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.click('#profil-speichern');

  expect(page.url()).not.toContain(KANARIENVOGEL);
  const adressen = await page.evaluate(() => ({
    href: window.location.href,
    such: window.location.search,
    anker: window.location.hash,
    verlauf: window.history.length,
  }));
  expect(adressen.href).not.toContain(KANARIENVOGEL);
  expect(adressen.such).toBe('');
  expect(adressen.anker).toBe('');
});

test('trägt nichts in einen Partnerlink', async ({ page }) => {
  await page.goto(PROFIL);
  await page.fill('#profil-name', KANARIENVOGEL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.click('#profil-speichern');

  await page.goto(ANGEBOTE);
  const links = await page
    .locator('a.partner__link, .angebot a')
    .evaluateAll((elemente) => elemente.map((element) => (element as HTMLAnchorElement).href));
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link).not.toContain(KANARIENVOGEL);
    // Auch keine Unterkennung, in der so etwas landen könnte.
    expect(link.toLowerCase()).not.toMatch(/subid|clickref|sub_id|u1=/);
  }
});

test('lädt keine Analytics- oder Tracking-Skripte', async ({ page }) => {
  const anfragen = schneideMit(page);
  await page.goto(PROFIL);
  await page.goto(MERKLISTE);

  const verdaechtig = anfragen.filter((anfrage) =>
    /analytics|gtag|matomo|piwik|plausible|segment|hotjar|facebook|doubleclick/i.test(anfrage.url),
  );
  expect(verdaechtig.map((anfrage) => anfrage.url)).toEqual([]);
});

test('zeigt im Druck der Packliste keine Profilangaben', async ({ page }) => {
  await page.goto(PROFIL);
  await page.fill('#profil-name', KANARIENVOGEL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.click('#profil-speichern');

  await page.goto(REISE);
  await page.locator('.packliste input[type="checkbox"]').first().check();
  await page.emulateMedia({ media: 'print' });
  const text = await page.locator('body').innerText();
  expect(text).not.toContain(KANARIENVOGEL);
});

test('speichert nur unter den eigenen Schlüsseln', async ({ page }) => {
  await page.goto(PROFIL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.fill('#profil-name', KANARIENVOGEL);
  await page.click('#profil-speichern');
  await page.goto(`${FUTTER}royal-canin-mini-adult-2kg/`);
  await page.locator('button[data-merken="food"]').click();
  await page.goto(REISE);
  await page.locator('.packliste input[type="checkbox"]').first().check();

  const stand = await page.evaluate(() => ({
    schluessel: Object.keys(window.localStorage).sort(),
    cookies: document.cookie,
    session: Object.keys(window.sessionStorage),
  }));
  expect(stand.schluessel).toEqual([
    'petatlas.favorites.v1',
    'petatlas.packing.v1',
    'petatlas.profile.v1',
  ]);
  expect(stand.cookies).toBe('');
  expect(stand.session).toEqual([]);
});
