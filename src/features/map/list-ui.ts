/**
 * M11-01 — Trefferliste im Browser.
 *
 * Erweitert die statisch gebaute Liste. Ohne JavaScript bleibt die Seite
 * vollständig lesbar; dieses Modul tauscht nur den Ausschnitt.
 *
 * Geladen wird nur, was gebraucht wird: der Namensteil zum getippten
 * Anfangsbuchstaben und die räumlichen Zellen um den gewählten Punkt.
 * Es gibt keinen Vorabdownload des Gesamtbestands.
 */
import {
  KATEGORIE_LABEL,
  filtereOrte,
  formatiereEntfernung,
  leereListeHinweis,
  notdienstHinweis,
  type ListenOrt,
} from './list.ts';
import { merkknoepfeBinden } from '../profile/favorites-ui.ts';
import { frageStandort, standortLabel } from './geolocation.ts';
import { zeigeKarte, waehleMarker, type KartenZustand } from './map.ts';
import { normalisiere, sucheOrte, type OrtsEintrag } from './place-search.ts';
import { ladeManifest, ladeZellenUm, ortMitId } from './data.ts';
import { darstellung } from './website.ts';

let geladeneNamenCache: Map<string, readonly OrtsEintrag[]> | null = null;

function geladeneNamen(): Map<string, readonly OrtsEintrag[]> {
  geladeneNamenCache ??= new Map<string, readonly OrtsEintrag[]>();
  return geladeneNamenCache;
}

/** Lädt den Namensteil zum getippten Anfang, nicht den ganzen Index. */
async function ladeNamen(begriff: string): Promise<readonly OrtsEintrag[]> {
  const normal = normalisiere(begriff);
  const erster = /^[a-z]/.test(normal) ? (normal[0] as string) : '0';

  const gesammelt: OrtsEintrag[] = [];
  const chunks = await ladeManifest();
  // Ein Anfangsbuchstabe kann in einen oder in mehrere Teile geteilt sein.
  const passende = chunks.filter(
    (chunk) =>
      chunk.chunkId.startsWith('places-de-names-') &&
      chunk.chunkId.replace('places-de-names-', '').startsWith(erster),
  );

  for (const chunk of passende) {
    const vorhanden = geladeneNamen().get(chunk.chunkId);
    if (vorhanden !== undefined) {
      gesammelt.push(...vorhanden);
      continue;
    }
    const antwort = await fetch(chunk.path);
    if (!antwort.ok) throw new Error(`Ortsnamen antworten mit ${antwort.status}.`);
    const daten = (await antwort.json()) as { entries: OrtsEintrag[] };
    geladeneNamen().set(chunk.chunkId, daten.entries);
    gesammelt.push(...daten.entries);
  }
  return gesammelt;
}

