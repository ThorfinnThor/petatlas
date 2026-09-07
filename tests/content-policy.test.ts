// M09-04 — Redaktion und Erlöslogik bleiben getrennt.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { InsuranceDisclosureSchema } from '../src/domain/schemas/disclosure.ts';
import { PartnerPlacement } from '../src/domain/schemas/partner.ts';
import { disclosuresFor, insuranceDisclosures } from '../src/features/commerce/disclosures.ts';

const TEXTE_VERZEICHNIS = 'content-data/insurance-disclosures';

/**
 * Aussagen, die auf dieser Website nicht vorkommen dürfen. Geprüft wird der
 * **Wortlaut**, nicht die Absicht: der Test ist deshalb streng und meldet
 * auch gut gemeinte Formulierungen.
 */
const VERBOTENE_AUSSAGEN: readonly { readonly muster: RegExp; readonly warum: string }[] = [
  {
    // „garantierte Erstattung“, aber auch „die Erstattung ist garantiert“:
    // zwischen beiden Wörtern darf etwas stehen, nur kein Satzende.
    muster: /garantiert\w*[^.!?]{0,30}\b(kostenerstattung|erstattung|übernahme)/i,
    warum: 'Erstattungszusage',
  },
  {
    muster: /\b(kostenerstattung|erstattung|übernahme)\b[^.!?]{0,30}garantiert/i,
    warum: 'Erstattungszusage',
  },
  { muster: /(immer|stets)\s+erstattet/i, warum: 'Erstattungszusage' },
  { muster: /voll(e|ständig)?\s+erstattung/i, warum: 'Erstattungszusage' },
  { muster: /trotz\s+vorerkrankung\w*\s+\w*versicher/i, warum: 'Versicherbarkeitszusage' },
  { muster: /(immer|jederzeit)\s+versicherbar/i, warum: 'Versicherbarkeitszusage' },
  { muster: /testsieger|vergleichssieger|stiftung\s+warentest/i, warum: 'Testbehauptung' },
  { muster: /best(er|e|es)\s+(tarif|versicherung|angebot|produkt|anbieter)/i, warum: 'Rangfolge' },
  { muster: /top-?(tarif|anbieter|empfehlung)/i, warum: 'Rangfolge' },
  { muster: /(günstigst|preiswertest)\w*\s+(tarif|versicherung|anbieter)/i, warum: 'Rangfolge' },
  { muster: /\bab\s+nur\s+\d/i, warum: 'erfundene Tarifdaten' },
  {
    muster: /\d+([.,]\d+)?\s*(€|eur|euro)\s*(pro\s+monat|\/\s*monat|monatlich|im\s+monat)/i,
    warum: 'erfundene Tarifdaten',
  },
  { muster: /(monatsbeitrag|jahresbeitrag)\s+(von|ab)\s+\d/i, warum: 'erfundene Tarifdaten' },
  { muster: /jetzt\s+(abschließen|sichern|zuschlagen)/i, warum: 'Verkaufsdruck' },
  { muster: /(nur\s+noch\s+heute|nur\s+kurze\s+zeit|letzte\s+chance)/i, warum: 'Verkaufsdruck' },
];

/** Wörter, die eine Aussage in ihr Gegenteil verkehren. */
const VERNEINUNGEN =
  /\b(kein|keine|keinen|keiner|keines|keinerlei|keinesfalls|nicht|nie|niemals|niemand|nirgends|ohne|weder|statt)\b/i;

/**
 * Fundstellen einer verbotenen Aussage. Ein Satz, der die Aussage
 * ausdrücklich verneint („es gibt hier keine beste Versicherung“), zählt
 * nicht — sonst könnte die Seite nicht einmal sagen, was sie nicht tut.
 */
export function verdaechtigeStellen(text: string): readonly string[] {
  const saetze = text.split(/(?<=[.!?:])\s+|\n+/);
  const funde: string[] = [];
  for (const satz of saetze) {
    for (const eintrag of VERBOTENE_AUSSAGEN) {
      if (!eintrag.muster.test(satz)) continue;
      if (VERNEINUNGEN.test(satz)) continue;
      funde.push(`${eintrag.warum}: „${satz.trim().slice(0, 120)}“`);
    }
  }
  return funde;
}

/** Alle Dateien unter einem Pfad, rekursiv, mit passender Endung. */
function dateien(pfad: string, endungen: readonly string[]): string[] {
  const gefunden: string[] = [];
  for (const eintrag of readdirSync(pfad, { withFileTypes: true })) {
    const voll = join(pfad, eintrag.name);
    if (eintrag.isDirectory()) gefunden.push(...dateien(voll, endungen));
    else if (endungen.some((endung) => eintrag.name.endsWith(endung))) gefunden.push(voll);
  }
  return gefunden;
}

