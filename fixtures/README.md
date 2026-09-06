# Fixtures

**SYNTHETISCH.** Alle Dateien in diesem Verzeichnis sind erfunden. Sie sind keine erhobenen Daten, keine echten Preise, keine realen Orte und kein Nachweis für Abdeckung oder Qualität.

## Regeln

- Jede Datei enthält den Marker `"synthetic": true` beziehungsweise das Wort `SYNTHETISCH`. `scripts/checks/secrets.ts` meldet jede Datei ohne Marker.
- Fixtures werden ausschließlich in `BUILD_MODE=development` geladen, und in `preview` nur bei ausdrücklichem `USE_FIXTURES=true`. In `production` führt `USE_FIXTURES` zum Abbruch des Builds.
- Ein Build mit Fixtures zeigt einen sichtbaren Testdatenhinweis und ist `noindex`.
- Fixtures brauchen kein Netz. Lokale Tests dürfen weder Internet noch echte Zugangsdaten voraussetzen.
- Fixtures für deaktivierte Märkte (US, NL) dienen der Architekturprüfung. Sie belegen keinen gestarteten Markt und dürfen keine indexierbaren Seiten erzeugen.
