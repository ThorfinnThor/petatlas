# DESIGN SPECIFICATIONS V2 — Deutschland-First Pet Platform

**Version:** 2.0  
**Stand:** 8. September 2026  
**Status:** Verbindliche visuelle und UX-Spezifikation  
**Zweck:** Umsetzungsgrundlage für Claude Code und alle späteren Frontend-Arbeiten  
**Technischer Rahmen:** Astro + TypeScript, statische Ausgabe, progressive Enhancement, Cloudflare Static Assets  
**Markenname im Mockup:** `Hundeglück` ist ein Arbeitsname. Das Design darf technisch nicht vom finalen Markennamen abhängen.

---

# 0. Geltungsbereich und Priorität

Diese Datei ersetzt die bisherige visuelle Richtung aus `DESIGN_SPECIFICATIONS.md` für **Look & Feel, Layout, Branding, Bildsprache und visuelle Komponenten**.

Bei Konflikten gilt folgende Priorität:

1. fachliche Richtigkeit und Sicherheit
2. Accessibility und Datenschutz
3. Implementierungsplan / Daten- und Lizenzregeln
4. **diese Datei `DESIGN_SPECIFICATIONS_V2.md`**
5. ältere Design-Spezifikationen

Claude Code soll neue UI nicht frei interpretieren, sondern aus den hier definierten Regeln, Tokens, Komponenten und Seitenmustern zusammensetzen.

Die Designreferenz ist:

```text
design-assets/design-reference-homepage.png
```

Sie ist eine **visuelle Nordstern-Referenz**, kein Pixel-Perfect-Mockup. Der Code muss die gleichen Prinzipien transportieren, aber echte Inhalte, korrekte Responsive-Layouts und zugängliche Komponenten verwenden.

---

# 1. Design-Idee

## 1.1 Leitgedanke

Die Plattform soll wirken wie eine Mischung aus:

- hochwertigem digitalen Verbraucherprodukt
- vertrauenswürdiger Haustier-Informationsplattform
- moderner Outdoor-/Lifestyle-Marke
- praktischer Tool-Suite

Nicht wie:

- generischer SEO-Blog
- klassischer Affiliate-Shop
- Tierarztpraxis-Webseite
- verspielte Kinder-/Comic-Seite
- sterile SaaS-Oberfläche

Der zentrale Eindruck soll sein:

> **„Hier bekomme ich schnell verlässliche Hilfe für ein besseres Leben mit meinem Hund — modern, freundlich und ohne Verkaufsdruck.“**

## 1.2 Charakter

Die visuelle Persönlichkeit ist:

- **warm**, aber nicht kitschig
- **modern**, aber nicht steril
- **premium**, aber nicht elitär
- **emotional**, aber nicht dramatisch
- **datenorientiert**, aber nicht technisch kalt
- **lebendig**, aber nicht überladen
- **vertrauenswürdig**, ohne Behördenästhetik

## 1.3 Verhältnis von Utility zu Emotion

Das Design soll ungefähr diesem Verhältnis folgen:

```text
70 % klare Utility / Produktoberfläche
30 % Emotion / Tier-Mensch-Lifestyle
```

Emotion kommt primär über Fotografie, großzügige Flächen, kurze markenhafte Statements und einzelne handschriftliche Akzente.

Utility kommt über klare Navigation, strukturierte Tools, Karten, Rechner, Filter, Ergebnisflächen und transparente Quellenangaben.

---

# 2. Bildsprache und vorhandene Assets

## 2.1 Verfügbare initiale Projektbilder

Die folgenden generierten Bilder sind als Startmaterial vorgesehen und liegen im Planungspaket unter `design-assets/`.

| Asset | Einsatz | Priorität |
|---|---|---:|
| `design-reference-homepage.png` | visuelle Referenz des finalen Designsystems | Referenz |
| `hero-dog-alpine-lake.png` | Homepage Hero / große Kampagnenfläche | sehr hoch |
| `travel-human-dog-sunset.png` | Reisecheck / Travel-Banner | sehr hoch |
| `play-dog-alpine-lake.png` | Spielzeug / Bewegung / Outdoor | hoch |
| `health-dog-home.png` | Health / Pflege / Zuhause / Komfort | hoch |

## 2.2 Zielpfade in der Website

Claude Code soll die Bilder beim Einbau nicht unter zufälligen Dateinamen verwenden, sondern in eine stabile Asset-Struktur überführen:

```text
public/
  images/
    brand/
      hero-dog-alpine-lake.avif
      hero-dog-alpine-lake.webp
      travel-human-dog-sunset.avif
      travel-human-dog-sunset.webp
      play-dog-alpine-lake.avif
      play-dog-alpine-lake.webp
      health-dog-home.avif
      health-dog-home.webp
```

Die Original-PNGs bleiben nicht die primären Produktionsdateien. Für Produktion werden responsive AVIF/WebP-Derivate erzeugt.

## 2.3 Fotografie-Regeln

Neue Bilder müssen dieselbe visuelle Sprache haben:

- natürliches Tageslicht oder Golden Hour
- warme, glaubwürdige Haut-/Fellfarben
- reale Landschaften und Wohnräume
- freundliche Hunde ohne übertriebene Pose
- echte Interaktion zwischen Mensch und Hund, wenn Menschen gezeigt werden
- natürliche Blickrichtungen
- klare Tiefenstaffelung
- Premium-Lifestyle, aber nicht Luxuswerbung
- keine Studioweiß-Hintergründe für redaktionelle Hero-Flächen

Vermeiden:

- übertriebene HDR-Optik
- Comic-/3D-Tiere
- unrealistisch perfekte Felltexturen
- Menschen, die direkt werblich in die Kamera posieren
- aggressive medizinische Visualisierungen
- „kranke“ Hunde als Angsttrigger
- starke Markenlogos fremder Hersteller in redaktionellen Bildern
- visuelles Chaos im Hintergrund

## 2.4 Bild-Cropping

Hero-Bilder müssen so gecroppt werden, dass Text auf einer ruhigen Bildzone liegt.

Desktop:

```text
Textzone     38–46 % Breite
Bildmotiv    54–62 % Breite
```

Mobile:

- Text und Bild nicht dauerhaft in zwei zu kleine Spalten pressen
- Bild darf oberhalb oder unterhalb des Textes stehen
- Gesicht/Hund nie durch `object-fit: cover` unkontrolliert anschneiden
- `object-position` pro Asset bewusst setzen

