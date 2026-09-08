# DESIGN SPECIFICATIONS — PetAtlas

**Version:** 1.0  
**Stand:** 8. September 2026  
**Status:** Verbindliche UI/UX-Spezifikation für das Deutschland-MVP  
**Gilt für:** M04, M08, M09, M11, M12, M13, M14, M15, M16, M18 und alle daraus entstehenden UI-Komponenten  
**Technischer Rahmen:** Astro, TypeScript, statische Ausgabe, kleine clientseitige Interaktionen, kein UI-Framework als Pflichtabhängigkeit

---

## 0. Zweck dieses Dokuments

Dieses Dokument ist der visuelle und funktionale Designvertrag für die Haustierplattform. Es soll Claude Code ermöglichen, die Oberfläche über längere Zeit autonom und konsistent umzusetzen, ohne bei jeder Seite neue Designentscheidungen zu treffen.

Die Plattform soll sich **ruhig, hochwertig, vertrauenswürdig, modern und nützlich** anfühlen. Sie ist weder ein verspielter Tierblog noch ein aggressiver Affiliate-Shop. Der primäre Eindruck soll sein:

> „Hier bekomme ich belastbare Informationen und praktische Werkzeuge für mein Tier — schnell, transparent und ohne Verkaufsdruck.“

Die Nutzeroberfläche priorisiert daher in dieser Reihenfolge:

1. **Verständlichkeit**
2. **Vertrauen**
3. **Aufgabenerfolg**
4. **Zugänglichkeit**
5. **Geschwindigkeit**
6. **visuelle Eleganz**
7. **Monetarisierung**

Monetarisierung darf diese Reihenfolge nicht umkehren.

### Verbindlichkeit

Wenn Implementierungsdetails dieses Dokuments mit einer späteren fachlichen, rechtlichen oder technischen Anforderung kollidieren, hat die sichere/fachlich korrekte Lösung Vorrang. Abweichungen von den grundlegenden Designprinzipien, Tokens oder Komponentenmustern müssen jedoch dokumentiert werden.

Claude Code soll **keine neue Designrichtung pro Feature erfinden**. Neue Seiten werden aus den hier definierten Layouts, Komponenten, Tokens und Interaktionsmustern zusammengesetzt.

---

# 1. Designziel und Markencharakter

## 1.1 Gewünschte Markenwirkung

PetAtlas soll visuell folgende Eigenschaften vermitteln:

- kompetent
- freundlich
- sachlich
- ruhig
- modern
- transparent
- tiernah, aber nicht kindlich
- kommerziell nutzbar, aber nicht verkäuferisch
- technisch/datengetrieben, ohne technisch kalt zu wirken

Die Seite soll eher an ein hochwertiges Verbraucherportal bzw. digitales Utility-Produkt erinnern als an einen redaktionellen Lifestyle-Blog.

## 1.2 Was das Design ausdrücklich nicht sein soll

Nicht verwenden:

- verspielte Pfotenmuster als Hintergrund
- Comic-Tiere als primäre Gestaltungssprache
- übermäßig abgerundete „Bubble“-UI
- Neonfarben
- laute Farbverläufe
- mehrfarbige CTA-Landschaft
- aggressive Countdown-/Knappheitselemente
- blinkende Hinweise
- Fake-Siegel
- Fake-Bewertungen
- übergroße Shop-Banner
- dunkle Pattern, die Affiliate-Links wie neutrale Empfehlungen aussehen lassen
- „Testsieger“-Badges ohne reale, dokumentierte Methodik
- „perfekt für deinen Hund“, wenn die Eignung nicht belastbar belegt ist
- Angst-Kommunikation bei Gesundheits- oder Versicherungsthemen

## 1.3 Markenprinzip: „Calm utility“

Der visuelle Stil folgt dem Prinzip **Calm Utility**:

- viel Weißraum
- warme, leicht gebrochene Hintergrundfarbe
- tiefe grüne Primärfarbe
- klare Typografie
- wenige, bewusst eingesetzte Akzentfarben
- schmale Borders statt starker Schatten
- großzügige, aber nicht verschwenderische Abstände
- Daten und Ergebnisse prominent, Erklärung sekundär
- Verkaufsflächen klar gekennzeichnet und visuell leicht zurückgenommen

---

# 2. UX-Grundsätze

## UX-01 — Aufgabe vor Content

Bei Tools wie Tierarztkosten-Rechner, Reisecheck oder Spielzeug-Finder sieht der Nutzer den Einstieg in die Aufgabe **oberhalb langer Erklärungstexte**.

Nicht:

```text
H1
1200 Wörter SEO-Text
FAQ
Rechner
```

Sondern:

```text
H1 + kurze Erklärung
Tool / primäre Aktion
Ergebnis
Erklärung / Methodik / FAQ / Quellen
```

## UX-02 — Eine primäre Aktion pro Bereich

Jeder sichtbare Bereich soll eine klar erkennbare Hauptaktion haben.

Beispiele:

- „Kosten berechnen“
- „Reise prüfen“
- „Orte anzeigen“
- „Passendes Spielzeug finden“
- „Angebot ansehen“

Keine Reihe aus vier optisch gleich starken Buttons.

## UX-03 — Progressive Disclosure

Komplexe Informationen werden stufenweise sichtbar.

Standard:

1. wichtigstes Ergebnis
2. kurze Begründung
3. Details auf Wunsch
4. Methodik und Quellen

Dies ist insbesondere wichtig bei GOT-Berechnungen, Reiserichtlinien, Datenquellen und Produktmerkmalen.

## UX-04 — Kein Dead End

Jeder Zustand braucht einen sinnvollen nächsten Schritt.

Beispiele:

- Keine Karten-Treffer → Radius ändern / Kategorie entfernen
- Reise nicht unterstützt → unterstützte Ziele anzeigen
- Produktdaten fehlen → neutral erklären und andere passende Produkte anzeigen
- GOT-Position nicht gefunden → Suche ändern / Gebührenkatalog öffnen

## UX-05 — Unbekannt bleibt unbekannt

Die UI darf Unsicherheit nicht verstecken.

Verwende definierte Zustände:

- bestätigt
- nicht zutreffend
- unbekannt
- noch nicht geprüft
- nicht unterstützt

„Unbekannt“ wird niemals visuell wie „Nein“ oder „alles okay“ dargestellt.

## UX-06 — Quellen direkt am Ergebnis

Bei datengetriebenen Ergebnissen muss der Nutzer nicht bis in den Footer scrollen, um zu verstehen, woher eine Information stammt.

Jede wichtige Ergebnisfläche hat mindestens:

- Datenstand
- Quelle bzw. Quellenlink
- kurze Methodik-/Hinweisoption

## UX-07 — Werbung bleibt Werbung

Affiliate- und Anzeigenflächen dürfen nicht mit neutralen Informationskarten verwechselt werden.

Jede kommerzielle Fläche erhält eine sichtbare Kennzeichnung wie:

- `Werbelink`
- `Anzeige`
- `Affiliate-Partner`

Nicht nur über ein `title`-Attribut, Tooltip oder Footer-Hinweis.

## UX-08 — Mobile ist der Primärfall

Alle Features werden zuerst für 360–430 px breite Geräte gedacht. Desktop nutzt den zusätzlichen Raum für parallele Informationen, nicht für kleinere Schrift oder dichtere UI.

## UX-09 — Nutzer nicht zwingen, ein Profil anzulegen

Alle Kernwerkzeuge funktionieren ohne Konto und ohne Pet-Profil. Das lokale Profil ist Komfortfunktion, kein Gate.

## UX-10 — Fehler verhindern, nicht nur melden

Wann immer möglich:

- ungültige Optionen gar nicht anbieten
- Einheiten explizit beschriften
- Datumsfelder begrenzen
- abhängige Felder automatisch korrekt setzen
- bereits gewählte Werte erhalten

---

# 3. Visuelle Grundsprache

## 3.1 Farbpalette

Die Plattform verwendet eine warme neutrale Basis mit einem tiefen Evergreen als Markenfarbe.

### Core Colors

| Token | Wert | Verwendung |
|---|---:|---|
| `--color-ink` | `#19231F` | primärer Text, Headlines |
| `--color-text` | `#27332E` | normaler Bodytext |
| `--color-text-muted` | `#64726C` | sekundärer Text |
| `--color-bg` | `#F7F8F5` | Seitenhintergrund |
| `--color-surface` | `#FFFFFF` | Karten, Inputs, Panels |
| `--color-surface-subtle` | `#F0F3F1` | sekundäre Flächen |
| `--color-border` | `#DDE3DF` | Standardborder |
| `--color-border-strong` | `#C8D1CC` | hervorgehobene Border |

### Brand / Primary

| Token | Wert | Verwendung |
|---|---:|---|
| `--color-primary` | `#0E6B55` | Primärbutton, aktive Elemente |
| `--color-primary-hover` | `#0A5745` | Hover |
| `--color-primary-active` | `#074537` | Active |
| `--color-primary-soft` | `#EAF6F1` | dezente Markenfläche |
| `--color-primary-border` | `#BFDCCD` | Border auf Soft-Flächen |

### Semantische Farben

| Zustand | Text/Icon | Fläche | Border |
|---|---|---|---|
| Erfolg | `#12633E` | `#EAF7F0` | `#BFE3CE` |
| Info | `#1E5C98` | `#EDF5FC` | `#C9DFF2` |
| Warnung | `#7A4A00` | `#FFF5DC` | `#EDD49B` |
| Fehler | `#9B1C1C` | `#FDECEC` | `#E9B9B9` |

### Kommerzielle Kennzeichnung

Affiliate-Flächen verwenden **keine eigene aggressive Verkaufsfarbe**. Sie bleiben visuell in der neutralen/primären Palette.

Kennzeichnung:

```text
Werbelink
```

als kleines Label in `--color-text-muted` oder `--color-primary`, aber immer sichtbar.

