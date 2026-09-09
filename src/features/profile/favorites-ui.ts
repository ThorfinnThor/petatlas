/**
 * M16-03 — Merkliste im Browser.
 *
 * Der Speicher ist derselbe wie beim Profil: lokal, ausdrücklich, ohne
 * Übertragung. Anders als das Profil wird die Merkliste beim Klick auf
 * „Merken“ sofort geschrieben — das ist die Handlung.
 *
 * Angezeigt wird nie das Gemerkte, sondern immer das Aktuelle: die Liste
 * hält nur Kennungen, und was dahintersteckt, kommt beim Anzeigen aus den
 * ausgelieferten Daten.
 */
import { ortMitId } from '../map/data.ts';
import { futterMitId } from '../food/catalog.ts';
import { mengenText } from '../food/unit-price.ts';
import {
  FAVORITES_STORAGE_KEY,
  LEERE_MERKLISTE,
  istGemerkt,
  lese,
  loeseAuf,
  merke,
  schreibe,
  vergiss,
  type MerkArt,
  type Merkliste,
} from './favorites.ts';

function speicher(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function merklisteLesen(): Merkliste {
  const ablage = speicher();
  if (ablage === null) return LEERE_MERKLISTE;
  return lese(ablage.getItem(FAVORITES_STORAGE_KEY));
}

export function merklisteSchreiben(liste: Merkliste): boolean {
  const ablage = speicher();
  if (ablage === null) return false;
  try {
    ablage.setItem(FAVORITES_STORAGE_KEY, schreibe(liste));
    return true;
  } catch {
    return false;
  }
}

function escape(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

function knopfBeschriften(knopf: HTMLButtonElement, gemerkt: boolean): void {
  knopf.textContent = gemerkt ? 'Gemerkt — entfernen' : 'Merken';
  knopf.setAttribute('aria-pressed', gemerkt ? 'true' : 'false');
}

/**
 * Bindet alle Merkknöpfe innerhalb eines Bereichs.
 *
 * Ein Knopf trägt seine Angaben in `data-`-Attributen: Art, Kennung und bei
 * Orten die Koordinate. Ohne Speicher wird der Knopf ausgeblendet, statt eine
 * Handlung anzubieten, die nichts bewirkt.
 */
export function merkknoepfeBinden(bereich: ParentNode = document): void {
  const knoepfe = [...bereich.querySelectorAll<HTMLButtonElement>('button[data-merken]')];
  if (knoepfe.length === 0) return;

  if (speicher() === null) {
    for (const knopf of knoepfe) knopf.hidden = true;
    return;
  }

  for (const knopf of knoepfe) {
    const art = (knopf.dataset.merken ?? 'food') as MerkArt;
    const id = knopf.dataset.id ?? '';
    if (id === '') continue;
    knopf.hidden = false;
    knopfBeschriften(knopf, istGemerkt(merklisteLesen(), art, id));

    knopf.addEventListener('click', () => {
      const liste = merklisteLesen();
      const gemerkt = istGemerkt(liste, art, id);
      const breite = Number(knopf.dataset.lat ?? '');
      const laenge = Number(knopf.dataset.lon ?? '');
      const neu = gemerkt
        ? vergiss(liste, art, id)
        : merke(liste, {
            kind: art,
            id,
            coordinates:
              art === 'place' && Number.isFinite(breite) && Number.isFinite(laenge)
                ? { latitude: breite, longitude: laenge }
                : null,
            addedAt: new Date().toISOString(),
          });
      if (!merklisteSchreiben(neu)) {
        const meldung = document.createElement('p');
        meldung.setAttribute('role', 'alert');
        meldung.textContent =
          'Die Änderung konnte nicht gespeichert werden. Bitte prüfen Sie den verfügbaren Browser-Speicher.';
        knopf.after(meldung);
        return;
      }
      knopfBeschriften(knopf, istGemerkt(neu, art, id));
    });
  }
}

interface AnzeigeDaten {
  readonly titel: string;
  readonly zusatz: string;
  readonly pfad: string | null;
}

async function nachschlagen(
  kind: MerkArt,
  id: string,
  lat: number | null,
  lon: number | null,
  futterBasis: string,
  kartenPfad: string,
): Promise<AnzeigeDaten | null> {
  if (kind === 'food') {
    const produkt = futterMitId(id);
    if (produkt === undefined) return null;
    return {
      titel: `${produkt.brand} — ${produkt.productName}`,
      zusatz: mengenText(produkt) ?? 'Menge nicht angegeben',
      pfad: `${futterBasis}${id.replace('synthetisch:', '')}/`,
    };
  }
  if (lat === null || lon === null) return null;
  const ort = await ortMitId(id, lat, lon);
  if (ort === null) return null;
  return {
    titel: ort.name,
    zusatz: ort.municipality === null ? 'Gemeinde nicht erfasst' : ort.municipality,
    pfad: `${kartenPfad}?${new URLSearchParams({ place: ort.id, lat: String(ort.lat), lon: String(ort.lon) })}`,
  };
}

/** Zeigt die Merkliste an — mit aktuellen Daten und ehrlichen Lücken. */
export async function merklisteStarten(): Promise<void> {
  const bereich = document.querySelector<HTMLElement>('#merkliste');
  if (bereich === null) return;

  const futterBasis = bereich.dataset.futter ?? '/de-de/futter/';
  const kartenPfad = bereich.dataset.karte ?? '/de-de/tierarzt-karte/';
  const hinweis = document.querySelector<HTMLElement>('#merkliste-ohne-js');
  if (hinweis !== null) hinweis.hidden = true;

  const zeichne = async (): Promise<void> => {
    const liste = merklisteLesen();
    if (liste.entries.length === 0) {
      bereich.innerHTML =
        '<p class="merk__kopf" data-leer="true">Ihre Merkliste ist leer. Sie liegt nur auf ' +
        'diesem Gerät und wird nirgends abgeglichen.</p>';
      return;
    }

    const teile: string[] = [
      `<p class="merk__kopf" data-leer="false">${liste.entries.length} Eintrag/Einträge, ` +
        'nur auf diesem Gerät gespeichert.</p><ul class="merk__liste">',
    ];

    for (const eintrag of liste.entries) {
      const aufgeloest = await loeseAuf(eintrag, async () =>
        nachschlagen(
          eintrag.kind,
          eintrag.id,
          eintrag.coordinates?.latitude ?? null,
          eintrag.coordinates?.longitude ?? null,
          futterBasis,
          kartenPfad,
        ),
      );

      const inhalt =
        aufgeloest.daten === null
          ? `<p class="merk__weg">${escape(aufgeloest.hinweis)}</p>`
          : `<p class="merk__zusatz">${escape(aufgeloest.daten.zusatz)}</p>` +
            (aufgeloest.daten.pfad === null
              ? ''
              : `<p><a href="${escape(aufgeloest.daten.pfad)}">Ansehen</a></p>`);

      teile.push(
        `<li data-eintrag="${escape(eintrag.kind)}:${escape(eintrag.id)}" data-stand="${aufgeloest.stand}">
          <h3>${escape(aufgeloest.daten?.titel ?? eintrag.id)}</h3>
          ${inhalt}
          <p><button type="button" data-entfernen data-art="${escape(eintrag.kind)}" data-id="${escape(
            eintrag.id,
          )}">Aus der Merkliste entfernen</button></p>
        </li>`,
      );
    }

    teile.push('</ul>');
    bereich.innerHTML = teile.join('');

    for (const knopf of bereich.querySelectorAll<HTMLButtonElement>('button[data-entfernen]')) {
      knopf.addEventListener('click', () => {
        const art = (knopf.dataset.art ?? 'food') as MerkArt;
        if (!merklisteSchreiben(vergiss(merklisteLesen(), art, knopf.dataset.id ?? ''))) {
          const meldung = document.createElement('p');
          meldung.setAttribute('role', 'alert');
          meldung.textContent =
            'Der Eintrag konnte nicht entfernt werden. Bitte prüfen Sie den Browser-Speicher.';
          knopf.after(meldung);
          return;
        }
        void zeichne();
      });
    }
  };

  await zeichne();
}