## 2.5 Handschriftliche Akzente

Handschrift darf verwendet werden für:

- kurze emotionale Notizen
- Bild-Sticker
- 2–6 Wörter lange Editorial-Akzente

Beispiele:

```text
Gemeinsam mehr erleben.
Wissen schafft Sicherheit.
Gute Hunde. Gute Tage.
Mehr entdecken.
```

Nicht für:

- Body Copy
- Navigation
- Buttons
- Datenwerte
- Preise
- Warnungen
- Quellen
- rechtliche Hinweise

Maximal **1–2 handschriftliche Akzente pro Viewport**.

---

# 3. Farbdesign

## 3.1 Kernpalette

Die Marke basiert auf tiefem Petrol, warmem Off-White und einem sonnigen Orange. Ergänzende Toolfarben werden nur funktional eingesetzt.

```css
:root {
  --color-ink: #102E34;
  --color-ink-soft: #355057;
  --color-ink-muted: #6B7D82;

  --color-brand-900: #073637;
  --color-brand-800: #0B4745;
  --color-brand-700: #12685F;
  --color-brand-600: #168B78;
  --color-brand-100: #DDF3EC;
  --color-brand-050: #EFF9F5;

  --color-orange-600: #C15000;
  --color-orange-500: #F58A1F;
  --color-orange-100: #FFF0DD;

  --color-blue-600: #2679C8;
  --color-blue-500: #409BF5;
  --color-blue-100: #E8F3FF;

  --color-purple-600: #6D56C6;
  --color-purple-500: #8B72EA;
  --color-purple-100: #F0ECFF;

  --color-coral-600: #C84C5D;
  --color-coral-500: #E96576;
  --color-coral-100: #FDECEF;

  --color-green-600: #147866;
  --color-green-500: #35A987;
  --color-green-100: #E6F6F1;

  --color-surface: #FFFFFF;
  --color-surface-soft: #F7F8F6;
  --color-surface-warm: #FBF8F2;
  --color-surface-blue: #F2F8FC;
  --color-border: #E3E9E7;
  --color-border-strong: #CDD7D4;

  --color-success: #147866;
  --color-warning: #B65B00;
  --color-danger: #B83E4C;
  --color-info: #2679C8;
}
```

## 3.2 Hauptverwendung

### Petrol

Verwendung:

- Logo
- Primärtext
- Header-Akzente
- primäre Buttons
- Kartenpins
- relevante Trust-Elemente

### Orange

Verwendung:

- einzelne Conversion-Akzente
- aktive Highlights
- wichtige Homepage-CTA
- kleine Markendetails

Orange ist **nicht** die Standardfarbe für jeden Button.

Wegen Kontrast wird auf hellem Orange dunkler Text verwendet:

```text
Background: #F58A1F
Text:       #102E34
```

Keine weiße kleine Schrift auf `#F58A1F`.

### Toolfarben

Toolfarben dienen der Orientierung, nicht der Dekoration:

```text
Tierarztkosten      Grün/Petrol
Karte               Blau
Reise               Violett
Futter               Orange
Spielzeug            Koralle
Gesundheit & Pflege  Grün
```

Toolfarben werden überwiegend in Icons, Badges und sehr hellen Hintergründen eingesetzt.

## 3.3 Flächenverteilung

Ziel:

```text
65–75 % Weiß / Warm White
15–20 % sehr helle Flächen
5–10 % Fotografie
3–6 % Brand Petrol
1–3 % Orange / Secondary Accents
```

Die Oberfläche soll dadurch lebendig, aber nicht bunt wirken.

---

# 4. Typografie

## 4.1 Hauptschrift

Bevorzugt:

```text
Manrope Variable
```

Fallback:

```css
font-family: "Manrope", Inter, ui-sans-serif, system-ui, -apple-system,
             BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Wenn eine Webfont eingebunden wird:

- lokal hosten
- keine Abhängigkeit von Google Fonts zur Laufzeit
- nur benötigte Variable-Font-Dateien
- `font-display: swap`

## 4.2 Handschriftliche Akzentschrift

Bevorzugt:

```text
Kalam
```

Alternativ eine ähnlich natürliche, gut lesbare Handschrift.

Nur für kurze Akzente gemäß Abschnitt 2.5.

## 4.3 Typografische Skala

```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-md: 1.125rem;     /* 18px */
--text-lg: 1.375rem;     /* 22px */
--text-xl: 1.75rem;      /* 28px */
--text-2xl: 2.25rem;     /* 36px */
--text-3xl: 3rem;        /* 48px */
--text-4xl: 4rem;        /* 64px */
```

Hero Desktop:

```text
52–64px
line-height 0.98–1.06
font-weight 700–780
letter-spacing -0.035em
```

Hero Mobile:

```text
38–44px
line-height 1.02–1.08
```

Section Headline Desktop:

```text
30–38px
font-weight 700
```

Card Headline:

```text
18–24px
font-weight 650–750
```

Body:

```text
16–18px
line-height 1.55–1.7
```

## 4.4 Textbreiten

Lange Texte sollen nicht über volle Containerbreite laufen.

```text
Body Copy:      60–72ch
Hero Copy:      36–48ch
Result Explain: 50–65ch
```

---

# 5. Spacing, Grid und Radien

## 5.1 Spacing-System

4px-Basis:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

## 5.2 Container

```css
--container-max: 1320px;
--container-readable: 760px;
```

Desktop:

```text
max-width 1320px
side padding 28–40px
```

Tablet:

```text
side padding 24px
```

Mobile:

```text
side padding 16–20px
```

## 5.3 Grid

Desktop ab 1200px:

```text
12 Columns
24px Gutters
```

Tablet:

```text
8 Columns
20px Gutters
```

Mobile:

```text
4 Columns
16px Gutters
```

## 5.4 Radien

```css
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-xl: 28px;
--radius-pill: 999px;
```

Standard:

- Inputs: 12–14px
- Cards: 18–20px
- große Feature-Flächen: 24–28px
- Buttons: 999px oder 12–14px, abhängig vom Kontext

Nicht jede Komponente soll maximal rund sein.

## 5.5 Schatten

Schatten sind weich und sparsam.

```css
--shadow-sm: 0 1px 2px rgba(10, 45, 47, 0.05),
             0 5px 18px rgba(10, 45, 47, 0.05);