### Farbregeln

1. Primärgrün ist die einzige reguläre starke CTA-Farbe.
2. Rot ausschließlich für Fehler/Gefahr, niemals für Sales-Dringlichkeit.
3. Orange/Gelb ausschließlich für echte Warn-/Hinweiszustände.
4. Blau für neutrale Information und Links in Sonderkontexten.
5. Status darf niemals nur über Farbe vermittelt werden; immer Text oder Icon ergänzen.
6. Kein Text in `--color-text-muted` kleiner als 14 px auf `--color-bg`, sofern nicht dekorativ.

## 3.2 CSS Tokens

Claude soll mindestens folgende Datei anlegen:

`src/styles/tokens.css`

```css
:root {
  --color-ink: #19231f;
  --color-text: #27332e;
  --color-text-muted: #64726c;

  --color-bg: #f7f8f5;
  --color-surface: #ffffff;
  --color-surface-subtle: #f0f3f1;

  --color-border: #dde3df;
  --color-border-strong: #c8d1cc;

  --color-primary: #0e6b55;
  --color-primary-hover: #0a5745;
  --color-primary-active: #074537;
  --color-primary-soft: #eaf6f1;
  --color-primary-border: #bfdccd;

  --color-success: #12633e;
  --color-success-soft: #eaf7f0;
  --color-success-border: #bfe3ce;

  --color-info: #1e5c98;
  --color-info-soft: #edf5fc;
  --color-info-border: #c9dff2;

  --color-warning: #7a4a00;
  --color-warning-soft: #fff5dc;
  --color-warning-border: #edd49b;

  --color-danger: #9b1c1c;
  --color-danger-soft: #fdecec;
  --color-danger-border: #e9b9b9;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-32: 8rem;

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(18, 31, 25, 0.06);
  --shadow-sm: 0 4px 14px rgba(18, 31, 25, 0.07);
  --shadow-md: 0 12px 32px rgba(18, 31, 25, 0.10);

  --content-max: 74rem;
  --content-reading: 46rem;
  --header-height-mobile: 4rem;
  --header-height-desktop: 4.5rem;

  --focus-ring: 0 0 0 3px rgba(30, 92, 152, 0.28);

  --transition-fast: 120ms;
  --transition-normal: 180ms;
}
```

Keine zufälligen neuen Hex-Werte in Feature-CSS. Neue Farben benötigen einen semantischen Token.

---

# 4. Typografie

## 4.1 Font Stack

Das MVP verwendet **Systemfonts** für Geschwindigkeit, Datenschutz und Robustheit.

```css
font-family:
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Keine externe Google-Font-Abhängigkeit im MVP.

## 4.2 Typografische Skala

### H1 — Page title

Desktop:

```css
font-size: 3rem;       /* 48px */
line-height: 1.08;
font-weight: 720;
letter-spacing: -0.035em;
```

Mobile:

```css
font-size: 2.25rem;    /* 36px */
line-height: 1.1;
```

Maximale Breite: `18ch` bei großen Marketing-/Tool-H1s.

### H2

Desktop: `2.25rem / 1.16 / 700`  
Mobile: `1.75rem / 1.2 / 700`

### H3

`1.5rem / 1.3 / 680`

### H4

`1.25rem / 1.35 / 650`

### Body

`1rem / 1.6 / 400`

### Lead

`1.125rem / 1.6 / 400`

### Small

`0.875rem / 1.45`

### Micro / Label

`0.8125rem / 1.4 / 600`

Nicht kleiner als 13 px für informationstragenden Text.

## 4.3 Lesbarkeit

- Fließtext: maximal `68ch`
- Tool-Erklärungen: maximal `60ch`
- Überschriften niemals vollständig in Versalien
- Buttons: normale Schreibweise, keine ALL CAPS
- Geldwerte: `font-variant-numeric: tabular-nums`
- Datums-/Zahlenkolonnen ebenfalls tabellarische Ziffern
- deutsche Zahlendarstellung: `1.234,56 €`
- keine künstlich komprimierte Schrift oder negative Letterspacing-Werte unter `-0.04em`

---

# 5. Spacing und Rhythmus

Grundraster: **4 px**.

Primärabstände:

| Einsatz | Abstand |
|---|---:|
| Icon ↔ Label | 8 px |
| Label ↔ Feld | 8 px |
| Feld ↔ Hilfetext | 8 px |
| zwei Formfelder | 20–24 px |
| Card Innenabstand mobil | 20 px |
| Card Innenabstand Desktop | 24–32 px |
| Sektion innerhalb Tool | 32–40 px |
| Hauptsektionen mobil | 56–64 px |
| Hauptsektionen Desktop | 80–96 px |
| H2 ↔ Introtext | 12–16 px |
| Sektionstitel ↔ Inhalt | 24–32 px |

Regel: Nicht durch 7, 13, 18 oder andere spontane Zwischenwerte gestalten, sofern kein technischer Grund besteht.

---

# 6. Grid, Container und Breakpoints

## 6.1 Breakpoints

Die Implementierung verwendet genau diese Layoutschwellen:

```text
0–479 px       small mobile
480–767 px     large mobile
768–1023 px    tablet
1024–1279 px   small desktop
1280+ px       desktop
```

Keine feature-spezifischen Breakpoints ohne dokumentierten Grund.

## 6.2 Globaler Container

```css
.page-container {
  width: min(100% - 2rem, 74rem);
  margin-inline: auto;
}
```

Ab 768 px darf der seitliche Abstand auf 32 px steigen.

Große Karten-/Vergleichsseiten dürfen einen Wide-Container von maximal `90rem` verwenden.

## 6.3 Reading Container

Artikel, Methodik, Quellen und längere Erklärungen:

```css
max-width: 46rem;
```

Lange Fließtexte niemals auf die komplette 1184-px-Breite ziehen.

## 6.4 Desktop Grid

12 Spalten, Gap 24 px.

Typische Tool-Seite:

```text
| 4 Spalten Input / Navigation | 8 Spalten Ergebnis |
```

Bei umfangreicherem Ergebnis:

```text
| 5 Spalten Input | 7 Spalten Ergebnis |
```

## 6.5 Mobile

Alle zweispaltigen Tool-Layouts werden unter 768 px **einspaltig**.

Sticky Elemente dürfen nicht mehr als ca. 20 % der sichtbaren Bildschirmhöhe blockieren.

---

# 7. Oberflächen, Borders, Radien und Schatten

## 7.1 Cards

Standardkarte:

```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: var(--radius-lg);
box-shadow: none;
```

Hover bei klickbaren Karten:

```css
border-color: var(--color-border-strong);
box-shadow: var(--shadow-sm);
transform: translateY(-1px);
```

Nur bei Pointer-Geräten und wenn `prefers-reduced-motion` nicht aktiv ist.

## 7.2 Schattenregel

Schatten dienen Hierarchie, nicht Dekoration.

- normale Card: kein Shadow
- Popover / Dropdown: `--shadow-md`
- Sticky Result Panel: `--shadow-xs` oder Border
- Modal/Dialog: `--shadow-md`

## 7.3 Radien

- Inputs: 10–12 px
- Buttons: 10–12 px
- Cards: 16 px
- große Hero-/Featureflächen: 20 px
- Badges/Chips: Pill

Keine 30–40 px Radien für reguläre Karten.

---

# 8. Iconografie und Bildsprache

## 8.1 Icons

Bevorzugt: schlanke Outline-Icons mit konsistenter Strichstärke.

Empfohlen:

- Lucide Icons oder äquivalente interne SVGs
- Standardgröße 20 px
- Tool-/Featureicon 24 px
- Heroicon max. 32 px
- Stroke ungefähr 1.75–2 px

Icons erhalten bei Buttons mit Text in der Regel `aria-hidden="true"`.

## 8.2 Tiere als Icons

Tierarten dürfen durch neutrale Icons unterstützt werden, aber nie nur visuell identifiziert werden.

Immer:

```text
[Hund-Icon] Hund
[Katze-Icon] Katze
```

nicht nur Icons ohne Text.

## 8.3 Fotografie

Fotos sind unterstützend, nicht dominierend.

Wenn echte Produktfotos verwendet werden:

- nur bei vorhandenen Nutzungsrechten
- kein Cropping, das relevante Produkteigenschaften verfälscht
- neutraler Hintergrund bevorzugt
- `object-fit: contain` bei Produktbildern
- reservierte feste Bildfläche zur Vermeidung von Layout Shift

Editoriale Tierfotos sind im MVP optional. **Keine Stockfoto-Abhängigkeit nötig.** Ein hochwertiges Utility-Design darf bewusst fast vollständig ohne Hero-Fotografie funktionieren.

## 8.4 Logo

Bis eine Marke final freigegeben ist:

- schlichte Wortmarke „PetAtlas“ oder konfigurierbarer Projektname
- keine komplexe Logoentwicklung als Blocker
- Wortmarke links im Header
- kein Pfoten-Emoji als Logo

---

# 9. Globale Navigation

## 9.1 Desktop Header

Höhe: `72 px`.

Aufbau:

```text
[Logo]      Tierarztkosten   Karte   Reise   Produkte   Futter      [Suche] [Merkliste]
```

Regeln:

- Logo links
- Hauptnavigation mittig bzw. nach Logo
- Suche und Merkliste rechts
- maximale Zahl primärer Navpunkte: 5–6
- aktiver Bereich durch Textfarbe + 2 px Bottom/Inset Indicator, nicht nur Hintergrund
- Header background weiß mit Bottom Border
- sticky nur wenn im Browser getestet und ohne störende Sprünge; bevorzugt `position: sticky; top: 0`
- z-index unter Dialogen/Popovers

## 9.2 Mobile Header

Höhe: `64 px`.

```text
[Logo]                        [Suche] [Menü]
```

Das Menü öffnet ein einfaches Panel unterhalb des Headers oder ein zugängliches Dialogpanel.

Mobile Hauptlinks:

1. Tierarztkosten
2. Karte
3. Reisecheck
4. Spielzeug & Pflege
5. Futter
6. Merkliste
7. Quellen & Datenstand

Keine verschachtelte Mega-Navigation im MVP.

## 9.3 Breadcrumbs

Ab Ebene 2 einsetzen.

Beispiel:

```text
Startseite › Tierarztkosten › Allgemeine Untersuchung
```

- 14 px
- gedämpfte Farbe
- aktuelle Seite nicht verlinkt
- mobil horizontal umbrechen, nicht abschneiden

---

# 10. Footer

Der Footer ist funktional, nicht werblich.

Desktop 4 Spalten:

```text
PetAtlas
Kurzer Vertrauenssatz

