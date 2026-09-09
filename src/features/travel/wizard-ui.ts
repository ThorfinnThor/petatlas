/**
 * M12-04 — Der Reisecheck im Browser.
 *
 * Alles läuft lokal: keine Anfrage, kein Speichern, keine Übertragung der
 * Angaben. Die Regeln liegen im Bundle, weil sie klein und statisch sind.
 *
 * Ohne JavaScript bleibt die Seite lesbar — Umfang, Ausnahmen und die
 * amtlichen Verweise stehen im HTML. Nur das Ausrechnen fehlt dann, und die
 * Seite sagt das auch.
 */
import { ZUSTAND_LABEL, pruefeWizard, type Angabe, type WizardEingabe } from './wizard.ts';

function wert(id: string): string {
  const feld = document.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`);
  return feld === null ? '' : feld.value.trim();
}

/**
 * M21-05: Die Tierart ist eine Radiogruppe (Auswahlkarten). Ohne Auswahl
 * gibt es keinen Wert — geraten wird keiner.
 */
function gewaehlt(name: string): string {
  const feld = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return feld === null ? '' : feld.value.trim();
}

function angabe(id: string): Angabe {
  const roh = wert(id);
  return roh === 'ja' || roh === 'nein' ? roh : 'unbekannt';
}

function datum(id: string): string | null {
  const roh = wert(id);
  return /^\d{4}-\d{2}-\d{2}$/.test(roh) ? roh : null;
}

function transitLaender(): string[] {
  return [...document.querySelectorAll<HTMLInputElement>('input[name="transit"]:checked')].map(
    (feld) => feld.value,
  );
}

function escape(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

function eingabeLesen(): WizardEingabe {
  return {
    species: gewaehlt('tierart'),
    destination: wert('ziel'),
    transit: transitLaender(),
    direction: wert('richtung'),
    animals: Number(wert('anzahl') || '1'),
    travelDate: wert('reisedatum'),
    birthDate: datum('geburtsdatum'),
    microchipped: angabe('chip'),
    identificationDate: datum('chipdatum'),
    rabiesVaccinated: angabe('impfung'),
    rabiesVaccinationDate: datum('impfdatum'),
    euPetPassport: angabe('ausweis'),
    accompaniedByOwner: angabe('begleitung'),
    // Der Prüftag kommt aus dem Browser, nicht aus dem Build: eine
    // ausgelieferte Seite kann Wochen alt sein, und eine fachliche Freigabe
    // altert weiter, während sie herumliegt (M17-04).
    heute: new Date().toISOString().slice(0, 10),
  };
}

const GESAMT_TEXT: Readonly<Record<string, string>> = {
  fulfilled: 'Alle geprüften Punkte sind nach Ihren Angaben erfüllt.',
  not_fulfilled: 'Mindestens ein Punkt ist nach Ihren Angaben nicht erfüllt.',
  unknown: 'Kein Gesamtergebnis.',
  not_applicable: 'Diese Reise wird hier nicht geprüft.',
};

export function reisecheckStarten(): void {
  const form = document.querySelector<HTMLFormElement>('#reiseform');
  const ausgabe = document.querySelector<HTMLElement>('#reiseergebnis');
  if (form === null || ausgabe === null) return;

  const hinweisOhneJs = document.querySelector<HTMLElement>('#ohne-javascript');
  if (hinweisOhneJs !== null) hinweisOhneJs.hidden = true;
  const knopf = document.querySelector<HTMLButtonElement>('#pruefen');
  if (knopf !== null) knopf.hidden = false;

  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    const eingabe = eingabeLesen();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eingabe.travelDate)) {
      ausgabe.innerHTML =
        '<p class="ergebnis__kopf" data-zustand="unknown">Bitte tragen Sie das Reisedatum ein. ' +
        'Ohne den Tag der Reise lassen sich Fristen nicht prüfen.</p>';
      return;
    }

    const ergebnis = pruefeWizard(eingabe);
    const teile: string[] = [];

    teile.push(
      `<p class="ergebnis__kopf" data-zustand="${escape(ergebnis.gesamt)}">${escape(
        GESAMT_TEXT[ergebnis.gesamt] ?? 'Kein Gesamtergebnis.',
      )}</p>`,
    );

    for (const hinweis of ergebnis.hinweise) {
      teile.push(`<p class="ergebnis__hinweis">${escape(hinweis)}</p>`);
    }

    if (!ergebnis.umfang.unterstuetzt) {
      teile.push(
        '<h3>Warum diese Reise hier nicht geprüft wird</h3><ul class="ergebnis__gruende">',
      );
      for (const grund of ergebnis.umfang.gruende) {
        teile.push(`<li>${escape(grund)}</li>`);
      }
      teile.push('</ul>');
    }

    if (ergebnis.pruefung !== null && ergebnis.pruefung.positionen.length > 0) {
      teile.push('<h3>Checkliste</h3><ul class="ergebnis__punkte">');
      for (const position of ergebnis.pruefung.positionen) {
        teile.push(
          `<li data-zustand="${escape(position.state)}" data-anforderung="${escape(
            position.requirementId,
          )}">` +
            `<p class="punkt__zustand">${escape(ZUSTAND_LABEL[position.state])}</p>` +
            `<p>${escape(position.guidance)}</p>` +
            `<p><a href="${escape(position.officialSourceUrl)}" rel="nofollow noopener">Amtliche Fundstelle</a></p>` +
            '</li>',
        );
      }
      teile.push('</ul>');
    }

    ausgabe.innerHTML = teile.join('');
  });
}