describe('Hinweistexte', () => {
  const jsonDateien = readdirSync(TEXTE_VERZEICHNIS).filter((name) => name.endsWith('.json'));

  it('sind vollständig und gültig', () => {
    expect(jsonDateien.length).toBeGreaterThanOrEqual(5);
    for (const name of jsonDateien) {
      const roh = JSON.parse(readFileSync(join(TEXTE_VERZEICHNIS, name), 'utf8')) as unknown;
      expect(InsuranceDisclosureSchema.safeParse(roh).success, name).toBe(true);
    }
  });

  it('werden alle geladen und sind eindeutig', () => {
    const ids = insuranceDisclosures().map((text) => text.disclosureId);
    expect(ids.length).toBe(jsonDateien.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gelten auch ohne Partner — sonst wären sie Werbung', () => {
    const ohnePartner = disclosuresFor('information_page', false);
    expect(ohnePartner.length).toBe(insuranceDisclosures().length);
    for (const text of ohnePartner)
      expect(text.appliesWithoutPartner, text.disclosureId).toBe(true);
  });

  it('nennen ausdrücklich, dass es keine Erstattungszusage und keine Rangfolge gibt', () => {
    const alles = insuranceDisclosures()
      .map((text) => `${text.heading} ${text.paragraphs.join(' ')}`)
      .join('\n')
      .toLowerCase();
    expect(alles).toContain('keine beratung');
    expect(alles).toContain('bestenliste');
    expect(alles).toMatch(/erstattet wird, entscheidet der vertrag/);
    expect(alles).toMatch(/versicherbar/);
    expect(alles).toMatch(/notfall/);
  });
});

describe('Verbotene Aussagen', () => {
  it('kommen in den Hinweistexten nicht vor', () => {
    for (const text of insuranceDisclosures()) {
      const funde = verdaechtigeStellen(`${text.heading}. ${text.paragraphs.join(' ')}`);
      expect(funde, text.disclosureId).toEqual([]);
    }
  });

  it('kommen in der Oberfläche nicht vor', () => {
    const quellen = [
      ...dateien('src/components', ['.astro']),
      ...dateien('src/pages', ['.astro']),
      ...dateien('src/features/commerce', ['.ts']),
    ];
    for (const datei of quellen) {
      const funde = verdaechtigeStellen(readFileSync(datei, 'utf8'));
      expect(funde, datei).toEqual([]);
    }
  });

  it('werden vom Prüfmuster tatsächlich gefunden', () => {
    // Der Test muss selbst geprüft sein, sonst prüft er nichts.
    expect(verdaechtigeStellen('Die Erstattung ist garantiert.').length).toBe(1);
    expect(verdaechtigeStellen('Der beste Tarif für Ihren Hund.').length).toBe(1);
    expect(verdaechtigeStellen('Schon ab nur 9,90 € pro Monat.').length).toBeGreaterThan(0);
    expect(verdaechtigeStellen('Trotz Vorerkrankung versicherbar.').length).toBe(1);
    expect(verdaechtigeStellen('Jetzt abschließen und sparen.').length).toBe(1);
  });

  it('gelten nicht für Sätze, die sie ausdrücklich verneinen', () => {
    expect(verdaechtigeStellen('Es gibt hier keine beste Versicherung.')).toEqual([]);
    expect(verdaechtigeStellen('Eine garantierte Erstattung sagt hier niemand zu.')).toEqual([]);
  });
});

describe('Trennung von Redaktion und Erlös', () => {
  it('kennt keine Platzierung neben einem Ergebnis', () => {
    expect(new Set(PartnerPlacement.options)).toEqual(
      new Set(['information_page', 'page_footer_section', 'neutral_list']),
    );
  });

  it('bindet den Partnerhinweis in keine fachliche Seite ein', () => {
    // Zulässig ist er bisher ausschließlich auf der Probe-Seite. Kommt eine
    // Versicherungsseite dazu, gehört sie hier ausdrücklich hinein — und
    // dieser Test zwingt zu der Entscheidung.
    const erlaubt = new Set(['src/pages/entwicklung/versicherungsprobe.astro']);
    const seiten = dateien('src/pages', ['.astro']);
    for (const datei of seiten) {
      const inhalt = readFileSync(datei, 'utf8');
      if (!inhalt.includes('PartnerCta')) continue;
      expect(erlaubt.has(datei.replaceAll('\\', '/')), datei).toBe(true);
    }
  });

  it('bindet ihn insbesondere nicht in Kosten-, Karten- oder Notfallinhalte ein', () => {
    for (const datei of dateien('src/components/pages', ['.astro'])) {
      const inhalt = readFileSync(datei, 'utf8');
      expect(inhalt.includes('PartnerCta'), datei).toBe(false);
    }
    const kostenSeite = readFileSync('src/pages/de-de/tierarztkosten/[slug].astro', 'utf8');
    expect(kostenSeite).not.toContain('PartnerCta');
    const stadtSeite = readFileSync('src/pages/de-de/tierarzt-karte/[stadt].astro', 'utf8');
    expect(stadtSeite).not.toContain('PartnerCta');
  });
});