Tools
- Tierarztkosten
- Karte
- Reisecheck

Produkte
- Pflege
- Spielzeug
- Futter

Transparenz
- Quellen
- Datenstand
- Affiliate-Hinweis
- Datenschutz
- Impressum
```

Unterkante:

```text
© Jahr Projektname · Datenstände je Tool können abweichen
```

Keine Social-Media-Icons, solange keine real betriebenen Kanäle existieren.

---

# 11. Buttons

## 11.1 Größen

### Medium — Standard

- Höhe mindestens 44 px
- Padding horizontal 18 px
- Font 15–16 px, Gewicht 650
- Radius 10 px

### Large

- Höhe 50–52 px
- Padding horizontal 22–24 px
- für zentrale Tool-CTA

### Small

- Höhe mindestens 36 px auf Desktop
- bei Touchflächen trotzdem Zielbereich 44 px sicherstellen

## 11.2 Varianten

### Primary

```text
Background: Primary
Text: White
Hover: Primary Hover
```

Für eine primäre Aktion pro Bereich.

### Secondary

```text
Background: White
Border: Border Strong
Text: Ink
```

### Soft

```text
Background: Primary Soft
Text: Primary Hover
```

### Ghost

Kein Hintergrund, für sekundäre Aktionen wie „Details“.

### Danger

Nur für Löschen/Zurücksetzen mit tatsächlicher Konsequenz.

## 11.3 Button Copy

Bevorzugt Verb + Objekt:

- „Kosten berechnen“
- „Reise prüfen“
- „Filter anwenden“
- „Auf Karte anzeigen“
- „Angebot ansehen“
- „Zur Merkliste hinzufügen“

Nicht:

- „Los!“
- „Jetzt zuschlagen“
- „Hier klicken“
- „Sofort sichern“

## 11.4 Loading State

Bei kurzen rein lokalen Berechnungen **kein künstlicher Spinner**.

Nur bei tatsächlich asynchronen Operationen:

- Button disabled
- Text z. B. „Karte wird geladen …“
- optional kleiner Spinner
- Labelbreite stabil halten

---

# 12. Links

Inline-Links sind klar erkennbar.

Standard:

- Farbe `--color-primary`
- Unterstreichung zumindest bei Fließtext
- Hover: dunkler
- sichtbarer Fokus

Nicht nur Farbunterschied ohne Unterstreichung bei langen Texten.

Externe Links können mit kleinem External-Link-Icon versehen werden.

Affiliate-Links erhalten zusätzlich die sichtbare Kennzeichnung im jeweiligen kommerziellen Block.

---

# 13. Formulare

## 13.1 Grundaufbau pro Feld

```text
Label
[Input                                ]
Hilfetext oder Fehler
```

Label niemals nur Placeholder.

## 13.2 Maße

- Inputhöhe: 48 px
- große Such-/Combobox: 52 px
- Padding: 12–14 px
- Border: 1 px
- Radius: 10 px
- Font: 16 px, damit Mobile-Browser nicht zoomen

## 13.3 Fokus

Fokuszustand:

```css
border-color: var(--color-info);
box-shadow: var(--focus-ring);
outline: none;
```

Für native Kontrollelemente darf `outline` genutzt werden; entscheidend ist ein klar sichtbarer 3-px-Fokusindikator.

## 13.4 Fehler

Fehlerzustand:

- rote Border
- Fehlericon optional
- Fehlertext direkt unter Feld
- zusätzlich Form-Error-Summary oben, wenn mehrere Fehler vorliegen

Beispiel:

```text
Gewicht
[ - ]
Bitte gib ein Gewicht zwischen 0,5 und 100 kg ein.
```

Nicht nur „Ungültig“.

## 13.5 Selects

Native `<select>` bevorzugen, sofern kein echter Suchbedarf besteht.

Custom Combobox nur bei langen Listen wie GOT-Positionen oder Produkt-/Ortssuche.

## 13.6 Radio Cards

Für kleine visuelle Entscheidungen wie Tierart oder Spieltyp:

```text
┌───────────────────┐   ┌───────────────────┐
│ ○ Hund            │   │ ○ Katze           │
│ kurze Erläuterung │   │ kurze Erläuterung │
└───────────────────┘   └───────────────────┘
```

- ganze Karte klickbar
- echtes Radio im DOM
- Checked: Primary Border + Soft Background
- keine Icons allein

## 13.7 Checkboxen

Mindestens 20x20 px visuell; gesamte Labelzeile klickbar.

## 13.8 Slider

Slider vermeiden, wenn exakte numerische Werte wichtig sind. Für GOT-Faktoren oder Gewicht bevorzugt Buttons/Input statt unpräzisem Range-Slider.

---

# 14. Chips und Filter

Chips nur für kurze Filter-/Statuswerte.

Beispiele:

```text
[ Hund × ] [ 10–25 kg × ] [ Apportieren × ]
```

Maße:

- min-height 36 px
- Border 1 px
- Radius Pill
- Padding 8/12 px

Aktive Filter werden oberhalb der Ergebnisliste zusammengefasst.

„Alle Filter löschen“ als Textbutton, nicht als primärer Button.

---

# 15. Badges und Statusanzeigen

## 15.1 Erlaubte Badge-Typen

- `Aktuell`
- `Datenstand: 06.09.2026`
- `Offizielle Quelle`
- `Nicht geprüft`
- `Nicht unterstützt`
- `Werbelink`

Badges sind klein, aber gut lesbar.

## 15.2 Kein Badge-Spam

Maximal 2–3 sichtbare Badges pro regulärer Karte.

Produktmerkmale sind eher als kurze Text-/Iconzeile als als 8 bunte Pills darzustellen.

---

# 16. Alert-/Hinweiskomponenten

Vier Varianten:

1. Info
2. Success
3. Warning
4. Error

Aufbau:

```text
[Icon] Titel
       1–3 Sätze Erklärung
       optionaler Link
```

Keine Hinweise länger als ca. 5 Zeilen ohne einklappbare Details.

## 16.1 Health-/Safety-Warnungen

Gesundheitsnahe Warnungen bleiben ruhig und konkret.

Gut:

> **Akute Beschwerden?** Dieser Rechner ersetzt keine tierärztliche Untersuchung. Bei einem Notfall wende dich direkt an eine Tierarztpraxis oder Tierklinik.

Nicht:

> ⚠️ ACHTUNG! DEIN HUND KÖNNTE IN GEFAHR SEIN!!!

---

# 17. Source / Provenance Component

Komponente: `DataSourceDisclosure.astro`

Jedes datengetriebene Tool benötigt eine standardisierte Quellenbox.

Collapsed State:

```text
Quelle & Datenstand                         [Details]
GOT · Stand 2022 / zuletzt geprüft 08.09.2026
```

Expanded:

```text
Quelle
Gebührenordnung für Tierärztinnen und Tierärzte (GOT)

Datenstand
...

Von uns verarbeitet
Parser-Version ...

Hinweis
Die Berechnung ist keine amtliche Auskunft.

[Originalquelle öffnen ↗]
```

Quellenkomponente nicht in Affiliate-Flächen verstecken.

---

# 18. Affiliate Disclosure

Komponente: `AffiliateDisclosure.astro`

Globale Kurzform oberhalb des ersten kommerziellen Blocks:

> **Hinweis zu Werbelinks:** Wenn du über einen gekennzeichneten Link etwas abschließt oder kaufst, können wir eine Provision erhalten. Für dich ändert sich der Preis dadurch nicht. Die Sortierung darf nicht allein von der Provision abhängen.

Auf Produktkarten zusätzlich klein:

`Werbelink`

## Design

- neutraler Background `surface-subtle`
- Border
- Text 14 px
- kein Warnungs-Gelb
- kein modal erzwingen

---

# 19. Ad-Slots

Display Ads dürfen das Produkt nicht dominieren.

## Regeln

1. Kein Display-Ad direkt zwischen Tool-Eingabe und Ergebnis.
2. Kein Ad innerhalb kritischer Health-/Safety-Warnungen.
3. Keine Ads, die wie Formularbuttons aussehen.
4. Keine sticky Video Ads im MVP.
5. Keine automatische Audio-/Video-Wiedergabe.
6. Platz für Ads vorab reservieren, um CLS zu vermeiden.
7. Anzeigen sichtbar als `Anzeige` kennzeichnen, falls Netzwerkkennzeichnung nicht ausreichend deutlich ist.

## Empfohlene Positionen

Desktop:

- nach erstem vollständigen Tool-Ergebnis / vor ergänzendem Ratgeber
- zwischen zwei längeren Content-Sektionen
- optional Sidebar nur auf redaktionellen Seiten, nicht im Kernformular

Mobile:

- nach Ergebniszusammenfassung
- danach höchstens in größeren Abständen zwischen Content-Sektionen

Keine Anzeigen oberhalb der primären Toolaktion auf Tierarztkosten- oder Reisecheck-Seiten.

---

# 20. Produktkarte

Komponente: `ProductCard.astro`

## 20.1 Desktop

```text
┌────────────────────────────────────────────────────┐
│ [ Bild 120x120 ]  Produktname                      │
│                  Marke                             │
│                  • Größe: M                        │
│                  • Waschbar                        │
│                  • Für Apportieren                 │
│                                                    │
│                  ab 29,99 €                        │
│                  bei Händler · Preisstand ...      │
│                  Werbelink      [Angebot ansehen]  │
└────────────────────────────────────────────────────┘
```

## 20.2 Mobile

Bild maximal 96x96 px neben den wichtigsten Informationen; CTA darunter über volle Breite.

## 20.3 Hierarchie

1. Produktname
2. relevante belegte Merkmale
3. Preis
4. Händler
5. CTA
6. Affiliatekennzeichnung

Nicht zuerst Rabattbanner oder Provision.

## 20.4 Preis

- Preis prominent, aber nicht riesig
- `font-weight: 700`
- alte Preise nur, wenn Feed ihre rechtmäßige Darstellung erlaubt
- Prozent-Rabatt nicht selbst errechnen, wenn Bezugs-/Vergleichspreis unsicher ist
- Preisstand anzeigen, wenn technisch verfügbar

## 20.5 Matching Explanation

Bei Finder-Ergebnissen:

```text
Warum angezeigt?
Passt zu: 10–25 kg · Apportieren · Outdoor
Nicht geprüft: Haltbarkeit bei sehr starkem Kauen
```

Das ist ein Kernbestandteil der Differenzierung.

---

# 21. Ergebnis-Card / Result Summary

Komponente: `ResultSummary.astro`

Für Rechner und Checks.

Aufbau:

```text
Eyebrow / Status
Hauptwert bzw. Ergebnis
1–2 Sätze Einordnung

