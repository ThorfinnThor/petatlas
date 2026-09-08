// M12-01 — Die Seite sagt zuerst, was sie nicht prüft.
import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const REISE = '/de-de/reisecheck/';

const umfang = JSON.parse(readFileSync('content-data/travel/scope.json', 'utf8')) as {
  destinations: string[];
  unsupported: { caseId: string; label: string }[];
};

test('nennt die vier Zielstaaten und keine weltweite Abdeckung', async ({ page }) => {
  await page.goto(REISE);
  await expect(page.locator('h1')).toHaveText('Reisecheck');
  await expect(page.getByText('Keine weltweite Auskunft')).toBeVisible();
  for (const land of ['Österreich', 'Frankreich', 'Italien', 'Niederlande']) {
    await expect(page.getByText(land, { exact: false }).first(), land).toBeVisible();
  }
});

test('zeigt jeden nicht geprüften Fall mit Begründung', async ({ page }) => {
  await page.goto(REISE);
  for (const fall of umfang.unsupported) {
    const eintrag = page.locator(`[data-testid="nicht-geprueft-${fall.caseId}"]`);
    await expect(eintrag, fall.caseId).toBeVisible();
    const text = (await eintrag.innerText()).trim();
    expect(text.length, fall.caseId).toBeGreaterThan(60);
  }
});

test('unterscheidet „nicht geprüft“ von „nicht erlaubt“', async ({ page }) => {
  await page.goto(REISE);
  await expect(page.getByText(/nicht erlaubt und nicht verboten|es ist ungeprüft/)).toBeVisible();
});

test('rechnet nur mit belegten Regeln und sagt, dass sie ungeprüft sind', async ({ page }) => {
  await page.goto(REISE);
  // Seit M12-04 gibt es ein Formular — aber nur mit Regeln, die eine
  // amtliche Fundstelle haben und ausdrücklich als ungeprüft gelten.
  await expect(page.getByText('Fachlich noch nicht geprüft')).toBeVisible();
  await expect(page.locator('#reiseform')).toBeVisible();
  await expect(page.locator('.ergebnis__punkte')).toHaveCount(0);
});

test('bleibt ohne JavaScript vollständig lesbar', async ({ browser }) => {
  const kontext = await browser.newContext({ javaScriptEnabled: false });
  const seite = await kontext.newPage();
  await seite.goto(REISE);
  await expect(seite.locator('.ausnahmen li')).toHaveCount(umfang.unsupported.length);
  await kontext.close();
});

test('rechnet lokal und gibt kein grünes Gesamtergebnis', async ({ page }) => {
  const fremdeAnfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (!anfrage.url().startsWith('http://localhost')) fremdeAnfragen.push(anfrage.url());
  });

  await page.goto(REISE);
  await page.selectOption('#tierart', 'dog');
  await page.selectOption('#ziel', 'AT');
  await page.fill('#reisedatum', '2026-10-01');
  await page.fill('#geburtsdatum', '2020-01-01');
  await page.selectOption('#chip', 'ja');
  await page.fill('#chipdatum', '2020-03-01');
  await page.selectOption('#impfung', 'ja');
  await page.fill('#impfdatum', '2026-01-01');
  await page.selectOption('#ausweis', 'ja');
  await page.selectOption('#begleitung', 'ja');
  await page.click('#pruefen');

  await expect(page.locator('.ergebnis__punkte > li')).toHaveCount(5);
  // Alle Punkte erfüllt — und trotzdem kein grünes Gesamtergebnis.
  await expect(page.locator('.ergebnis__kopf')).toHaveAttribute('data-zustand', 'unknown');
  await expect(page.locator('#reiseergebnis')).toContainText('fachlich noch nicht geprüft');
  expect(fremdeAnfragen).toEqual([]);
});

test('eine offene Angabe bleibt offen', async ({ page }) => {
  await page.goto(REISE);
  await page.fill('#reisedatum', '2026-10-01');
  await page.fill('#geburtsdatum', '2020-01-01');
  await page.selectOption('#chip', 'ja');
  await page.click('#pruefen');

  const offen = page.locator('.ergebnis__punkte > li[data-zustand="unknown"]');
  await expect(offen.first()).toBeVisible();
  await expect(page.locator('.ergebnis__kopf')).toHaveAttribute('data-zustand', 'unknown');
});