--shadow-md: 0 10px 30px rgba(10, 45, 47, 0.08);

--shadow-float: 0 18px 45px rgba(10, 45, 47, 0.12);
```

Standardcards verwenden eher Border + `shadow-sm` als starke Floating-Shadows.

---

# 6. Header und Navigation

## 6.1 Desktop Header

Höhe:

```text
68–76px
```

Layout:

```text
Logo     Hauptnavigation             Search / Save / Mein Hund
```

Navigation:

- Tools
- Ratgeber
- Karte
- Produkte
- Wissen

Optionale spätere Ergänzungen bleiben in derselben Hierarchie.

## 6.2 Header-Verhalten

Header ist sticky:

```css
position: sticky;
top: 0;
z-index: 100;
```

Nach leichtem Scroll:

- transparenter/weißer Hintergrund wird zu 92–96 % Weiß
- leichter Blur möglich
- feine Bottom Border
- keine aggressive Schattenkante

## 6.3 Logo

Logo muss kompakt und horizontal sein.

Struktur:

```text
[Icon] Markenname
       optional sehr kurze Tagline
```

Das Pfotenmotiv darf abstrakt oder reduziert sein. Keine Clipart-Pfote.

## 6.4 „Mein Hund“

Als Pill-CTA in Petrol:

```text
[User Icon] Mein Hund
```

Auch ohne Account darf diese Funktion zunächst lokales Browserprofil öffnen.

## 6.5 Mobile Header

```text
[Logo]                   [Search] [Menu]
```

„Mein Hund“ befindet sich im geöffneten Menü prominent oben.

Das mobile Menü ist kein Desktop-Dropdown in klein, sondern eine klare Full-Height oder große Sheet-Navigation.

---

# 7. Homepage — verbindliche Informationsarchitektur

Die Homepage folgt dieser Reihenfolge.

## H01 — Header

Siehe Abschnitt 6.

## H02 — Hero

Ziel: Marke + Nutzen + sofortige Aufgabe.

Desktop:

```text
┌──────────────────────────────────────────────────────────────┐
│ Eyebrow                                                      │
│ Alles für ein                   [großes Hund-/Naturbild]     │
│ gesundes & glückliches                                      │
│ Hundeleben.                                                  │
│                                                              │
│ kurze Erklärung                                              │
│                                                              │
│ [Tierarztkosten] [Hunde-Orte] [Reisecheck]                  │
└──────────────────────────────────────────────────────────────┘
```

Empfohlenes Asset:

```text
design-assets/hero-dog-alpine-lake.png
```

### Hero Copy

Die exakten Texte dürfen redaktionell später geändert werden, aber die Informationsdichte bleibt:

```text
Eyebrow:
Bessere Entscheidungen. Glücklichere Hunde.

H1:
Alles für ein gesundes & glückliches Hundeleben.

