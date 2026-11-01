/**
 * Bedienung der Rechnungsprüfung. Lädt den Gebührenkatalog wie der Rechner und
 * rechnet nur im Browser; nichts wird gesendet oder gespeichert.
 */
import type { FeeItem } from '../../domain/schemas/index.ts';
import { formatMoney } from '../../domain/money.ts';
import { pruefeRechnung, type Befund, type RechnungsZeile } from './invoice-check.ts';
import { ladeKatalog } from './ui.ts';

const STUFE_TEXT: Record<Befund['stufe'], string> = {
  ok: 'Unauffällig',
  hinweis: 'Hinweis',
  pruefen: 'Nachfragen',
};

function zahl(wert: string): number | null {
  const bereinigt = wert
    .trim()
    .replace(/\s/g, '')
    .replace('€', '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  if (bereinigt === '') return null;
  const ergebnis = Number(bereinigt);
  return Number.isFinite(ergebnis) ? ergebnis : Number.NaN;
}

function befundListe(befunde: readonly Befund[]): HTMLUListElement {
  const liste = document.createElement('ul');
  for (const befund of befunde) {
    const eintrag = document.createElement('li');
    eintrag.className = `befund--${befund.stufe}`;
    const stufe = document.createElement('strong');
    stufe.textContent = `${STUFE_TEXT[befund.stufe]}: `;
    eintrag.append(stufe, befund.text);
    liste.append(eintrag);
  }
  return liste;
}

export function pruefungStarten(): void {
  const form = document.querySelector<HTMLFormElement>('#rechnungspruefung');
  const zeilenBereich = document.querySelector<HTMLDivElement>('#zeilen');
  const status = document.querySelector<HTMLParagraphElement>('#pruefung-status');
  const ausgabe = document.querySelector<HTMLElement>('#pruefung-ergebnis');
  const weitere = document.querySelector<HTMLButtonElement>('#zeile-hinzufuegen');
  if (!form || !zeilenBereich || !status || !ausgabe || !weitere) return;

  let katalog: readonly FeeItem[] | null = null;

  weitere.addEventListener('click', () => {
    const vorlage = zeilenBereich.querySelector<HTMLElement>('[data-zeile]');
    if (!vorlage) return;
    const index = zeilenBereich.querySelectorAll('[data-zeile]').length;
    const neu = vorlage.cloneNode(true) as HTMLElement;
    for (const feld of neu.querySelectorAll<HTMLInputElement>('input')) {
      feld.value = '';
      feld.id = `${feld.name}-${index}`;
    }
    for (const label of neu.querySelectorAll<HTMLLabelElement>('label')) {
      const name = label.htmlFor.replace(/-\d+$/, '');
      label.htmlFor = `${name}-${index}`;
    }
    zeilenBereich.append(neu);
    neu.querySelector<HTMLInputElement>('input')?.focus();
  });

  form.addEventListener('submit', async (ereignis) => {
    ereignis.preventDefault();
    const zeilen: RechnungsZeile[] = [];
    const fehler: string[] = [];
    zeilenBereich.querySelectorAll<HTMLElement>('[data-zeile]').forEach((zeile, index) => {
      const wert = (name: string) =>
        zeile.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value ?? '';
      const nummer = wert('nummer')
        .trim()
        .replace(/^Nr\.?\s*/i, '');
      if (nummer === '') return;
      const faktor = zahl(wert('faktor')) ?? 1;
      const menge = zahl(wert('menge')) ?? 1;
      const betrag = zahl(wert('betrag'));
      if (!/^\d{1,4}$/.test(nummer))
        fehler.push(`Zeile ${index + 1}: Die GOT-Nummer besteht nur aus Ziffern.`);
      if (!(faktor > 0) || Number.isNaN(faktor))
        fehler.push(`Zeile ${index + 1}: Der Faktor muss eine Zahl größer als 0 sein.`);
      if (!Number.isSafeInteger(menge) || menge < 1)
        fehler.push(`Zeile ${index + 1}: Die Menge muss eine ganze Zahl ab 1 sein.`);
      if (betrag !== null && Number.isNaN(betrag))
        fehler.push(`Zeile ${index + 1}: Der Betrag ist keine Zahl.`);
      zeilen.push({
        nummer,
        faktor,
        menge,
        betragLautRechnungMinor:
          betrag === null || Number.isNaN(betrag) ? null : Math.round(betrag * 100),
      });
    });
    const gebuehren = Number(
      form.querySelector<HTMLInputElement>('#notdienstgebuehren')?.value || '0',
    );
    if (!Number.isSafeInteger(gebuehren) || gebuehren < 0)
      fehler.push('Die Zahl der Notdienstgebühren muss eine ganze Zahl ab 0 sein.');
    if (zeilen.length === 0) fehler.push('Trag mindestens eine GOT-Nummer ein.');
    if (fehler.length > 0) {
      status.textContent = fehler.join(' ');
      return;
    }

    try {
      status.textContent = 'Gebührenverzeichnis wird geladen …';
      katalog ??= await ladeKatalog();
    } catch {
      status.textContent =
        'Das Gebührenverzeichnis konnte nicht geladen werden. Bitte versuch es später noch einmal.';
      return;
    }

    const kontext =
      form.querySelector<HTMLSelectElement>('#kontext')?.value === 'emergency'
        ? 'emergency'
        : 'regular';
    const tierartWert = form.querySelector<HTMLSelectElement>('#tierart')?.value;
    const ergebnis = pruefeRechnung(
      {
        kontext,
        tierart: tierartWert === 'dog' || tierartWert === 'cat' ? tierartWert : null,
        zeilen,
        notdienstgebuehren: gebuehren,
      },
      katalog,
    );

    const zuPruefen =
      ergebnis.zeilen
        .flatMap((zeile) => zeile.befunde)
        .filter((befund) => befund.stufe === 'pruefen').length +
      ergebnis.befunde.filter((befund) => befund.stufe === 'pruefen').length;
    status.textContent =
      zuPruefen === 0
        ? `${ergebnis.zeilen.length} Zeilen geprüft, nichts Auffälliges zum Nachfragen.`
        : `${ergebnis.zeilen.length} Zeilen geprüft, ${zuPruefen} Punkt${zuPruefen === 1 ? '' : 'e'} zum Nachfragen.`;

    const titel = document.createElement('h2');
    titel.textContent = 'Ergebnis';
    const inhalt: HTMLElement[] = [titel];
    for (const zeile of ergebnis.zeilen) {
      const block = document.createElement('div');
      block.className = 'pruefzeile';
      const kopf = document.createElement('h3');
      kopf.textContent = zeile.bezeichnung
        ? `Nr. ${zeile.nummer}: ${zeile.bezeichnung}`
        : `Nr. ${zeile.nummer}`;
      block.append(kopf);
      if (zeile.grundbetrag && zeile.sollNetto) {
        const rechnung = document.createElement('p');
        rechnung.textContent = `${formatMoney(zeile.grundbetrag, 'de-DE')} × ${zeile.faktor.toLocaleString('de-DE')} × ${zeile.menge} = ${formatMoney(zeile.sollNetto, 'de-DE')} netto`;
        block.append(rechnung);
      }
      block.append(befundListe(zeile.befunde));
      inhalt.push(block);
    }
    if (ergebnis.befunde.length > 0) {
      const gesamt = document.createElement('h3');
      gesamt.textContent = 'Zur ganzen Rechnung';
      inhalt.push(gesamt, befundListe(ergebnis.befunde));
    }
    ausgabe.replaceChildren(...inhalt);
    ausgabe.focus();
  });
}
