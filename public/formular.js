/**
 * M04-05 — Formularvalidierung im Browser.
 *
 * Greift auf `form[data-validierung]` zu und arbeitet rein deklarativ über
 * `data-regel` an den Feldern. Kein Feld kennt seine Validierung selbst, und
 * es wird nichts an einen Server gesendet.
 *
 * Grundsätze:
 * - Fehler werden programmatisch zugeordnet (`aria-invalid`, Fehlertext im
 *   bereits verknüpften `aria-describedby`), nicht nur eingefärbt.
 * - Nach einem fehlgeschlagenen Absenden bekommt die Fehlerzusammenfassung
 *   den Fokus; ihre Einträge verlinken auf das jeweilige Feld.
 * - Eine leere oder ungültige Eingabe ergibt eine Meldung, nie ein Ergebnis
 *   von 0.
 */

/** @param {HTMLInputElement} feld */
function pruefeFeld(feld) {
  const roh = feld.value.trim();
  const regel = feld.dataset.regel;

  if (roh === '') {
    return feld.required ? (feld.dataset.fehlertext ?? 'Bitte ausfüllen.') : null;
  }

  if (regel === 'zahl-positiv' || regel === 'zahl-bereich') {
    const zahl = Number(roh.replace(',', '.'));
    if (!Number.isFinite(zahl)) return feld.dataset.fehlertext ?? 'Bitte eine Zahl eingeben.';
    if (regel === 'zahl-positiv' && zahl <= 0) return feld.dataset.fehlertext ?? 'Zu klein.';
    if (regel === 'zahl-bereich') {
      const min = feld.dataset.min === undefined ? -Infinity : Number(feld.dataset.min);
      const max = feld.dataset.max === undefined ? Infinity : Number(feld.dataset.max);
      if (zahl < min || zahl > max) return feld.dataset.fehlertext ?? 'Außerhalb des Bereichs.';
    }
  }

  return null;
}

/** @param {HTMLInputElement} feld @param {string | null} meldung */
function zeigeFeldfehler(feld, meldung) {
  const anzeige = document.getElementById(`${feld.id}-fehler`);
  if (!anzeige) return;

  if (meldung === null) {
    feld.removeAttribute('aria-invalid');
    anzeige.textContent = '';
    anzeige.hidden = true;
    return;
  }

  feld.setAttribute('aria-invalid', 'true');
  anzeige.textContent = meldung;
  anzeige.hidden = false;
}

/** @param {HTMLFormElement} form */
function initialisiere(form) {
  const zusammenfassungId = form.dataset.fehlerliste;
  const zusammenfassung = zusammenfassungId ? document.getElementById(zusammenfassungId) : null;
  const felder = /** @type {HTMLInputElement[]} */ ([
    ...form.querySelectorAll('input[data-regel]'),
  ]);

  function pruefeAlle() {
    /** @type {{ feld: HTMLInputElement, meldung: string }[]} */
    const fehler = [];
    for (const feld of felder) {
      const meldung = pruefeFeld(feld);
      zeigeFeldfehler(feld, meldung);
      if (meldung !== null) fehler.push({ feld, meldung });
    }
    return fehler;
  }

  function zeigeZusammenfassung(fehler) {
    if (!zusammenfassung) return;
    const liste = zusammenfassung.querySelector('ul');
    if (!liste) return;

    liste.replaceChildren();
    if (fehler.length === 0) {
      zusammenfassung.hidden = true;
      return;
    }

    for (const { feld, meldung } of fehler) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${feld.id}`;
      link.textContent = `${feld.dataset.label ?? feld.name}: ${meldung}`;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        feld.focus();
      });
      li.append(link);
      liste.append(li);
    }
    zusammenfassung.hidden = false;
    zusammenfassung.focus();
  }

  // Ein Feld, das schon rot ist, wird beim Tippen sofort wieder geprüft;
  // ein noch unberührtes Feld wird nicht vorzeitig angemeckert.
  for (const feld of felder) {
    feld.addEventListener('input', () => {
      if (feld.getAttribute('aria-invalid') === 'true') zeigeFeldfehler(feld, pruefeFeld(feld));
    });
    // Erst beim Absenden neue Fehler einblenden: ein Layoutsprung während
    // mousedown/blur kann sonst den folgenden Klick auf den Submit-Button verlieren.
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fehler = pruefeAlle();
    zeigeZusammenfassung(fehler);
    if (fehler.length > 0) {
      form.dispatchEvent(
        new CustomEvent('formular:ungueltig', { detail: { anzahl: fehler.length } }),
      );
      return;
    }
    form.dispatchEvent(new CustomEvent('formular:gueltig', { bubbles: false }));
  });
}

for (const form of document.querySelectorAll('form[data-validierung]')) {
  initialisiere(/** @type {HTMLFormElement} */ (form));
}
