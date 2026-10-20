# Stadtseiten mit eigener Auswertung — 20.10.2026

Schritt 4 der Inhaltsoffensive (`docs/CONTENT_STANDARD.md`, Seitentyp
Stadtseite: „Wo finde ich hier was?“; Reihenfolge in
`content-scorecard-2026-10-20.md`). Bisher war die Stadtseite eine Liste der
OpenStreetMap-Orte im Umkreis von 10 km – dieselbe Information wie eine
Kartensuche. Neu sind drei Abschnitte, die eine Kartensuche nicht liefert.

## 1. Tierarzt abends und am Wochenende

`src/features/map/opening-hours.ts` liest die einfache, häufige Form der
OSM-Öffnungszeiten (`Mo-Fr 09:00-12:00, 15:00-19:00; Sa 10:00-12:00`).
Alles Komplexere (Monatsangaben, `||`, Wochennummern, verdrehte Spannen)
gilt als nicht lesbar und wird nicht geraten. Bundesweit: 2.644 Praxen mit
Öffnungszeiten, davon 2.354 sicher lesbar (89 %); der Rest ist fast nur
„nach Vereinbarung“.

`city-summary.ts` zählt je Stadt, wer samstags, sonntags, werktags bis
mindestens 19 Uhr oder laut Angabe rund um die Uhr geöffnet hat, und zeigt die
acht nächstgelegenen je Liste mit Zeiten und Telefon. Die Kurzantwort im Kopf
der Seite nennt die Zahlen.

## 2. Hundewiesen und Freilaufflächen

Die erfassten Hundewiesen im Umkreis, nach Entfernung, mit Postleitzahl und
„eingezäunt“ nur bei ausdrücklicher Angabe. Hinweis auf der Seite: Darunter
können Übungsplätze von Hundevereinen sein. Die kommunalen Datensätze für
Berlin und Hamburg bleiben unverändert darunter.

## 3. Tierärztlicher Notdienst

OpenStreetMap kennt den Notdienst praktisch nicht (bundesweit neun Praxen mit
`emergency=yes`). Für die 15 indexierbaren Städte wurde er deshalb eigens
erhoben: `content-data/city-emergency/notdienst-2026-10.json`. Zugelassen
waren nur Tierärztekammern, organisierte Notdienstringe und die eigene Website
einer Klinik, die ausdrücklich rund um die Uhr Notdienst angibt; keine
Verzeichnisse. Jeder Eintrag hat Quelle und wörtlichen Beleg (≤ 200 Zeichen),
der auf der Seite steht.

| Stadt | Dienste | Namen |
| --- | ---: | --- |
| berlin | 3 | Notdienst-Übersicht der Tierärztekammer Berlin; Tierarztpraxis Bärenwiese; Tierärzte im Notdienst – Berlin & Brandenburg (mobil) |
| bochum | 0 | – |
| dresden | 1 | Tierärztlicher Notfalldienst Sachsen (Kleintiere) – zentrale Notrufnummer |
| duesseldorf | 1 | Tierklinik Düsseldorf (AniCura), Münsterstr. 359 |
| essen | 2 | Tierärztlicher Notfalldienst Kreisstelle Essen – zentrale Rufnummer; Tierärztliche Klinik für Kleintiere Dr. med. vet. Jan Apelt |
| frankfurt-am-main | 1 | Tierklinik Kalbach – Fachklinik für Kleintiere |
| gelsenkirchen | 1 | Tierärztliche Klinik für Kleintiere Dr. med. vet. Jan Apelt |
| hamburg | 1 | Aktueller Notdienstplan der Tierärztekammer Hamburg |
| hannover | 2 | Tierärztlicher Notdienst Hannover (TNH); Klinik für Kleintiere der Stiftung Tierärztliche Hochschule Hannover (TiHo) |
| koeln | 2 | Kölner Tierärztenotdienst; VetZentrum Köln – Tierärztliche Klinik für Kleintiere |
| leipzig | 1 | Tierärztlicher Notfalldienst Sachsen (Kleintiere) – zentrale Notrufnummer |
| mannheim | 0 | – |
| muelheim-an-der-ruhr | 1 | Tierärztliche Klinik für Kleintiere am Kaiserberg |
| muenchen | 2 | LMU Klinik für Kleintiere (Kleintierklinik der LMU München); AniCura Tierklinik Haar |
| neuss | 2 | Tierärztlicher Notfalldienst Mönchengladbach/Rhein-Kreis Neuss – zentrale Rufnummer; Tierklinik Düsseldorf (AniCura), Münsterstr. 359 |

Bewusst nicht übernommen:

- **Mannheim:** Notdienstring Mannheim (0621-13571) war nur auf der undatierten
  Seite einer fremden Praxis belegt, die die Liste selbst „als Anhaltspunkt“
  nennt. Bei einer Notdienstnummer zu schwach.
- **Bochum:** Weder Kammer noch eine Klinik mit eigener 24-h-Angabe gefunden.
  Die Seite sagt das und verweist auf die Kammer Westfalen-Lippe.
- Leipziger Uniklinik (24/7 nur aus Stellenanzeigen belegt), Klinik
  Kellerwessel Köln (keine eigene Website gefunden).

Mit Vorsicht zu lesen (steht im `note`-Feld des Datensatzes):

- NRW-Nummern für Essen und Neuss stehen nur auf der Liste der Kammer
  Nordrhein, die selbst keine Gewähr für Aktualität übernimmt.
- Gelsenkirchen und Mülheim: Die genannte Klinik liegt in der Nachbarstadt
  (Essen-Altenessen bzw. Duisburg); der Ort steht am Eintrag.
- Hannover: Der Notdienst der Tierärzte gilt nur am Wochenende und an
  Feiertagen; nachts unter der Woche bleibt die TiHo-Klinik.
- Köln: Der Notdienstring deckt 18–22 Uhr (Wochenende 8–22 Uhr) ab, „ab
  23 Uhr“ verweist er auf Kliniken.

Städte ohne Erhebung (nicht indexiert) behalten den bisherigen Hinweis
„Kein Notdienstverzeichnis“. Seitentitel und Beschreibung nennen den
Notdienst nur, wenn ein belegter Dienst da ist.

**Empfehlung vor dem nächsten Indexschritt:** Die Telefonnummern einmal von
Hand anrufen oder mit der Quelle abgleichen. Die Erhebung ist eine
Recherche mit wörtlichem Beleg, keine Bestätigung der Dienste selbst.

## Prüfungen

vitest (neu: `tests/places/opening-hours.test.ts`, `city-summary.test.ts`,
`emergency.test.ts`; `npm run verify` 1579 Tests), Produktionsbuild mit
`check:seo` (118 indexierbar, unverändert) und `check:dist`,
`design:audit` (0 Auffälligkeiten; gefunden und behoben: leere Rasterspalten
bei nur einem Hinweis oder Dienst), Feature-Suite 322 Browsertests inklusive
neuer Fälle in `tests/e2e-features/city.spec.ts` (Köln mit axe, Bochum ohne
Dienst, nicht erhobene Stadt), App-Suite 82 Tests.
