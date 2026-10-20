import { describe, expect, it } from 'vitest';

import snapshot from '../../data-snapshots/places/places-de.json' with { type: 'json' };
import { oeffentlicheProjektion } from '../../scripts/publish/places.ts';
import type { Place } from '../../src/domain/schemas/places.ts';
import { baubareStadtseiten } from '../../src/features/map/city-allowlist.ts';
import { LISTENLAENGE, stadtUebersicht } from '../../src/features/map/city-summary.ts';
import { applyDirectoryControls } from '../../src/features/map/directory-controls.ts';
import type { ListenOrt } from '../../src/features/map/list.ts';
import { sprechzeiten, wochenplan } from '../../src/features/map/opening-hours.ts';

const orte = applyDirectoryControls(snapshot.places as unknown as Place[]).map(
  oeffentlicheProjektion,
) as unknown as ListenOrt[];
const seiten = baubareStadtseiten(orte);

describe('Stadtübersicht', () => {
  it('zählt nur Tierarztpraxen mit lesbaren Öffnungszeiten', () => {
    for (const seite of seiten) {
      const u = stadtUebersicht(seite);
      expect(u.mitLesbarenZeiten, seite.slug).toBeLessThanOrEqual(u.tieraerzte);
      for (const liste of [u.samstag, u.sonntag, u.abends, u.rundUmDieUhr]) {
        expect(liste.naechste.length).toBe(Math.min(liste.anzahl, LISTENLAENGE));
        for (const { treffer } of liste.naechste) {
          expect(treffer.ort.category).toBe('veterinary');
          expect(wochenplan(treffer.ort.openingHours)).not.toBeNull();
        }
      }
    }
  });

  it('führt Praxen mit 24/7 nur unter „rund um die Uhr“, nicht doppelt', () => {
    for (const seite of seiten) {
      const u = stadtUebersicht(seite);
      for (const liste of [u.samstag, u.sonntag, u.abends]) {
        for (const { treffer } of liste.naechste) {
          expect(sprechzeiten(wochenplan(treffer.ort.openingHours)!).rundUmDieUhr).toBe(false);
        }
      }
    }
  });

  it('nennt die nächstgelegenen zuerst', () => {
    for (const seite of seiten) {
      const u = stadtUebersicht(seite);
      for (const liste of [u.samstag.naechste.map((e) => e.treffer), u.hundewiesen.naechste]) {
        const meter = liste.map((t) => t.entfernungMeter);
        expect(meter).toEqual([...meter].sort((a, b) => a - b));
      }
    }
  });

  it('zählt eingezäunte Hundewiesen nur bei ausdrücklicher Angabe', () => {
    for (const seite of seiten) {
      const u = stadtUebersicht(seite);
      const wiesen = seite.treffer.filter((t) => t.ort.category === 'dog_park');
      expect(u.hundewiesen.anzahl).toBe(wiesen.length);
      expect(u.hundewiesen.eingezaeunt).toBe(wiesen.filter((t) => t.ort.fenced === true).length);
    }
  });
});
