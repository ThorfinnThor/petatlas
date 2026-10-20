# Handoff: Produktvergleiche (Branch `content/product-comparisons`)

Stand: 20.10.2026, Zwischenstand, noch **kein PR**. Auftrag: Schritt 3 der Überarbeitung nach dem
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
| `kauspielzeug-hund-vergleich` (neu, ersetzt `kong-hundespielzeug-vergleich`) | — | **Daten fehlen noch** |

Die Belegprüfung mit `crosscheck.py` fand je Kategorie 93–100 % der Werte wörtlich auf der Quellseite.
Die Abweichungen sind abgeleitete Werte, zum Beispiel „30 Tage“ → 4 Wochen oder 6 × 170 ml
= 1,02 l. Sie stehen in `notes` oder `overrides.json`.

## Offen (in dieser Reihenfolge)

1. **Kauspielzeug Hund:** Daten nach `BRIEF.md` erheben. Vorgesehene Modelle sind KONG Classic und
   Extreme, West Paw Toppl und Tux, TRIXIE, Nylabone und Planet Dog. Die Rohdaten kommen nach
   `raw/kauspielzeug-hund.json`, danach `python3 scripts/audit/product-comparison/merge.py` ausführen.
   Anschließend die Seite `kauspielzeug` in `comparison-copy.ts` anlegen (Kriterien zum Beispiel:
   Belastbarkeit laut Hersteller, befüllbar, spülmaschinenfest, Garantie, Preis) und in `SEITEN`
   aufnehmen. **Ohne diese Seite liefert der Redirect für `kong-hundespielzeug-vergleich` ins Leere.**
2. **Tests** in `tests/products/comparison.test.ts`:
   - Engine: Gewichte = 100, Preisskala, keine Empfehlung ohne Preis.
   - Datensatz: ≥ 6 Modelle und ≥ 3 Marken je Seite; jeder Nicht-null-Wert hat `verbatim` und eine
     https-`sourceUrl`; keine Amazon-Quellen.
   - Seiten: Zahl im `metaTitel` = Zahl der Modelle; jeder Eintrag in `ALTE_SLUGS` hat eine
     308-Zeile in `public/_redirects`.
   - `tests/content-policy.test.ts` soll zusätzlich `src/features/products` scannen.
3. **Browser-Tests anpassen:** `tests/app/purchase-guides.spec.ts` importiert noch
   `PURCHASE_GUIDES`. `tests/app/design-v2.spec.ts` (ab etwa Zeile 265) erwartet `.guide-hero`,
   `.quick-choice__card` (3) und `.product-detail`. Beide auf `.pc-hero`, `.pc-pick`, `.pc-product`
   und `.pc-commerce` umstellen.
4. **Lokal prüfen:** `BUILD_MODE=production PUBLIC_SITE_URL=https://deinhaustierportal.de
   APP_PROFILE=real npm run build:site`, dann vitest, eslint, `prettier --check`, typecheck,
   `check:seo`, `check:dist` und `npm run design:audit`. Dabei gilt: kein Fließtext breiter als
   900 px, mobil nicht schmaler als 180 px, keine Schrift unter 14 px. Tabellenzellen bleiben unter
   70 Zeichen, sonst meldet der Audit sie.
5. **PR** mit grüner CI; die Nutzerin oder der Nutzer merged selbst. Commits laufen als
   `ThorfinnThor <pixsatmaps@gmail.com>`. Auf der SSD kein `git stash` verwenden.

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
