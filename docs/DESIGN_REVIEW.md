# Designabnahme

Durchgeführt am **2026-09-08** gegen `docs/DESIGN_SPECIFICATIONS.md` (Fassung 1.0). Diese Datei sagt, **was umgesetzt ist, was bewusst abweicht und was noch aussteht** — Abschnitt 0.3 des Vertrags verlangt, Abweichungen zu dokumentieren.

## Umgesetzt

| Abschnitt | Umsetzung |
|---|---|
| 3.2 Tokens | `src/styles/tokens.css` mit den Werten des Vertrags. Alle 31 Komponenten wurden von den alten deutschen Tokennamen auf `--color-*`, `--space-*`, `--radius-*` umgestellt; es gibt keine Altnamen mehr. |
| 4 Typografie | `src/styles/typography.css`: Systemschrift, H1 3rem/2.25rem mit `-0.035em`, H2–H4, Lead, Small, Micro, tabellarische Ziffern für Geldwerte, Fließtext auf 68ch begrenzt. |
| 5 Spacing | Rhythmus über die `--space-*`-Skala; Hauptsektionen 56–64 px mobil, 80–96 px Desktop. |
| 6 Container | `.page-container` (74rem) und `.reading-container` (46rem). Startseite, Karte und die Produktübersichten sind breit, Fließtextseiten schmal. |
| 7 Karten | `.card` ohne Schatten, Hover nur bei Zeigegeräten und nur bei `.card--klickbar`. |
| 9 Navigation | Kopfbereich weiß mit unterer Kante, 64 px mobil / 72 px ab Tablet, sticky. Aktive Seite über Textfarbe **und** 2-px-Kante. Auf schmalen Geräten Menüknopf statt umbrechender Liste. |
| 10 Fuß | Vier Gruppen (Marke, Werkzeuge, Produkte, Transparenz) und eine Unterkante mit Jahr und Hinweis auf abweichende Datenstände. |
| 11 Buttons | Höhe ≥ 44 px, Radius 12 px, Varianten primär, sekundär, soft, ghost, danger, groß. Vorgabe ist sekundär — eine primäre Aktion je Bereich. |
| 12 Links | Primärfarbe, Unterstreichung im Fließtext, sichtbarer Fokus. |
| 13 Formulare | Feldhöhe 48 px, Schriftgröße 16 px, Radius 12 px, Fokus mit 3-px-Indikator, Kontrollkästchen 20 px, Fieldsets als Flächen. |
| 15 Badges | `.badge` mit Varianten für Info, Erfolg und Warnung. |
| 23 Startseite | Hero mit Eyebrow, H1 (18ch), Lead, zwei Aktionen und Belegzeile; Werkzeugraster; „So arbeiten unsere Daten“ in drei Schritten; Produkteinstieg **nach** den Werkzeugen; Suche zuletzt. |
| 39 Zugänglichkeit | Sprungmarke als erstes fokussierbares Element, sichtbarer Fokus, keine positiven `tabindex`, Umbruch bis 320 px. 107 Prüfungen grün, davon 39 axe-Läufe über 13 Seiten in drei Profilen. |
| 40/39.9 Motion | Übergänge 120 ms, 1 px Karten-Lift, vollständige `prefers-reduced-motion`-Abschaltung. |
| 47 CSS-Architektur | `tokens.css`, `reset.css`, `typography.css`, `base.css`, `print.css`. Kein Tailwind, kein CSS-in-JS, keine IDs für Styling. |
| 53 Dark Mode | **Entfernt.** Der Vertrag nimmt ihn ausdrücklich aus dem MVP; der vorher vorhandene automatische Dark Mode ist raus, die Tokenstruktur bleibt erweiterbar. |

## Bewusste Abweichungen