[primäre nächste Aktion] [sekundäre Aktion]

Datenstand · Quellen
```

Beispiel Tierarztkosten:

```text
Geschätzte Gebühren
82,40 € – 164,80 €

Auf Basis der ausgewählten GOT-Positionen und des gewählten Gebührensatzes.
Zusätzliche Leistungen können den tatsächlichen Rechnungsbetrag verändern.
```

Wichtig: Bei Bandbreiten immer klar erklären, was die Grenzen repräsentieren.

---

# 22. Tool Shell

Komponente: `ToolShell.astro`

Tool-Seiten nutzen eine konsistente Struktur.

Desktop:

```text
Breadcrumbs

H1
Kurze Erklärung
Trust/Source teaser

┌────────────────────┬────────────────────────────────┐
│ INPUT PANEL        │ RESULT PANEL                   │
│                    │                                │
│ Felder / Schritte  │ Ergebnis / Preview             │
│                    │                                │
└────────────────────┴────────────────────────────────┘

Methodik
FAQ
Quellen
weiterführende Inhalte
```

Mobile:

```text
Breadcrumbs
H1
Intro

INPUT

CTA

RESULT

Details
Methodik
FAQ
```

Auf Desktop darf das Ergebnispanel innerhalb der Tool-Fläche sticky sein, wenn seine Höhe den Viewport nicht überschreitet. Sonst keine sticky Positionierung.

---

# 23. Startseite — exakte Struktur

Route: `/de-de/`

## 23.1 Hero

Keine riesige Fotobühne.

Desktop:

```text
----------------------------------------------------------
Praktische Daten für Tierhalter

Besser entscheiden für dein Tier.
Kosten, Orte, Reisen und Produkte verständlich geprüft.

[ Tierarztkosten berechnen ] [ Reisecheck starten ]

Aktuelle Daten · transparente Quellen · keine Anmeldung nötig
----------------------------------------------------------
```

Layout:

- Textblock max 760 px
- H1 max 14–16 Wörter
- Hero Padding top 72–88 px, bottom 56–72 px
- optional rechts eine abstrakte, sehr dezente Icon-/Datenillustration; nicht erforderlich
- Hintergrund: `--color-primary-soft` oder sehr dezenter Verlauf in `--color-bg`

Primary CTA: Tierarztkosten  
Secondary CTA: Reisecheck

## 23.2 Tool Grid

Vier zentrale Karten:

1. Tierarztkosten
2. Hunde-Karte
3. Reisecheck
4. Spielzeug & Pflege

Optional fünfte Karte Futter, wenn live.

Jede Karte:

- Icon
- Titel
- max 2 Sätze
- Textlink mit Pfeil
- keine große Produktwerbung

Desktop 2x2 oder 3+2 Grid, Mobile 1 Spalte.

## 23.3 „So helfen dir unsere Daten“

3 Schritte:

```text
1. Offizielle und offene Quellen
2. Verständlich aufbereitet
3. Mit Datenstand und Herkunft
```

Keine unbelegten Trust-Zahlen wie „10.000 geprüfte Produkte“.

## 23.4 Produkt-/Affiliate-Einstieg

Erst nach den Utility-Tools.

Titel:

> Produkte nach nachvollziehbaren Eigenschaften finden

Cards für:

- Spielzeug
- Pflege
- Futter

Keine Shop-Wand auf der Startseite.

## 23.5 Transparenzbereich

Kompakt:

- Quellen
- Datenstand
- Wie wir Geld verdienen

---

# 24. Tierarztkosten-Rechner — exakte UX

Route: `/de-de/tierarztkosten/`

Dies ist das wichtigste Trust-Feature.

## 24.1 Page Header

Eyebrow:

`Tierarztkosten · GOT`

H1:

> Tierarztkosten nach GOT berechnen

Lead:

> Wähle Tierart, Leistungen und Gebührensatz. Du siehst nachvollziehbar, wie sich die Schätzung zusammensetzt.

Darunter kompakte Info:

`Datenstand ... · Quelle: GOT · keine amtliche Auskunft`

## 24.2 Desktop Layout

Links 5 Spalten:

- Tierart
- Behandlungskontext
- Leistungssuche
- ausgewählte Leistungen
- Gebührensatz/Faktor

Rechts 7 Spalten:

- Live-Zusammenfassung
- Breakdown
- nicht enthaltene Kosten
- Quelle

## 24.3 Mobile Ablauf

Nicht 12 Felder gleichzeitig zeigen.

Reihenfolge:

1. Tier auswählen
2. Leistungen auswählen
3. Gebührensatz/Kontext
4. Ergebnis

Der Nutzer darf zwischen Schritten zurückgehen, ohne Datenverlust.

## 24.4 Leistungssuche

Combobox:

```text
Leistung suchen
[ z. B. allgemeine Untersuchung                  ]
```

Result list:

```text
Allgemeine Untersuchung mit Beratung
GOT-Nr. ...
Grundbetrag ...
[Hinzufügen]
```

Suchtreffer zuerst nach Textrelevanz, nicht nach Affiliatepotenzial.

## 24.5 Ausgewählte Positionen

Jede Zeile:

```text
Allgemeine Untersuchung
1 × 23,62 €                         [Entfernen]
```

Optional Menge über Stepper/Input.

## 24.6 Ergebnis

Prominente Summary:

```text
Voraussichtlicher Rechnungsbetrag
XX,XX €
```

Wenn unterschiedliche Faktoren verglichen werden:

```text
1-fach     XX,XX €
2-fach     XX,XX €
3-fach     XX,XX €
```

Nicht automatisch „Minimum/Maximum“, wenn dies fachlich missverständlich wäre. Die Beschriftung muss dem Rechenmodell entsprechen.

Breakdown:

```text
Leistungen                   XX,XX €
Zuschläge                    XX,XX €
Umsatzsteuer                 XX,XX €
-----------------------------------
Gesamt                       XX,XX €
```

## 24.7 Uncertainty Block

Direkt nach Ergebnis:

> **Was kann zusätzlich berechnet werden?** Medikamente, Materialien, Laborleistungen und weitere tatsächlich erbrachte Leistungen können hinzukommen.

Details einklappbar.

## 24.8 Versicherungs-Affiliate

Nicht direkt als Teil der Rechnung darstellen.

Erst **nach** vollständig erklärtem Ergebnis und Hinweisblock.

Visuelle Trennung:

```text
────────────────────────────────
Affiliate-Partner
Tierkrankenversicherung informieren
Kurzer neutraler Text
[Zum Anbieter]
Werbelink
────────────────────────────────
```

Keine Formulierung wie:

> „Diese Versicherung hätte deine Rechnung bezahlt.“

wenn das nicht konkret und rechtlich/fachlich geprüft ist.

## 24.9 Druck

Druckversion:

- Logo/Projektname klein
- Datum der Berechnung
- ausgewählte GOT-Positionen
- Faktoren
- Gesamtergebnis
- Quellen-/Datenstand
- Disclaimer
- keine Display Ads
- Affiliateblöcke standardmäßig nicht drucken

---

# 25. GOT-Leistungsdetailseite

Route: `/de-de/tierarztkosten/<slug>/`

Struktur:

1. Breadcrumb
2. H1
3. kurze neutrale Erklärung
4. Gebührenkarte
5. „Im Rechner verwenden“ CTA
6. Was ist enthalten / nicht enthalten, sofern fachlich geprüft
7. Quelle & Stand
8. FAQ

Gebührenkarte:

```text
GOT-Grundbetrag
23,62 €

1-fach   23,62 €
2-fach   47,24 €
3-fach   70,86 €
```

Keine Werbung zwischen H1 und Gebühreninformation.

---

# 26. Hunde-Karte — exakte UX

Route: `/de-de/karte/`

## 26.1 Grundprinzip

**Liste zuerst, Karte optional.**

Die Seite muss ohne geladenen Kartenprovider vollständig nutzbar bleiben.

## 26.2 Page Header

H1:

> Tierorte in deiner Nähe finden

Lead:

> Finde Tierärzte, Tierkliniken, Hundewiesen und weitere erfasste Orte. Daten können je Region unterschiedlich vollständig sein.

## 26.3 Mobile

Standard: Listenansicht.

Top Controls:

```text
[ Ort oder PLZ suchen                     ]
[ Kategorie ▾ ] [ Radius ▾ ]

