import { productIdentity, merkmalLabel, attributPruefung } from '../care/attributes.ts';
import { kategorie } from '../care/taxonomy.ts';
import { amazonSearchUrl } from '../commerce/amazon.ts';
import { karteAusVorlage, ladeKatalog } from '../commerce/katalog-nachladen.ts';
import { PARTNER_LINK_ATTRIBUTE } from '../commerce/links.ts';
import type { Treffer } from '../care/matching.ts';
import {
  findeSpielzeug,
  SPIELARTEN,
  type Spielart,
  type SpielzeugBedarf,
  type SpielzeugExtra,
  type SpielzeugMaterial,
} from './matching.ts';

interface PartnerOffer {
  readonly imageUrl?: unknown;
  readonly affiliateUrl?: unknown;
}

interface SicherePartnerOffer {
  readonly imageUrl: string;
  readonly affiliateUrl: string;
}

function escape(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

function ausgewaehlterWert<T extends string>(name: string, fallback: T): T {
  return (document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ??
    fallback) as T;
}

function bedarfLesen(): SpielzeugBedarf {
  const species =
    document.querySelector<HTMLSelectElement>('#finder-tierart')?.value === 'cat' ? 'cat' : 'dog';
  const extras = [
    ...document.querySelectorAll<HTMLInputElement>('input[name="extra"]:checked'),
  ].map((feld) => feld.value as SpielzeugExtra);
  const material =
    (document.querySelector<HTMLSelectElement>('#finder-material')?.value as SpielzeugMaterial) ??
    'all';
  return {
    species,
    weightKilograms: null,
    needs: [],
    playStyle: ausgewaehlterWert<Spielart>('spielart', 'all'),
    material,
    extras,
  };
}

function symbolbild(identity: ReturnType<typeof productIdentity>): {
  readonly src: string;
  readonly alt: string;
} {
  if (identity?.species === 'cat') {
    return {
      src: '/images/products/symbol-cat.avif',
      alt: 'Neutrales Symbolbild für Katzenspielzeug',
    };
  }
  if (identity?.categoryId === 'fetch-toy') {
    return {
      src: '/images/products/symbol-fetch.avif',
      alt: 'Neutrales Symbolbild für Apportierspielzeug',
    };
  }
  if (identity?.categoryId === 'chew-toy') {
    return {
      src: '/images/products/symbol-chew.avif',
      alt: 'Neutrales Symbolbild für Kauspielzeug',
    };
  }
  return {
    src: '/images/products/symbol-puzzle.avif',
    alt: 'Neutrales Symbolbild für Beschäftigungsspielzeug',
  };
}

function sichereAngebote(raw: string | undefined): Record<string, SicherePartnerOffer> {
  try {
    const offers = JSON.parse(raw ?? '{}') as Record<string, PartnerOffer>;
    return Object.fromEntries(
      Object.entries(offers).flatMap(([id, offer]) => {
        if (typeof offer.imageUrl !== 'string' || typeof offer.affiliateUrl !== 'string') return [];
        const imageUrl = new URL(offer.imageUrl);
        const affiliateUrl = new URL(offer.affiliateUrl);
        if (imageUrl.protocol !== 'https:' || affiliateUrl.protocol !== 'https:') return [];
        return [[id, { imageUrl: imageUrl.toString(), affiliateUrl: affiliateUrl.toString() }]];
      }),
    );
  } catch {
    return {};
  }
}

function amazonLink(productId: string): string {
  const configured = document.querySelector<HTMLFormElement>('#finder')?.dataset.amazonLinks;
  const expected = amazonSearchUrl(productId);
  if (!expected) return '';
  try {
    const links = JSON.parse(configured ?? '{}') as Record<string, unknown>;
    if (links[productId] !== expected) return '';
  } catch {
    return '';
  }
  return `<a class="finder__shop-link" href="${escape(expected)}" rel="${PARTNER_LINK_ATTRIBUTE.rel}" target="${PARTNER_LINK_ATTRIBUTE.target}">Bei Amazon suchen ↗ <span class="sr-only">(Werbung)</span></a>`;
}

function trefferMarkup(
  treffer: Treffer,
  fressnapfOffers: Readonly<Record<string, SicherePartnerOffer>>,
  zooRoyalOffers: Readonly<Record<string, SicherePartnerOffer>>,
): string {
  const identity = productIdentity(treffer.productId);
  const fallback = symbolbild(identity);
  const fressnapf = fressnapfOffers[treffer.productId];
  const zooRoyal = zooRoyalOffers[treffer.productId];
  const feedOffer = fressnapf ?? zooRoyal;
  const retailer = fressnapf ? 'Fressnapf' : zooRoyal ? 'ZooRoyal' : null;
  const imageUrl = feedOffer?.imageUrl ?? fallback.src;
  const imageAlt = feedOffer
    ? `${identity?.name ?? treffer.productId} · Produktbild von ${retailer}`
    : fallback.alt;
  const fressnapfLink = fressnapf
    ? `<a class="finder__shop-link finder__shop-link--primary" href="${escape(fressnapf.affiliateUrl)}" rel="${PARTNER_LINK_ATTRIBUTE.rel}" target="${PARTNER_LINK_ATTRIBUTE.target}">Bei Fressnapf ansehen ↗ <span class="sr-only">(Werbung)</span></a>`
    : '';
  const zooRoyalLink = zooRoyal
    ? `<a class="finder__shop-link finder__shop-link--primary" href="${escape(zooRoyal.affiliateUrl)}" rel="${PARTNER_LINK_ATTRIBUTE.rel}" target="${PARTNER_LINK_ATTRIBUTE.target}">Bei ZooRoyal ansehen ↗ <span class="sr-only">(Werbung)</span></a>`
    : '';
  const source = identity
    ? `<a href="${escape(identity.sourceUrl)}" rel="noopener">Quelle ansehen</a> · Stand ${escape(identity.checkedAt)}`
    : '';
  const reasons =
    treffer.begruendung.length > 0
      ? `<ul class="finder__gruende">${treffer.begruendung
          .slice(0, 4)
          .map((grund) => `<li>${escape(grund)}</li>`)
          .join('')}</ul>`
      : '<p class="finder__neutral">Passt zu den gewählten Grundfiltern; weitere Merkmale sind nicht belegt.</p>';
  const open =
    treffer.ungeprueft.length > 0
      ? `<p>Offen: ${treffer.ungeprueft.map(merkmalLabel).map(escape).join(', ')}.</p>`
      : '';
  const facts = identity?.facts.length
    ? `<p class="finder__facts">${identity.facts.map(escape).join(' · ')}</p>`
    : '';

  return `
    <li class="finder__card" data-produkt="${escape(treffer.productId)}" data-punkte="${treffer.punkte}">
      <figure class="finder__bild">
        <img src="${escape(imageUrl)}" alt="${escape(imageAlt)}" width="720" height="720" loading="lazy" decoding="async" referrerpolicy="no-referrer"${feedOffer ? ` data-feed-image data-fallback-src="${fallback.src}" data-fallback-alt="${escape(fallback.alt)}"` : ''}>
        <figcaption>${feedOffer ? `Produktbild · ${retailer}-Feed` : 'Symbolbild'}</figcaption>
      </figure>
      <div class="finder__card-body">
        <p class="finder__kategorie">${identity?.species === 'cat' ? 'Katze' : 'Hund'} · ${escape(kategorie(treffer.categoryId)?.label ?? treffer.categoryId)}</p>
        <h3>${escape(identity?.name ?? treffer.productId)}</h3>
        ${identity ? `<p class="finder__brand">${escape(identity.brand)}</p>` : ''}
        ${facts}
        <div class="finder__match"><strong>Warum es erscheint</strong>${reasons}</div>
        <details class="finder__details">
          <summary>Quellen und offene Angaben</summary>
          ${open}
          <p>${source}</p>
        </details>
        <div class="finder__aktionen">${fressnapfLink}${zooRoyalLink}${amazonLink(treffer.productId)}</div>
      </div>
    </li>`;
}

function aktuelleFilter(bedarf: SpielzeugBedarf): string[] {
  const filter: string[] = [
    bedarf.species === 'cat' ? 'Katze' : 'Hund',
    SPIELARTEN[bedarf.playStyle ?? 'all'].label,
  ];
  if (bedarf.extras?.includes('floats')) filter.push('schwimmfähig');
  if (bedarf.extras?.includes('foodFillable')) filter.push('befüllbar');
  if (bedarf.extras?.includes('dishwasherSafe')) filter.push('spülmaschinengeeignet');
  if (bedarf.material && bedarf.material !== 'all') filter.push('gewähltes Material');
  return filter;
}

/** Ab hier: Händlerprodukte aus den Feeds im Finder (ohne geprüfte Merkmale). */
const KATALOG_SCHRITT = 12;

interface KatalogKarte {
  readonly art: string;
  /** Eine frische, sichtbare Karte für die Ergebnisliste. */
  readonly element: () => HTMLElement;
}

interface KatalogQuelle {
  readonly karten: readonly KatalogKarte[];
  readonly vorlage: HTMLElement | null;
}

/** Händler im Wechsel, damit nicht erst alle Produkte eines Händlers kommen. */
function imWechsel<T>(jeHaendler: readonly (readonly T[])[]): T[] {
  const laenge = Math.max(0, ...jeHaendler.map((liste) => liste.length));
  return Array.from({ length: laenge }, (_, i) =>
    jeHaendler.map((liste) => liste[i]).filter((eintrag): eintrag is T => eintrag !== undefined),
  ).flat();
}

/**
 * Die Startauswahl der Katalogkarten steht als Händlerbereiche auf der Seite.
 * Mit JavaScript übernimmt der Finder sie in seine Ergebnisse und blendet die
 * Bereiche aus; ohne JavaScript bleiben sie, wo sie sind.
 */
function katalogQuelle(sektionen: readonly HTMLElement[]): KatalogQuelle {
  for (const sektion of sektionen) sektion.hidden = true;
  const jeHaendler = sektionen.map((sektion) =>
    [...sektion.querySelectorAll<HTMLElement>('.feed-catalog__card')].map((karte) => ({
      art: karte.dataset.art ?? '',
      element: () => {
        const kopie = karte.cloneNode(true) as HTMLElement;
        kopie.hidden = false;
        return kopie;
      },
    })),
  );
  return {
    karten: imWechsel(jeHaendler),
    vorlage: sektionen[0]?.querySelector<HTMLElement>('.feed-catalog__grid') ?? null,
  };
}

/** Alle Händlerprodukte aus der nachgeladenen Datei, gebaut aus den Karten der Seite. */
async function vollerKatalog(
  sektionen: readonly HTMLElement[],
  vorlage: HTMLElement | null,
): Promise<KatalogQuelle | null> {
  const pfad = sektionen.find((sektion) => sektion.dataset.katalogQuelle)?.dataset.katalogQuelle;
  if (pfad === undefined) return null;
  const vorlagen = new Map(
    sektionen.map((sektion) => [
      sektion.dataset.haendler ?? '',
      sektion.querySelector<HTMLElement>('.feed-catalog__card'),
    ]),
  );
  const eintraege = await ladeKatalog(pfad);
  const jeHaendler = sektionen.map((sektion) => {
    const karte = vorlagen.get(sektion.dataset.haendler ?? '');
    if (!karte) return [];
    return eintraege
      .filter((eintrag) => eintrag.haendler === sektion.dataset.haendler)
      .map((eintrag) => ({ art: eintrag.art, element: () => karteAusVorlage(karte, eintrag) }));
  });
  const karten = imWechsel(jeHaendler);
  return karten.length === 0 ? null : { karten, vorlage };
}

function ohneMerkmalsfilter(bedarf: SpielzeugBedarf): boolean {
  return (
    (bedarf.playStyle ?? 'all') === 'all' &&
    (bedarf.extras?.length ?? 0) === 0 &&
    (bedarf.material ?? 'all') === 'all'
  );
}

export function finderStarten(): void {
  const form = document.querySelector<HTMLFormElement>('#finder');
  const ausgabe = document.querySelector<HTMLElement>('#finder-ergebnis');
  const status = document.querySelector<HTMLElement>('#finder-status');
  if (!form || !ausgabe) return;
  const fressnapfOffers = sichereAngebote(form.dataset.fressnapfOffers);
  const zooRoyalOffers = sichereAngebote(form.dataset.zooroyalOffers);

  const requestedSpecies = new URLSearchParams(window.location.search).get('tierart');
  const speciesField = document.querySelector<HTMLSelectElement>('#finder-tierart');
  if (speciesField && (requestedSpecies === 'cat' || requestedSpecies === 'dog')) {
    speciesField.value = requestedSpecies;
  }
  document.querySelector<HTMLElement>('#finder-ohne-js')?.setAttribute('hidden', '');
  const sektionen = [...document.querySelectorAll<HTMLElement>('[data-finder-katalog]')];
  let katalog = katalogQuelle(sektionen);
  let katalogSichtbar = KATALOG_SCHRITT;

  const katalogAnhaengen = (karten: readonly KatalogKarte[], vorhanden: number): void => {
    const block = document.createElement('section');
    block.className = 'finder__katalog';
    block.setAttribute('aria-labelledby', 'finder-katalog-titel');
    if (karten.length === 0) {
      if (vorhanden > 0) {
        block.innerHTML = `<p class="finder__katalog-hinweis">${vorhanden} weitere Händlerprodukte haben keine geprüften Merkmale und erscheinen nur, wenn keine Spielweise, kein Material und keine Extras gewählt sind.</p>`;
        ausgabe.append(block);
      }
      return;
    }
    block.innerHTML = `<div class="finder__result-head"><div><p class="eyebrow">Bei Fressnapf und ZooRoyal</p><h2 id="finder-katalog-titel">${karten.length} weitere Spielzeuge bei Händlern</h2></div><p>Echte Produktbilder aus den Händlerfeeds. Spielweise, Material und Extras sind für diese Produkte nicht geprüft.</p></div>`;
    const liste =
      (katalog.vorlage?.cloneNode(false) as HTMLElement | undefined) ??
      document.createElement('ul');
    liste.classList.remove('feed-catalog__grid--wenige');
    liste.classList.add('finder__katalog-liste');
    for (const karte of karten.slice(0, katalogSichtbar)) liste.append(karte.element());
    block.append(liste);
    if (karten.length > katalogSichtbar) {
      const mehr = document.createElement('p');
      mehr.className = 'finder__katalog-mehr';
      mehr.innerHTML = '<button type="button">Mehr anzeigen</button>';
      mehr.querySelector('button')?.addEventListener('click', () => {
        katalogSichtbar += KATALOG_SCHRITT;
        block.remove();
        katalogAnhaengen(karten, vorhanden);
      });
      block.append(mehr);
    }
    ausgabe.append(block);
  };

  const render = (): void => {
    const bedarf = bedarfLesen();
    const treffer = findeSpielzeug(attributPruefung().products, bedarf);
    const katalogAlle = katalog.karten.filter((karte) => karte.art === bedarf.species);
    const katalogTreffer = ohneMerkmalsfilter(bedarf) ? katalogAlle : [];
    if (status) {
      status.textContent =
        treffer.length === 0 && katalogTreffer.length === 0
          ? 'Keine belegte Kombination gefunden.'
          : `${treffer.length} geprüfte ${treffer.length === 1 ? 'Option' : 'Optionen'}${katalogTreffer.length > 0 ? ` und ${katalogTreffer.length} weitere Händlerprodukte` : ''} gefunden.`;
    }
    const filter = aktuelleFilter(bedarf);
    const kopf =
      treffer.length === 0
        ? '<div class="finder__leer"><h3>Keine belegte Kombination gefunden</h3><p>Entferne einen Zusatzfilter oder wähl „Alle Spielarten“. Es werden nur Produkte gezeigt, deren Angaben den Filtern nachweisbar entsprechen.</p><button type="button" data-finder-reset>Filter zurücksetzen</button></div>'
        : `<div class="finder__result-head"><div><p class="eyebrow">Ergebnis</p><h2>${treffer.length} geprüfte ${treffer.length === 1 ? 'Option' : 'Optionen'}</h2>${
            katalogTreffer.length > 0
              ? `<p class="finder__katalog-verweis">Dazu <a href="#finder-katalog-titel">${katalogTreffer.length} weitere Spielzeuge bei Händlern</a>, ohne geprüfte Merkmale.</p>`
              : ''
          }</div><p>${escape(filter.join(' · '))}</p></div>`;
    ausgabe.innerHTML = `${kopf}<ul class="finder__liste">${treffer
      .map((eintrag) => trefferMarkup(eintrag, fressnapfOffers, zooRoyalOffers))
      .join('')}</ul>`;
    katalogAnhaengen(katalogTreffer, katalogAlle.length);
    ausgabe
      .querySelector<HTMLButtonElement>('[data-finder-reset]')
      ?.addEventListener('click', () => {
        form.reset();
        render();
        form.querySelector<HTMLElement>('input, select')?.focus();
      });
    for (const image of ausgabe.querySelectorAll<HTMLImageElement>('img[data-feed-image]')) {
      image.addEventListener(
        'error',
        () => {
          const fallbackSrc = image.dataset.fallbackSrc;
          if (!fallbackSrc || image.src.endsWith(fallbackSrc)) return;
          image.src = fallbackSrc;
          image.alt = image.dataset.fallbackAlt ?? 'Neutrales Symbolbild';
          image.closest('figure')?.querySelector('figcaption')?.replaceChildren('Symbolbild');
        },
        { once: true },
      );
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
    ausgabe.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  form.addEventListener('change', () => {
    katalogSichtbar = KATALOG_SCHRITT;
    render();
  });
  document.querySelector<HTMLButtonElement>('#finder-reset')?.addEventListener('click', () => {
    form.reset();
    render();
  });
  render();

  // Im HTML steht nur die Startauswahl; die übrigen Händlerprodukte kommen nach.
  vollerKatalog(sektionen, katalog.vorlage)
    .then((voll) => {
      if (voll === null) return;
      katalog = voll;
      render();
    })
    .catch(() => {
      // Ohne Datei bleibt es bei der Startauswahl.
    });
}
