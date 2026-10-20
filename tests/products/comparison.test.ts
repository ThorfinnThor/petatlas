import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  bewerte,
  empfehlungen,
  preisKriterium,
  summeDerGewichte,
  type Kriterium,
  type Produkt,
} from '../../src/features/products/comparison.ts';
import {
  ALTE_SLUGS,
  PRODUKTE,
  PRODUKT_VERGLEICHE,
  auswertung,
  produkteFuer,
} from '../../src/features/products/comparison-pages.ts';
import { filterkostenProJahr } from '../../src/features/products/comparison-copy.ts';

const muster = (id: string, preis: number | null, specs: Produkt['specs'] = {}): Produkt => ({
  id,
  category: 'katzentrinkbrunnen',
  brand: 'Marke',
  model: id,
  variant: null,
  sourceUrl: 'https://example.org/',
  specs,
  price:
    preis === null
      ? null
      : {
          retailer: 'example.org',
          priceEur: preis,
          label: 'Stück',
          url: 'https://example.org/',
          verbatim: `${preis} €`,
        },
  checkedAt: '2026-10-20',
});

describe('Bewertung', () => {
  it('verlangt Gewichte mit zusammen 100 Punkten', () => {
    const halb: Kriterium = { ...preisKriterium(50) };
    expect(() => bewerte([muster('a', 10)], [halb])).toThrow(/100/);
  });

  it('gibt dem günstigsten Modell alle Preispunkte und dem teuersten ein Fünftel', () => {
    const [billig, mittel, teuer] = [muster('a', 20), muster('b', 40), muster('c', 80)];
    const noten = bewerte([billig, mittel, teuer], [preisKriterium(100)]);
    const punkte = Object.fromEntries(noten.map((n) => [n.produkt.id, n.gesamt]));
    expect(punkte).toEqual({ a: 100, b: 60, c: 20 });
  });

  it('gibt ohne belegten Preis keine Preispunkte und keine Empfehlung', () => {
    const noten = bewerte([muster('ohne', null), muster('mit', 50)], [preisKriterium(100)]);
    expect(noten.find((n) => n.produkt.id === 'ohne')!.gesamt).toBe(0);
    const [e] = empfehlungen(noten, [{ titel: 'Alle', warum: () => 'x' }]);
    expect(e!.bewertung.produkt.id).toBe('mit');
    expect(
      empfehlungen(bewerte([muster('ohne', null)], [preisKriterium(100)]), [
        { titel: 'Alle', warum: () => 'x' },
      ]),
    ).toEqual([]);
  });
});

describe('Datensatz', () => {
  it('belegt jeden Wert mit wörtlichem Ausschnitt und https-Quelle, nie Amazon', () => {
    for (const p of PRODUKTE) {
      expect(new URL(p.sourceUrl).protocol, p.id).toBe('https:');
      for (const [key, angabe] of Object.entries(p.specs)) {
        if (angabe.value === null) continue;
        expect(angabe.verbatim, `${p.id}.${key}`).toBeTruthy();
        expect(angabe.sourceUrl, `${p.id}.${key}`).toMatch(/^https:\/\//);
        expect(new URL(angabe.sourceUrl!).hostname, `${p.id}.${key}`).not.toContain('amazon.');
      }
      if (p.price) {
        expect(new URL(p.price.url).hostname, p.id).not.toContain('amazon.');
        expect(p.price.verbatim, p.id).toBeTruthy();
      }
    }
  });

  it('hat eindeutige IDs', () => {
    const ids = PRODUKTE.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Seiten', () => {
  it('erfüllen den Inhaltsstandard: mindestens 6 Modelle aus mindestens 3 Marken', () => {
    for (const seite of PRODUKT_VERGLEICHE) {
      const produkte = produkteFuer(seite);
      expect(produkte.length, seite.slug).toBeGreaterThanOrEqual(6);
      expect(new Set(produkte.map((p) => p.brand)).size, seite.slug).toBeGreaterThanOrEqual(3);
      expect(summeDerGewichte(seite.kriterien), seite.slug).toBe(100);
    }
  });

  it('nennen im Meta-Titel die tatsächliche Zahl der Modelle', () => {
    for (const seite of PRODUKT_VERGLEICHE) {
      const zahl = Number(/(\d+) /.exec(seite.metaTitel.replace(/20\d\d/, ''))?.[1]);
      expect(zahl, seite.slug).toBe(produkteFuer(seite).length);
    }
  });

  it('geben mindestens eine Empfehlung und Noten innerhalb der Gewichte', () => {
    for (const seite of PRODUKT_VERGLEICHE) {
      const { bewertungen, empfehlungen: liste } = auswertung(seite);
      expect(liste.length, seite.slug).toBeGreaterThanOrEqual(1);
      for (const e of liste) expect(e.bewertung.produkt.price, seite.slug).not.toBeNull();
      for (const b of bewertungen) {
        for (const n of b.teilnoten) {
          expect(n.punkte).toBeGreaterThanOrEqual(0);
          expect(n.punkte).toBeLessThanOrEqual(n.maximum);
        }
      }
    }
  });

  it('haben eindeutige Slugs und für jeden alten Slug eine 308-Weiterleitung auf eine Seite', () => {
    const slugs = PRODUKT_VERGLEICHE.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const redirects = readFileSync('public/_redirects', 'utf8');
    for (const [alt, neu] of Object.entries(ALTE_SLUGS)) {
      expect(slugs).toContain(neu);
      expect(slugs).not.toContain(alt);
      expect(redirects).toContain(`/de-de/produkte/${alt}/ /de-de/produkte/${neu}/ 308`);
    }
  });

  it('verwenden keine Test- oder Testsieger-Sprache', () => {
    for (const seite of PRODUKT_VERGLEICHE) {
      const text = JSON.stringify(seite);
      expect(text, seite.slug).not.toMatch(
        /Testsieger|\bim Test\b|\bunser(em)? Test|von uns getestet/,
      );
    }
  });
});

describe('Filterkosten', () => {
  it('rechnen Packungspreis, Stückzahl und Wechselintervall auf ein Jahr', () => {
    const p = muster('f', 30, {
      filterPack: { value: 12, verbatim: '12 €', sourceUrl: 'https://example.org/' },
      filterPackCount: { value: 6, verbatim: '6 Stück', sourceUrl: 'https://example.org/' },
      filterChangeWeeks: { value: 4, verbatim: 'alle 4 Wochen', sourceUrl: 'https://example.org/' },
    });
    // 2 € je Filter, 13 Wechsel im Jahr
    expect(filterkostenProJahr(p)).toBe(26);
  });

  it('bleiben offen, wenn eine Angabe fehlt', () => {
    expect(filterkostenProJahr(muster('f', 30))).toBeNull();
  });
});
