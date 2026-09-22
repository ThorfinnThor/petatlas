import { productIdentity, merkmalLabel, attributPruefung } from '../care/attributes.ts';
import { kategorie } from '../care/taxonomy.ts';
import { amazonSearchUrl } from '../commerce/amazon.ts';
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

  const render = (): void => {
    const bedarf = bedarfLesen();
    const treffer = findeSpielzeug(attributPruefung().products, bedarf);
    if (status) {
      status.textContent =
        treffer.length === 0
          ? 'Keine belegte Kombination gefunden.'
          : `${treffer.length} passende ${treffer.length === 1 ? 'Option' : 'Optionen'} gefunden.`;
    }
    const filter = aktuelleFilter(bedarf);
    const kopf =
      treffer.length === 0
        ? '<div class="finder__leer"><h3>Keine belegte Kombination gefunden</h3><p>Entfernen Sie einen Zusatzfilter oder wählen Sie „Alle Spielarten“. Es werden nur Produkte gezeigt, deren Angaben den Filtern nachweisbar entsprechen.</p><button type="button" data-finder-reset>Filter zurücksetzen</button></div>'
        : `<div class="finder__result-head"><div><p class="eyebrow">Ergebnis</p><h2>${treffer.length} passende ${treffer.length === 1 ? 'Option' : 'Optionen'}</h2></div><p>${escape(filter.join(' · '))}</p></div>`;
    ausgabe.innerHTML = `${kopf}<ul class="finder__liste">${treffer
      .map((eintrag) => trefferMarkup(eintrag, fressnapfOffers, zooRoyalOffers))
      .join('')}</ul>`;
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
  form.addEventListener('change', render);
  document.querySelector<HTMLButtonElement>('#finder-reset')?.addEventListener('click', () => {
    form.reset();
    render();
  });
  render();
}
