// M16-01 — Kein Konto, keine Speicherung, keine Übertragung.
import { expect, test } from '@playwright/test';

const PROFIL = '/de-de/mein-tier/';

test('sagt, dass die Angaben freiwillig sind und im Tab bleiben', async ({ page }) => {
  await page.goto(PROFIL);
  await expect(page.locator('h1')).toHaveText('Mein Tier');
  await expect(page.getByText('Was mit diesen Angaben passiert')).toBeVisible();
  await expect(page.locator('main')).toContainText('nicht gespeichert');
});

test('überträgt beim Eintippen nichts', async ({ page }) => {
  const anfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (anfrage.method() !== 'GET' || !anfrage.url().startsWith('http://localhost')) {
      anfragen.push(`${anfrage.method()} ${anfrage.url()}`);
    }
  });

  await page.goto(PROFIL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.fill('#profil-name', 'Bello');
  await page.fill('#profil-gewicht', '20');
  await page.check('input[value="futter"]');
  await expect(page.locator('.profil__kopf')).toHaveAttribute('data-gueltig', 'true');

  expect(anfragen).toEqual([]);
});

test('speichert nichts von allein', async ({ page }) => {
  await page.goto(PROFIL);
  await page.selectOption('#profil-tierart', 'cat');
  await page.fill('#profil-name', 'Mira');

  const speicher = await page.evaluate(() => ({
    local: Object.keys(window.localStorage),
    session: Object.keys(window.sessionStorage),
    cookies: document.cookie,
  }));
  expect(speicher.local).toEqual([]);
  expect(speicher.session).toEqual([]);
  expect(speicher.cookies).toBe('');
});

test('speichert auf Knopfdruck und lädt den Stand wieder', async ({ page }) => {
  await page.goto(PROFIL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.fill('#profil-name', 'Bello');
  await page.fill('#profil-gewicht', '20');
  await page.check('input[value="futter"]');
  await page.click('#profil-speichern');
  await expect(page.locator('.profil__hinweis')).toContainText('Gespeichert');

  const schluessel = await page.evaluate(() => Object.keys(window.localStorage));
  expect(schluessel).toEqual(['petatlas.profile.v1']);

  await page.reload();
  await expect(page.locator('#profil-name')).toHaveValue('Bello');
  await expect(page.locator('#profil-gewicht')).toHaveValue('20');
  await expect(page.locator('input[value="futter"]')).toBeChecked();
  await expect(page.locator('.profil__hinweis')).toContainText('nur auf diesem Gerät');
});

test('löscht den gespeicherten Stand vollständig', async ({ page }) => {
  await page.goto(PROFIL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.fill('#profil-name', 'Bello');
  await page.click('#profil-speichern');
  await page.click('#profil-loeschen');
  await expect(page.locator('.profil__hinweis')).toContainText('Gelöscht');

  expect(await page.evaluate(() => Object.keys(window.localStorage))).toEqual([]);
  await page.reload();
  await expect(page.locator('#profil-name')).toHaveValue('');
});

test('speichert nicht ohne Tierart und Rufname', async ({ page }) => {
  await page.goto(PROFIL);
  await page.fill('#profil-gewicht', '20');
  await page.click('#profil-speichern');
  await expect(page.locator('.profil__hinweis')).toContainText('fehlen');
  expect(await page.evaluate(() => Object.keys(window.localStorage))).toEqual([]);
});

test('überträgt auch beim Speichern nichts', async ({ page }) => {
  const anfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (anfrage.method() !== 'GET' || !anfrage.url().startsWith('http://localhost')) {
      anfragen.push(`${anfrage.method()} ${anfrage.url()}`);
    }
  });
  await page.goto(PROFIL);
  await page.selectOption('#profil-tierart', 'dog');
  await page.fill('#profil-name', 'Bello');
  await page.click('#profil-speichern');
  await expect(page.locator('.profil__hinweis')).toContainText('Gespeichert');
  expect(anfragen).toEqual([]);
});

test('sagt, dass es keinen Geräteabgleich gibt', async ({ page }) => {
  await page.goto(PROFIL);
  await expect(page.locator('main')).toContainText('keinen Abgleich mit anderen Geräten');
});

test('vergisst ungespeicherte Angaben beim Neuladen', async ({ page }) => {
  await page.goto(PROFIL);
  await page.fill('#profil-name', 'Bello');
  await page.reload();
  await expect(page.locator('#profil-name')).toHaveValue('');
});

test('trägt keine Eingabe in die Adresse', async ({ page }) => {
  await page.goto(PROFIL);
  await page.fill('#profil-name', 'Bello');
  await page.selectOption('#profil-tierart', 'dog');
  expect(page.url()).not.toContain('Bello');
  expect(page.url()).not.toContain('dog');
});

test('bleibt ohne Angaben nutzbar und sagt das', async ({ page }) => {
  await page.goto(PROFIL);
  await expect(page.locator('.profil__kopf')).toHaveAttribute('data-gueltig', 'false');
  await expect(page.locator('.profil__kopf')).toContainText('funktionieren trotzdem');
});

test('nennt, was nicht erhoben wird', async ({ page }) => {
  await page.goto(PROFIL);
  const text = await page.locator('main').innerText();
  expect(text).toContain('Keine E-Mail-Adresse');
  expect(text).toContain('Keine Gesundheitsangaben');
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
});

