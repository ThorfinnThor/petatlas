// M11-04 — Die ausgelieferte Allowlist gegen den echten Datenstand gemessen.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { oeffentlicheProjektion, type PlacesSnapshot } from '../../scripts/publish/places.ts';
import { PFLICHT_KATEGORIEN } from '../../src/features/map/city.ts';
import {
  baubareStadtseiten,
  nachKategorie,
  stadtAllowlist,
} from '../../src/features/map/city-allowlist.ts';
import type { ListenOrt } from '../../src/features/map/list.ts';

const snapshot = JSON.parse(
  readFileSync('data-snapshots/places/places-de.json', 'utf8'),
) as PlacesSnapshot;
const orte = snapshot.places.map(oeffentlicheProjektion) as unknown as ListenOrt[];
const seiten = baubareStadtseiten(orte);
const allowlist = stadtAllowlist();

describe('Allowlist gegen den Datenstand', () => {
  it('erzeugt für jede gelistete Stadt tatsächlich eine Seite', () => {
    // Schlägt das fehl, ist die Datei veraltet: `npm run build:city-allowlist`.
    expect(seiten.map((seite) => seite.slug)).toEqual(allowlist.cities.map((stadt) => stadt.slug));
  });

  it('gibt die gemessenen Zahlen unverändert wieder', () => {
    for (const seite of seiten) {
      const eintrag = allowlist.cities.find((stadt) => stadt.slug === seite.slug);
      expect(eintrag, seite.slug).toBeDefined();
      expect(seite.befund.gesamt, seite.slug).toBe(eintrag?.measured.total);
      expect(seite.befund.inGemeinde, seite.slug).toBe(eintrag?.measured.inMunicipality);
      expect(seite.befund.mitKontakt, seite.slug).toBe(eintrag?.measured.withContact);
    }
  });

  it('hat auf keiner Seite eine leere Kategorie', () => {
    for (const seite of seiten) {
      const gruppen = nachKategorie(seite.treffer);
      for (const kategorie of PFLICHT_KATEGORIEN) {
        expect(gruppen.get(kategorie)?.length ?? 0, `${seite.slug}/${kategorie}`).toBeGreaterThan(
          0,
        );
      }
    }
  });

  it('sortiert die Treffer jeder Seite nach Entfernung', () => {
    for (const seite of seiten) {
      const abstaende = seite.treffer.map((treffer) => treffer.entfernungMeter);
      expect(
        [...abstaende].sort((a, b) => a - b),
        seite.slug,
      ).toEqual(abstaende);
    }
  });

  it('verweist nur auf Städte, die es im Ortsindex gibt', () => {
    const index = JSON.parse(readFileSync('data-snapshots/places/place-index-de.json', 'utf8')) as {
      entries: readonly { placeId: string; name: string }[];
    };
    const bekannt = new Map(index.entries.map((eintrag) => [eintrag.placeId, eintrag.name]));
    for (const stadt of allowlist.cities) {
      expect(bekannt.get(stadt.placeId), stadt.slug).toBe(stadt.name);
    }
  });
});
