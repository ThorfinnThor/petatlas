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
import { zeigeKarte, waehleMarker } from './map.ts';
import { normalisiere, sucheOrte, type OrtsEintrag } from './place-search.ts';

const MANIFEST = '/data/v1/manifest.json';

interface ChunkEintrag {
  readonly chunkId: string;
  readonly kind: string;
  readonly marketId: string;
  readonly path: string;
}

interface ZellenVerweis {
  readonly key: string;
  readonly bbox: readonly [number, number, number, number];
  readonly count: number;
  readonly path: string;
}

let manifestCache: ChunkEintrag[] | null = null;
const geladeneZellen = new Map<string, readonly ListenOrt[]>();
const geladeneNamen = new Map<string, readonly OrtsEintrag[]>();

async function ladeManifest(): Promise<readonly ChunkEintrag[]> {
  if (manifestCache !== null) return manifestCache;
  const antwort = await fetch(MANIFEST);
  if (!antwort.ok) throw new Error(`Manifest antwortet mit ${antwort.status}.`);
  const manifest = (await antwort.json()) as { chunks: ChunkEintrag[] };
  manifestCache = manifest.chunks;
  return manifestCache;
}

async function pfadVon(chunkId: string): Promise<string> {
  const chunk = (await ladeManifest()).find((eintrag) => eintrag.chunkId === chunkId);
  if (chunk === undefined) throw new Error(`Das Manifest kennt ${chunkId} nicht.`);
  return chunk.path;
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
    const vorhanden = geladeneNamen.get(chunk.chunkId);
    if (vorhanden !== undefined) {
      gesammelt.push(...vorhanden);
      continue;
    }
    const antwort = await fetch(chunk.path);
    if (!antwort.ok) continue;
    const daten = (await antwort.json()) as { entries: OrtsEintrag[] };
    geladeneNamen.set(chunk.chunkId, daten.entries);
    gesammelt.push(...daten.entries);
  }
  return gesammelt;
}

/** Lädt die Zellen, deren Bounding Box den Suchkreis schneiden kann. */
async function ladeZellenUm(
  latitude: number,
  longitude: number,
  radiusMeter: number,
): Promise<readonly ListenOrt[]> {
  const indexPfad = await pfadVon('places-de-index');
  const index = (await (await fetch(indexPfad)).json()) as { cells: ZellenVerweis[] };

  // Ein Grad Breite sind rund 111 km; für die Länge kommt der Kosinus dazu.
  const gradLat = radiusMeter / 111_000;
  const gradLon = radiusMeter / (111_000 * Math.max(0.2, Math.cos((latitude * Math.PI) / 180)));

  const passende = index.cells.filter(
    (zelle) =>
      zelle.bbox[0] <= longitude + gradLon &&
      zelle.bbox[2] >= longitude - gradLon &&
      zelle.bbox[1] <= latitude + gradLat &&
      zelle.bbox[3] >= latitude - gradLat,
  );

  const orte: ListenOrt[] = [];
  for (const zelle of passende) {
    const vorhanden = geladeneZellen.get(zelle.key);
    if (vorhanden !== undefined) {
      orte.push(...vorhanden);
      continue;
    }
    const antwort = await fetch(zelle.path);
    if (!antwort.ok) continue;
    const daten = (await antwort.json()) as { places: ListenOrt[] };
    geladeneZellen.set(zelle.key, daten.places);
    orte.push(...daten.places);
  }
  return orte;
}

