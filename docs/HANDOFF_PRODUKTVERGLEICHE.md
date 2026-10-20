# Handoff: Produktvergleiche (Branch `content/product-comparisons`)

Stand: 20.10.2026, **abgeschlossen und als PR eingereicht**; alle neun Seiten fertig. Auftrag: Schritt 3 der Überarbeitung nach dem
Indexverlust vom 11.10.2026 (Reihenfolge: Futter ✓ → **Produktvergleiche** → GOT → Städte →
Reisecheck). Maßstab: `docs/CONTENT_STANDARD.md` und ADR-021 in `docs/DECISIONS.md`.

## Ziel

Die neun Seiten unter `/de-de/produkte/<slug>/` hatten nur 3–4 Modelle, meist eine Marke, und
gaben keine Empfehlung („Keine Rangliste“). Neu ist je Seite Folgendes vorgesehen:

- mindestens 6 Modelle aus mindestens 3 Marken
- ein Bewertungsschema mit Gewichten (Summe 100), das auf der Seite steht
- eine Empfehlung je Einsatz
- eine Vergleichstabelle
- jeder Wert mit Quelle, wörtlichem Beleg und Prüfdatum

Wörter wie „Test“ oder „Testsieger“ kommen nicht vor; es heißt „nach unseren Kriterien“. Die Sitemap
wächst nicht: Es bleiben neun Seiten.

## Was fertig ist

| Datei | Inhalt |
| --- | --- |
| `src/features/products/comparison.ts` | Schema (zod), generische Bewertung (`bewerte`), `preisKriterium` (logarithmisch wie beim Futter), `empfehlungen` (bestes Modell je Einsatz, **nur mit belegtem Preis**) |
| `src/features/products/comparison-pages.ts` | lädt den Datensatz, `auswertung()`, `zeigeWert()`, Seitentyp `ProduktVergleichsSeite` |
| `src/features/products/comparison-copy.ts` | Seitenrahmen: Kriterien mit Regeltext, Einsätze, Merkmale, Tabelle, Hinweise, FAQ; `ALTE_SLUGS` |
| `src/components/pages/ProductComparison.astro` | Seite nach dem Muster `FoodComparison.astro`: Kurzantwort, Empfehlungskarten, Tabelle, Modellkarten mit Teilnoten, Amazon-Block (gekennzeichnet), Methode, FAQ |
| `src/pages/de-de/produkte/[slug].astro` | nutzt die neue Komponente, JSON-LD `ItemList` + `FAQPage` |
| `content-data/products/comparison-2026-10.json` | 62 Modelle in 8 Kategorien, erzeugt von `merge.py` |
| `scripts/audit/product-comparison/` | `pagetext.py` (Seite holen und Beleg suchen), `crosscheck.py` (prüft jeden Beleg gegen die Quelle), `merge.py` + `overrides.json` (redaktionelle Korrekturen, dokumentiert), `raw/` (Rohdaten je Kategorie), `BRIEF.md` (Erhebungsauftrag) |
| `public/_redirects` | 308-Weiterleitungen für die drei umbenannten Slugs |
| `src/components/pages/Home.astro` | Kachel-Text angepasst: Empfehlung statt „ohne Testsieger“ |

Gelöscht wurden `src/features/commerce/purchase-guides.ts`, `src/components/pages/PurchaseGuide.astro`
und `tests/purchase-guides.test.ts`.

### Die neun Seiten

Die vier Catit-Seiten sind jetzt markenneutral.

| Slug | Modelle / Marken | Stand |
| --- | --- | --- |
| `katzentrinkbrunnen-vergleich` | 8 / 6 | fertig |
| `katzen-futterautomat-vergleich` | 7 / 5 | fertig |
| `katzentoilette-vergleich` | 10 / 4 | fertig |
| `katzenspielzeug-kugelbahn-vergleich` (neu, ersetzt `catit-senses-2-vergleich`) | 8 / 5 | fertig |
| `katzentransportboxen-vergleich` | 8 / 5 | fertig |
| `hunderampe-auto-vergleich` | 7 / 3 | fertig |
| `rollleine-vergleich` (neu, ersetzt `flexi-rollleine-vergleich`) | 7 / 3 | fertig |
| `hundetransportbox-auto-vergleich` | 7 / 5 | fertig |
| `kauspielzeug-hund-vergleich` (neu, ersetzt `kong-hundespielzeug-vergleich`) | 7 / 5 | fertig |

