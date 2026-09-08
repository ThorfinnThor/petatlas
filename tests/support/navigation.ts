/**
 * Hilfe für Tests, die einen Navigationseintrag anklicken.
 *
 * Seit dem Designdurchgang klappt die Hauptnavigation auf schmalen Geräten
 * hinter einem Menüknopf ein (Designvertrag Abschnitt 9.2). Ein Test, der
 * einfach auf einen Navigationslink klickt, prüfte damit nur noch das
 * Desktoplayout. Diese Hilfe geht den Weg, den auch ein Mensch geht: erst
 * das Menü öffnen, falls es eines gibt.
 */
import type { Page } from '@playwright/test';

export async function hauptnavigationOeffnen(page: Page): Promise<void> {
  const knopf = page.locator('#menue-knopf');
  if ((await knopf.count()) === 0) return;
  if (!(await knopf.isVisible())) return;
  if ((await knopf.getAttribute('aria-expanded')) === 'true') return;
  await knopf.click();
}
