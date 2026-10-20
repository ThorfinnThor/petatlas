# Inhaltsbewertung der indexierten Seiten — 20.10.2026

Grundlage: die 114 indexierbaren Seiten des Produktionsbuilds, gemessen am
Hauptinhalt (`<main>`), bewertet gegen `docs/CONTENT_STANDARD.md`.
„Vorbehalte“ zählt Formulierungen wie „keine Rangliste“, „nicht ableiten“,
„beantwortet nicht“; „Empfehlungen“ zählt Formulierungen mit klarer Aussage.

| Seitentyp | Seiten | Wörter (Ø) | Tabellen | Bilder | Vorbehalte (Ø) | Empfehlungen (Ø) | Urteil |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| GOT-Einzelseite | 47 | 276 | 2 | 0 | 0 | 0 | **ungenügend**: amtlicher Betrag × 1/2/3, keine Gesamtrechnung, kein Fallbeispiel |
| GOT-Gruppe | 13 | 289 | 0 | 0 | 0 | 0 | **ungenügend**: Linkliste |
| Stadtseite | 15 | 2.339 | 0 | 0 | 0 | 0 | **mittel**: echte Ortsdaten, aber Liste ohne Einordnung |
| Produktvergleich | 9 | 820 | 1 | 1 | 1,7 | 0,2 | **ungenügend**: 3–4 Modelle, meist 1 Marke (Catit 4×, KONG, flexi, TRIXIE); keine Empfehlung |
| Futter (Hub) | 1 | 928 | 0 | 0 | 4 | 0 | **ungenügend**: 7 Packungen aus 3 Produktlinien, kein echter Vergleich |
| Ergänzungsfuttermittel (Hub) | 1 | 824 | 0 | — | 2 | 0 | mittel |
| Pflege | 5 | 833 | 0 | 1 | 0,4 | 0 | **gut** (Auswahlhilfe, Quellen); Produktbeispiele fehlen |
| Ratgeber | 5 | 984 | 0 | 0,8 | 0,4 | 0,2 | **gut**; Muster für den Rest |
| Blog | 3 | 1.084 | 0,7 | 0,7 | 1 | 0 | gut |
| Reisecheck | 4 | 896 | 0 | 0 | 0 | 0 | mittel: Länderseiten gleich gebaut, kein Fristenplan |
| Hubs, Tools, Vertrauensseiten | 11 | — | — | — | — | — | Startseite gut; Spielzeug (433 W.) und Tierversicherung (378 W.) dünn |

## Reihenfolge der Überarbeitung

1. **Futter** (erledigt, PR #91): 4 Vergleiche mit je ~12 Produkten aus vielen
   Marken, Nährwerte auf Trockenmasse, Preis pro Tag, Empfehlungen je Bedarf.
2. **Produktvergleiche** (erledigt 20.10.2026, neun Seiten, `docs/HANDOFF_PRODUKTVERGLEICHE.md`): je ≥ 6 Modelle aus ≥ 3 Marken, Empfehlung je Einsatz.
   Die vier Catit-Seiten zu einer markenübergreifenden Seite je Produktart
   zusammenführen (Trinkbrunnen, Futterautomat, Katzentoilette, Spielzeug).
3. **GOT** (acht Seiten als Entwurf, PR #92; wartet auf fachliche Prüfung): pro häufiger Behandlung (Impfung, Kastration Kater/Kätzin/Rüde/
   Hündin, Zahnsteinentfernung, Röntgen, Blutbild, Euthanasie) eine
   Kostenseite mit realistischer Gesamtrechnung. Die Einzelpositionen bleiben
   Nachschlagewerk und gehen langfristig aus dem Index.
4. **Stadtseiten**: Notdienst, Freilaufflächen, Einordnung je Stadtteil.
5. **Reisecheck**: Fristenplan je Land.

Freigabe in den Index nur nach Standard und in kleinen Gruppen.