[ Liste ] [ Karte laden ]
```

Karte wird erst auf Nutzeraktion geladen.

## 26.4 Desktop

Nach Suchaktion:

```text
┌──────────────────────────┬───────────────────────────────┐
│ Filter + Trefferliste    │ Karte                         │
│ 40 %                     │ 60 %                          │
└──────────────────────────┴───────────────────────────────┘
```

Kartenhöhe mindestens 620 px, maximal passend zum Viewport.

## 26.5 Place Card

```text
Tierarzt Mustername
Tierarztpraxis
1,8 km
Musterstraße 10 · Berlin

Quelle: OpenStreetMap · Stand ...
[Details] [Auf Karte]
```

Öffnungszeiten nur zeigen, wenn tatsächlich als ausreichend verlässlich vorhanden; keine „jetzt geöffnet“-Logik ohne robusten Parser/Zeitzonenlogik.

## 26.6 Geolocation

Kein automatischer Browser-Permission-Prompt.

Button:

`Meinen Standort verwenden`

Erklärung klein darunter:

> Dein Standort wird nur für die Suche in deinem Browser verwendet, sofern dies der tatsächlichen Implementierung entspricht.

## 26.7 Empty State

```text
Keine erfassten Treffer in diesem Bereich.
Das bedeutet nicht, dass dort keine passenden Orte existieren.

[Radius erhöhen] [Kategorie zurücksetzen]
```

---

# 27. Ortsseite

Route: `/de-de/orte/<stadt>/`

Nur bei Qualitäts-Allowlist.

Aufbau:

1. H1 „Mit Hund in Berlin: hilfreiche Orte und Daten“
2. kompakte lokale Fakten, nur belegt
3. Kategorien mit Trefferzahlen
4. Listen-/Karteneinstieg
5. ggf. kommunale Daten
6. lokale Regeln nur bei belastbarer Quelle
7. Datenabdeckung erklären
8. Quellen

Keine künstlichen 1000-Wörter-Ortstexte zur SEO-Streckung.

---

# 28. Reisecheck — exakte UX

Route: `/de-de/reisecheck/`

## 28.1 Ziel

Der Nutzer soll schnell verstehen:

- ob der konkrete Reiseweg vom Tool unterstützt wird
- welche Anforderungen er prüfen muss
- was erfüllt / offen / unbekannt ist
- welche offiziellen Quellen zugrunde liegen

## 28.2 Wizard

Vier Schritte:

```text
1 Reise
2 Tier
3 Angaben
4 Ergebnis
```

Stepper zeigt Text + Nummer. Kein rein visueller Progressbar.

### Schritt 1 — Reise

- Startland standardmäßig Deutschland
- Zielland
- Transit optional
- geplantes Reisedatum

### Schritt 2 — Tier

- Hund / Katze (nur unterstützte Tierarten)
- Alter bzw. Geburtsdatum, wenn für Regeln erforderlich

### Schritt 3 — relevante Angaben

Nur Fragen zeigen, die für den gewählten Kontext tatsächlich benötigt werden.

Beispiele:

- Mikrochip vorhanden?
- Tollwutimpfung gültig?
- Heimtierausweis vorhanden?

Keine medizinischen Fragen ohne Regelrelevanz.

### Schritt 4 — Ergebnis

Result Sections:

```text
Reisecheck für Deutschland → Italien
Reisedatum: ...

[Status Summary]

Erforderlich
✓ ...
! ...
? ...

Vor Reise prüfen
...

Offizielle Quellen
...
```

## 28.3 Statussprache

Verwende:

- `Erfüllt` — wenn Eingabe + Regel dies wirklich zulassen
- `Zu prüfen`
- `Angabe fehlt`
- `Nicht zutreffend`
- `Nicht unterstützt`

Nicht pauschal „Du darfst reisen“, wenn das Tool nur Teilanforderungen abbildet.

## 28.4 Packliste

Nach fachlichem Ergebnis separate Utility-Fläche:

```text
Reise-Packliste
□ Heimtierausweis
□ Wasser
□ Napf
□ Transportlösung
...
```

Offizielle Anforderungen und Komfortprodukte visuell trennen.

Affiliateprodukte kommen **unterhalb** der offiziellen Anforderungen und werden als optional bezeichnet.

---

# 29. Produktkatalog — Pflege und Health-Zubehör

Route: `/de-de/pflege/`

## 29.1 Intro

H1:

> Pflegeprodukte nach nachvollziehbaren Eigenschaften finden

Lead erklärt, dass die Plattform Produkte nach Hersteller-/Quelldaten filtert und keine Diagnose stellt.

## 29.2 Filter

Desktop Sidebar 280–320 px.

Filtergruppen:

- Tierart
- Kategorie
- Größe
- Material
- Waschbarkeit
- Anwendungsart
- Preisbereich nur bei stabilen Preisdaten

Mobile: Filterbutton öffnet Bottom Sheet/Dialog.

## 29.3 Ergebnisse

Standardansicht: vertikale Karten bzw. 2-spaltiges Grid ab ca. 900 px.

Nicht 4–5 kleine Ecommerce-Cards nebeneinander. Lesbarkeit ist wichtiger als maximale Produktdichte.

## 29.4 Health Boundary

Bei Produkten in gesundheitsnaher Kategorie sichtbarer neutraler Hinweis:

> Produktinformationen ersetzen keine tierärztliche Beratung. Medizinische Wirkung wird nur dargestellt, wenn sie aus zulässiger, belastbarer Quelle hervorgeht und fachlich freigegeben ist.

Keine rote Warnbox für normale Pflegeprodukte.

---

# 30. Spielzeug-Finder — exakte UX

Route: `/de-de/spielzeug/finder/`

## 30.1 Fragebogen

Maximal 5–6 Kernfragen im ersten Durchlauf.

Empfohlene Reihenfolge:

1. Tierart
2. Größe/Gewicht
3. Spielart
4. Nutzung Indoor/Outdoor
5. relevante Material-/Pflegepräferenz
6. optional Kauintensität nur mit sauberer Erklärung

Radio Cards statt lange Dropdowns.

## 30.2 Ergebnis

Header:

> Passende Treffer für deine Auswahl

Direkt darunter aktive Kriterien als Chips.

Jede Karte erklärt:

- warum angezeigt
- welche Datenquelle das Merkmal trägt
- was unbekannt ist

Keine interne „92 % Match“-Zahl, sofern sie nicht aus einer definierten, dokumentierten Methode entsteht.

## 30.3 Keine falsche Sicherheit

Nicht verwenden:

- unzerstörbar
- absolut sicher
- garantiert passend

Besser:

- laut Hersteller für Größe X vorgesehen
- für Apportierspiel beschrieben
- Material laut Produktangabe ...

---

# 31. Futtervergleich — exakte UX

Route: `/de-de/futter/`

## 31.1 Primäre Aufgabe

Suche zuerst.

```text
Hundefutter suchen
[ Marke, Produkt oder GTIN                       ]
```

Darunter optionale Kategorie-/Lebensphasenfilter nur bei belastbaren Feldern.

## 31.2 Produktdetail

```text
Produktname
Marke
Produktart
Packungsgröße