Die Belegprüfung mit `crosscheck.py` fand je Kategorie 93–100 % der Werte wörtlich auf der Quellseite.
Die Abweichungen sind abgeleitete Werte, zum Beispiel „30 Tage“ → 4 Wochen oder 6 × 170 ml
= 1,02 l. Sie stehen in `notes` oder `overrides.json`.

## Abschluss (20.10.2026, zweite Sitzung)

- **Kauspielzeug Hund:** 7 Modelle aus 5 Marken nach `BRIEF.md`, alle 35 Werte mit `crosscheck.py` belegt. KONG in Größe L (13–30 kg), weil M nur bis 16 kg reicht. Schwach belegt: Planet Dog Double-Tuff (nur Fressnapf-Partnerseite, kaum Angaben), Nylabone (Werte nur von brekz.de), West Paw Hurley ohne Preis (ausverkauft). Einsätze: meiste Hunde, Garantie + spülmaschinenfest, kleines Budget.
- **Tests:** `tests/products/comparison.test.ts` (Engine, Datensatz, Seiten, Weiterleitungen, Filterkosten); `tests/content-policy.test.ts` scannt jetzt auch `src/features/products`.
- **Browser-Tests:** `tests/app/purchase-guides.spec.ts` ersetzt durch `tests/app/product-comparisons.spec.ts` (alle Seiten bei 320 und 1440 px, axe, Partnerlinks, JSON-LD, alte Slugs 404); `design-v2.spec.ts` auf `.pc-*` umgestellt.
- **Gefundene Layoutfehler behoben:** Auf 320 px lief die Hundebox-Seite horizontal über (Modellkarten ohne `min-inline-size: 0`), und der Kopfbereich war mobil fast 1.400 px hoch. Jetzt: Stimmungsbild erst ab 64rem, Sprungnavigation auf dem Telefon ausgeblendet, kleinere H1.
- **Geprüft:** `npm run verify` (1569 Tests), Produktionsbuild mit `check:seo` (118 indexierbar, keine Beanstandung) und `check:dist`, `design:audit` (4128 Messungen, 0 Auffälligkeiten), komplette App-Suite (83 Tests).

## Entscheidungen und Grenzen

- **Fehlende Angabe = 0 Punkte** und wird als „keine Angabe“ angezeigt. Das steht auf jeder Seite.
- **Spannen** werden konservativ gelesen, also mit dem kürzeren Filterintervall
  (`overrides.json`: Catit PIXI 3 Wochen, PetSafe 2 Wochen).
- **Ein Modell darf mehrere Einsätze gewinnen.** Eine schlechtere Wahl nur der Abwechslung wegen
  wäre keine ehrliche Empfehlung.
- **Quellen:** Viele Werte stammen aus Herstellertexten auf zooplus.de, weil die
  Herstellerseiten JavaScript-only sind (Kerbl, Savic, PETKIT, PETLIBRO). Das ist an jedem Modell
  sichtbar.
- **Unsichere Artikelnummer:** Für die TRIXIE-Teleskop-Rampe ist die Art.-Nr. 3940 nicht belegt.
  Die Variante wird deshalb nur über ihre Maße benannt.
- **Hundebox-Maße** werden wörtlich angezeigt, weil die Hersteller unterschiedliche Reihenfolgen
  verwenden.
- **Produktfotos:** Es gibt noch keine echten Produktbilder. Herstellerbilder bräuchten eine
  Freigabe; die Seiten nutzen die Markenbilder im Hero. Das ist ein offener Punkt aus
  `CONTENT_STANDARD.md`.
- **Preise:** Stand ist der 20.10.2026. Sie veralten und sollten zusammen mit
  `crosscheck.py` monatlich erneuert werden.