Subline:
Praktische Tools, verlässliche Informationen und passende Produkte —
basierend auf aktuellen Daten und transparenten Quellen.
```

### Hero-CTA

Maximal drei direkte Einstiege:

1. Tierarztkosten berechnen — Orange
2. Hunde-Orte finden — Weiß/Outline
3. Reisecheck starten — Weiß/Outline

Auf Mobile:

- primärer CTA volle Breite
- sekundäre CTA darunter als zwei kompakte Buttons oder Liste

## H03 — Tool Dock

Unmittelbar unter Hero.

Desktop: sechs gleichgewichtete Karten.

```text
Tierarztkosten | Hunde-Karte | Reisecheck | Futter | Spielzeug | Gesundheit
```

Jede Karte:

- Icon in Toolfarbe
- Name
- 1 Zeile Nutzen
- gesamte Karte klickbar
- dezenter Hover

Höhe ca. 104–120px.

Mobile:

- horizontal scrollbare Cards oder 2x3 Grid
- horizontal scroll nur mit sichtbarem Overflow-Hinweis

## H04 — Drei Hauptmodule

Desktop auf 12-Column Grid:

```text
Tierarztkosten      Hunde-Karte        Ratgeber
5 Columns           4 Columns          3 Columns
```

### Tierarztkosten Feature Card

- helle Blau-/Petrol-Fläche
- echtes Tool, kein reines Marketing
- kurze Erklärung
- CTA
- kleiner Hundebildausschnitt
- drei Trust-Facts darunter

Trust-Facts müssen real sein. Keine erfundenen Zahlen.

### Hunde-Karte Feature Card

- sehr vereinfachte Deutschland-Karte / statische Preview
- Search-Feld „PLZ oder Ort eingeben“
- Pin-/Place-Chips
- CTA/Search direkt funktional, wenn technisch möglich

### Ratgeber Feature

3 kleine Editorial Cards:

- Bild
- Kategorie
- Titel
- Lesezeit

Keine Clickbait-Headlines.

## H05 — Produktempfehlungen

Die Homepage darf Produkte zeigen, aber die Sektion soll bewusst **nach den Utility-Modulen** erscheinen.

Struktur:

```text
Eyebrow: Ausgewählt für euch
Headline: Beliebte Produkte für ein glückliches Hundeleben.
Subline: Qualitätsprodukte für Alltag, Abenteuer und Wohlbefinden.
```

4 Produktcards Desktop.

Produktcards siehe Abschnitt 13.

## H06 — Emotionaler Reise-Banner

Full-width innerhalb oder knapp außerhalb des normalen Containers.

Asset:

```text
design-assets/travel-human-dog-sunset.png
```

Text:

```text
Gemeinsam die Welt entdecken.
Neue Orte. Neue Erinnerungen. Ein besseres Leben — mit Hund.
```

CTA:

```text
Zum Reisecheck
```

Der Banner ist der stärkste emotionale Moment der Homepage.

## H07 — Optional: Daten-/Trust-Sektion

Später, sobald echte Kennzahlen vorhanden sind:

- Orte im Datenbestand
- aktualisierte GOT-Fassung
- Datenquellen
- letzte Aktualisierung

Keine Zahlen erfinden, um die Oberfläche voller wirken zu lassen.

## H08 — Footer

Siehe Abschnitt 18.

---

# 8. Hero-Komponente

Reusable Component:

```text
<HeroFeature />
```

Props/Content Contract:

```ts
interface HeroFeatureProps {
  eyebrow?: string;
  title: string;
  description?: string;
  image: ImageAsset;
  imageAlt: string;
  primaryAction: Action;
  secondaryActions?: Action[];
  annotation?: string;
  tone?: 'brand' | 'warm' | 'blue' | 'plain';
}
```

## Desktop

- Mindesthöhe 440px
- bevorzugt 480–540px
- H1 nicht breiter als ca. 640px
- Bildmotiv dominant, aber Text lesbar
- Bild kann in Background oder Split Layout liegen

## Mobile

- Text immer vollständig lesbar
- kein Text direkt auf unruhigem Bild ohne ausreichend Overlay
- CTA min. 48px hoch
- Bild folgt nach der primären Botschaft oder wird mit klarer Gradientzone eingebettet

---

# 9. Tool Cards

Komponente:

```text
<ToolCard />
```

Inhalt:

```text
Icon
Name
kurzer Nutzen
optional Status/Badge
```

Interaktion:

Default:

- Border `--color-border`
- Background White oder Soft Tint

Hover Desktop:

```text
transform: translateY(-2px)
border-color leicht stärker
shadow-sm → shadow-md
```

Transition:

```text
160–220ms ease-out
```

Bei `prefers-reduced-motion` kein Transform.

Keine Toolcard darf wie Bannerwerbung aussehen.

---

# 10. Tierarztkosten-Rechner

## 10.1 Ziel

Der Rechner soll **seriös, klar und beruhigend** wirken. Er darf nicht wie ein Versicherungs-Verkaufstrichter aussehen.

## 10.2 Desktop Layout

```text
┌────────────── 7 cols ──────────────┬──── 5 cols ────┐
│ Eingabe / Behandlung               │ Live Summary   │
│                                    │                │
│ Tierart                            │ Betragsspanne  │
│ Behandlung                         │ GOT-Faktor     │
│ Zusatzoptionen                     │ Quelle         │
│                                    │ Datenstand     │
│ [Berechnen]                        │                │
└────────────────────────────────────┴────────────────┘
```

Summary ist sticky, solange es ergonomisch bleibt.

## 10.3 Mobile Layout

```text
H1
Kurzinfo
Formular
[Kosten berechnen]
Ergebnis
Details
Methodik
Quelle
Affiliate-/Versicherungsbereich klar getrennt
```

Keine sticky Ergebnisbox, die den kleinen Bildschirm verdeckt.

## 10.4 Ergebnisvisualisierung

Primärer Wert groß:

```text
ca. 145–230 €
```

Darunter:

```text
Beispielhafte Berechnung nach ausgewählten GOT-Positionen
```

Dann aufklappbare Bestandteile:

```text
Allgemeine Untersuchung    xx,xx €
Leistung X                  xx,xx €
Leistung Y                  xx,xx €
--------------------------------
Zwischensumme               xx,xx €
```

Fakten und Schätzungen visuell unterscheiden.

## 10.5 Versicherung

Erst **nach dem fachlichen Ergebnis**.

Kommerzielle Sektion:

```text
Kann eine Tierkrankenversicherung solche Kosten abdecken?
[Partnerangebote ansehen]
```

Kennzeichnung sichtbar:

```text
Werbelinks / Affiliate-Partner
```

Keine Aussage „beste Versicherung für dich“, solange keine entsprechende regulatorische Grundlage besteht.

---

# 11. Deutschlandweite Hunde-Karte

## 11.1 Desktop

```text
┌───────────────┬─────────────────────────────────────┐
│ Filter        │ Karte                               │
│ 320–380px     │ flexible Breite                     │
│               │                                     │
│ Suche         │                                     │
│ Kategorien    │                                     │
│ Ergebnisliste │                                     │
└───────────────┴─────────────────────────────────────┘
```

Map darf den Inhalt nicht komplett dominieren. Ergebnisliste ist immer erreichbar.

## 11.2 Mobile

Default:

```text
Search
Filter Chips
Toggle: Liste | Karte
```

Startzustand bevorzugt Liste oder zuletzt verwendete Ansicht.

## 11.3 Pins

- Petrol Standard-Pin
- aktiver Pin Orange
- Cluster als klare Zähler
- keine 6 verschiedenen Pinfarben ohne Legende

## 11.4 Place Card

```text
Name
Kategorie
Ort/Distanz
relevante Eigenschaften
Datenquelle
[Details]
```

Fehlende Angaben nicht mit erfundenen Defaults auffüllen.

---

# 12. Reisecheck

## 12.1 Designprinzip

Der Reisecheck soll sich eher wie ein **freundlicher Check-in-Prozess** anfühlen als wie ein Behördenformular.

## 12.2 Stepper

Maximal 4–5 Hauptschritte:

```text
1. Start & Ziel
2. Tier
3. Alter / Status
4. relevante Dokumente
5. Ergebnis
```

Desktop kann Stepper horizontal anzeigen.

Mobile vertikal/kompakt.

## 12.3 Ergebnis

Status nicht nur mit Farbe vermitteln.

Verwenden:

```text
✓ Erfüllt
! Prüfen
? Unbekannt
— Nicht relevant
```

Ergebnisblöcke:

1. Einreisebedingungen
2. Dokumente
3. Impf-/Gesundheitsanforderungen, sofern relevant und fachlich sauber
4. praktische Reisehinweise
5. Packliste
6. passende Produkte / Affiliate klar getrennt

## 12.4 Emotionale Bildfläche

Auf Landingpage oder Ergebnisabschluss:

```text
design-assets/travel-human-dog-sunset.png
```

Nicht während kritischer Regelprüfung zwischen die Fakten schieben.

---

# 13. Produkt- und Affiliate-Design

## 13.1 Grundprinzip

Produkte werden als **hilfreiche Ergänzung** zur Nutzeraufgabe präsentiert.

Nicht:

```text
„Jetzt kaufen!!!“
```

Sondern:

```text
Passende Produkte für deine Auswahl
```

## 13.2 Product Card

Desktop Mindestbreite ca. 230px.

Struktur:

```text
Produktbild
optional Kategorie / Badge
Produktname
relevante 1–3 Merkmale
Preis / Preisstatus
Shop oder Anbieter
[Angebot ansehen]
Kennzeichnung Affiliate/Werbelink
```

Bewertungen nur anzeigen, wenn echte Bewertungsdaten und Quelle vorhanden sind.

Keine generierten Sternebewertungen.

## 13.3 Preis

Preis ist visuell relevant, aber nicht dominanter als Produktname.

```text
29,90 €
```

Zusätze:

```text
Preis zuletzt aktualisiert: …
zzgl./inkl. Versand, sofern Daten vorhanden
```

## 13.4 CTA

Standard Produkt-CTA:

```text
Angebot ansehen
```

Nicht „Kaufen“, wenn der Kauf auf fremder Seite erfolgt.

## 13.5 Product Rows

Für Vergleiche und Futterpreise bevorzugt tabellarische/listenartige Darstellung statt ausschließlich großen Shopcards.

---

# 14. Health & Pflege

## 14.1 Visuelle Tonalität

Health-Flächen sollen:

- ruhig
- warm
- sauber
- hilfreich

wirken, aber **nicht klinisch**.

Asset:

```text
design-assets/health-dog-home.png
```

## 14.2 Kategorien

Mögliche Navigationskarten:

```text
Zahnpflege
Fell & Haut
Mobilität
Alltag & Komfort
Hygiene
Erste Hilfe / Ausstattung
```

Gesundheitsbehauptungen nur dort verwenden, wo sie fachlich/rechtlich belastbar sind.

## 14.3 Health Notice

Bei medizinisch relevanten Themen:

```text
Informationshinweis
Diese Inhalte ersetzen keine tierärztliche Untersuchung oder Beratung.
```

Der Hinweis soll sichtbar, aber nicht alarmierend sein.

## 14.4 Keine Angst-UX

Nicht verwenden:

- rote Alarmflächen ohne echten Grund
- Bilder leidender Tiere
- „Wenn du das nicht kaufst …“
- Countdown
- dramatische Risikoüberschriften

---

# 15. Spielzeug-Finder

## 15.1 Tonalität

Dies ist der lebendigste Produktbereich.

Asset:

```text
design-assets/play-dog-alpine-lake.png
```

## 15.2 Filter

Bevorzugte visuelle Filter:

```text
Größe
Alter/Lebensphase
Spielart
Kauintensität
Indoor / Outdoor
Material
Befüllbar
Schwimmfähig
Waschbarkeit
```

Nicht alle Filter sofort offen anzeigen.

Use Progressive Disclosure:

- wichtigste 3–4 Filter zuerst
- „Weitere Filter“ öffnet zusätzliche Optionen

## 15.3 Ergebniscard

Neben Produktdaten soll klar erklärt werden, **warum** ein Produkt passt:

```text
Passt zu deiner Auswahl, weil:
• Größe geeignet
• für Apportieren
• Outdoor geeignet
```

Keine unbelegte Behauptung „perfekt für deinen Hund“.

---

# 16. Futtervergleich

## 16.1 Fokus

Der Futtervergleich ist datenorientierter als andere Commerce-Seiten.

Priorität:

1. Produktidentität
2. Packungsgröße
3. Preis
4. Grundpreis
5. verfügbare Daten zu Inhalts-/Nährwerten
6. Shop-Angebote

## 16.2 Tabellen

Desktop:

- sticky erste Spalte möglich
- klare Sortieroptionen
- nicht mehr als 6–8 Kernspalten gleichzeitig

Mobile:

- Karten oder kompakte Rows
- wichtigste Werte sichtbar
- Details per Accordion

## 16.3 Price Highlight

Günstigstes Angebot darf hervorgehoben werden, wenn Daten aktuell und vergleichbar sind.

Text:

```text
Niedrigster aktuell erfasster Preis
```

Nicht:

```text
Bestes Angebot garantiert
```

---

# 17. Ratgeber / Editorial

## 17.1 Artikelkarten

Card besteht aus:

- Bild
- Kategorie
- Titel
- kurze Dek
- Lesezeit oder Aktualisierungsdatum

## 17.2 Artikeltemplate

```text
Breadcrumb
Kategorie
H1
Dek
Autor / Prüfung / Aktualisierung
Hero-Bild optional
Artikel
Inline Tool CTA
Quellen
Methodik/Autorität
Related Content
```

## 17.3 Artikeltypografie

Body:

```text
max-width: 720–760px
18px Desktop
16–17px Mobile
line-height 1.65–1.75
```

Große Tabellen oder interaktive Elemente dürfen breiter ausbrechen.

## 17.4 Affiliate im Editorial

Kommerzielle Blöcke müssen sichtbar getrennt sein.

Keine Produktlinks mitten in medizinischen Aussagen ohne klare Kennzeichnung.

---

# 18. Footer

Footer soll hochwertig und ruhig sein.

Desktop 4–5 Spalten:

```text
Marke
Tools
Ratgeber/Wissen
Unternehmen/Über uns
Rechtliches & Datenquellen
```

Pflicht-/Vertrauenslinks je nach finalem Projekt:

- Impressum
- Datenschutz
- Affiliate-Hinweis
- Datenquellen
- Methodik
- Kontakt

Footer-Hintergrund:

```text
Deep Petrol
```

Text weiß/hellgrau mit ausreichendem Kontrast.

Keine riesige Linkwand mit 80 SEO-Links.

---

# 19. Buttons

## 19.1 Primary

```text
Background: #073637 oder #0B4745
Text: White
Radius: Pill
Height: 48–52px
Padding: 0 20–24px
```

## 19.2 Hero Highlight

```text
Background: #F58A1F
Text: #102E34
```

Nur für besonders wichtige Conversion-Aktion.

## 19.3 Secondary

```text
Background: White
Border: #CDD7D4
Text: #102E34
```

## 19.4 Tertiary

Textlink mit Arrow.

```text
Alle Tools ansehen →
```

## 19.5 Hover / Active

Keine wilden Farbwechsel.

Hover:

- minimale Dunkel-/Helligkeitsänderung
- optional 1–2px Translation

Active:

- sichtbar gedrückt
- kein Layout Shift

## 19.6 Mindestgrößen

Clickable Target:

```text
mindestens 44 x 44px
```

Bevorzugte Buttonhöhe:

```text
48px+
```

---

# 20. Forms und Inputs

## 20.1 Input Design

```text
Height: 48–52px
Radius: 12–14px
Border: #CDD7D4
Background: White
```

Label immer sichtbar.

Placeholder ersetzt niemals das Label.

## 20.2 Focus State

```text
2–3px Focus Ring in Brand/Blue
```

Focus darf nicht nur durch Farbänderung der Border signalisiert werden.

## 20.3 Validation

Error:

```text
[Icon] Konkrete Fehlermeldung
```

Nicht nur rote Border.

Beispiel:

```text
Bitte gib eine gültige deutsche PLZ ein.
```

Nicht:

```text
Ungültig.
```

## 20.4 Selects

Native Select bevorzugen, solange Design und UX ausreichend sind.

Custom Combobox nur bei:

- großer Suchliste
- Autocomplete
- komplexer Location-Suche

Dann vollständig keyboard-accessible.

---

# 21. Icons

## 21.1 Stil

- monoline
- abgerundete Ecken
- 1.75–2px Stroke
- keine Emoji als primäre UI-Icons

## 21.2 Größe

```text
16px inline
20px controls
24px navigation/cards
28–32px feature cards
```

## 21.3 Icon Library

Wenn externe Library:

- Lucide bevorzugt
- tree-shakable
- nur verwendete Icons importieren

Keine Mischung aus drei Iconsets.

---

# 22. Chips und Badges

## Filter Chips

```text
Height 36–40px
Radius pill
Border neutral
```

Selected:

```text
Brand-100 Background
Brand-800 Text
Brand Border
```

## Status Badges

Farben sind semantisch und immer mit Text/Icon kombiniert.

Beispiele:

```text
✓ Erfüllt
! Prüfen
? Unbekannt
```

---

# 23. Alerts, Info Boxes und Quellen

## 23.1 Info

Hintergrund: sehr helles Blau.

## 23.2 Warnung

Hintergrund: sehr helles Warm Orange.

Nicht automatisch Rot verwenden.

## 23.3 Kritisch

Rot nur für tatsächliche Fehler oder hohe Relevanz.

## 23.4 Source Box

Jedes datengetriebene Tool bekommt standardisierte Source-UI:

```text
Datenstand: 08.09.2026
Quelle: [Name]
Methodik: [Details]
```

Source Box ist kompakt, aber nicht versteckt.

---

# 24. Cardsystem

Es gibt vier Hauptcardtypen.

## A. Utility Card

Für Tools und Funktionen.

- neutraler Hintergrund
- klare Aktion
- Icon statt großer Fotografie

## B. Editorial Card

Für Ratgeber.

- Bild
- Kategorie
- Titel
- Metadaten

## C. Product Card

Für Affiliate/Commerce.

- Produktbild
- Daten/Preis
- Kennzeichnung

## D. Feature Card

Für große Homepage-Module.

- 20–28px Radius
- großflächiger Tint oder Foto
- starker Headline
- 1 Hauptaktion

Keine fünfte Card-Sprache ohne guten Grund erfinden.

---

# 25. Responsive Breakpoints

Empfohlene technische Breakpoints:

```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1440px;
```

Design nicht nur bei diesen exakten Punkten testen.

Pflicht-Testbreiten:

```text
360px
390px
430px
768px
1024px
1280px
1440px
```

## Mobile Regeln

- keine horizontale Page-Scrollbar
- kein Text kleiner als 14px für reguläre UI-Inhalte
- wichtigste CTAs 48px hoch
- 1-spaltige Ergebnisdarstellung bevorzugen
- Tabellen responsiv transformieren
- Sticky UI sparsam verwenden

---

# 26. Motion

Motion ist subtil und funktional.

## Erlaubt

- 160–220ms Hover
- Accordion Transition
- Drawer/Sheet
- leichte Card Translation
- Pin Highlight
- Progress Step Transition

## Nicht erlaubt

- Autoplay-Animationen ohne funktionalen Zweck
- Parallax im Kernflow
- große Hero-Zoom-Animationen
- Bounce-Buttons
- endlose decorative loops

`prefers-reduced-motion` vollständig berücksichtigen.

---

# 27. Accessibility

Ziel: mindestens WCAG 2.2 AA für alle Kernflows.

## Pflicht

- vollständige Keyboard-Navigation
- sichtbare Focus States
- sinnvolle Heading-Hierarchie
- semantische Buttons/Links
- Labels für Inputs
- Alt-Texte
- Status nicht nur per Farbe
- Kontrast AA
- `aria-live` für relevante dynamische Ergebnisse
- Modals/Drawers mit Focus Management
- Skip Link

## Bilder

Dekorative Bilder:

```html
alt=""
```

Informationshaltige Bilder erhalten sinnvolle, knappe Alt-Texte.

Keine Beschreibung von rein dekorativer Berglandschaft nötig, wenn sie keinen Informationswert hat.

---

# 28. Performance

Das Design darf die Static-first-Architektur nicht aushebeln.

## 28.1 Bildbudget

Hero LCP:

- responsive `srcset`
- AVIF + WebP
- realistische Zielgröße 120–300 KB pro ausgelieferter Variante
- Original-PNG nicht an normale Besucher ausliefern

Below-the-fold Bilder:

```html
loading="lazy"
decoding="async"
```

Hero:

- nicht lazy loaden
- ggf. `fetchpriority="high"`

## 28.2 JS

Keine UI-Library nur wegen Cards und Buttons.

Interaktive Islands nur dort, wo erforderlich:

- Rechner
- Karte
- komplexe Filter
- Reisecheck
- lokale Pet-Profile

Homepage-Marketingbereiche bleiben statisch.

## 28.3 Layout Shift

Für jedes Bild Aspect Ratio reservieren.

Cards dürfen nach Datenladen nicht unkontrolliert springen.

---

# 29. SEO und Design

Design darf SEO nicht durch reine JS-Ausgabe verhindern.

Statisch rendern:

- H1
- Intro
- Tool-Beschreibung
- Datenstand
- relevante statische Ergebnis-/Kategorieinhalte, soweit sinnvoll
- Artikel
- FAQ

Interaktive Daten dürfen clientseitig ergänzt werden.

Keine SEO-Textwände vor dem Tool.

---

# 30. Monetarisierung und Ads

## 30.1 Grundsatz

Monetarisierung darf nie die Kernaufgabe blockieren.

## 30.2 Ads

Wenn Display Ads später eingesetzt werden:

- keine Ad direkt zwischen Label und Input
- keine Ad im laufenden Rechner-Stepper
- keine Ad, die Ergebnis und Quelle trennt
- reservierte Höhe gegen CLS
- klar als Anzeige gekennzeichnet

Geeignete Positionen:

- nach abgeschlossenem Tool-Ergebnis
- zwischen größeren redaktionellen Sektionen
- im Artikel nach einigen Absätzen
- Desktop Sidebar bei langen Ratgeberseiten

## 30.3 Affiliate

Affiliate ist besonders passend nach:

```text
Nutzerproblem → Tool-Ergebnis → Erklärung → passende Option
```

Nicht:

```text
Affiliate-Produkt → Nutzerproblem danach erklären
```

---

# 31. Empty, Loading und Error States

## Empty

Neutral erklären und nächste Aktion anbieten.

Beispiel Karte:

```text
Keine passenden Orte gefunden.
Versuche einen größeren Radius oder entferne einen Filter.
```

## Loading

Bei statischen Daten bevorzugt kaum Loading.

Bei interaktiven Bereichen:

- Skeleton nur wenn >300–500ms plausibel
- kein Spinner für sofortige Berechnung

## Error

Fehlerzustand muss sagen:

1. was nicht funktioniert hat
2. was der Nutzer tun kann
3. ob vorhandene Daten weiter nutzbar sind

---

# 32. Component Architecture

Claude Code soll mindestens folgende visuelle Primitives definieren:

```text
Button
IconButton
Badge
Chip
Card
Section
Container
Stack
Cluster
Input
Select
Combobox
Checkbox
RadioGroup
Accordion
Alert
SourceMeta
Breadcrumb
Pagination
Drawer
Modal
Tabs
```

Feature Components:

```text
SiteHeader
SiteFooter
HeroFeature
ToolDock
ToolCard
FeatureCard
EditorialCard
ProductCard
ProductRow
AffiliateDisclosure
MapPlaceCard
CostSummary
TravelResultCard
HealthCategoryCard
FilterBar
PetProfilePrompt
```

Featurekomponenten nutzen die Primitives; sie sollen nicht jeweils eigene Spacing-/Button-Systeme mitbringen.

---

# 33. CSS / Token-Struktur

Empfohlene Struktur:

```text
src/styles/
  tokens.css
  reset.css
  base.css
  typography.css
  utilities.css
  components.css   // nur falls sinnvoll
