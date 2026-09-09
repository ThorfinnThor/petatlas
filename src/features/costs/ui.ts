/**
 * M08-04 — Rechneroberfläche im Browser.
 *
 * Wichtig: gerechnet wird mit **derselben** Engine wie im Build. Sie wird
 * importiert, nicht nachgebaut — sonst könnten Browser und Build zu
 * verschiedenen Beträgen kommen.
 *
 * Die Gebührendaten kommen über das Manifest als statische Datei. Es gibt
 * keinen Server und keine Anfrage an Dritte.
 */
import { formatMoney } from '../../domain/money.ts';
import { istGebuehrenposition } from '../../domain/runtime-guards.ts';
import type { FeeItem } from '../../domain/schemas/costs.ts';
import type { Species } from '../../domain/schemas/common.ts';
import {
  CostError,
  calculateCosts,
  factorRange,
  type CostRequestLine,
  type CostResult,
  type TreatmentContext,
} from './engine.ts';

const LOCALE = 'de-DE';
const MANIFEST = '/data/v1/manifest.json';

interface Auswahl extends CostRequestLine {
  readonly label: string;
}

async function ladeKatalog(): Promise<readonly FeeItem[]> {
  const manifest = (await (await fetch(MANIFEST)).json()) as {
    chunks: { kind: string; marketId: string; path: string }[];
  };
  const chunk = manifest.chunks.find((c) => c.kind === 'fees' && c.marketId === 'DE');
  if (!chunk) throw new Error('Das Manifest nennt keine Gebührendaten für den Markt DE.');

  const daten = (await (await fetch(chunk.path)).json()) as { records: unknown[] };
  const items: FeeItem[] = [];
  for (const roh of daten.records) {
    // Ein ungültiger Datensatz wird übersprungen, nicht repariert. Geprüft
    // wird mit der handgeschriebenen Fassung (M22-02); dass sie dasselbe
    // sagt wie `FeeItemSchema`, prüft `tests/runtime-guards.test.ts`.
    if (istGebuehrenposition(roh)) items.push(roh as FeeItem);
  }
  if (items.length === 0) throw new Error('Die Gebührendatei enthält keine gültige Position.');
  return items;
}

function element<T extends Element>(auswahl: string): T | null {
  return document.querySelector<T>(auswahl);
}

function geld(minor: number): string {
  return formatMoney({ amountMinor: minor, currency: 'EUR' }, LOCALE);
}

function ergebnisTabelle(result: CostResult): string {
  const zeilen = result.lines
    .map(
      (zeile, index) => `
        <tr>
          <td>
            ${escape(zeile.label)}
            <span class="fundstelle">${escape(zeile.sourceReference)}</span>
            <button type="button" data-remove-cost="${index}" aria-label="Position entfernen: ${escape(zeile.label)}">Entfernen</button>
          </td>
          <td class="zahl">${geld(zeile.baseAmount.amountMinor)}</td>
          <td class="zahl">${zeile.factor.toLocaleString(LOCALE, { minimumFractionDigits: 2 })}</td>
          <td class="zahl">${zeile.quantity}</td>
          <td class="zahl">${geld(zeile.netAmount.amountMinor)}</td>
        </tr>`,
    )
    .join('');

  const notdienst =
    result.emergencyFee === null
      ? ''
      : `<tr>
           <td colspan="4">Notdienstgebühr, einmal je Angelegenheit</td>
           <td class="zahl">${geld(result.emergencyFee.amountMinor)}</td>
         </tr>`;

  return `
    <p class="bill-summary"><strong>${geld(result.grossTotal.amountMinor)}</strong><br>Brutto für die ausgewählten Positionen, inklusive ${result.vatPercent} % Umsatzsteuer.</p>
    <table>
      <caption>Rechnung, Fassung ${escape(result.catalogVersion)}</caption>
      <thead>
        <tr>
          <th scope="col">Position</th>
          <th scope="col" class="zahl">Satz</th>
          <th scope="col" class="zahl">Faktor</th>
          <th scope="col" class="zahl">Menge</th>
          <th scope="col" class="zahl">Netto</th>
        </tr>
      </thead>
      <tbody>${zeilen}${notdienst}</tbody>
      <tfoot>
        <tr><td colspan="4">Summe netto</td><td class="zahl">${geld(result.netTotal.amountMinor)}</td></tr>
        <tr><td colspan="4">Umsatzsteuer ${result.vatPercent} Prozent</td><td class="zahl">${geld(result.vatAmount.amountMinor)}</td></tr>
        <tr><td colspan="4">Summe brutto</td><td class="zahl" data-testid="brutto">${geld(result.grossTotal.amountMinor)}</td></tr>
      </tfoot>
    </table>
    <p>Die Umsatzsteuer ist mit ${result.vatPercent} Prozent angenommen. Auslagen können abweichend behandelt werden.</p>`;
}

