import { describe, expect, it } from 'vitest';

import { verzeichnisKontaktLink } from '../../src/features/map/contact.ts';

describe('Kontakt für Verzeichniseinträge', () => {
  it('übernimmt nur Eintrags-ID und Seitenpfad in die Anfrage', () => {
    const href = verzeichnisKontaktLink(
      'info@deinhaustierportal.de',
      'osm-node-123',
      '/de-de/tierarzt-karte/berlin/',
    );
    expect(href).toContain('mailto:info@deinhaustierportal.de');
    expect(decodeURIComponent(href ?? '')).toContain('Eintrags-ID: osm-node-123');
    expect(decodeURIComponent(href ?? '')).toContain('/de-de/tierarzt-karte/berlin/');
    expect(href).not.toContain('https://');
  });

  it('erzeugt ohne Kontaktadresse keinen Scheinweg', () => {
    expect(verzeichnisKontaktLink(null, 'osm-node-123', '/de-de/')).toBeNull();
  });
});