```

Oder äquivalente Astro-Komponentenstyles.

Wichtig:

- Tokens zentral
- keine verstreuten Hex-Farben in Komponenten
- keine zufälligen `17px`, `23px`, `37px` Spacingwerte ohne Grund
- keine Inline-Styles für Standarddesign

---

# 34. Homepage Wireframe Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ LOGO          Tools Ratgeber Karte Produkte Wissen     User  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bessere Entscheidungen.           [     DOG IMAGE      ]    │
│                                                              │
│  Alles für ein                                               │
│  gesundes & glückliches                                      │
│  Hundeleben.                                                 │
│                                                              │
│  kurze Erklärung                                             │
│  [Kosten] [Orte] [Reise]                                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ [Kosten] [Karte] [Reise] [Futter] [Spielzeug] [Gesundheit] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [ Tierarztkosten Feature ] [ Map Feature ] [ Ratgeber x3 ] │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Beliebte Produkte                                            │
│ [P1] [P2] [P3] [P4]                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [ Mensch + Hund / Sunset Travel Banner              CTA ]   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ optional Trust / Daten                                      │
├──────────────────────────────────────────────────────────────┤
│ Footer                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

# 35. Homepage Wireframe Mobile

```text
┌───────────────────────┐
│ Logo        Search ☰  │
├───────────────────────┤
│ Eyebrow               │
│ Alles für ein         │
│ gesundes &            │
│ glückliches           │
│ Hundeleben.           │
│                       │
│ kurze Erklärung       │
│ [Kosten berechnen]    │
│ [Orte] [Reise]        │
│                       │
│ [Hero Dog Image]      │
├───────────────────────┤
│ Tool Grid 2x3         │
├───────────────────────┤
│ Tierarztkosten        │
│ Feature               │
├───────────────────────┤
│ Hunde-Karte           │
│ Feature               │
├───────────────────────┤
│ Ratgeber              │
│ Cards                 │
├───────────────────────┤
│ Produkte horizontal   │
├───────────────────────┤
│ Travel Banner         │
├───────────────────────┤
│ Footer                │
└───────────────────────┘
```

---

# 36. Design-Implementierungsmeilensteine

Diese IDs sollen für Statusfragen verwendet werden können.

## D00 — Referenz und Asset-Setup

**Ziel:** Designreferenz und Bildassets im Projekt verfügbar.

Aufgaben:

- D00-01 `DESIGN_SPECIFICATIONS_V2.md` als aktuelle Designquelle markieren
- D00-02 Designreferenz ins Repo übernehmen
- D00-03 Bildassets in Produktionsstruktur übernehmen
- D00-04 AVIF/WebP-Pipeline anlegen
- D00-05 Alt-Text/Asset-Metadaten definieren

Abnahme:

- alle Assets existieren reproduzierbar
- keine gebrochenen Bildpfade
- Build liefert optimierte Formate

## D01 — Tokens und Baseline

Aufgaben:

- D01-01 Farben
- D01-02 Typografie
- D01-03 Spacing
- D01-04 Grid/Container
- D01-05 Radius/Shadow
- D01-06 Base/Reset/Focus

Abnahme:

- keine alten zufälligen Farben im neuen UI
- Token-Demo oder Story/Testseite vorhanden

## D02 — UI Primitives

Aufgaben:

- Button
- Badge
- Chip
- Card
- Form Controls
- Alert
- Accordion
- SourceMeta

Abnahme:

- alle States vorhanden
- Tastaturbedienung geprüft
- keine visuell inkonsistenten Varianten

## D03 — Site Shell

Aufgaben:

- Header Desktop
- Header Mobile
- Navigation
- Mobile Drawer
- Footer
- Breadcrumbs

Abnahme:

- 360–1440px geprüft
- sticky header funktioniert ohne Content-Overlap

## D04 — Homepage

Aufgaben:

- Hero
- Tool Dock
- 3 Feature Modules
- Editorial Cards
- Product Section
- Travel Banner
- Trust Section optional

Abnahme:

- visuell klar an `design-reference-homepage.png` angelehnt
- keine Copy-Overflow-Probleme
- LCP-Bild optimiert

## D05 — Universal Tool Shell

Aufgaben:

- Tool Header
- Intro
- Tool container
- Ergebniszone
- Methodik/Quellen
- Related Tools

Abnahme:

- gemeinsames Muster für Rechner, Reise, Finder

## D06 — Tierarztkosten UI

Aufgaben:

- Formular
- Behandlungssuche
- Ergebnis
- Gebührenbestandteile
- Quellen
- Affiliate-Follow-up

Abnahme:

- keine kommerzielle Fläche vor dem fachlichen Kernergebnis

## D07 — Karten-UI

Aufgaben:

- Desktop Split Layout
- Mobile Liste/Karte Toggle
- Place Cards
- Filter Chips
- Empty/Error State

Abnahme:

- vollständig ohne Maus bedienbare Listenalternative

## D08 — Reisecheck UI

Aufgaben:

- Stepper
- Country/Animal Auswahl
- Result Status
- Packliste
- Travel Banner
- Product Follow-up

Abnahme:

- Status nie nur farbcodiert

## D09 — Commerce UI

Aufgaben:

- Product Card
- Product Row
- Price Meta
- Affiliate Disclosure
- Comparison Layout

Abnahme:

- Werbung/Affiliate eindeutig erkennbar

## D10 — Health / Spielzeug / Futter

Aufgaben:

- Health Landing
- Spielzeug Finder
- Futter Vergleich
- Filter
- Product reasons
- Info/Medical disclaimers

Abnahme:

- keine unbelegten Gesundheits-/Eignungsclaims

## D11 — Editorial

Aufgaben:

- Article Card
- Article Template
- Author/Review Meta
- Sources
- Related content

Abnahme:

- gute Lesbarkeit auf Mobile/Desktop

## D12 — Responsive QA

Pflichtbreiten:

```text
360
390
430
768
1024
1280
1440
```

Abnahme:

- keine horizontale Overflow-Probleme
- keine abgeschnittenen CTAs
- keine unlesbaren Cards

## D13 — Accessibility QA

Aufgaben:

- Keyboard Flows
- Focus
- Contrast
- Screen Reader Labels
- Dynamic Announcements
- Reduced Motion

Abnahme:

- Kernflows WCAG 2.2 AA-orientiert

## D14 — Performance & Visual Polish

Aufgaben:

- Bildgrößen
- CLS
- JS-Budget
- Hover/Motion
- Cross-browser
- finaler visueller Vergleich mit Referenz

Abnahme:

- Design wirkt wie ein zusammenhängendes Produkt
- keine Seite fällt in die alte generische „Blogcard“-Optik zurück

---

# 37. Statusformat für Claude Code

Wenn der Nutzer nach dem Designfortschritt fragt, soll Claude Code folgendes Format verwenden:

```text
Design-Meilenstein: D04 — Homepage
Status: in_progress
Erledigt: 4/6 Teilbereiche

