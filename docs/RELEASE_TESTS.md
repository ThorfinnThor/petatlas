# Abnahmeläufe

Die aktuelle V2-Abnahme mit Revision, Befehlen, Browserläufen und verbleibenden Voraussetzungen steht in `ACCEPTANCE.md`. Die früheren V1-Ergebnisse sind in der Git-Historie erhalten und gelten nicht als aktueller Nachweis.

Die Prüfkette umfasst:

- `npm run verify`: Lint, TypeScript, Formatierung, Unit-/Vertragstests, Secrets, Workflow-Härtung, Lizenzen, Inhaltsdaten und Handoff.
- `npm run test:e2e`: Basisrouten, Navigation und abgeschaltete Funktionen.
- `npm run test:accessibility`: axe, Tastaturbedienung und Browsermatrix.
- `npm run test:e2e:features`: Fachwerkzeuge, Fehlerfälle, Datenschutz, lokale Speicherung und Datenflüsse.
- `npm run test:app`: echter Preview-Build, sieben Bildschirmbreiten, produktive Datenquellen, mobile Karte und Profilübernahme.
- `npm run test:performance`: tatsächliche initiale Bytes, JavaScript und DOM-Größe auf Desktop und Mobilgeräten. Lokale LCP-Werte sind keine Aussage über reale Endgeräte oder Netze.
- `npm run build:app`: geprüfter, nicht indexierbarer Auslieferungsstand mit Daten-Hashes.

Eine grüne Prüfkette ersetzt weder fachliche Freigaben noch einen erfolgreichen Smoke-Test nach der tatsächlichen Veröffentlichung.