Angebote
Händler A   24,99 €   6,25 €/kg   [Ansehen]
Händler B   27,49 €   6,87 €/kg   [Ansehen]
```

Sortierung standardmäßig nach nachvollziehbarem Preisvergleich, sofern Varianten identisch sind.

Keine Provision als verdecktes Sortierkriterium.

## 31.3 Nährwert-/Labeldaten

Eigener Abschnitt:

> Deklarierte Produktdaten

Nicht als Healthscore darstellen.

Unbekannte Werte:

`Keine verlässliche Angabe vorhanden`

nicht `0`.

---

# 32. Produktdetailseite

Route: `/de-de/produkte/<slug>/`

Nur für Produkte mit hinreichender Datenqualität.

Aufbau:

1. Breadcrumb
2. Produktbild
3. Titel / Marke
4. wichtigste belegte Attribute
5. Angebotsliste
6. Affiliatehinweis
7. Produktdetails
8. „Für wen könnte es passen?“ nur attributbasiert
9. Quellen/Stand
10. Alternativen

Keine User-Sterne im MVP, solange keine echte Bewertungsdatenquelle besteht.

---

# 33. Search Experience

Globale Suche über statische Pagefind-Indizes.

## Desktop

Search Trigger rechts im Header.

Kann als dedizierte Suchseite oder zugängliches Overlay umgesetzt werden.

## Mobile

Tap auf Suche → vollständige Suchseite bevorzugt, wenn Overlay unnötig komplex wird.

## Ergebnisse

Jeder Treffer:

```text
Kategorie
Titel
Snippet
Pfad
```

Kategorien:

- Tierarztkosten
- Orte
- Reise
- Produkt
- Futter
- Ratgeber/Quelle

Keine Affiliateprodukte höher ranken, nur weil sie Provision generieren.

---

# 34. Lokales Tierprofil

Route: `/de-de/merkliste/` bzw. Profilbereich

## 34.1 Sprache

Nicht „Account“ nennen, da kein Serverkonto existiert.

Besser:

- „Mein Tierprofil auf diesem Gerät“
- „Merkliste“

## 34.2 Speicherung

Vor persistenter Speicherung klar erklären:

> Wenn du möchtest, speichern wir diese Angaben nur in diesem Browser auf diesem Gerät. Es wird dafür kein Konto erstellt.

Buttons:

- `Auf diesem Gerät speichern`
- `Ohne Speichern fortfahren`

## 34.3 Löschen

Immer sichtbar:

`Lokale Daten löschen`

Danger-Stil nur für endgültige Löschaktion.

---

# 35. Quellen- und Datenstandseiten

## 35.1 Quellen

Route: `/de-de/quellen/`

Tabellarisch/kartenbasiert:

```text
Quelle
Einsatz
Lizenz/Nutzungsgrundlage
letzter Abruf
letzte Prüfung
Link
```

Bei komplexen Lizenzangaben Details aufklappbar.

## 35.2 Datenstand

Route: `/de-de/datenstand/`

Nach Feature gruppieren:

```text
Tierarztkosten      Stand ...    aktuell
Karte               Stand ...    ...
Reise               geprüft ...
Produktpreise       aktualisiert ...
```

Status nur zeigen, wenn technisch korrekt ermittelt.

---

# 36. Empty, Loading und Error States

## 36.1 Empty State

Besteht aus:

- einfachem Icon optional
- konkret benanntem Zustand
- Erklärung
- sinnvoller Aktion

Keine traurigen Cartoon-Tiere nötig.

## 36.2 Loading

Statische Seiten sollten fast keinen Loading State benötigen.

Bei lazy geladenen Karten/JSON-Shards:

- Skeleton nur bei erwarteter Wartezeit > ca. 300 ms
- kein Fullscreen Loader
- bereits sichtbare Inhalte bleiben stehen

## 36.3 Error

Fehlertext beantwortet:

1. Was ist passiert?
2. Was kann Nutzer tun?
3. Bleiben vorhandene Daten erhalten?

Beispiel:

> Die Karte konnte gerade nicht geladen werden. Die Trefferliste darunter funktioniert weiterhin.

---

# 37. Dialoge, Popovers und Bottom Sheets

## 37.1 Dialoge sparsam einsetzen

Dialog nur für:

- irreversible lokale Löschaktion
- umfangreiche mobile Filter
- ggf. zusätzliche Detailansicht

Kein Dialog für normale Hinweise oder Affiliateoffenlegung.

## 37.2 Mobile Filter Bottom Sheet

- maximal 90vh
- sichtbarer Titel
- Close Button mindestens 44x44
- Body scrollt innerhalb
- Bottom Bar:

```text
[Zurücksetzen]        [23 Treffer anzeigen]
```

Fokus wird beim Öffnen gesetzt und beim Schließen zurückgeführt.

---

# 38. Responsive Verhalten — verbindliche Fälle

Claude Code testet mindestens diese Viewports:

```text
360 x 800
390 x 844
768 x 1024
1024 x 768
1440 x 900
```

Zusätzlich:

- 320 CSS px Breite
- 200 % Browserzoom auf Desktop

## Regeln

- Kein unbeabsichtigtes horizontales Scrolling.
- Tool-CTAs bleiben erreichbar.
- Header verdeckt keine fokussierten Elemente.
- Tabellen/Charts dürfen nur in bewusst markierten Scrollcontainern horizontal scrollen.
- Buttons dürfen umbrechen, statt Text abzuschneiden.
- Produktpreise niemals abgeschnitten.
- lange deutsche Wörter dürfen sinnvoll umbrechen (`overflow-wrap: anywhere` nur dort, wo nötig).

---

# 39. Accessibility — Pflicht, nicht optional

Ziel: mindestens WCAG 2.2 AA-orientierte Umsetzung.

## 39.1 Tastatur

Alle Funktionen ohne Maus nutzbar.

Reihenfolge logisch:

```text
Header → Breadcrumb → Main → Tool → Ergebnis → Ergänzung → Footer
```

Keine positive `tabindex`-Werte.

## 39.2 Skip Link

Erstes fokussierbares Element:

`Zum Hauptinhalt springen`

## 39.3 Fokus

Fokus niemals über `outline: none` entfernen, ohne gleichwertigen Ersatz.

## 39.4 Touch Targets

Interaktive Hauptflächen mindestens 44x44 px Zielgröße, sofern praktisch möglich.

## 39.5 Formulare

- sichtbares Label
- programmatische Zuordnung
- `aria-describedby` für Hilfe/Fehler
- Error Summary bei mehreren Fehlern
- Fokus auf Summary nach fehlgeschlagener Übermittlung

## 39.6 Dynamische Ergebnisse

Rechnerergebnisse in einem sinnvollen `aria-live="polite"`-Bereich ankündigen, aber nicht jede Tastatureingabe aggressiv vorlesen.

Empfehlung: Ergebnis erst nach expliziter Aktion oder debounced bedeutsamer Änderung ankündigen.

## 39.7 Icons

Dekorative Icons `aria-hidden=true`.

Icon-only Buttons brauchen zugänglichen Namen.

## 39.8 Karte

Jeder Karteninhalt, der für die Kernaufgabe relevant ist, muss auch über die Listenansicht erreichbar sein.

## 39.9 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Keine essentielle Information über Animation vermitteln.

---

# 40. Motion und Microinteractions

Motion ist subtil.

Erlaubt:

- 120–180 ms Hover-/Focus-Transitions
- 1 px Card Lift
- Accordion öffnen/schließen
- kleines Checkmark bei erfolgreicher lokaler Aktion

Nicht:

- Bounce
- Parallax
- animierte Zahlenzähler ohne Nutzen
- Confetti
- pulsierende Affiliatebuttons
- automatische Carousel-Bewegung

---

# 41. Content Design / Sprache

## 41.1 Ton

Deutsch, freundlich und klar.

Ansprache: `du` / `dein`, kleingeschrieben.

Bevorzugt:

> Wähle die Leistungen aus, die du vergleichen möchtest.

Nicht:

> Bitte selektieren Sie die gewünschten veterinärmedizinischen Positionen.

Aber fachliche Begriffe werden korrekt verwendet, wenn sie relevant sind.

## 41.2 Keine Verniedlichung

Nicht:

- Fellnase
- Wauzi
- Stubentiger als Standardbegriff
- Pfötchen-Check

Neutral:

- Hund
- Katze
- dein Tier

## 41.3 Ergebnisformulierungen

Keine übertriebene Gewissheit.

Gut:

- „Auf Basis deiner Auswahl ergibt sich …“
- „In unseren erfassten Quellen …“
- „Diese Angabe ist noch nicht geprüft.“
- „Zusätzliche Kosten können hinzukommen.“

Nicht:

- „Garantiert“
- „100 % sicher“
- „Das beste Produkt“
- „Du brauchst unbedingt …“

## 41.4 CTA-Sprache bei Affiliate

Gut:

- Angebot ansehen
- Zum Anbieter
- Tarife beim Anbieter ansehen
- Produktdetails ansehen

Nicht:

- Jetzt unbedingt absichern
- Nur heute
- Sofort kaufen
- Verpass das nicht

---

# 42. Informationshierarchie bei Health-Inhalten

Bei gesundheitsnahen Seiten gilt immer:

```text
1. neutrale Information
2. Einschränkungen / Warnzeichen, falls fachlich erforderlich
3. Quelle / Datenstand
4. optionale Produkte
```

Nicht:

```text
1. Produkt
2. Angsttext
3. Kaufen
4. Quelle irgendwo unten
```

Produkte dürfen nie so präsentiert werden, als würden sie eine medizinische Untersuchung ersetzen.

---

# 43. Versicherungsdarstellung

Versicherungen sind ein eigener kommerzieller Block.

## 43.1 Kein Ranking ohne Methodik

Wenn mehrere Versicherungen angezeigt werden und keine zulässige Vergleichsmethodik besteht:

- keine Plätze 1, 2, 3
- kein „Empfehlung“-Ribbon
- kein „Testsieger“
- neutrale Reihenfolge nach dokumentierter Regel

## 43.2 Card

```text
Affiliate-Partner
Anbietername
Kurze sachliche Beschreibung des Angebotsrahmens
[Tarife beim Anbieter ansehen]
Werbelink
```

Keine individuelle Aussage „passt zu deinem Tier“, solange rechtlich/fachlich nicht freigegeben.

---

# 44. Tabellen und Datenvisualisierung

## 44.1 Tabellen

Tabellen nur für echten Vergleich oder strukturierte Daten.

- Header klar
- Zahlen rechtsbündig
- Text linksbündig
- Zebra Striping nicht nötig; Borders und Spacing reichen
- Hover darf Zeile leicht markieren
- mobile horizontale Scrollcontainer mit sichtbarem Hinweis, wenn unvermeidbar

## 44.2 Cost Breakdown

Bevorzugt keine breite Tabelle, sondern responsive Breakdown-Liste:

```text
Allgemeine Untersuchung                         23,62 €
Menge 1 · Faktor 1,0

Röntgen ...                                     36,57 €
Menge 1 · Faktor 1,0
```

So bleibt die Rechnung mobil verständlich.

## 44.3 Charts

Charts nur, wenn sie eine Frage besser beantworten als Text/Tabelle.

Keine dekorativen Dashboards im MVP.

Wenn Preisverlauf später kommt:

- einfache Linie
- klare Achsen
- zugängliche Daten-Tabelle zusätzlich

---

# 45. SEO- und Content-Layouts

## 45.1 Tool-Seite

Reihenfolge:

1. Breadcrumb
2. H1
3. kurze Einordnung
4. Tool
5. Ergebnis
6. relevante Erklärung
7. FAQs
8. Quellen/Methodik
9. verwandte Tools

## 45.2 Editorial-/Detailseite

Maximaler Reading Container 46rem.

In längeren Texten:

- H2 alle sinnvollen 300–600 Wörter, nicht künstlich
- kurze Absätze
- Listen nur wenn tatsächlich listenartig
- Tabellen nur für Vergleiche
- keine Keyword-Blöcke

## 45.3 Related Content

Am Ende maximal 3–4 wirklich passende Links.

Keine 20 SEO-Linkkarten.

---

# 46. Performance als Designanforderung

Das Design darf die Static-first-Architektur nicht sabotieren.

## 46.1 Ziele

Für zentrale MVP-Seiten anstreben:

- initiales JS so klein wie sinnvoll
- keine globale Hydration für statische Komponenten
- keine UI-Bibliothek nur für Buttons/Cards
- Bilder mit `width`/`height`
- Lazy Loading unterhalb Fold
- Karte erst nach Nutzeraktion oder klarer Lazy-Strategie
- keine externen Fonts

## 46.2 Performance Budget

Richtwerte für Kernseiten vor Ads/Partner-Skripten:

- JS initial ideal < 100 KB gzip, harte Review-Schwelle 150 KB
- CSS initial ideal < 60 KB gzip
- kein einzelnes Hero-Bild > 250 KB ohne begründete Ausnahme
- keine unnötigen Third-Party-Skripte

Wenn ein Feature diese Budgets deutlich überschreitet, dokumentiere Messung und Grund.

## 46.3 Layout Shift

Alle dynamischen Flächen reservieren Platz:

- Produktbilder
- Ads
- Result Panels
- Lazy Map Container

---

# 47. CSS-Architektur

Empfohlene Dateien:

```text
src/styles/
  tokens.css
  reset.css
  base.css
  typography.css
  utilities.css
  print.css
