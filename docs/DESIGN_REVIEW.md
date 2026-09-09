# Designabnahme V2

Stand: 2026-09-09. Grundlage ist `DESIGN_SPECIFICATIONS_V2.md`. Die frühere V1-Abnahme bleibt in der Git-Historie erhalten.

## Umsetzung

- Petrol, Orange und warmes Weiß; lokale Manrope- und Kalam-Schriften mit Lizenznachweisen.
- Responsive Hero-Bilder mit AVIF/WebP, festen Abmessungen und eigenen Bildnachweisen in `design-assets/README.md`.
- Startseite mit sechs Werkzeugen, priorisierten Funktionskarten, Ortsuche, drei Ratgebern, echten Produktdaten, Reisebanner und Quellenkennzahlen.
- Gruppierte Navigation, mobiles Menü, sichtbare Fokuszustände, dunkler Fußbereich.
- Gebührenrechner mit Eingabe und haftendem Ergebnis auf Desktop, Einspaltigkeit auf Mobilgeräten, Entfernen von Positionen und Druck erst bei gültigem Ergebnis.
- Karte mit Filter- und Trefferleiste auf Desktop sowie umschaltbarer Listen-/Kartenansicht auf Mobilgeräten. Kartenkacheln laden weiterhin erst auf ausdrückliche Aktion.
- Reiseformular vor den ausführlichen Geltungsbereichshinweisen, nachvollziehbare Einzelergebnisse ohne erfundene fachliche Freigabe.
- Gespeicherte Tierdaten lassen sich auf ausdrückliche Aktion in Rechner, Reisecheck und Spielzeugfinder übernehmen. Gesundheitsantworten werden nicht aus dem Profil abgeleitet.

## Bewusste Abweichungen

- Bestehende, getestete Routen bleiben erhalten.
- Produktfotos, Händlerpreise, Rabatte, Bewertungen und Affiliate-Links erscheinen erst mit belastbaren Nutzungsrechten und tatsächlichen Daten. Die Produktkarten verwenden bis dahin Sachinformationen und Kategoriezeichen.
- Ratgeber sind redaktionelle Orientierung mit Quellen; sie tragen keine erfundene Expertenfreigabe.
- Die Startseite verwendet „du“, bestehende Fachseiten weiterhin „Sie“.
- Standortdaten haben bekannte Abdeckungslücken; Kartenpunkte behaupten keine Vollständigkeit oder Notdienstverfügbarkeit.

## Prüfung

`npm run test:app` baut die echte Vorschau und prüft sieben Breiten: 360, 390, 430, 768, 1024, 1280 und 1440 px. Alle Hauptwerkzeuge werden auf Überlauf und Laufzeitfehler geprüft; der Rechner enthält dabei eine echte Gebührenposition. Die Startseite wird je Breite aufgenommen. Zusätzliche Tests prüfen die Hamburger Ortsuche, den Futtervergleich, Profilübernahme und mobile Kartenumschaltung einschließlich axe.

Die erste V2-Bildmappe wurde bei 390 und 1440 px visuell geprüft. Dabei wurden Hero-Proportionen, mobile Mindestschriftgrößen und die Lesbarkeit der Kartenumschaltung korrigiert. Der abschließende Prüfstand wird in `ACCEPTANCE.md` dokumentiert.