function escape(wert: string): string {
  return wert.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

function trefferMarkup(treffer: ReturnType<typeof filtereOrte>[number], mitMerken = false): string {
  const ort = treffer.ort;
  const notdienst = notdienstHinweis(ort.emergency);
  return `
    <li>
      <h3>${escape(ort.name)}</h3>
      <p class="meta">${escape(KATEGORIE_LABEL[ort.category] ?? ort.category)} ·
        ${escape(formatiereEntfernung(treffer.entfernungMeter))} · ${escape(treffer.ortsLabel)}${
          treffer.punktBerechnet ? ' · Position berechnet' : ''
        }</p>
      ${
        ort.openingHours === null
          ? '<p class="unbekannt">Öffnungszeiten nicht erfasst</p>'
          : `<p>Öffnungszeiten: ${escape(ort.openingHours)}</p>`
      }
      ${ort.phone === null ? '' : `<p>Telefon: <a href="tel:${escape(ort.phone.replace(/\s/g, ''))}">${escape(ort.phone)}</a></p>`}
      ${webZeile(ort.website)}
      ${mitMerken ? `<p><button type="button" data-merken="place" data-id="${escape(ort.id)}" data-lat="${ort.lat}" data-lon="${ort.lon}" hidden>Merken</button></p>` : ''}
      ${notdienst === null ? '' : `<p class="notdienst">${escape(notdienst)}</p>`}
    </li>`;
}

/** Website als Link, als Text oder gar nicht — siehe `website.ts`. */
function webZeile(website: string | null): string {
  const web = darstellung(website);
  if (web.art === 'link') {
    return `<p><a href="${escape(web.url)}" rel="nofollow noopener">Website</a></p>`;
  }
  if (web.art === 'text') {
    return `<p class="unbekannt">Website: ${escape(web.adresse)} (${escape(web.hinweis)})</p>`;
  }
  return '';
}

export function listeStarten(): void {
  const form = document.querySelector<HTMLFormElement>('#ortsfilter');
  const ortsFeld = document.querySelector<HTMLInputElement>('#ort');
  const ortsHinweis = document.querySelector<HTMLElement>('#ort-hinweis');
  const ortsTreffer = document.querySelector<HTMLUListElement>('#ort-treffer');
  const radius = document.querySelector<HTMLSelectElement>('#radius');
  const status = document.querySelector<HTMLElement>('#treffer-status');
  const liste = document.querySelector<HTMLUListElement>('#trefferliste');

  if (!form || !ortsFeld || !ortsHinweis || !ortsTreffer || !radius || !status || !liste) return;

  const mitMerken = liste.dataset.profile === 'true';
  if (mitMerken) merkknoepfeBinden(liste);
  const erneut = document.querySelector<HTMLButtonElement>('#ortsdaten-erneut');
  const ladefehler = document.querySelector<HTMLElement>('#orts-ladefehler');
  const karteKnopf = document.querySelector<HTMLButtonElement>('#karte-anzeigen');
  const karteBehaelter = document.querySelector<HTMLElement>('#karte');
  const karteStatus = document.querySelector<HTMLElement>('#karte-status');

  let gewaehlt: { name: string; latitude: number; longitude: number } | null = {
    name: 'Berlin',
    latitude: 52.5174,
    longitude: 13.3951,
  };
  let datenGeladen = false;
  let letzteOrte: readonly ListenOrt[] = [];
  let karteAktiv = false;
  let kartenZustand: KartenZustand | undefined;
  let kartenLauf: Promise<void> = Promise.resolve();
  let suchLauf = 0;

  function kategorien(): string[] {
    return [...document.querySelectorAll<HTMLInputElement>('input[name="kategorie"]:checked')].map(
      (feld) => feld.value,
    );
  }

  async function aktualisiere(): Promise<void> {
    if (gewaehlt === null) return;
    const lauf = ++suchLauf;
    datenGeladen = false;
    const radiusMeter = Number(radius!.value);
    status!.textContent = 'Wird geladen …';
    if (erneut) erneut.disabled = true;
    if (ladefehler) ladefehler.hidden = true;

    try {
      const orte = await ladeZellenUm(gewaehlt.latitude, gewaehlt.longitude, radiusMeter);
      if (lauf !== suchLauf) return;
      const treffer = filtereOrte(orte, {
        mitte: { latitude: gewaehlt.latitude, longitude: gewaehlt.longitude },
        gemeinde: gewaehlt.name,
        radiusMeter,
        kategorien: kategorien(),
        maxTreffer: 100,
      });

      datenGeladen = true;
      if (erneut) erneut.hidden = true;
      letzteOrte = treffer.map((eintrag) => eintrag.ort);
      liste!.innerHTML = treffer.map((treffer) => trefferMarkup(treffer, mitMerken)).join('');
      if (mitMerken) merkknoepfeBinden(liste!);
      if (karteAktiv) void zeichneKarte();
      status!.textContent =
        treffer.length === 0
          ? leereListeHinweis(gewaehlt.name, radiusMeter)
          : `${treffer.length} erfasste Orte im Umkreis von ${formatiereEntfernung(radiusMeter)} um ${gewaehlt.name}.`;
    } catch (fehler) {
      if (lauf !== suchLauf) return;
      // Ein Ladefehler wird benannt; die vorherige Liste bleibt stehen.
      status!.textContent =
        'Die Ortsdaten konnten nicht geladen werden. Die bisherige Anzeige bleibt bestehen.';
      if (ladefehler) {
        ladefehler.hidden = false;
        ladefehler.textContent = status!.textContent;
      }
      if (erneut) {
        erneut.hidden = false;
        erneut.disabled = false;
      }
      console.error('Ortsdaten:', fehler);
    }
  }

  function zeichneKarte(): Promise<void> {
    // Leaflet bleibt an denselben Container gebunden. Auch während des ersten
    // Imports dürfen schnelle Orts-/Filterwechsel keine zweite Instanz erzeugen.
    kartenLauf = kartenLauf.then(zeichneKarteJetzt);
    return kartenLauf;
  }

  async function zeichneKarteJetzt(): Promise<void> {
    if (!karteBehaelter || !karteStatus || gewaehlt === null) return;
    karteBehaelter.hidden = false;

    const { gezeigt, ausgelassen } = waehleMarker(letzteOrte);
    try {
      kartenZustand = await zeigeKarte(
        {
          container: karteBehaelter,
          mitte: { latitude: gewaehlt.latitude, longitude: gewaehlt.longitude },
          orte: letzteOrte,
          // Ein Ausfall des Kacheldienstes betrifft nur die Karte.
          beiKachelfehler: () => {
            karteStatus.textContent =
              'Der Kartendienst liefert gerade keine Kacheln. Die Trefferliste bleibt nutzbar.';
            if (karteKnopf) {
              karteKnopf.disabled = false;
              karteKnopf.textContent = 'Karte erneut laden';
            }
          },
          beiKachelerfolg: () => {
            const { gezeigt, ausgelassen } = waehleMarker(letzteOrte);
            karteStatus.textContent =
              ausgelassen === 0
                ? `${gezeigt.length} Orte auf der Karte.`
                : `${gezeigt.length} von ${gezeigt.length + ausgelassen} Orten auf der Karte; der Rest steht in der Liste.`;
            if (karteKnopf) {
              karteKnopf.disabled = true;
              karteKnopf.textContent = 'Karte anzeigen';
            }
          },
        },
        kartenZustand,
      );
      karteStatus.textContent =
        ausgelassen === 0
          ? `${gezeigt.length} Orte auf der Karte.`
          : `${gezeigt.length} von ${gezeigt.length + ausgelassen} Orten auf der Karte; der Rest steht in der Liste.`;
    } catch (fehler) {
      karteStatus.textContent = 'Die Karte konnte nicht geladen werden. Die Liste bleibt nutzbar.';
      if (karteKnopf) {
        karteKnopf.disabled = false;
        karteKnopf.textContent = 'Karte erneut laden';
      }
      console.error('Karte:', fehler);
    }
  }

  karteKnopf?.addEventListener('click', () => {
    karteAktiv = true;
    karteKnopf.disabled = true;
    if (kartenZustand) {
      if (karteStatus) karteStatus.textContent = 'Karte wird erneut geladen …';
      kartenZustand.kacheln.redraw();
      return;
    }
    if (!datenGeladen) {
      // Ohne gewählten Ort zeigt die Karte den Standardausschnitt der Liste.
      void aktualisiere();
    } else {
      void zeichneKarte();
    }
  });

  const standortKnopf = document.querySelector<HTMLButtonElement>('#standort');
  const standortStatus = document.querySelector<HTMLElement>('#standort-status');

  // Der Standort wird ausschließlich hier abgefragt: in einem Klickhandler.
  // Es gibt keinen Aufruf beim Laden der Seite und kein watchPosition.
  standortKnopf?.addEventListener('click', () => {
    if (!standortStatus) return;
    standortKnopf.disabled = true;
    standortStatus.textContent = 'Standort wird abgefragt …';

    void frageStandort().then((ergebnis) => {
      standortKnopf.disabled = false;
      if (ergebnis.art !== 'ok') {
        standortStatus.textContent = ergebnis.text;
        return;
      }
      // Der Wert bleibt in dieser Variablen. Er wird nicht gespeichert und
      // nicht gesendet.
      gewaehlt = {
        name: standortLabel(ergebnis.genauigkeitMeter),
        latitude: ergebnis.latitude,
        longitude: ergebnis.longitude,
      };
      standortStatus.textContent = `Ausschnitt um ${gewaehlt.name}.`;
      void aktualisiere();
    });
  });

  erneut?.addEventListener('click', () => void aktualisiere());

  let namensSuche = 0;
  let timer: number | undefined;
  ortsFeld.addEventListener('input', () => {
    const sucheId = ++namensSuche;
    ortsTreffer.replaceChildren();
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void (async () => {
        const eingabe = ortsFeld.value.trim();
        ortsTreffer.replaceChildren();
        if (normalisiere(eingabe).length < 2) {
          ortsHinweis.textContent = 'Bitte mindestens zwei Zeichen eingeben.';
          return;
        }

        let index: readonly OrtsEintrag[];
        try {
          index = await ladeNamen(eingabe);
        } catch {
          if (sucheId === namensSuche)
            ortsHinweis.textContent =
              'Die Ortsnamen konnten nicht geladen werden. Bitte versuchen Sie die Suche erneut.';
          return;
        }
        if (sucheId !== namensSuche) return;
        const ergebnis = sucheOrte(eingabe, index, { maxTreffer: 8 });
        ortsHinweis.textContent = ergebnis.hinweis;

        for (const eintrag of ergebnis.treffer) {
          const li = document.createElement('li');
          const knopf = document.createElement('button');
          knopf.type = 'button';
          knopf.textContent = eintrag.anzeige;
          knopf.addEventListener('click', () => {
            gewaehlt = {
              name: eintrag.eintrag.name,
              latitude: eintrag.eintrag.latitude,
              longitude: eintrag.eintrag.longitude,
            };
            ortsFeld.value = eintrag.eintrag.name;
            ortsTreffer.replaceChildren();
            ortsHinweis.textContent = `Ausschnitt um ${eintrag.anzeige}.`;
            void aktualisiere();
          });
          li.append(knopf);
          ortsTreffer.append(li);
        }
      })();
    }, 200);
  });

  radius.addEventListener('change', () => void aktualisiere());
  for (const feld of document.querySelectorAll<HTMLInputElement>('input[name="kategorie"]')) {
    feld.addEventListener('change', () => void aktualisiere());
  }
  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    if (ortsFeld.value.trim() !== gewaehlt?.name) {
      ortsFeld.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      void aktualisiere();
    }
  });
  const parameter = new URLSearchParams(window.location.search);
  const requestedPlace = parameter.get('q')?.trim();
  const placeId = parameter.get('place');
  const lat = Number(parameter.get('lat'));
  const lon = Number(parameter.get('lon'));
  if (
    placeId &&
    parameter.has('lat') &&
    parameter.has('lon') &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  ) {
    void ortMitId(placeId, lat, lon)
      .then((ort) => {
        if (suchLauf !== 0 || ortsFeld.value !== '') return;
        if (!ort) {
          ortsHinweis.textContent =
            'Dieser gemerkte Ort ist im aktuellen Datenstand nicht mehr erfasst.';
          return;
        }
        gewaehlt = { name: ort.name, latitude: ort.lat, longitude: ort.lon };
        ortsFeld.value = ort.name;
        ortsHinweis.textContent = `Ausschnitt um ${ort.name}.`;
        void aktualisiere();
      })
      .catch(() => {
        if (suchLauf === 0)
          ortsHinweis.textContent =
            'Der gemerkte Ort konnte gerade nicht geladen werden. Bitte laden Sie die Seite erneut oder suchen Sie einen Ort.';
      });
  }
  if (requestedPlace && requestedPlace.length <= 100) {
    ortsFeld.value = requestedPlace;
    ortsFeld.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