Fertig:
- Hero
- Tool Dock
- Feature Modules
- Travel Banner

Offen:
- Product Section
- responsive Visual QA

Letzter geprüfter Viewport:
390px / 1440px

Letzter Test:
[echter Test-/Build-Befehl]

Abweichungen von DESIGN_SPECIFICATIONS_V2.md:
[keine / konkrete Abweichung mit Begründung]

Nächster Schritt:
[konkret]
```

---

# 38. Definition of Done für jede visuelle Seite

Eine Seite gilt designseitig erst als fertig, wenn:

- [ ] richtige Tokens verwendet werden
- [ ] Header/Footer konsistent sind
- [ ] Mobile 360–430px geprüft ist
- [ ] Tablet geprüft ist
- [ ] Desktop 1280/1440 geprüft ist
- [ ] Fokuszustände vorhanden sind
- [ ] alle Bilder sinnvolle Alt-Strategie haben
- [ ] kein horizontaler Overflow besteht
- [ ] keine Layout Shifts durch Bilder auftreten
- [ ] Loading/Empty/Error State vorhanden ist, wenn relevant
- [ ] Quelle/Datenstand sichtbar ist, wenn datengetrieben
- [ ] Affiliate-/Werbeinhalte sichtbar gekennzeichnet sind
- [ ] keine erfundenen Trust-Zahlen/Bewertungen eingebaut sind
- [ ] keine unbelegten Health-/Produktclaims vorkommen
- [ ] `prefers-reduced-motion` berücksichtigt ist
- [ ] Design visuell zu `design-reference-homepage.png` passt

---

# 39. Was Claude Code ausdrücklich nicht tun soll

- nicht erneut ein eigenes Farbsystem erfinden
- nicht für jede Featureseite neue Cardstile bauen
- nicht überall Glassmorphism einsetzen
- nicht alle Sektionen mit Verläufen versehen
- nicht Bootstrap-/Admin-Dashboard-Optik erzeugen
- nicht jede freie Fläche mit Cards füllen
- nicht Icon + bunte Bubble + Shadow als universelles Muster verwenden
- nicht Hero-Bilder gegen generische Stockbilder austauschen
- keine imaginären Bewertungen oder Nutzerzahlen einsetzen
- keine Platzhaltertexte in Produktion belassen
- keine medizinischen Claims zur visuellen Dramatisierung erfinden
- keine Affiliate-CTA als neutrale fachliche Empfehlung tarnen
- keine Desktop-Oberfläche einfach auf Mobile zusammenschrumpfen
- keine großen UI-Frameworks nur für Standardkomponenten einführen

---

# 40. Finaler visueller Zielzustand

Die Seite soll nach Umsetzung nicht wie ein „Tierportal mit modernem Theme“ wirken, sondern wie eine eigenständige digitale Marke.

Der ideale erste Eindruck:

```text
1. Ich sehe sofort, was ich hier tun kann.
2. Das Produkt fühlt sich seriös und modern an.
3. Die Hunde-/Naturfotografie schafft Nähe und Freude.
4. Die Tools sehen wichtiger aus als Affiliate-Angebote.
5. Farben helfen mir bei Orientierung, ohne die Seite bunt zu machen.
6. Ergebnisse und Quellen wirken transparent.
7. Produkte sind nützlich integriert, aber nicht aufdringlich.
8. Mobile fühlt sich wie ein echtes Produkt an, nicht wie eine verkleinerte Website.
```

Kurzform der Designformel:

> **Premium Utility + warme Tier-Mensch-Emotion + klare Datenvertrauenssignale + zurückhaltender Commerce.**

Das ist die verbindliche Richtung für die weitere Umsetzung.
