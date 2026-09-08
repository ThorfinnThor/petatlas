/**
 * M16-01 — Profilformular im Browser.
 *
 * Der Zustand liegt in einer Variablen dieses Tabs. Er wird **nicht**
 * gespeichert und **nicht** übertragen: kein `fetch`, kein `localStorage`,
 * kein Bild-Pixel, keine URL-Parameter. Wer die Seite neu lädt, fängt neu an
 * — und genau das steht auch auf der Seite.
 *
 * Das Speichern kommt in M16-02 und bleibt eine ausdrückliche Handlung.
 */
import {
  INTERESSEN,
  LEERER_ENTWURF,
  alsProfil,
  bereinigeInteressen,
  bewerte,
  gewichtInGramm,
  type ProfilEntwurf,
} from './state.ts';

let entwurf: ProfilEntwurf = LEERER_ENTWURF;

function escape(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

function lies(): ProfilEntwurf {
  const wert = (id: string): string =>
    document.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)?.value.trim() ?? '';
  const art = wert('profil-tierart');
  const gewicht = gewichtInGramm(wert('profil-gewicht'));
  const geburt = wert('profil-geburtsdatum');
  const rasse = wert('profil-rasse');
  return {
    species: art === '' ? null : art,
    displayName: wert('profil-name'),
    birthDate: /^\d{4}-\d{2}-\d{2}$/.test(geburt) ? geburt : null,
    weightGrams: gewicht,
    breed: rasse === '' ? null : rasse,
    interests: bereinigeInteressen(
      [...document.querySelectorAll<HTMLInputElement>('input[name="interesse"]:checked')].map(
        (feld) => feld.value,
      ),
    ),
  };
}

function zeige(): void {
  const ausgabe = document.querySelector<HTMLElement>('#profil-stand');
  if (ausgabe === null) return;

  const zustand = bewerte(entwurf);
  const profil = alsProfil(entwurf, '00000000-0000-4000-8000-000000000000');
  const teile: string[] = [];

  teile.push(
    `<p class="profil__kopf" data-gueltig="${zustand.gueltig}">${
      zustand.gueltig
        ? 'Das Profil ist vollständig genug für die Vorauswahl.'
        : 'Das Profil ist unvollständig — die Werkzeuge funktionieren trotzdem.'
    }</p>`,
  );

  if (zustand.offen.length > 0) {
    teile.push(
      `<ul class="profil__offen">${zustand.offen
        .map((eintrag) => `<li>${escape(eintrag)}</li>`)
        .join('')}</ul>`,
    );
  }

  if (profil !== null) {
    const gewicht =
      profil.weightGrams === null
        ? 'nicht angegeben'
        : `${(profil.weightGrams / 1000).toLocaleString('de-DE')} kg`;
    teile.push(
      `<dl class="profil__werte">
        <dt>Tierart</dt><dd data-feld="species">${escape(profil.species)}</dd>
        <dt>Rufname</dt><dd data-feld="displayName">${escape(profil.displayName)}</dd>
        <dt>Gewicht</dt><dd data-feld="weight">${escape(gewicht)}</dd>
        <dt>Interessen</dt><dd data-feld="interests">${
          entwurf.interests.length === 0
            ? 'keine ausgewählt'
            : escape(entwurf.interests.map((eintrag) => INTERESSEN[eintrag] ?? eintrag).join(', '))
        }</dd>
      </dl>`,
    );
  }

  teile.push(
    '<p class="profil__hinweis">Diese Angaben liegen nur in diesem Tab. Sie werden nicht ' +
      'gespeichert und nicht übertragen; beim Neuladen sind sie weg.</p>',
  );

  ausgabe.innerHTML = teile.join('');
}

export function profilStarten(): void {
  const form = document.querySelector<HTMLFormElement>('#profilform');
  if (form === null) return;

  const hinweis = document.querySelector<HTMLElement>('#profil-ohne-js');
  if (hinweis !== null) hinweis.hidden = true;

  form.addEventListener('input', () => {
    entwurf = lies();
    zeige();
  });
  form.addEventListener('change', () => {
    entwurf = lies();
    zeige();
  });
  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    entwurf = lies();
    zeige();
  });

  const leeren = document.querySelector<HTMLButtonElement>('#profil-leeren');
  if (leeren !== null) {
    leeren.hidden = false;
    leeren.addEventListener('click', () => {
      form.reset();
      entwurf = LEERER_ENTWURF;
      zeige();
    });
  }

  zeige();
}
