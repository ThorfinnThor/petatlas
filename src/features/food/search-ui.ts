/**
 * M15-03 — Futtersuche im Browser.
 *
 * Sucht lokal über den mitgelieferten Datensatz — keine Anfrage, keine
 * Übertragung der Eingabe. Die Barcodenummer ist dabei nur eine weitere
 * Eingabe: abgetippt genügt, eine Kamera braucht niemand.
 */
import { sucheFutter, type FutterTreffer } from './catalog.ts';
import { mengenText } from './unit-price.ts';

function escape(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

const GRUND_TEXT: Readonly<Record<FutterTreffer['grund'], string>> = {
  gtin: 'Treffer über die Nummer',
  name: 'Treffer im Produktnamen',
  marke: 'Treffer in der Marke',
};

function trefferMarkup(treffer: FutterTreffer, basisPfad: string): string {
  const menge = mengenText(treffer.produkt);
  return `
    <li data-futter="${escape(treffer.produkt.foodId)}" data-grund="${treffer.grund}">
      <h3><a href="${escape(basisPfad)}${escape(treffer.produkt.foodId.replace('synthetisch:', ''))}/">${escape(
        treffer.produkt.brand,
      )} — ${escape(treffer.produkt.productName)}</a></h3>
      <p class="treffer__meta">${escape(GRUND_TEXT[treffer.grund])}${
        menge === null ? ' · Menge nicht angegeben' : ` · ${escape(menge)}`
      }</p>
    </li>`;
}

export function futtersucheStarten(): void {
  const form = document.querySelector<HTMLFormElement>('#futtersuche');
  const ausgabe = document.querySelector<HTMLElement>('#futter-treffer');
  if (form === null || ausgabe === null) return;

  const basisPfad = form.dataset.basis ?? '/de-de/futter/';
  const hinweis = document.querySelector<HTMLElement>('#futter-ohne-js');
  if (hinweis !== null) hinweis.hidden = true;
  const knopf = document.querySelector<HTMLButtonElement>('#futter-suchen');
  if (knopf !== null) knopf.hidden = false;

  form.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    const begriff = document.querySelector<HTMLInputElement>('#futter-begriff')?.value ?? '';
    if (begriff.trim().length < 3) {
      ausgabe.innerHTML =
        '<p class="treffer__kopf">Bitte mindestens drei Zeichen eingeben — oder die vollständige ' +
        'Nummer vom Etikett.</p>';
      return;
    }

    const treffer = sucheFutter(begriff);
    if (treffer.length === 0) {
      ausgabe.innerHTML =
        '<p class="treffer__kopf">Kein Treffer. Das heißt nicht, dass es das Produkt nicht gibt — ' +
        'nur, dass es hier nicht erfasst ist.</p>';
      return;
    }

    ausgabe.innerHTML =
      `<p class="treffer__kopf">${treffer.length} Treffer.</p>` +
      `<ul class="treffer__liste">${treffer.map((eintrag) => trefferMarkup(eintrag, basisPfad)).join('')}</ul>`;
  });
}