```

Komponentenspezifische Styles dürfen in Astro-Komponenten scoped sein.

## Regeln

1. Kein Tailwind im MVP, sofern nicht per neuer ADR entschieden.
2. Keine CSS-in-JS-Library.
3. Keine unkontrollierten globalen Utility-Klassen.
4. Farben immer über Tokens.
5. Spacing bevorzugt über definierte Scale.
6. `!important` nur für eng begründete Accessibility-/Print-Fälle.
7. Keine IDs für Styling.
8. `:focus-visible` verwenden, ohne Tastaturfokus zu verstecken.
9. `:has()` nur, wenn ein robuster Fallback oder ausreichend unterstützte Zielbrowser dokumentiert sind.

---

# 48. Komponentenbibliothek — Mindestumfang

Claude soll wiederverwendbare Komponenten anlegen und **keine Seiten mit dupliziertem Markup-Design** bauen.

Empfohlener Mindestumfang:

```text
src/components/
  SiteHeader.astro
  MobileNav.astro
  SiteFooter.astro
  Breadcrumbs.astro
  PageHeader.astro
  SectionHeader.astro
  Button.astro
  IconButton.astro
  Card.astro
  Badge.astro
  Alert.astro
  Accordion.astro
  DataSourceDisclosure.astro
  DataFreshness.astro
  AffiliateDisclosure.astro
  AdSlot.astro
  EmptyState.astro
  ErrorState.astro
  LoadingState.astro

  forms/
    Field.astro
    TextInput.astro
    NumberInput.astro
    Select.astro
    Checkbox.astro
    RadioCard.astro
    Combobox.astro
    FormErrorSummary.astro

  tools/
    ToolShell.astro
    ToolStepper.astro
    ResultSummary.astro
    ResultBreakdown.astro
    ActiveFilters.astro

  commerce/
    ProductCard.astro
    OfferRow.astro
    PriceDisplay.astro
    MerchantBadge.astro
    MatchingReason.astro
    InsurancePartnerCard.astro
