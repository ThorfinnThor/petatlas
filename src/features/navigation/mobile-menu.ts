/**
 * Mobiles Menü nach `docs/DESIGN_SPECIFICATIONS.md` Abschnitt 9.2.
 *
 * Fortschrittliche Verbesserung: ohne JavaScript bleibt die vollständige
 * Navigationsliste sichtbar. Erst wenn dieses Skript läuft, erscheint der
 * Menüknopf und die Liste klappt ein — ein Knopf, der nichts tut, wäre
 * schlimmer als eine lange Liste.
 *
 * Es gibt keinen Fokusfang und keinen Dialog: das Panel steht im
 * Dokumentfluss unter dem Kopfbereich (Abschnitt 37.1 — Dialoge sparsam).
 */
export const KNOPF_ID = 'menue-knopf';
export const NAV_ID = 'hauptnavigation';

export function menueStarten(dokument: Document = document): void {
  const knopf = dokument.getElementById(KNOPF_ID);
  const navigation = dokument.getElementById(NAV_ID);
  if (knopf === null || navigation === null) return;

  knopf.hidden = false;
  navigation.dataset.eingeklappt = 'true';
  knopf.setAttribute('aria-expanded', 'false');

  knopf.addEventListener('click', () => {
    const offen = navigation.dataset.eingeklappt !== 'true';
    navigation.dataset.eingeklappt = offen ? 'true' : 'false';
    knopf.setAttribute('aria-expanded', offen ? 'false' : 'true');
  });

  // Nach einem Klick auf einen Link ist das Menü erledigt.
  for (const link of navigation.querySelectorAll('a')) {
    link.addEventListener('click', () => {
      navigation.dataset.eingeklappt = 'true';
      knopf.setAttribute('aria-expanded', 'false');
    });
  }

  // Escape schließt, der Fokus geht zurück auf den Knopf.
  navigation.addEventListener('keydown', (ereignis) => {
    if ((ereignis as KeyboardEvent).key !== 'Escape') return;
    navigation.dataset.eingeklappt = 'true';
    knopf.setAttribute('aria-expanded', 'false');
    knopf.focus();
  });
}
