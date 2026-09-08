/**
 * M19-01 — Die Kernpfade am Stück.
 *
 * Die einzelnen Bausteine haben ihre eigenen Tests. Hier wird geprüft, was
 * ein Mensch tatsächlich tut: eine Frage stellen und eine brauchbare Antwort
 * bekommen — oder eine ehrliche Auskunft, warum es keine gibt.
 *
 * Sechs Pfade, wie in der Abnahme verlangt:
 *   Kosten → Auskunft, Ort → Treffer, Reise → Checkliste,
 *   Finder → echtes oder gesperrtes Angebot, Futter → Grundpreis,
 *   Profil → Löschen.
 *
 * Jeder Pfad endet mit einer Aussage darüber, was der Mensch **sieht**,
 * nicht darüber, welche Funktion gelaufen ist.
 */
import { expect, test, type Page } from '@playwright/test';

async function katalogGeladen(page: Page): Promise<void> {
  await expect(page.locator('#suche-hinweis')).toContainText('Positionen geladen', {
    timeout: 20_000,
  });
}

test('Kosten: von der Leistung zur nachvollziehbaren Auskunft', async ({ page }) => {
  await page.goto('/de-de/tierarztkosten/');
  await katalogGeladen(page);

  await page.fill('#suche', 'Beratung im einzelnen');
  await expect(page.locator('#treffer button').first()).toBeVisible();
  await page.fill('#menge', '1');
  await page.fill('#faktor', '1');
  await page.locator('#treffer button').first().click();

  // Eine Zahl mit Herkunft: Betrag, Fundstelle in der Verordnung, Umsatzsteuer.
  await expect(page.getByTestId('brutto')).toContainText('€');
  await expect(page.locator('#ergebnis .fundstelle').first()).toContainText('lfd. Nr.');

  // Und der ausdrückliche Hinweis, dass die Rechnung fachlich nicht
  // abgenommen ist. Ohne ihn wäre die Zahl eine Behauptung.
  await expect(page.getByText('fachlich noch nicht geprüft').first()).toBeVisible();
});

test('Ort: von der Karte zur Trefferliste mit Herkunft', async ({ page }) => {
  await page.goto('/de-de/tierarzt-karte/');

  await expect(page.locator('#trefferliste li').first()).toBeVisible();
  await expect(page.locator('#trefferliste h3').first()).not.toBeEmpty();
  await expect(page.locator('#treffer-status')).toContainText('erfasste Orte');

  // Herkunft und Lizenz stehen auf derselben Seite wie die Treffer.
  await expect(page.getByText('OpenStreetMap contributors').first()).toBeVisible();
});

test('Reise: von der Angabe zur Checkliste', async ({ page }) => {
  await page.goto('/de-de/reisecheck/');
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

  await expect(page.locator('#reiseergebnis')).toBeVisible();
  // Ohne fachliche Freigabe gibt es kein grünes Gesamtergebnis — auch
  // dann nicht, wenn jede einzelne Angabe stimmt.
  await expect(page.locator('#reiseergebnis')).not.toContainText(
    'Alle geprüften Punkte sind nach Ihren Angaben erfüllt.',
  );

  await page.goto('/de-de/reisecheck/oesterreich/');
  await expect(page.locator('.packliste > li').first()).toBeVisible();
  await expect(page.locator('.anforderungen > li').first()).toBeVisible();
});

test('Finder: gesperrtes Angebot mit Begründung statt leerer Seite', async ({ page }) => {
  await page.goto('/de-de/angebote/');
  await expect(page.getByTestId('katalog-leer')).toBeVisible();
  await expect(page.locator('[data-testid="katalog-liste"] li')).toHaveCount(0);
  // Kein Partnervertrag heißt: kein Angebot und keine Werbung — und ein Satz,
  // der das erklärt, statt einer leeren Liste.
  await expect(page.getByTestId('katalog-leer')).toContainText(/Vertrag|freigegeben|Programm/);
});

test('Futter: von der Suche zur Menge — und zur Begründung, warum es keinen Grundpreis gibt', async ({
  page,
}) => {
  await page.goto('/de-de/futter/');
  await page.fill('#futter-begriff', 'trockenfutter');
  await page.click('#futter-suchen');
  await expect(page.locator('#futter-treffer li').first()).toBeVisible();

  await page.goto('/de-de/futter/trocken-12kg/');
  // Die Menge ist die Voraussetzung für jeden Grundpreis; sie steht da.
  await expect(page.getByTestId('menge')).toContainText('12 kg');
  // Einen Grundpreis gibt es trotzdem nicht — weil es kein Angebot gibt.
  // Die Seite sagt das, statt eine Zahl zu erfinden oder nichts zu zeigen.
  await expect(page.getByTestId('keine-angebote')).toBeVisible();

  // Wo Nährwerte fehlen, steht „nicht deklariert“ und keine Null.
  await page.goto('/de-de/futter/trocken-1kg/');
  await expect(page.getByTestId('nicht-deklariert')).toContainText('keine Null');
});

test('Profil: anlegen, wiederfinden, löschen — und danach ist nichts mehr da', async ({ page }) => {
  await page.goto('/de-de/mein-tier/');
  await page.selectOption('#profil-tierart', 'dog');
  await page.fill('#profil-name', 'Bello');
  await page.click('#profil-speichern');
  await expect(page.locator('.profil__hinweis')).toContainText('Gespeichert');

  await page.reload();
  await expect(page.locator('#profil-name')).toHaveValue('Bello');

  await page.click('#profil-loeschen');
  const schluessel = await page.evaluate(() => Object.keys(window.localStorage));
  // Nicht „geleert“, sondern weg: kein einziger Schlüssel bleibt zurück.
  expect(schluessel.filter((eintrag) => eintrag.startsWith('petatlas.'))).toEqual([]);

  await page.reload();
  await expect(page.locator('#profil-name')).toHaveValue('');
});

test('Abgeschaltete Funktionen sind wirklich abgeschaltet', async ({ page }) => {
  // Dieser Lauf hat alle Flags an. Der reguläre Lauf prüft das Gegenstück:
  // ohne Flag gibt es die Seite nicht (tests/e2e/smoke.spec.ts).
  await page.goto('/de-de/');
  await expect(page.locator('header nav a').first()).toBeVisible();

  // Keine Werbung, solange kein Partnerprogramm freigegeben ist.
  await expect(page.locator('[data-testid^="angebot-"]')).toHaveCount(0);
});