function escape(wert: string): string {
  return wert.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

function trefferMarkup(treffer: ReturnType<typeof filtereOrte>[number]): string {
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
      ${ort.website === null ? '' : `<p><a href="${escape(ort.website)}" rel="nofollow noopener">Website</a></p>`}
      ${notdienst === null ? '' : `<p class="notdienst">${escape(notdienst)}</p>`}
    </li>`;
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

  const karteKnopf = document.querySelector<HTMLButtonElement>('#karte-anzeigen');
  const karteBehaelter = document.querySelector<HTMLElement>('#karte');
  const karteStatus = document.querySelector<HTMLElement>('#karte-status');

  let gewaehlt: { name: string; latitude: number; longitude: number } | null = null;
  let letzteOrte: readonly ListenOrt[] = [];
  let karteAktiv = false;

  function kategorien(): string[] {
    return [...document.querySelectorAll<HTMLInputElement>('input[name="kategorie"]:checked')].map(
      (feld) => feld.value,
    );
  }

  async function aktualisiere(): Promise<void> {
    if (gewaehlt === null) return;
    const radiusMeter = Number(radius!.value);
    status!.textContent = 'Wird geladen …';

    try {
      const orte = await ladeZellenUm(gewaehlt.latitude, gewaehlt.longitude, radiusMeter);
      const treffer = filtereOrte(orte, {
        mitte: { latitude: gewaehlt.latitude, longitude: gewaehlt.longitude },
        gemeinde: gewaehlt.name,
        radiusMeter,
        kategorien: kategorien(),
        maxTreffer: 100,
      });

      letzteOrte = treffer.map((eintrag) => eintrag.ort);
      liste!.innerHTML = treffer.map(trefferMarkup).join('');
      if (karteAktiv) void zeichneKarte();
      status!.textContent =
        treffer.length === 0
          ? leereListeHinweis(gewaehlt.name, radiusMeter)
          : `${treffer.length} erfasste Orte im Umkreis von ${formatiereEntfernung(radiusMeter)} um ${gewaehlt.name}.`;
    } catch (fehler) {
      // Ein Ladefehler wird benannt; die vorherige Liste bleibt stehen.
      status!.textContent = 'Die Ortsdaten konnten nicht geladen werden.';
      console.error('Ortsdaten:', fehler);
    }
  }

  async function zeichneKarte(): Promise<void> {
    if (!karteBehaelter || !karteStatus || gewaehlt === null) return;
    karteBehaelter.hidden = false;
    karteBehaelter.replaceChildren();

    const { gezeigt, ausgelassen } = waehleMarker(letzteOrte);
    try {
      await zeigeKarte({
        container: karteBehaelter,
        mitte: { latitude: gewaehlt.latitude, longitude: gewaehlt.longitude },
        orte: letzteOrte,
        // Ein Ausfall des Kacheldienstes betrifft nur die Karte.
        beiKachelfehler: () => {
          karteStatus.textContent =
            'Der Kartendienst liefert gerade keine Kacheln. Die Liste unten bleibt vollständig.';
        },
      });
      karteStatus.textContent =
        ausgelassen === 0
          ? `${gezeigt.length} Orte auf der Karte.`
          : `${gezeigt.length} von ${gezeigt.length + ausgelassen} Orten auf der Karte; der Rest steht in der Liste.`;
    } catch (fehler) {
      karteStatus.textContent = 'Die Karte konnte nicht geladen werden. Die Liste bleibt nutzbar.';
      console.error('Karte:', fehler);
    }
  }

  karteKnopf?.addEventListener('click', () => {
    karteAktiv = true;
    karteKnopf.disabled = true;
    if (gewaehlt === null) {
      // Ohne gewählten Ort zeigt die Karte den Standardausschnitt der Liste.
      gewaehlt = { name: 'Berlin', latitude: 52.5174, longitude: 13.3951 };
      void aktualisiere();
    } else {
      void zeichneKarte();
    }
  });

  let timer: number | undefined;
  ortsFeld.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void (async () => {
        const eingabe = ortsFeld.value.trim();
        ortsTreffer.replaceChildren();
        if (normalisiere(eingabe).length < 2) {
          ortsHinweis.textContent = 'Bitte mindestens zwei Zeichen eingeben.';
          return;
        }

        const index = await ladeNamen(eingabe);
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
    void aktualisiere();
  });
}