test('verwirft die Angaben auf Wunsch', async ({ page }) => {
  await page.goto(PROFIL);
  await page.fill('#profil-name', 'Bello');
  await page.click('#profil-leeren');
  await expect(page.locator('#profil-name')).toHaveValue('');
  await expect(page.locator('.profil__kopf')).toHaveAttribute('data-gueltig', 'false');
});

test.describe('Sicherung', () => {
  test('legt eine Datei an, die nicht hochgeladen wird', async ({ page }) => {
    const anfragen: string[] = [];
    page.on('request', (anfrage) => {
      if (anfrage.method() !== 'GET' || !anfrage.url().startsWith('http://localhost')) {
        anfragen.push(`${anfrage.method()} ${anfrage.url()}`);
      }
    });

    await page.goto(PROFIL);
    await page.selectOption('#profil-tierart', 'dog');
    await page.fill('#profil-name', 'Bello');
    await page.click('#profil-speichern');

    const download = page.waitForEvent('download');
    await page.click('#profil-export');
    const datei = await download;
    expect(datei.suggestedFilename()).toMatch(/^petatlas-lokal-\d{4}-\d{2}-\d{2}\.json$/);

    await expect(page.locator('.profil__hinweis')).toContainText('unverschlüsselt');
    expect(anfragen).toEqual([]);
  });

  test('liest eine eigene Datei wieder ein', async ({ page }) => {
    await page.goto(PROFIL);
    const inhalt = JSON.stringify({
      format: 'petatlas-lokal',
      version: 1,
      exportedAt: '2026-09-08T10:00:00+00:00',
      profile: {
        profileId: '00000000-0000-4000-8000-000000000000',
        schemaVersion: 1,
        species: 'cat',
        displayName: 'Mira',
        birthDate: null,
        weightGrams: 4500,
        breed: null,
      },
      interests: ['futter'],
      favorites: null,
      packing: null,
    });
    await page.setInputFiles('#profil-import', {
      name: 'sicherung.json',
      mimeType: 'application/json',
      buffer: Buffer.from(inhalt, 'utf8'),
    });

    await expect(page.locator('#profil-name')).toHaveValue('Mira');
    await expect(page.locator('#profil-gewicht')).toHaveValue('4.5');
    await expect(page.locator('input[value="futter"]')).toBeChecked();
  });

  test('lehnt eine fremde Datei ab und ändert nichts', async ({ page }) => {
    await page.goto(PROFIL);
    await page.selectOption('#profil-tierart', 'dog');
    await page.fill('#profil-name', 'Bello');
    await page.click('#profil-speichern');

    await page.setInputFiles('#profil-import', {
      name: 'fremd.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ format: 'etwas-anderes' }), 'utf8'),
    });

    await expect(page.locator('.profil__hinweis')).toContainText('nicht aus dieser Website');
    await expect(page.locator('#profil-name')).toHaveValue('Bello');
  });

  test('führt aus einer manipulierten Datei kein Skript aus', async ({ page }) => {
    const meldungen: string[] = [];
    page.on('dialog', (dialog) => {
      meldungen.push(dialog.message());
      void dialog.dismiss();
    });

    await page.goto(PROFIL);
    const boese = JSON.stringify({
      format: 'petatlas-lokal',
      version: 1,
      exportedAt: '2026-09-08T10:00:00+00:00',
      profile: {
        profileId: '00000000-0000-4000-8000-000000000000',
        schemaVersion: 1,
        species: 'dog',
        displayName: '<img src=x onerror=alert(1)>',
        birthDate: null,
        weightGrams: null,
        breed: null,
      },
      interests: [],
      favorites: null,
      packing: null,
    });
    await page.setInputFiles('#profil-import', {
      name: 'boese.json',
      mimeType: 'application/json',
      buffer: Buffer.from(boese, 'utf8'),
    });

    // Der Name erscheint als Text, nicht als Auszeichnung.
    await expect(page.locator('[data-feld="displayName"]')).toHaveText(
      '<img src=x onerror=alert(1)>',
    );
    await expect(page.locator('[data-feld="displayName"] img')).toHaveCount(0);
    expect(meldungen).toEqual([]);
  });

  test('lädt beim Einlesen nichts nach', async ({ page }) => {
    const fremde: string[] = [];
    page.on('request', (anfrage) => {
      if (!anfrage.url().startsWith('http://localhost')) fremde.push(anfrage.url());
    });

    await page.goto(PROFIL);
    await page.setInputFiles('#profil-import', {
      name: 'sicherung.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          format: 'petatlas-lokal',
          version: 1,
          exportedAt: '2026-09-08T10:00:00+00:00',
          profile: null,
          interests: [],
          favorites: {
            version: 1,
            entries: [
              {
                kind: 'food',
                id: 'synthetisch:trocken-1kg',
                coordinates: null,
                addedAt: '2026-09-08T10:00:00+00:00',
              },
            ],
          },
          packing: null,
        }),
        'utf8',
      ),
    });

    await expect(page.locator('.profil__hinweis')).toContainText('geprüft');
    expect(fremde).toEqual([]);
  });
});
