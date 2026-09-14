import { describe, expect, it } from 'vitest';

import { PlaceSchema, type Place } from '../../src/domain/schemas/places.ts';
import {
  DirectoryControlsSchema,
  applyDirectoryControls,
} from '../../src/features/map/directory-controls.ts';
import { baueZellen } from '../../scripts/publish/places.ts';

function place(placeId: string, name = 'Alte Praxis'): Place {
  return PlaceSchema.parse({
    placeId,
    name,
    category: 'veterinary',
    coordinates: { latitude: 52.52, longitude: 13.405 },
    coordinateSource: 'node',
    municipality: 'Berlin',
    postalCode: '10115',
    phone: '+49 30 123',
    website: null,
    openingHours: null,
    emergency: null,
    wheelchair: null,
    fenced: null,
    dogAllowed: null,
  });
}

describe('dauerhafte Verzeichniskontrollen', () => {
  it('entfernt einen gesperrten Eintrag vor der öffentlichen JSON-Ausgabe', () => {
    const controls = DirectoryControlsSchema.parse({
      entries: [
        {
          placeId: 'osm:node:1',
          action: 'suppress',
          decidedAt: '2026-09-14',
          reviewedBy: 'Testprüfung',
          evidence: 'synthetischer Testfall',
        },
      ],
    });
    const visible = applyDirectoryControls([place('osm:node:1'), place('osm:node:2')], controls);

    expect(visible.map((entry) => entry.placeId)).toEqual(['osm:node:2']);
    expect(JSON.stringify(baueZellen(visible))).not.toContain('osm:node:1');
  });

  it('wendet eine Korrektur nach jedem erneuten Import wieder an', () => {
    const controls = DirectoryControlsSchema.parse({
      entries: [
        {
          placeId: 'osm:node:1',
          action: 'correct',
          decidedAt: '2026-09-14',
          reviewedBy: 'Testprüfung',
          evidence: 'synthetischer Testfall',
          fields: { name: 'Berichtigte Praxis', phone: null },
        },
      ],
    });

    for (const importedName of ['Alte Praxis', 'Vom nächsten Import überschrieben']) {
      const [corrected] = applyDirectoryControls([place('osm:node:1', importedName)], controls);
      expect(corrected?.name).toBe('Berichtigte Praxis');
      expect(corrected?.phone).toBeNull();
    }
  });

  it('verlangt für eine Regel Entscheidung, verantwortliche Person und Nachweis', () => {
    expect(
      DirectoryControlsSchema.safeParse({
        entries: [{ placeId: 'osm:node:1', action: 'suppress' }],
      }).success,
    ).toBe(false);
  });
});