test('ein klarer Mangel wird als Mangel benannt', async ({ page }) => {
  await page.goto(REISE);
  await page.fill('#reisedatum', '2026-10-01');
  await page.fill('#geburtsdatum', '2020-01-01');
  await page.selectOption('#chip', 'nein');
  await page.click('#pruefen');
  await expect(page.locator('.ergebnis__kopf')).toHaveAttribute('data-zustand', 'not_fulfilled');
});

test('eine nicht unterstützte Route bekommt keine Checkliste', async ({ page }) => {
  await page.goto(REISE);
  await page.selectOption('#ziel', 'XX');
  await page.fill('#reisedatum', '2026-10-01');
  await page.fill('#geburtsdatum', '2020-01-01');
  await page.click('#pruefen');

  await expect(page.locator('.ergebnis__punkte')).toHaveCount(0);
  await expect(page.locator('.ergebnis__kopf')).toHaveAttribute('data-zustand', 'not_applicable');
  await expect(page.locator('.ergebnis__gruende > li').first()).toBeVisible();
});

test('ohne Reisedatum wird nicht geraten', async ({ page }) => {
  await page.goto(REISE);
  await page.click('#pruefen');
  // Das Feld ist als Pflichtfeld ausgezeichnet: der Browser hält das
  // Absenden auf. Entscheidend ist, dass keine Checkliste entsteht.
  await expect(page.locator('.ergebnis__punkte')).toHaveCount(0);
  expect(
    await page.locator('#reisedatum').evaluate((feld) => (feld as HTMLInputElement).validity.valid),
  ).toBe(false);

  // Auch wenn die Pflichtprüfung des Browsers umgangen wird, rechnet die
  // Seite nicht mit einem geratenen Datum.
  await page.locator('#reisedatum').evaluate((feld) => feld.removeAttribute('required'));
  await page.click('#pruefen');
  await expect(page.locator('#reiseergebnis')).toContainText('Reisedatum');
  await expect(page.locator('.ergebnis__punkte')).toHaveCount(0);
});

