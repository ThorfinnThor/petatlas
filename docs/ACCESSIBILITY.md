# Zugänglichkeit

Geprüft am **2026-09-08**. Was hier steht, ist entweder von einem Lauf belegt oder als Beobachtung von Hand gekennzeichnet. Wiederholen: `npm run test:accessibility`

## Was geprüft wurde

| Prüfung | Wie | Umfang |
|---|---|---|
| Regelverstöße nach WCAG 2.0/2.1 A und AA | axe-core 4.13 über Playwright | 13 Seiten × 3 Profile = 39 Läufe |
| Sprungmarke zum Inhalt | Playwright, Lage und Fokusverhalten | 4 Seiten × 3 Profile |
| Erster Tabstopp | Playwright, Tastendruck | 4 Seiten, Chromium (Begründung unten) |
| Sichtbarer Fokus | Playwright, berechneter Stil | Kopfbereich |
| Kein positives `tabindex` | Playwright, DOM-Abfrage | Rechnerseite |
| Umbruch bei 320 CSS-Pixeln (WCAG 1.4.10) | Playwright, `scrollWidth` gegen `clientWidth` | 4 Seiten × 3 Profile |
| Genau eine H1, ein `main`, benannte Navigation | Playwright | 4 Seiten × 3 Profile |
| Überschriftenebenen ohne Sprung | Playwright | 4 Seiten × 3 Profile |

**Ergebnis: 101 bestanden, 7 übersprungen, keine offenen kritischen Befunde.** Die übersprungenen sind Safari-Tabstopps (siehe unten) und eine Prüfung, die es nur mit einem Auswahlfeld gibt, das die Seite nicht hat.

Die Kontrastprüfung steckt in axe (`color-contrast`, Teil von WCAG 2 AA) und ist auf allen 13 Seiten ohne Verstoß durchgelaufen.

## Behobener Befund: die Sprungmarke fehlte

Vor dieser Prüfung musste jemand, der mit der Tastatur bedient, auf **jeder** Seite die vollständige Navigation durchtabben, bevor er beim Inhalt ankam. Das ist WCAG 2.4.1 (Bypass Blocks).

Jetzt steht vor allem anderen im Dokument eine Sprungmarke „Zum Inhalt springen“. Sie liegt außerhalb des Sichtfelds — verschoben, **nicht** `display: none`, sonst wäre sie auch für die Tastatur weg — und springt hinein, sobald sie den Fokus bekommt. Ihr Ziel `main` ist mit `tabindex="-1"` fokussierbar, damit der Sprung den Fokus wirklich mitnimmt und nicht nur die Bildlaufposition.

## Browsermatrix

| Profil | Engine | Rolle |
|---|---|---|
| chromium-desktop | Chromium | Hauptpfad |
| webkit-desktop | WebKit | zweiter Engine-Pfad (Safari) |
| chromium-mobile (Pixel 7) | Chromium | mobiles Format und Touch |

**Safari tabt standardmäßig nicht auf Links.** In Safari springt die Tabulatortaste ab Werk nur zwischen Formularfeldern; Links werden erst erreicht, wenn „Beim Drücken der Tabtaste jedes Objekt hervorheben“ eingeschaltet ist oder mit Wahl+Tab bedient wird. Das ist eine Einstellung des Browsers, kein Mangel der Seite — die Sprungmarke ist auch dort vorhanden, fokussierbar und wirksam, was der Lauf einzeln prüft. Die Reihenfolgeprüfung über echte Tastendrücke läuft deshalb nur in Chromium, und diese Auslassung steht hier, statt in einem grünen Häkchen zu verschwinden.

## Beobachtungen von Hand

Diese Punkte lassen sich nicht sinnvoll automatisch prüfen; sie sind angesehen und hier festgehalten:

- **Formulare** (Rechner, Reisecheck, Futtersuche) haben sichtbare Beschriftungen, keine reinen Platzhaltertexte. Fehlermeldungen stehen als Liste am Anfang des Formulars und sind mit den Feldern verknüpft.
- **Ergebnisse** erscheinen in Bereichen mit `role="status"`, damit ein Screenreader ein neu berechnetes Ergebnis ansagt, ohne den Fokus zu verlieren.
- **Unbekanntes** ist als „nicht angegeben“ oder „unbekannt“ ausgeschrieben, nicht als leeres Feld oder Strich. Das ist auch eine Zugänglichkeitsfrage: ein Strich ist für eine Vorlesefunktion nichts.
- **Die Karte** ist eine Ergänzung, keine Voraussetzung. Dieselben Orte stehen als Liste darunter, mit Adresse und Öffnungszeiten; ohne JavaScript bleibt die Liste erreichbar.
- **Der Testdatenhinweis** steht oben im Dokument und nicht nur farblich abgesetzt, damit er auch ohne Farbwahrnehmung ankommt.

## Was hier nicht geprüft ist

- **Kein Screenreader-Lauf.** NVDA, JAWS oder VoiceOver bedienen sich nicht automatisiert; was sie vorlesen, hat niemand gehört. Die ARIA-Auszeichnungen sind gesetzt und von axe geprüft, aber das ist eine Aussage über das Markup, nicht über das Hörerlebnis.
- **Keine Prüfung mit echten Nutzern**, insbesondere nicht mit Menschen, die auf Hilfsmittel angewiesen sind. Ohne sie ist keine Aussage über tatsächliche Bedienbarkeit möglich.
- **Keine BFSG-Konformitätserklärung.** Das Barrierefreiheitsstärkungsgesetz verlangt mehr als bestandene Regelprüfungen: eine Erklärung zur Barrierefreiheit, einen Feedback-Weg und eine belegte Bewertung. Das gehört zu den rechtlichen Vorbereitungen (M18-05) und ist kein Nebenprodukt dieser Tests.
- **Kein Test der Druckansicht** mit Hilfsmitteln.

## Wiederholen

```bash
npm run test:accessibility
```

Der Lauf baut die Website mit allen Funktionen, startet einen lokalen Server und prüft die oben genannten Punkte in drei Profilen. Ein Verstoß macht den Lauf rot und nennt Regel, Schweregrad und Fundstelle.
