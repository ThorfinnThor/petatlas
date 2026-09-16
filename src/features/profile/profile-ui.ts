/**
 * M16-01 — Profilformular im Browser.
 *
 * Der Zustand liegt in einer Variablen dieses Tabs. Er wird **nicht**
 * gespeichert und **nicht** übertragen: kein `fetch`, kein `localStorage`,
 * kein Bild-Pixel, keine URL-Parameter. Wer die Seite neu lädt, fängt neu an
 * — und genau das steht auch auf der Seite.
 *
 * Seit M16-02 gibt es zwei Knöpfe: Speichern und Löschen. Beides ist eine
 * ausdrückliche Handlung, beides meldet sein Ergebnis im Klartext — auch den
 * Fehlschlag, etwa im privaten Modus oder bei vollem Speicher.
 */
import {
  INTERESSEN,
  LEERER_ENTWURF,
  alsProfil,
  bereinigeInteressen,
  bewerte,
  pruefeGewicht,
  type GewichtsPruefung,
  type ProfilEntwurf,
} from './state.ts';
import { browserSpeicher, lade, loesche, speichere } from './storage.ts';
import { EXPORT_WARNUNG, MAX_IMPORT_BYTES, baueExport, pruefeImport } from './import-export.ts';
import type { ExportDatei } from './import-export.ts';
import { ersetzeDurchSicherung, offeneSicherungZuruecksetzen } from './backup-transaction.ts';
import { FAVORITES_STORAGE_KEY, lese as leseMerkliste } from './favorites.ts';
import { PACKING_STORAGE_KEY, lese as lesePacken } from './packing-state.ts';

let entwurf: ProfilEntwurf = LEERER_ENTWURF;
/** Letzte Rückmeldung zu Speichern oder Löschen. `null` = noch keine. */
let letzteMeldung: string | null = null;
let entwurfUngespeichert = false;
let gewichtsPruefung: GewichtsPruefung = { status: 'leer', gramm: null, meldung: null };
let wartenderImport: ExportDatei | null = null;
let importLauf = 0;

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
  gewichtsPruefung = pruefeGewicht(wert('profil-gewicht'));
  const gewicht = gewichtsPruefung.gramm;
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

function gewichtsFehlerZeigen(): void {
  const feld = document.querySelector<HTMLInputElement>('#profil-gewicht');
  const fehler = document.querySelector<HTMLElement>('#profil-gewicht-fehler');
  if (feld === null || fehler === null) return;
  if (gewichtsPruefung.status === 'ungueltig') {
    feld.setAttribute('aria-invalid', 'true');
    fehler.textContent = gewichtsPruefung.meldung;
    fehler.hidden = false;
  } else {
    feld.removeAttribute('aria-invalid');
    fehler.textContent = '';
    fehler.hidden = true;
  }
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
        <dt>Tierart</dt><dd data-feld="species">${escape(
          profil.species === 'dog' ? 'Hund' : profil.species === 'cat' ? 'Katze' : profil.species,
        )}</dd>
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
    `<p class="profil__hinweis">${escape(
      letzteMeldung === null
        ? entwurfUngespeichert
          ? 'Änderungen noch nicht gespeichert.'
          : 'Diese Angaben liegen in diesem Tab. Gespeichert wird nur, wenn Sie es sagen; ' +
            'übertragen wird nie etwas.'
        : letzteMeldung,
    )}</p>`,
  );

  ausgabe.innerHTML = teile.join('');
  gewichtsFehlerZeigen();
}