```

Komponenten nur abstrahieren, wenn sie mindestens realistisch wiederverwendbar sind. Keine abstrakte „SuperComponent“ mit 30 Props.

---

# 49. Komponenten-API-Prinzipien

- Props semantisch benennen, nicht nach CSS.
- `variant="warning"`, nicht `background="yellow"`.
- sensible Defaults
- unbekannte/fehlende Daten explizit behandeln
- kein HTML aus Datenquellen ungeprüft mit `set:html` rendern
- externe URLs validieren/normalisieren

Beispiel:

```ts
interface DataFreshnessProps {
  label?: string;
  asOf: string;
  status: 'current' | 'stale' | 'unknown';
  sourceName?: string;
}
```

---

# 50. States pro interaktiver Komponente

Für jede interaktive UI müssen mindestens geprüft werden:

```text
default
hover
focus-visible
active
selected
loading (falls relevant)
disabled
error (falls relevant)
```

Nicht erst am Ende hinzufügen.

---

# 51. Print Design

Relevant für:

- GOT-Berechnung
- Reisecheck
- Packliste

## Print Regeln

- Hintergrund weiß
- Text schwarz/dunkel
- Navigation/Footer-Navigation ausblenden
- CTA Buttons ausblenden oder als Klartext-Link nur wenn sinnvoll
- Ads ausblenden
- Affiliateprodukte standardmäßig ausblenden
- Quellen vollständig drucken
- Datum/Stand drucken
- keine abgeschnittenen Cards über Seitenumbruch, soweit CSS praktikabel

---

# 52. Datenschutz in der Oberfläche

Die UI darf Datenschutz nicht nur in `/datenschutz/` erklären.

Kontextuelle Hinweise bei:

- Standortabfrage
- lokaler Profilspeicherung
- externen Partnerlinks

Beispiele:

### Standort

> Dein Browser fragt erst nach deiner Freigabe nach dem Standort.

### lokales Profil

> Wird nur auf diesem Gerät gespeichert.

Nur verwenden, wenn die technische Implementierung dies tatsächlich garantiert.

---

# 53. Dark Mode

**Nicht Teil des MVP.**

Keinen halbfertigen automatischen Dark Mode implementieren.

Die Tokenstruktur soll eine spätere Theme-Erweiterung nicht unnötig erschweren, aber es werden zunächst nur Light-Theme-Styles abgenommen.

---

# 54. Internationalisierungs-Design

Obwohl zunächst Deutsch live ist, darf das Design keine deutschen Textlängen als harte Pixelannahme behandeln.

Regeln:

- Buttons dürfen wachsen/umbrechen
- keine fixen Breiten für Navlabels
- Formlabels nicht in feste 1-Zeilen-Höhen zwingen
- `lang` korrekt aus Market/Locale setzen
- Währung/Einheit über Formatter
- Flaggen nicht als alleinige Sprach-/Marktkennzeichnung

US-Markt kann später Englisch/USD/Imperial verwenden, ohne neue UI-Struktur zu benötigen.

---

# 55. Design für Vertrauen

Die Plattform soll Vertrauen **belegen**, nicht behaupten.

Gute Vertrauenselemente:

- sichtbare Quelle
- Datum der letzten Prüfung
- klare Methodik
- eindeutige Werbekennzeichnung
- Einschränkungen nennen
- keine erfundenen Autorenrollen
- kein „wissenschaftlich bewiesen“, wenn nicht belegt
- Fehler/Abdeckung transparent darstellen

Nicht verwenden:

- „100 % unabhängig“, wenn Affiliateerlöse bestehen
- „von Tierärzten empfohlen“, ohne echten Nachweis
- erfundene Logos von Medien/Verbänden
- künstliche Bewertungssterne

---

# 56. Design QA — visuelle Abnahme

Für jede neue Hauptseite muss Claude mindestens prüfen:

## Funktional

- primäre Aufgabe verständlich
- eindeutiger CTA
- Empty/Error/Unsupported State
- Datenstand/Quelle
- Affiliatekennzeichnung falls relevant

## Responsive

- 360x800
- 390x844
- 768x1024
- 1440x900

## Accessibility

- Tastatur
- Fokus
- Labels
- Screenreader-relevante Semantik
- Zoom 200 %
- Reduced Motion

## Visuell

- kein abgeschnittener Text
- keine ungewollten horizontalen Scrollbars
- konsistente Radien
- konsistente Buttonhöhen
- korrekte Tokenfarben
- keine zufälligen Shadows
- keine uneinheitlichen Section-Abstände

---

# 57. Screenshot-basierter Review-Prozess

Für M04-06 und später pro Hauptfeature:

Screenshots erzeugen für:

```text
home-mobile.png
home-desktop.png
costs-mobile.png
costs-desktop.png
map-mobile.png
map-desktop.png
travel-mobile.png
travel-desktop.png
catalog-mobile.png
catalog-desktop.png
```

Bei noch nicht existierenden Features nur vorhandene Seiten aufnehmen.

Review dokumentiert mindestens:

- Viewport
- Commit
- sichtbare Probleme
- korrigierte Probleme
- bekannte Restpunkte

Keine Screenshots als „passed“ markieren, ohne sie tatsächlich zu prüfen.

---

# 58. Visuelle Regression / Test-Selektoren

E2E-Tests dürfen sich nicht primär an zufälligen CSS-Klassennamen orientieren.

Bevorzugt:

- Rollen
- Labels
- sichtbarer Text
- stabile `data-testid` nur wenn semantische Selektoren unpraktisch sind

Visuelle Screenshots können für zentrale Templates eingesetzt werden, aber geringe Pixelabweichungen durch Systemfonts dürfen nicht zu unwartbaren Tests führen.

---

# 59. Definition of Done — Designsystem M04

M04-02 gilt erst als designseitig abgeschlossen, wenn:

- Tokens implementiert
- Base Typography implementiert
- Header/Footer responsive
- Buttons vollständig
- Formfelder vollständig
- Radio Cards
- Alerts
- Cards
- Badges
- ToolShell
- ResultSummary
- DataSourceDisclosure
- AffiliateDisclosure
- Empty/Error State
- sichtbarer Fokus
- Reduced Motion
- Print-Basis
- mobile und desktop Screenshots geprüft

Nicht ausreichend:

> „Es gibt eine CSS-Datei und die Startseite sieht okay aus.“

---

# 60. Definition of Done — Tierarztkosten UI

Designseitig fertig erst wenn:

- mobile Auswahl ohne Überforderung
- Leistungssuche keyboard-accessible
- gewählte Leistungen leicht entfernbar
- Geldwerte korrekt und lesbar
- Ergebnis visuell dominant
- Kostenbestandteile nachvollziehbar
- Uncertainty Block vorhanden
- Source Disclosure vorhanden
- Versicherungsblock klar separat und als Affiliate gekennzeichnet
- Printansicht vorhanden
- leer/ungültig/unsupported getestet

---

# 61. Definition of Done — Karte

- Liste funktioniert ohne Map
- Karte nur nach definierter Aktivierung/lazy loading
- Mobile list-first
- klare Filter
- Geolocation nur nach Aktion
- Standortfehler verständlich
- Marker/Place selection konsistent
- Providerfehler lässt Liste bestehen
- Attribution sichtbar
- keine automatische falsche „geöffnet“-Behauptung

---

# 62. Definition of Done — Reisecheck

- Wizard maximal 4 primäre Schritte
- aktueller Schritt verständlich
- zurück ohne Datenverlust
- Unsupported früh erkennbar
- Ergebnisstatus nicht über Farbe allein
- offizielle Anforderungen vor Affiliateprodukten
- Quellen und Geltungsstand sichtbar
- Packliste getrennt
- Printansicht verständlich

---

# 63. Definition of Done — Commerce / Finder

- Affiliate Disclosure vor erstem kommerziellen Ergebnisblock
- Produktkarten responsive
- Preisstand behandelt
- unbekannte Attribute sichtbar
- Matching Reason vorhanden
- Sortierung transparent
- keine Fake-Scores
- keine Fake-Reviews
- keine medizinischen Versprechen
- externe Partnernavigation eindeutig

---

# 64. Claude-Code-Arbeitsanweisung für Designumsetzung

Claude Code soll beim Implementieren der UI nach folgendem Ablauf arbeiten:

```text
1. DESIGN_SPECIFICATIONS.md lesen.
2. Prüfen, welche vorhandenen Komponenten bereits dem Designvertrag entsprechen.
3. Tokens und globale Primitive zuerst implementieren.
4. Neue Featureseite mit bestehenden Primitives zusammensetzen.
5. Keine neue lokale Designsprache einführen.
6. Mobile zuerst prüfen.
7. Danach Desktoplayout optimieren.
8. Keyboard-/Focus-Verhalten testen.
9. Screenshot im echten Browser erzeugen.
10. Visuelle Probleme korrigieren.
11. Erst danach Aufgabe als done markieren.
```

Wenn eine Spezifikation unklar ist, soll Claude die **einfachere, ruhigere und zugänglichere Lösung** wählen. Keine zusätzlichen UI-Libraries nur zur Beschleunigung der Umsetzung einführen.

---

# 65. Verbotene Design-Anti-Patterns

Claude darf ohne neue explizite Entscheidung nicht implementieren:

- automatische Slider/Carousels
- Hero-Hintergrundvideo
- Cookie-Banner für Tracking, das technisch noch gar nicht existiert
- Newsletter-Popups
- Exit-Intent-Popups
- Fullscreen Ads
- fake scarcity
- „Nur noch X verfügbar“ aus nicht belastbaren Feeddaten
- sticky Affiliate CTA über Kerninformationen
- Chatbot-Floating-Button
- 5+ verschiedene Buttonfarben
- riesige Emoji-Icons als Designsystem
- Glassmorphism auf Text-/Formflächen
- Neumorphism
- Bento-Grid nur als Trend ohne Informationslogik
- horizontale Scroll-Karussells für essentielle Inhalte
- automatische Standortabfrage
- Dark Patterns bei Datenschutz oder Partnerlinks
- Skeletons für rein statische Inhalte

---

# 66. Priorität bei Konflikten

Wenn zwei Designziele kollidieren, gilt diese Reihenfolge:

```text
1. Sicherheit / fachliche Korrektheit
2. Accessibility
3. Verständlichkeit
4. Nutzbarkeit auf Mobile
5. Datenschutz
6. Performance
7. visuelle Konsistenz
8. Monetarisierung
9. dekorative Wirkung
```

Beispiel:

Wenn eine Affiliatekarte schöner wäre, indem die Kennzeichnung versteckt wird, gewinnt Transparenz.

Wenn eine Karte schöner wäre, aber ohne Listenalternative nicht zugänglich, gewinnt Accessibility.

---

# 67. Minimaler visueller Stil in einem Satz

Wenn Claude bei einer Detailentscheidung unsicher ist, soll es diese Leitlinie verwenden:

> **Warm-neutraler Hintergrund, weiße klare Karten, tiefgrüne Aktionen, dunkle Typografie, großzügiger Weißraum, dünne Borders, wenige Schatten, präzise Datenhierarchie und keine verspielte oder aggressive Commerce-Optik.**

---

# 68. Referenz-Wireframes

## 68.1 Home Desktop

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ PetAtlas     Tierarztkosten  Karte  Reise  Produkte  Futter    Suche  Merken │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Praktische Daten für Tierhalter                                            │
│   Besser entscheiden für dein Tier.                                          │
│   Kosten, Orte, Reisen und Produkte verständlich geprüft.                    │
│                                                                              │
│   [Tierarztkosten berechnen] [Reisecheck starten]                            │
│   Aktuelle Daten · transparente Quellen · keine Anmeldung nötig              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│   Wichtige Tools                                                             │
│                                                                              │
│   [Tierarztkosten] [Hunde-Karte]                                             │
│   [Reisecheck]      [Spielzeug & Pflege]                                     │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│   So arbeiten unsere Daten                                                   │
│   [Quellen]        [Aufbereitung]       [Datenstand]                          │
├──────────────────────────────────────────────────────────────────────────────┤
│   Produkte nach Eigenschaften                                                │
│   [Spielzeug] [Pflege] [Futter]                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Footer                                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 68.2 Tool Desktop

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Breadcrumb                                                                   │
│                                                                              │
│ H1 Tierarztkosten nach GOT berechnen                                         │
│ Kurze Erklärung                                                              │
│ Quelle · Datenstand                                                          │
│                                                                              │
│ ┌────────────────────────────┐ ┌───────────────────────────────────────────┐ │
│ │ Eingaben                   │ │ Ergebnis                                  │ │
│ │                            │ │                                           │ │
│ │ Tierart                    │ │ Hauptwert                                 │ │
│ │ Kontext                    │ │                                           │ │
│ │ Leistung suchen            │ │ Aufschlüsselung                           │ │
│ │ Gewählte Leistungen        │ │                                           │ │
│ │ Faktor                     │ │ Einschränkungen                           │ │
│ │                            │ │ Quelle                                    │ │
│ │ [Berechnen]                │ │                                           │ │
│ └────────────────────────────┘ └───────────────────────────────────────────┘ │
│                                                                              │
│ Methodik                                                                     │
│ Affiliate-Partner                                                            │
│ FAQ                                                                          │
│ Quellen                                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 68.3 Tool Mobile

```text
┌───────────────────────────────┐
│ PetAtlas           Suche Menü │
├───────────────────────────────┤
│ Breadcrumb                    │
│                               │
│ H1 Tierarztkosten             │
│ Kurze Erklärung               │
│ Quelle · Stand                │
│                               │
│ ┌───────────────────────────┐ │
│ │ Eingabe                   │ │
│ │                           │ │
│ │ Feld                      │ │
│ │ Feld                      │ │
│ │                           │ │
│ │ [Kosten berechnen]        │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Ergebnis                  │ │
│ │ 123,45 €                  │ │
│ │ Details                   │ │
│ └───────────────────────────┘ │
│                               │
│ Hinweis / Methodik            │
│                               │
│ Affiliate-Partner             │
│                               │
│ FAQ                           │
└───────────────────────────────┘
```

---

# 69. Empfohlene Dateistruktur für die Designumsetzung

```text
src/
  styles/
    tokens.css
    reset.css
    base.css
    typography.css
    utilities.css
    print.css

  components/
    navigation/
    forms/
    feedback/
    tools/
    commerce/
    data/

  layouts/
    BaseLayout.astro
    ToolLayout.astro
    ContentLayout.astro
    WideLayout.astro
```

`BaseLayout` enthält globale Struktur und Metadaten.  
`ToolLayout` enthält Tool-typische Header-/Contentbreiten.  
`ContentLayout` begrenzt redaktionelle Lesebreite.  
`WideLayout` ist für Karte und große Vergleiche.

---

# 70. Design Review Gate vor Release

Vor M19 muss ein finaler Review mindestens diese fünf Nutzerpfade vollständig durchspielen:

### Pfad A — Tierarztkosten

```text
Home → Tierarztkosten → Leistung wählen → Ergebnis → Quelle → optional Affiliate
```

### Pfad B — Karte

```text
Home → Karte → Ort suchen → Liste → optional Karte → Ort ansehen
```

### Pfad C — Reise

```text
Home → Reisecheck → Deutschland → Ziel → Angaben → Ergebnis → Quelle → Packliste
```

### Pfad D — Spielzeug

```text
Home → Spielzeug-Finder → Fragen → Ergebnis → Matchingbegründung → Partnerangebot
```

### Pfad E — Futter

```text
Home → Futter → Suche → Produkt → identische Variante vergleichen → Partnerangebot
```

Für jeden Pfad dokumentieren:

- Mobile Screenshot
- Desktop Screenshot
- Keyboard-Test
- Fehlerzustand
- Datenstand/Quelle
- Affiliatekennzeichnung
- Console ohne ungeklärte Fehler

---

# 71. Schlussdefinition

Das Design gilt als gelungen, wenn Nutzer nicht zuerst wahrnehmen, dass sie auf einer Affiliate-Seite sind, sondern dass sie ein **nützliches, belastbares Haustier-Werkzeug** verwenden.

Die kommerzielle Ebene soll sich logisch aus dem Nutzungskontext ergeben:

```text
Problem verstehen
      ↓
Daten / Ergebnis erhalten
      ↓
Optionen verstehen
      ↓
optional passendes Produkt / Partner ansehen
```

Nicht:

```text
Traffic
  ↓
Werbung
  ↓
mehr Werbung
```

Die langfristige visuelle Stärke von PetAtlas entsteht aus **Klarheit, Datenqualität, wiederkehrenden Interaktionsmustern und konsequenter Transparenz** — nicht aus dekorativer Komplexität.