| Abweichung | Grund |
|---|---|
| **Routen bleiben wie sie sind** (`/de-de/tierarzt-karte/` statt `/karte/`, `/de-de/spielzeug/` statt `/spielzeug/finder/`, `/de-de/futter/<slug>/` statt `/produkte/<slug>/`) | Die Slugs stehen in der Route Registry, in Tests, in Redirects und in der Sitemap. Eine Umbenennung ist eine inhaltliche Entscheidung mit SEO-Folgen, keine Designfrage. Vorschlag: eigene Aufgabe mit `legacySlugs`-Eintrag, damit alte Adressen weiterleiten. |
| **Ansprache bleibt „Sie“** auf den bestehenden Fachseiten | Abschnitt 41.1 verlangt „du“. Die Umstellung berührt Fachtexte, die teils wörtlich mit Prüfhinweisen abgestimmt sind (Rechner, Reisecheck). Die neuen Texte auf der Startseite verwenden bereits „du“. Umstellung des Rests als eigener Durchgang. |
| **Kein Icon-Set** | Abschnitt 8.1 empfiehlt Outline-Icons. Icons sind derzeit nicht nötig, und ein Icon-Paket wäre eine neue Abhängigkeit samt Lizenzfrage. Der Output-Audit lässt Bilddateien nur mit benannter Herkunft zu. |

## Noch offen

Diese Punkte des Vertrags sind **nicht** umgesetzt und stehen als nächste Schritte:

1. **ToolShell mit zweispaltigem Desktoplayout** (Abschnitt 22, 24.2): Eingaben links, Ergebnis rechts. Heute läuft der Rechner einspaltig in Lesebreite.
2. **Wizard-Stepper für den Reisecheck** (Abschnitt 28.2) mit vier benannten Schritten.
3. **Komponentenbibliothek** (Abschnitt 48): `Breadcrumbs`, `PageHeader`, `Button`, `Card`, `Badge`, `Alert`, `DataSourceDisclosure`, `AffiliateDisclosure`, `ResultSummary`, `EmptyState` als eigene Komponenten statt globaler Klassen.
4. **Breadcrumbs** (Abschnitt 9.3) auf Unterseiten.
5. **Radio Cards** (Abschnitt 13.6) für Tierart und Spielart.
6. **Produktkarte nach Abschnitt 20** mit Bildfläche, Merkmalszeile und Matching-Begründung.
7. **Screenshot-Mappe** nach Abschnitt 57 als versionierte Dateien.

## Geprüfte Ansichten

| Seite | 390 × 844 | 1280 × 800 |
|---|---|---|
| Startseite | geprüft | geprüft |
| Tierarztkosten | geprüft | geprüft |
| Karte | geprüft | geprüft |
| Reisecheck | geprüft | geprüft |

**Gefundene und behobene Probleme in diesem Durchgang**

- Die Hauptnavigation brach auf dem Telefon über vier Zeilen um. Jetzt Menüknopf mit `aria-expanded`; ohne JavaScript bleibt die vollständige Liste sichtbar, damit kein toter Knopf entsteht.
- Eingabefelder liefen auf breiten Seiten über die volle Rasterbreite. Jetzt auf 32rem begrenzt.
- Der Absatz unter der H1 war typografisch nicht vom Fließtext unterschieden. `h1 + p` ist jetzt automatisch der Lead.
- Der Testdatenhinweis stand in Lesebreite, während die Seite breit war. Er folgt jetzt dem Container der Seite.

**Bekannte Restpunkte:** die sieben offenen Punkte oben.

## Nachweise

| Lauf | Ergebnis |
|---|---|
| `npm run verify` | 1302 Tests, exit 0 |
| `npx playwright test` | 228 bestanden |
| `--config playwright.features.config.ts` | 294 bestanden |
| `npm run test:accessibility` | 107 bestanden, 7 übersprungen |
| `npm run check:dist` | 444 Dateien, keine Beanstandung |
| `npm run check:seo` | 60 Seiten, keine Beanstandung |
| `npm run check:budgets` | alle Budgets eingehalten |
