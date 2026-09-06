# Visueller Ausgangsstand

Erhoben in M04-06 am 2026-09-06 gegen den **gebauten** statischen Output (`npm run build:site`), nicht gegen den Dev-Server und nicht gegen Entwürfe.

## Prüfumfang

| | |
|---|---|
| Seiten | Start, Quellen, Datenstand, Impressum, Datenschutz, 404, Formularprobe, Designprobe |
| Breiten | 360, 414, 768, 1280 und 1600 Pixel |
| Browser | Chromium (Desktop und mobiles Profil), WebKit Desktop |
| Screenshots | `reports/screenshots/<seite>-<breite>.png`, 40 Aufnahmen, ganze Seite |

`reports/` ist nicht versioniert; die Aufnahmen entstehen bei jedem Lauf neu.

## Ergebnis

Über alle 40 Kombinationen:

- horizontaler Überlauf: **0 Pixel**
- Elemente mit abgeschnittenem Text: **keine**
- Überschriftenstruktur: genau **eine H1** je Seite
- Konsolenfehler: **keine** (der vom Browser selbst protokollierte 404 auf der Fehlerseite ausgenommen)

## Behobener Befund

**Der Testdatenhinweis lief über die volle Fensterbreite.** Er steht im Layout außerhalb von `<main>` und bekam deshalb nicht die Inhaltsbreite von 44 rem. Auf breiten Bildschirmen sprang der gelbe Balken dadurch aus der Textspalte heraus und wirkte wie ein Systembanner statt wie ein Hinweis zur Seite.

Behoben durch einen Container mit derselben Inhaltsbreite. Gegen einen Rückfall sichert der Test „Der Testdatenhinweis hat dieselbe Inhaltsbreite wie der Rest“ ab, der die linke Kante von Hinweis und `<main>` vergleicht.

## Bewusste Festlegungen, keine Mängel

- **„PetAtlas“ erscheint auf der Startseite zweimal**, als Wortmarke im Kopfbereich und als H1. Das ist auf einer Startseite üblich und bleibt so.
- **Die Hauptnavigation ist leer**, weil kein Werkzeug freigegeben ist. Der Kopfbereich zeigt deshalb nur die Wortmarke. Das ist Absicht: ein Navigationseintrag ohne funktionierende Seite wäre der schwerere Mangel (M04-03).
- **Der Fußbereich nennt keine Betreiberangaben**, sondern sagt, dass sie fehlen. Erfundene Angaben sind ausgeschlossen (ADR-015).

## Wiederholbarkeit

Die Prüfungen liegen als Test vor und laufen bei jedem `npx playwright test` mit:

`tests/e2e/ui-baseline.spec.ts` — eine H1 je Seite, kein abgeschnittener Text, gleiche Inhaltsbreite für den Testdatenhinweis, sichtbarer Fokus beim ersten Tabstopp, keine ungeklärten Konsolenfehler.

Ergänzend prüfen `tests/e2e/design-system.spec.ts` die optische Trennung von Information und Werbung und `tests/e2e/forms.spec.ts` die Bedienung ohne Maus.

## Was diese Prüfung nicht ist

Kein Barrierefreiheitsgutachten und keine Performancemessung. Kontrastwerte, Screenreader-Durchläufe mit echter Hilfstechnik, Zoom auf 200 Prozent und Ladezeitbudgets gehören zu M18 und sind hier nicht belegt.