/** Setzt die Felder aus einem geladenen Stand. */
function schreibeFelder(entwurfNeu: ProfilEntwurf): void {
  const setze = (id: string, wert: string): void => {
    const feld = document.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`);
    if (feld !== null) feld.value = wert;
  };
  setze('profil-tierart', entwurfNeu.species ?? '');
  setze('profil-name', entwurfNeu.displayName);
  setze(
    'profil-gewicht',
    entwurfNeu.weightGrams === null ? '' : String(entwurfNeu.weightGrams / 1000),
  );
  setze('profil-geburtsdatum', entwurfNeu.birthDate ?? '');
  setze('profil-rasse', entwurfNeu.breed ?? '');
  for (const feld of document.querySelectorAll<HTMLInputElement>('input[name="interesse"]')) {
    feld.checked = entwurfNeu.interests.includes(feld.value);
  }
}

function speicherWert(schluessel: string): string | null {
  const ablage = browserSpeicher();
  if (ablage === null) return null;
  try {
    return ablage.getItem(schluessel);
  } catch {
    return null;
  }
}

/**
 * Baut die Exportdatei aus dem, was **gespeichert** ist — nicht aus dem, was
 * gerade im Formular steht. Was nie gespeichert wurde, gehört auch nicht in
 * eine Sicherung.
 */
function exportDaten(): string {
  const stand = lade(browserSpeicher());
  const merkliste = leseMerkliste(speicherWert(FAVORITES_STORAGE_KEY));
  const packen = lesePacken(speicherWert(PACKING_STORAGE_KEY), new Date().toISOString());
  return JSON.stringify(
    baueExport({
      profile: stand.wert?.profile ?? null,
      interests: stand.wert?.interests ?? [],
      favorites: merkliste.entries.length === 0 ? null : merkliste,
      packing: Object.keys(packen.ziele).length === 0 ? null : packen,
      exportedAt: new Date().toISOString(),
    }),
    null,
    2,
  );
}

export function profilStarten(): void {
  const form = document.querySelector<HTMLFormElement>('#profilform');
  if (form === null) return;

  const hinweis = document.querySelector<HTMLElement>('#profil-ohne-js');
  if (hinweis !== null) hinweis.hidden = true;

  const alsUngespeichertMarkieren = (): void => {
    entwurf = lies();
    entwurfUngespeichert = true;
    letzteMeldung = 'Änderungen noch nicht gespeichert.';
    zeige();
  };
  form.addEventListener('input', alsUngespeichertMarkieren);
  form.addEventListener('change', alsUngespeichertMarkieren);
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
      gewichtsPruefung = { status: 'leer', gramm: null, meldung: null };
      entwurfUngespeichert = false;
      letzteMeldung = 'Angaben verworfen. Ein gespeicherter Stand bleibt davon unberührt.';
      zeige();
    });
  }

  const speichern = document.querySelector<HTMLButtonElement>('#profil-speichern');
  if (speichern !== null) {
    speichern.hidden = false;
    speichern.addEventListener('click', () => {
      entwurf = lies();
      if (gewichtsPruefung.status === 'ungueltig') {
        letzteMeldung = 'Bitte korrigieren Sie das Gewicht. Es wurde nichts gespeichert.';
        zeige();
        document.querySelector<HTMLInputElement>('#profil-gewicht')?.focus();
        return;
      }
      const profil = alsProfil(entwurf);
      if (profil === null) {
        letzteMeldung = 'Zum Speichern fehlen Tierart oder Rufname. Es wurde nichts gespeichert.';
        zeige();
        return;
      }
      const ergebnis = speichere(
        browserSpeicher(),
        profil,
        entwurf.interests,
        new Date().toISOString(),
      );
      letzteMeldung = ergebnis.meldung;
      if (ergebnis.ok) entwurfUngespeichert = false;
      zeige();
    });
  }

  const entfernen = document.querySelector<HTMLButtonElement>('#profil-loeschen');
  if (entfernen !== null) {
    entfernen.hidden = false;
    entfernen.addEventListener('click', () => {
      letzteMeldung = loesche(browserSpeicher()).meldung;
      zeige();
    });
  }

  const exportKnopf = document.querySelector<HTMLButtonElement>('#profil-export');
  if (exportKnopf !== null) {
    exportKnopf.hidden = false;
    exportKnopf.addEventListener('click', () => {
      const datei = new Blob([exportDaten()], { type: 'application/json' });
      const adresse = URL.createObjectURL(datei);
      const verweis = document.createElement('a');
      verweis.href = adresse;
      verweis.download = `petatlas-lokal-${new Date().toISOString().slice(0, 10)}.json`;
      verweis.click();
      URL.revokeObjectURL(adresse);
      letzteMeldung = EXPORT_WARNUNG;
      zeige();
    });
  }

  const importFeld = document.querySelector<HTMLInputElement>('#profil-import');
  const importBestaetigung = document.querySelector<HTMLElement>('#profil-import-bestaetigung');
  const importVorschau = document.querySelector<HTMLElement>('#profil-import-vorschau');
  const importBestaetigen = document.querySelector<HTMLButtonElement>('#profil-import-bestaetigen');
  const importAbbrechen = document.querySelector<HTMLButtonElement>('#profil-import-abbrechen');

  const importVorschauSchliessen = (): void => {
    wartenderImport = null;
    if (importVorschau !== null) importVorschau.textContent = '';
    if (importBestaetigung !== null) importBestaetigung.hidden = true;
  };

  importAbbrechen?.addEventListener('click', () => {
    importLauf += 1;
    importVorschauSchliessen();
    letzteMeldung = 'Übernahme abgebrochen. Der lokale Stand blieb unverändert.';
    zeige();
  });

  importBestaetigen?.addEventListener('click', () => {
    if (wartenderImport === null) return;
    const daten = wartenderImport;
    const ergebnis = ersetzeDurchSicherung(browserSpeicher(), daten, new Date().toISOString());
    letzteMeldung = ergebnis.meldung;
    if (ergebnis.ok) {
      entwurf =
        daten.profile === null
          ? LEERER_ENTWURF
          : {
              species: daten.profile.species,
              displayName: daten.profile.displayName,
              birthDate: daten.profile.birthDate,
              weightGrams: daten.profile.weightGrams,
              breed: daten.profile.breed,
              interests: bereinigeInteressen(daten.interests),
            };
      gewichtsPruefung =
        entwurf.weightGrams === null
          ? { status: 'leer', gramm: null, meldung: null }
          : { status: 'gueltig', gramm: entwurf.weightGrams, meldung: null };
      entwurfUngespeichert = false;
      schreibeFelder(entwurf);
    }
    importVorschauSchliessen();
    zeige();
  });

  if (importFeld !== null) {
    importFeld.hidden = false;
    importFeld.addEventListener('change', () => {
      const datei = importFeld.files?.[0];
      if (datei === undefined) return;
      if (datei.size > MAX_IMPORT_BYTES) {
        letzteMeldung = `Die Datei ist zu groß (${Math.round(datei.size / 1024)} KiB) und wurde nicht gelesen.`;
        zeige();
        importFeld.value = '';
        return;
      }

      const dieserLauf = ++importLauf;
      importVorschauSchliessen();
      void datei
        .text()
        .then((inhalt) => {
          if (dieserLauf !== importLauf) return;
          const ergebnis = pruefeImport(inhalt);
          letzteMeldung = ergebnis.meldung;
          if (ergebnis.ok && ergebnis.daten !== null) {
            wartenderImport = ergebnis.daten;
            const profilText = ergebnis.daten.profile
              ? `${ergebnis.daten.profile.species === 'dog' ? 'Hund' : 'Katze'} „${ergebnis.daten.profile.displayName}“`
              : 'kein Profil';
            const favoriten = ergebnis.daten.favorites?.entries.length ?? 0;
            const packlisten = Object.keys(ergebnis.daten.packing?.ziele ?? {}).length;
            if (importVorschau !== null) {
              importVorschau.textContent = `Enthalten: ${profilText}, ${favoriten} Merkliste-Einträge und ${packlisten} Packlisten.`;
            }
            if (importBestaetigung !== null) importBestaetigung.hidden = false;
            importBestaetigen?.focus();
          }
          zeige();
        })
        .catch(() => {
          if (dieserLauf !== importLauf) return;
          letzteMeldung = 'Die Datei konnte nicht gelesen werden. Es wurde nichts übernommen.';
          importVorschauSchliessen();
          zeige();
        })
        .finally(() => {
          if (dieserLauf === importLauf) importFeld.value = '';
        });
    });
  }

  const erholung = offeneSicherungZuruecksetzen(browserSpeicher());
  if (!erholung.ok) letzteMeldung = erholung.meldung;

  // Ein gespeicherter Stand wird geladen — aber nur, wenn es einen gibt.
  const vorhanden = lade(browserSpeicher());
  if (vorhanden.ok && vorhanden.wert !== null) {
    entwurf = {
      species: vorhanden.wert.profile.species,
      displayName: vorhanden.wert.profile.displayName,
      birthDate: vorhanden.wert.profile.birthDate,
      weightGrams: vorhanden.wert.profile.weightGrams,
      breed: vorhanden.wert.profile.breed,
      interests: bereinigeInteressen(vorhanden.wert.interests),
    };
    schreibeFelder(entwurf);
    if (letzteMeldung === null)
      letzteMeldung = 'Gespeicherter Stand geladen — er liegt nur auf diesem Gerät.';
  } else if (vorhanden.fehler !== null && vorhanden.fehler !== 'kein_speicher') {
    letzteMeldung = vorhanden.meldung;
  }

  zeige();
}
