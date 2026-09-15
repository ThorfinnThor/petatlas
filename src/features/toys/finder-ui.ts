import { PARTNER_LINK_ATTRIBUTE } from '../commerce/links.ts';
import { amazonSearchUrl } from '../commerce/amazon.ts';
import { kategorie } from '../care/taxonomy.ts';
import { productIdentity, merkmalLabel } from '../care/attributes.ts';
/**
 * M14-04 — Spielzeugfinder im Browser.
 *
 * Der Finder rechnet lokal und zeigt zu jedem Ergebnis zwei Dinge: **warum**
 * es erscheint und **was nicht geprüft** ist. Das zweite ist der Grund, warum
 * es diesen Finder überhaupt geben darf — eine Liste ohne die Gegenseite
 * wäre eine Empfehlung.
 *
 * Es gibt keinen Sicherheits-, Haltbarkeits- oder Eignungsscore. Die Punkte
 * sind keine Bewertung des Produkts, sondern die Zahl der belegten
 * Übereinstimmungen mit den Angaben im Formular; die Oberfläche sagt das.
 */
import { attributPruefung } from '../care/attributes.ts';
import { BEDUERFNISSE, type Bedarf, type Treffer } from '../care/matching.ts';
import { findeSpielzeug } from './matching.ts';

function escape(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

function bedarfLesen(): Bedarf {
  const art = document.querySelector<HTMLSelectElement>('#finder-tierart')?.value ?? 'dog';
  const gewichtRoh = document.querySelector<HTMLInputElement>('#finder-gewicht')?.value ?? '';
  const gewicht = /^\d+(\.\d+)?$/.test(gewichtRoh.trim().replace(',', '.'))
    ? Number(gewichtRoh.trim().replace(',', '.'))
    : null;
  const needs = [
    ...document.querySelectorAll<HTMLInputElement>('input[name="bedarf"]:checked'),
  ].map((feld) => feld.value);
  return { species: art, weightKilograms: gewicht, needs };
}

function symbolbild(identity: ReturnType<typeof productIdentity>): {
  readonly src: string;
  readonly alt: string;
} {
  if (identity?.species === 'cat') {
    return {
      src: '/images/products/symbol-cat.avif',
      alt: 'Symbolbild für Katzenspielzeug, keine Herstellerabbildung',
    };
  }
  if (identity?.categoryId === 'fetch-toy') {
    return {
      src: '/images/products/symbol-fetch.avif',
      alt: 'Symbolbild für Apportierspielzeug, keine Herstellerabbildung',
    };
  }
  if (identity?.categoryId === 'chew-toy') {
    return {
      src: '/images/products/symbol-chew.avif',
      alt: 'Symbolbild für Kauspielzeug, keine Herstellerabbildung',
    };
  }
  return {
    src: '/images/products/symbol-puzzle.avif',
    alt: 'Symbolbild für Beschäftigungsspielzeug, keine Herstellerabbildung',
  };
}

function trefferMarkup(treffer: Treffer): string {
  const configured = document.querySelector<HTMLFormElement>('#finder')?.dataset.amazonLinks;
  const expected = amazonSearchUrl(treffer.productId);
  let amazon = '';
  try {
    const links = JSON.parse(configured ?? '{}') as Record<string, unknown>;
    if (expected && links[treffer.productId] === expected)
      amazon = `<p class="finder__aktion"><a href="${escape(expected)}" rel="${PARTNER_LINK_ATTRIBUTE.rel}" target="${PARTNER_LINK_ATTRIBUTE.target}">Bei Amazon suchen ↗ <span class="sr-only">(Werbung)</span></a></p>`;
  } catch {
    /* Missing or malformed configuration never creates a link. */
  }
  const configuredFressnapf =
    document.querySelector<HTMLFormElement>('#finder')?.dataset.fressnapfOffers;
  let fressnapf = '';
  let feedImage: { imageUrl: string; affiliateUrl: string } | null = null;
  try {
    const offers = JSON.parse(configuredFressnapf ?? '{}') as Record<
      string,
      { imageUrl?: unknown; affiliateUrl?: unknown }
    >;
    const offer = offers[treffer.productId];
    if (typeof offer?.imageUrl === 'string' && typeof offer.affiliateUrl === 'string') {
      const imageUrl = new URL(offer.imageUrl);
      const affiliateUrl = new URL(offer.affiliateUrl);
      if (imageUrl.protocol === 'https:' && affiliateUrl.protocol === 'https:') {
        feedImage = { imageUrl: imageUrl.toString(), affiliateUrl: affiliateUrl.toString() };
        fressnapf = `<p class="finder__aktion"><a href="${escape(feedImage.affiliateUrl)}" rel="${PARTNER_LINK_ATTRIBUTE.rel}" target="${PARTNER_LINK_ATTRIBUTE.target}">Bei Fressnapf ansehen ↗ <span class="sr-only">(Werbung)</span></a></p>`;
      }
    }
  } catch {
    /* Missing or malformed feed data falls back to the local symbol. */
  }
  const identity = productIdentity(treffer.productId);
  const bild = symbolbild(identity);
  const bildQuelle = feedImage?.imageUrl ?? bild.src;
  const bildAlt = feedImage ? `${identity?.name ?? treffer.productId} bei Fressnapf` : bild.alt;
  const source = identity
    ? `<p><a href="${escape(identity.sourceUrl)}" rel="noopener">Herstellerangaben ansehen</a> · ${escape(identity.checkedAt)}</p>`
    : '';
  const begruendung =
    treffer.begruendung.length === 0
      ? '<p class="finder__neutral">Keine belegte Übereinstimmung mit Ihren Angaben — das Produkt ' +
        'ist nur nicht ausgeschlossen.</p>'
      : `<ul class="finder__gruende">${treffer.begruendung
          .map((grund) => `<li>${escape(grund)}</li>`)
          .join('')}</ul>`;

  const offen =
    treffer.ungeprueft.length === 0
      ? ''
      : `<p class="finder__offen">Nicht geprüft: ${treffer.ungeprueft.map(merkmalLabel).map(escape).join(', ')}.</p>`;

  return `
    <li data-produkt="${escape(treffer.productId)}" data-punkte="${treffer.punkte}">
      <figure class="finder__bild">
        <img src="${escape(bildQuelle)}" alt="${escape(bildAlt)}" width="720" height="720" loading="lazy" decoding="async" referrerpolicy="no-referrer"${feedImage ? ` data-feed-image data-fallback-src="${bild.src}" data-fallback-alt="${escape(bild.alt)}"` : ''}>
        <figcaption>${feedImage ? 'Produktbild · Fressnapf-Feed' : 'Symbolbild'}</figcaption>
      </figure>
      <h3>${escape(productIdentity(treffer.productId)?.name ?? treffer.productId)}</h3>
      <p class="finder__kategorie">${identity ? `${escape(identity.brand)} · ` : ''}Kategorie: ${escape(kategorie(treffer.categoryId)?.label ?? treffer.categoryId)}</p>
      ${identity ? `<p>${identity.facts.map(escape).join(' · ')}</p>` : ''}
      ${begruendung}
      ${offen}
      ${source}
      <div class="finder__aktionen">${fressnapf}${amazon}</div>
    </li>`;
}

export function finderStarten(): void {
  const form = document.querySelector<HTMLFormElement>('#finder');
  const ausgabe = document.querySelector<HTMLElement>('#finder-ergebnis');
  if (form === null || ausgabe === null) return;

  const requestedSpecies = new URLSearchParams(window.location.search).get('tierart');
  const speciesField = document.querySelector<HTMLSelectElement>('#finder-tierart');
  if (speciesField && (requestedSpecies === 'cat' || requestedSpecies === 'dog'))
    speciesField.value = requestedSpecies;

  const hinweis = document.querySelector<HTMLElement>('#finder-ohne-js');
  if (hinweis !== null) hinweis.hidden = true;
  const knopf = document.querySelector<HTMLButtonElement>('#finder-suchen');
  if (knopf !== null) knopf.hidden = false;

  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    const gewichtFeld = document.querySelector<HTMLInputElement>('#finder-gewicht');
    const roh = gewichtFeld?.value.trim() ?? '';
    const gewicht = Number(roh.replace(',', '.'));
    if (
      roh !== '' &&
      (!/^\d+(?:[.,]\d+)?$/.test(roh) || !Number.isFinite(gewicht) || gewicht <= 0)
    ) {
      gewichtFeld?.setAttribute('aria-invalid', 'true');
      ausgabe.textContent =
        'Bitte geben Sie ein positives Gewicht in Kilogramm ein oder lassen Sie das Feld leer, wenn es unbekannt ist.';
      gewichtFeld?.focus();
      return;
    }
    gewichtFeld?.removeAttribute('aria-invalid');
    const bedarf = bedarfLesen();
    const treffer = findeSpielzeug(attributPruefung().products, bedarf);

    const gewaehlt = bedarf.needs
      .map((eintrag) => BEDUERFNISSE[eintrag]?.label)
      .filter((label): label is string => label !== undefined);

    const kopf =
      treffer.length === 0
        ? '<p class="finder__kopf">Kein Produkt bleibt übrig. Das heißt nicht, dass es keines gibt — ' +
          'nur, dass hier keines erfasst ist, das zu Ihren Angaben passt.</p>'
        : `<p class="finder__kopf">${treffer.length} Produkt(e) sind nach Ihren Angaben nicht ` +
          `ausgeschlossen${gewaehlt.length === 0 ? '' : ` (${escape(gewaehlt.join(', '))})`}. ` +
          'Die Reihenfolge zählt belegte Übereinstimmungen — sie ist keine Bewertung des Produkts.</p>';

    ausgabe.innerHTML = `${kopf}<ul class="finder__liste">${treffer.map(trefferMarkup).join('')}</ul>`;
    for (const image of ausgabe.querySelectorAll<HTMLImageElement>('img[data-feed-image]')) {
      image.addEventListener(
        'error',
        () => {
          const fallback = image.dataset.fallbackSrc;
          if (!fallback || image.src.endsWith(fallback)) return;
          image.src = fallback;
          image.alt = image.dataset.fallbackAlt ?? 'Neutrales Symbolbild';
          image.closest('figure')?.querySelector('figcaption')?.replaceChildren('Symbolbild');
        },
        { once: true },
      );
    }
  });
}
