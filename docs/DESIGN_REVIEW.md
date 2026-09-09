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

1. ~~**ToolShell mit zweispaltigem Desktoplayout** (Abschnitt 22, 24.2)~~ — erledigt in M21-03.
2. ~~**Wizard-Stepper für den Reisecheck** (Abschnitt 28.2)~~ — erledigt in M21-04.
3. **Komponentenbibliothek** (Abschnitt 48) — weitgehend erledigt in M21-01 und M21-02: `Button`, `Card`, `Badge`, `Alert`, `PageHeader`, `EmptyState`, `Breadcrumbs`, dazu `ToolShell`, `ToolStepper`, `RadioCard` und `ProductCard`. Offen bleiben `DataSourceDisclosure` und `ResultSummary`; für beide gibt es heute je eine gewachsene Entsprechung (`DataStatus`, die Ergebnisbox des Rechners), die zusammengeführt gehören.
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

---

# Zweiter Durchgang: Bildschirmmappe (M21-06, 2026-09-09)

Abschnitt 57 verlangt Aufnahmen je Hauptseite in zwei Formaten und einen Review, der Viewport, Commit, sichtbare Probleme, behobene Probleme und Restpunkte nennt. Dieser Abschnitt ist dieser Review.

## Wie die Mappe entsteht

```
npm run design:screenshots
```

Das Skript baut nichts: es startet die Vorschau über den **vorhandenen** Build, damit die Aufnahmen zeigen, was ausgeliefert würde, und nicht, was der Entwicklungsserver daraus macht. Bewegung ist abgeschaltet (`prefers-reduced-motion`), damit zwei Läufe vergleichbar bleiben.

| | |
|---|---|
| Ausgabe | `reports/screenshots/` — **nicht versioniert** (siehe `.gitignore`); die Bilder sind ein Prüfmittel, kein Inhalt |
| Viewports | mobile 390x844, desktop 1440x900, jeweils ganze Seite |
| Commit dieses Durchgangs | `69b2433` |
| Seiten | Start, Tierarztkosten, Gebührenkatalog, Karte, Stadtseite Hamburg, Reisecheck, Angebote, Pflege, Quellen, Datenstand |
| Aufnahmen | 20 |

Die Mappe selbst listet nur, was aufgenommen wurde (`reports/screenshots/mappe.md`). Eine Aufnahme gilt nicht als geprüft, weil sie existiert — die Befunde stehen hier.

## Sichtbare Probleme, gefunden beim Ansehen

1. **Der Rechner lief in Lesebreite.** Die neue zweispaltige Tool-Ansicht wurde dadurch auf zweimal rund 300 px gequetscht: die Auswahlkarten standen untereinander statt nebeneinander, die Hilfetexte brachen nach drei Wörtern um, und rechts stand ein fast leeres Ergebnispanel. Zweispaltig war es formal, brauchbar nicht.
2. **Der Druckknopf und sein Hinweis lagen auf einer Zeile.** Auf dem Desktop schob sich der Hinweistext neben den Knopf und lief unter ihm weiter — es sah aus wie ein Textfehler.
3. **Rohe Bezeichner in der Oberfläche.** Auf den Pflege- und Spielzeugseiten stand „Gefiltert wird nach: coatLength, toolWidthMillimeters, material.“ Das sind Feldnamen aus dem Datenmodell, keine Sprache.
4. **Die Kategorienliste ließ die halbe Seite leer.** Auf `/de-de/pflege/` stand eine einspaltige Liste in einer breiten Seite.
5. **Der Druck-Stylesheet griff ins Leere.** `print.css` entfärbte Hinweisboxen über die Klasse `.notiz`, die es seit der Komponentenbibliothek nicht mehr gibt. Beim Drucken wären die Farbflächen mitgekommen.

## Behoben

| Befund | Behebung |
|---|---|
| 1 | Rechner und Reisecheck stehen jetzt im Seitencontainer statt in Lesebreite (`WEITE_SEITEN` in `src/pages/[...pfad].astro`). Die Fließtexte bleiben bei 68ch — das regelt die Typografie, nicht der Container. |
| 2 | Der Druckknopf steht in einem eigenen Block, der Hinweis darunter. |
| 3 | `merkmalLabel()` in `src/features/care/attributes.ts` übersetzt die Bezeichner. Ein unbekannter Bezeichner bleibt sichtbar, wie er heißt — das fällt auf, und genau das soll es. |
| 4 | `.kategorien` ist ab 640 px ein Raster. |
| 5 | Die Regel greift jetzt `.hinweisbox`. Nebenbefund derselben Umbenennung: ein Playwright-Test blendete vor einer Wortprüfung `.notiz` aus — also seit der Umbenennung nichts mehr. Der Test lief grün, ohne noch zu prüfen, was er prüfen sollte; der Selektor ist korrigiert. |

## Bekannte Restpunkte

1. **Die Hauptnavigation führt neun Einträge.** Abschnitt 9.1 nennt sechs bis sieben. Welche zusammengefasst oder in den Fuß wandern, ist eine inhaltliche Entscheidung über den Zuschnitt der Produkte, keine Designfrage — sie gehört zusammen mit der Routenfrage aus dem ersten Durchgang entschieden.
2. **Der Druckknopf steht auch ohne ausgewählte Position da.** Ein leerer Ausdruck ist sinnlos, aber ein Knopf, der ohne Erklärung verschwindet, ist es auch. Vorschlag: sichtbar lassen und beim Klick ohne Auswahl einen Satz statt eines Ausdrucks.
3. **Kein Produktbild.** Abschnitt 20.1 sieht 120x120 px vor. Es gibt keine Bildrechte; die Karte hält die Fläche deshalb auch nicht frei — ein leerer Rahmen wäre ein Versprechen.
4. **Die Punkte des ersten Durchgangs** zu Routen und Ansprache stehen weiterhin offen.