test.describe('Zielseiten', () => {
  const ZIELE = ['oesterreich', 'frankreich', 'italien', 'niederlande'];

  test('gibt es genau für die unterstützten Ziele', async ({ page }) => {
    for (const ziel of ZIELE) {
      const antwort = await page.request.get(`${REISE}${ziel}/`);
      expect(antwort.status(), ziel).toBe(200);
    }
    for (const ziel of ['spanien', 'schweiz', 'usa']) {
      const antwort = await page.request.get(`${REISE}${ziel}/`);
      expect(antwort.status(), ziel).toBe(404);
    }
  });

  test('zeigt Anforderungen mit Fundstelle und eine abhakbare Packliste', async ({ page }) => {
    await page.goto(`${REISE}oesterreich/`);
    await expect(page.locator('h1')).toContainText('Österreich');
    await expect(page.locator('.anforderungen > li')).toHaveCount(5);
    await expect(page.locator('.anforderungen a').first()).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('.packliste > li')).toHaveCount(16);
    // Seit M16-04 sind es echte Kontrollkästchen statt gezeichneter Quadrate.
    await expect(page.locator('.packliste input[type="checkbox"]').first()).toBeVisible();
  });

  test('weist Beförderungsbedingungen getrennt aus', async ({ page }) => {
    await page.goto(`${REISE}oesterreich/`);
    const abschnitt = page.locator('section, body').filter({ hasText: 'Fluggesellschaft' });
    await expect(page.getByText('Fluggesellschaft, Bahn und Fähre')).toBeVisible();
    await expect(abschnitt.first()).toContainText('etwas anderes');
    await expect(abschnitt.first()).toContainText('weder geprüft noch wiedergegeben');
  });

  test('empfiehlt keine Medikamente', async ({ page }) => {
    await page.goto(`${REISE}oesterreich/`);
    await expect(page.getByText('Keine Reiseapotheke')).toBeVisible();
    // Geprüft wird die Liste selbst: der Hinweis darüber darf die Wörter
    // nennen, weil er sie verneint — die Einträge dürfen es nicht.
    const eintraege = (await page.locator('.packliste').allInnerTexts()).join('\n').toLowerCase();
    for (const wort of ['wirkstoff', 'dosier', 'wurmkur', 'beruhigungsmittel', 'medikament']) {
      expect(eintraege.includes(wort), wort).toBe(false);
    }
  });

  test('bleibt im Druck vollständig und ohne Bedienelemente', async ({ page }) => {
    await page.goto(`${REISE}oesterreich/`);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.packliste > li').first()).toBeVisible();
    await expect(page.locator('.anforderungen > li').first()).toBeVisible();
    await expect(page.locator('#drucken')).toBeHidden();
  });

  test('verlinkt die anderen Ziele und den Check', async ({ page }) => {
    await page.goto(`${REISE}oesterreich/`);
    await expect(page.locator('.ziele a')).toHaveCount(3);
    await expect(page.locator(`a[href="${REISE}"]`).first()).toBeVisible();
  });

  test('zeigt auf sich selbst als canonical', async ({ page }) => {
    await page.goto(`${REISE}italien/`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${REISE}italien/$`),
    );
  });
});

test.describe('Packliste abhaken', () => {
  const ZIEL = `${REISE}oesterreich/`;

  test('merkt Häkchen auf diesem Gerät', async ({ page }) => {
    await page.goto(ZIEL);
    const erster = page.locator('.packliste input[type="checkbox"]').first();
    await erster.check();
    await expect(page.locator('#packliste-stand')).toContainText('1 von 16 erledigt');
    await expect(page.locator('#packliste-stand')).toContainText('nur auf diesem Gerät');

    await page.reload();
    await expect(page.locator('.packliste input[type="checkbox"]').first()).toBeChecked();
  });

  test('hält Ziele auseinander', async ({ page }) => {
    await page.goto(ZIEL);
    await page.locator('.packliste input[type="checkbox"]').first().check();
    await page.goto(`${REISE}italien/`);
    await expect(page.locator('.packliste input[type="checkbox"]').first()).not.toBeChecked();
  });

  test('setzt die Häkchen auf Wunsch zurück', async ({ page }) => {
    await page.goto(ZIEL);
    await page.locator('.packliste input[type="checkbox"]').first().check();
    await page.click('#packliste-zuruecksetzen');
    await expect(page.locator('.packliste input[type="checkbox"]').first()).not.toBeChecked();
    await expect(page.locator('#packliste-stand')).toContainText('0 von 16');
  });

  test('speichert nur Ziel, Eintrag und Zeitpunkt', async ({ page }) => {
    await page.goto(ZIEL);
    await page.locator('.packliste input[type="checkbox"]').first().check();
    const stand = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('petatlas.packing.v1') ?? '{}'),
    );
    expect(Object.keys(stand).sort()).toEqual(['updatedAt', 'version', 'ziele']);
    expect(Object.keys(stand.ziele)).toEqual(['oesterreich']);
    const roh = await page.evaluate(() => window.localStorage.getItem('petatlas.packing.v1') ?? '');
    expect(roh).not.toMatch(/name|email|profil/i);
  });

  test('überträgt beim Abhaken nichts', async ({ page }) => {
    const anfragen: string[] = [];
    page.on('request', (anfrage) => {
      if (anfrage.method() !== 'GET' || !anfrage.url().startsWith('http://localhost')) {
        anfragen.push(`${anfrage.method()} ${anfrage.url()}`);
      }
    });
    await page.goto(ZIEL);
    await page.locator('.packliste input[type="checkbox"]').first().check();
    await expect(page.locator('#packliste-stand')).toContainText('1 von 16');
    expect(anfragen).toEqual([]);
  });

  test('druckt die Häkchen mit und die Bedienelemente nicht', async ({ page }) => {
    await page.goto(ZIEL);
    await page.locator('.packliste input[type="checkbox"]').first().check();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.packliste input[type="checkbox"]').first()).toBeVisible();
    await expect(page.locator('.packliste input[type="checkbox"]').first()).toBeChecked();
    await expect(page.locator('#packliste-zuruecksetzen')).toBeHidden();
    await expect(page.locator('#drucken')).toBeHidden();
  });

  test('bleibt ohne JavaScript anklickbar', async ({ browser }) => {
    const kontext = await browser.newContext({ javaScriptEnabled: false });
    const seite = await kontext.newPage();
    await seite.goto(ZIEL);
    const kasten = seite.locator('.packliste input[type="checkbox"]').first();
    await kasten.check();
    await expect(kasten).toBeChecked();
    await kontext.close();
  });
});
