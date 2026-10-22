/**
 * Händlerprodukte im Browser nachladen.
 *
 * Große Händlerlisten (Spielzeug) liefern im HTML nur eine Startauswahl. Den
 * Rest gibt es als JSON (`SPIELZEUG_KATALOG_PFAD`); daraus entstehen Karten,
 * indem eine vorhandene Karte als Vorlage geklont und befüllt wird. So bleiben
 * Gestaltung, Werbekennzeichnung und Partnerlink-Attribute identisch mit den
 * serverseitig gebauten Karten.
 */
import type { KatalogEintrag } from './feed-catalog.ts';

const cache = new Map<string, Promise<readonly KatalogEintrag[]>>();

function istEintrag(wert: unknown): wert is KatalogEintrag {
  if (wert === null || typeof wert !== 'object') return false;
  const e = wert as Record<string, unknown>;
  return (
    ['id', 'haendler', 'rubrik', 'name', 'meta', 'bild', 'link'].every(
      (feld) => typeof e[feld] === 'string',
    ) &&
    (e.art === 'dog' || e.art === 'cat') &&
    String(e.bild).startsWith('https://') &&
    String(e.link).startsWith('https://')
  );
}

/** Lädt die Einträge einmal je Pfad; ungültige Einträge fallen weg. */
export function ladeKatalog(pfad: string): Promise<readonly KatalogEintrag[]> {
  let laden = cache.get(pfad);
  if (laden === undefined) {
    laden = fetch(pfad, { headers: { Accept: 'application/json' } })
      .then((antwort) => {
        if (!antwort.ok) throw new Error(`Katalog nicht ladbar (${antwort.status}).`);
        return antwort.json() as Promise<{ eintraege?: unknown }>;
      })
      .then((daten) => (Array.isArray(daten.eintraege) ? daten.eintraege.filter(istEintrag) : []));
    laden.catch(() => cache.delete(pfad));
    cache.set(pfad, laden);
  }
  return laden;
}

/** Eine Karte im Aufbau der Vorlage, befüllt mit einem nachgeladenen Eintrag. */
export function karteAusVorlage(vorlage: HTMLElement, eintrag: KatalogEintrag): HTMLElement {
  const karte = vorlage.cloneNode(true) as HTMLElement;
  karte.hidden = false;
  karte.dataset.id = eintrag.id;
  karte.dataset.art = eintrag.art;
  karte.dataset.rubrik = eintrag.rubrik;

  const bildLink = karte.querySelector<HTMLAnchorElement>('.feed-catalog__image-link');
  if (bildLink) {
    bildLink.href = eintrag.link;
    bildLink.setAttribute('aria-label', `${eintrag.name} bei ${eintrag.haendler} ansehen`);
  }
  const bild = karte.querySelector<HTMLImageElement>('img');
  if (bild) {
    bild.removeAttribute('srcset');
    bild.src = eintrag.bild;
    bild.alt = `${eintrag.name} · Produktbild von ${eintrag.haendler}`;
  }
  const quelle = karte.querySelector('.feed-catalog__bildquelle');
  if (quelle) quelle.textContent = `Produktbild · ${eintrag.haendler}-Feed`;
  const art = karte.querySelector('.feed-catalog__species');
  if (art) art.textContent = eintrag.art === 'dog' ? 'Für Hunde' : 'Für Katzen';
  const titel = karte.querySelector('h3');
  if (titel) titel.textContent = eintrag.name;
  const meta = karte.querySelector('.feed-catalog__meta');
  if (meta) meta.textContent = eintrag.meta;
  const link = karte.querySelector<HTMLAnchorElement>('.feed-catalog__link');
  if (link) {
    link.href = eintrag.link;
    const werbung = link.querySelector('.sr-only');
    link.textContent = `Bei ${eintrag.haendler} ansehen ↗ `;
    if (werbung) link.append(werbung);
  }
  return karte;
}