function escape(wert: string): string {
  return wert.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}

export function rechnerStarten(): void {
  const form = element<HTMLFormElement>('#rechner');
  const suche = element<HTMLInputElement>('#suche');
  const trefferListe = element<HTMLUListElement>('#treffer');
  const sucheHinweis = element<HTMLParagraphElement>('#suche-hinweis');
  const status = element<HTMLParagraphElement>('#rechner-status');
  const ergebnis = element<HTMLDivElement>('#ergebnis');
  const menge = element<HTMLInputElement>('#menge');
  const faktor = element<HTMLInputElement>('#faktor');
  // M21-05: Die Tierart ist eine Radiogruppe (Auswahlkarten), kein Select.
  const tierartFelder = [...document.querySelectorAll<HTMLInputElement>('input[name="tierart"]')];

  if (
    !form ||
    !suche ||
    !trefferListe ||
    !sucheHinweis ||
    !status ||
    !ergebnis ||
    !menge ||
    !faktor
  )
    return;

  let katalog: readonly FeeItem[] = [];
  const auswahl: Auswahl[] = [];
  const bearbeiten = element<HTMLSelectElement>('#position-bearbeiten');
  const uebernehmen = element<HTMLButtonElement>('#position-uebernehmen');
  const entfernen = element<HTMLButtonElement>('#auswahl-entfernen');
  let bearbeitet: number | null = null;
  menge.value = '1';
  faktor.value = '1';

  function auswahlSteuern(): void {
    if (!bearbeiten || !uebernehmen || !entfernen) return;
    const steuerung = element<HTMLElement>('#auswahl-steuerung');
    if (steuerung) steuerung.hidden = auswahl.length === 0;
    bearbeiten.replaceChildren();
    auswahl.forEach((position, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = position.label;
      option.selected = index === bearbeitet;
      bearbeiten.append(option);
    });
    uebernehmen.disabled = bearbeitet === null;
    entfernen.hidden = bearbeitet === null;
    const hinweis = element<HTMLElement>('#auswahl-hinweis');
    if (hinweis)
      hinweis.textContent =
        'Menge und Faktor gelten für die ausgewählte Position. Änderungen werden erst mit „Änderungen übernehmen“ angewendet.';
  }

  function eingabePosition(item: FeeItem): Auswahl | null {
    const position = {
      officialItemId: item.officialItemId,
      quantity: Number(menge!.value.trim()),
      factor: Number(faktor!.value.trim().replace(',', '.')),
      label: item.originalLabel,
    };
    try {
      calculateCosts({ context: kontext(), species: art(), lines: [position] }, katalog);
      return position;
    } catch (error) {
      status!.textContent =
        error instanceof CostError ? error.message : 'Die Position kann nicht übernommen werden.';
      ergebnis!.replaceChildren();
      const drucken = element<HTMLButtonElement>('#drucken');
      if (drucken) drucken.disabled = true;
      return null;
    }
  }

  function positionEntfernen(index: number): void {
    auswahl.splice(index, 1);
    bearbeitet = auswahl.length ? 0 : null;
    if (bearbeitet !== null) {
      menge!.value = String(auswahl[bearbeitet]!.quantity);
      faktor!.value = String(auswahl[bearbeitet]!.factor).replace('.', ',');
    }
    auswahlSteuern();
    neuRechnen();
    suche!.focus();
  }

  function kontext(): TreatmentContext {
    const gewaehlt = document.querySelector<HTMLInputElement>('input[name="kontext"]:checked');
    return gewaehlt?.value === 'emergency' ? 'emergency' : 'regular';
  }

  /**
   * `null` heißt „keine Angabe“ — und zwar als ausdrückliche Wahl, nicht als
   * leeres Feld. Alles, was nicht Hund oder Katze ist, filtert nichts.
   */
  function art(): Species | null {
    const gewaehlt = document.querySelector<HTMLInputElement>('input[name="tierart"]:checked');
    const wert = gewaehlt?.value ?? 'unbekannt';
    return wert === 'dog' || wert === 'cat' ? wert : null;
  }

  function faktorGrenzenSetzen(): void {
    const { min, max } = factorRange(kontext());
    faktor!.dataset.min = String(min);
    faktor!.dataset.max = String(max);
    faktor!.dataset.fehlertext = `Der Faktor muss im Kontext „${kontext() === 'emergency' ? 'Notdienst' : 'regulär'}“ zwischen ${min} und ${max} liegen.`;
  }

  function neuRechnen(): void {
    const printButton = element<HTMLButtonElement>('#drucken');
    if (printButton) printButton.disabled = true;
    if (auswahl.length === 0) {
      status!.textContent = 'Noch keine Position ausgewählt.';
      ergebnis!.replaceChildren();
      return;
    }
    try {
      const result = calculateCosts(
        {
          context: kontext(),
          species: art(),
          lines: auswahl.map(({ officialItemId, quantity, factor }) => ({
            officialItemId,
            quantity,
            factor,
          })),
        },
        katalog,
      );
      status!.textContent = `${result.lines.length} Position(en), Summe brutto ${geld(result.grossTotal.amountMinor)}.`;
      ergebnis!.innerHTML = ergebnisTabelle(result);
      if (printButton) printButton.disabled = false;
    } catch (fehler) {
      // Ein Rechenfehler wird benannt, nicht verschluckt.
      const meldung =
        fehler instanceof CostError ? fehler.message : 'Die Rechnung ist nicht möglich.';
      status!.textContent = meldung;
      ergebnis!.replaceChildren();
    }
  }

  function trefferZeigen(): void {
    const begriff = suche!.value.trim().toLowerCase();
    trefferListe!.replaceChildren();

    if (begriff.length < 3) {
      sucheHinweis!.textContent = begriff === '' ? '' : 'Bitte mindestens drei Zeichen eingeben.';
      return;
    }

    const gewaehlteArt = art();
    const treffer = katalog
      .filter((item) => item.originalLabel.toLowerCase().includes(begriff))
      .filter(
        (item) => gewaehlteArt === null || item.species === null || item.species === gewaehlteArt,
      )
      .slice(0, 25);

    sucheHinweis!.textContent =
      treffer.length === 0
        ? `Keine Position gefunden für „${suche!.value.trim()}“.`
        : `${treffer.length} Position(en) gefunden.`;

    for (const item of treffer) {
      const li = document.createElement('li');
      const knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.textContent = `${item.originalLabel} — ${geld(item.baseAmountMinor)}`;
      knopf.addEventListener('click', () => {
        if (auswahl.some((eintrag) => eintrag.officialItemId === item.officialItemId)) {
          sucheHinweis!.textContent = 'Diese Position ist bereits ausgewählt.';
          return;
        }
        const position = eingabePosition(item);
        if (!position) return;
        auswahl.push(position);
        bearbeitet = auswahl.length - 1;
        auswahlSteuern();
        neuRechnen();
      });
      li.append(knopf);
      trefferListe!.append(li);
    }
  }

  for (const eingabe of document.querySelectorAll<HTMLInputElement>('input[name="kontext"]')) {
    eingabe.addEventListener('change', () => {
      faktorGrenzenSetzen();
      neuRechnen();
    });
  }
  for (const eingabe of tierartFelder) {
    eingabe.addEventListener('change', () => {
      trefferZeigen();
      neuRechnen();
    });
  }
  suche.addEventListener('input', trefferZeigen);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('formular:ungueltig', () => {
    ergebnis.replaceChildren();
    const drucken = element<HTMLButtonElement>('#drucken');
    if (drucken) drucken.disabled = true;
    status.textContent = 'Bitte korrigieren Sie die markierten Eingaben.';
  });
  form.addEventListener('formular:gueltig', () => {
    if (bearbeitet === null) return;
    const item = katalog.find(
      (entry) => entry.officialItemId === auswahl[bearbeitet!]?.officialItemId,
    );
    if (!item) return;
    const position = eingabePosition(item);
    if (!position) return;
    auswahl[bearbeitet] = position;
    neuRechnen();
  });
  bearbeiten?.addEventListener('change', () => {
    const index = Number(bearbeiten.value);
    const position = auswahl[index];
    if (!position) return;
    bearbeitet = index;
    menge.value = String(position.quantity);
    faktor.value = String(position.factor).replace('.', ',');
  });
  entfernen?.addEventListener('click', () => {
    if (bearbeitet !== null) positionEntfernen(bearbeitet);
  });

  ergebnis.addEventListener('click', (event) => {
    const button =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>('[data-remove-cost]')
        : null;
    if (!button) return;
    const index = Number(button.dataset.removeCost);
    if (!Number.isInteger(index) || index < 0 || index >= auswahl.length) return;
    positionEntfernen(index);
  });

  element<HTMLButtonElement>('#drucken')?.addEventListener('click', () => {
    window.print();
  });

  faktorGrenzenSetzen();

  void ladeKatalog()
    .then((geladen) => {
      katalog = geladen;
      sucheHinweis.textContent = `${geladen.length} Positionen geladen.`;
      suche.disabled = false;
    })
    .catch((fehler: unknown) => {
      // Ohne Katalog wird nichts gerechnet und nichts geschätzt.
      status.textContent = 'Die Gebührendaten konnten nicht geladen werden.';
      sucheHinweis.textContent = 'Die Suche steht gerade nicht zur Verfügung.';
      console.error('Gebührendaten:', fehler);
    });
}
