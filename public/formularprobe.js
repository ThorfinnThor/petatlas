/**
 * M04-05 — Auswertung der Formularprobe.
 *
 * Hängt sich an das Ereignis, das die gemeinsame Validierung auslöst, und
 * rechnet erst dann. Eine ungültige Eingabe erzeugt nie ein Ergebnis.
 */
const form = document.querySelector('#probe');
const ausgabe = document.querySelector('#ergebnis');

if (form && ausgabe) {
  form.addEventListener('formular:ungueltig', () => {
    // Das Ergebnisfeld darf keinen alten Wert stehen lassen.
    ausgabe.textContent = '';
  });

  form.addEventListener('formular:gueltig', () => {
    const kilogramm = Number(
      /** @type {HTMLInputElement} */ (document.querySelector('#kilogramm')).value
        .trim()
        .replace(',', '.'),
    );
    const faktorRoh = /** @type {HTMLInputElement} */ (
      document.querySelector('#faktor')
    ).value.trim();
    const faktor = faktorRoh === '' ? 1 : Number(faktorRoh.replace(',', '.'));

    ausgabe.textContent = `${Math.round(kilogramm * 1000 * faktor)} Gramm`;
  });
}
