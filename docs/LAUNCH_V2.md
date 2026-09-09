# PetAtlas V2 — Übergabe

Stand: 2026-09-09. Implementierung auf `codex/launch-readiness-design-v2`, Pull Request #5. Designgrundlage: `DESIGN_SPECIFICATIONS_V2.md`.

## Nutzbarer Umfang

Die echte Vorschau (`npm run build:app`) aktiviert Gebührenrechner, Ortskarte, Reisecheck, Pflege, Spielzeug, Futtervergleich und lokale Tierprofile. Sie enthält 9.381 OSM-Orte, 46.113 Ortsnamen, 42 Stadtseiten, 1.006 GOT-Positionen sowie Berliner und Hamburger Kommunaldaten. Vier reale Futtervarianten aus zwei Produktlinien und drei Zubehörprodukte haben nachvollziehbare Herstellerquellen. Die Quellen und Erfassungsstände stehen an den Angaben.

Das V2-Design enthält responsive eigene Bilder, lokale Schriften, sechs Werkzeuge auf der Startseite, Ratgeber, gruppierte Navigation und mobile Listen-/Kartenumschaltung. Profile werden ausschließlich lokal gespeichert und nur nach ausdrücklicher Aktion in passende Werkzeuge übernommen. Sicherung und Löschen bleiben verfügbar.

## Behobene Punkte aus dem Launch-Review

- Betreiberkonfiguration liest und validiert die vorgesehenen Umgebungsvariablen.
- Produktions- und Deployment-Pfad prüfen die zum Funktionsumfang gehörenden Freigaben, Metadaten, Rechtsprüfungen und den ausgelieferten Output.
- Unbenutzte Datenquellen und deaktivierte kommerzielle Funktionen blockieren keinen kleineren Start.
- CI prüft erlaubte und gesperrte Produktionskonfigurationen isoliert; ein später erlaubter Produktionsbuild ist kein erwarteter Fehler mehr.
- Datenschutztexte beschreiben optionale Standort- und Kartenanfragen sowie lokale Speicherung.
- Ohne Partnervertrag werden keine Angebote ausgeliefert; alte Angebotsdateien werden entfernt. Ein gesetztes Feed-Secret ersetzt keinen Vertrag.
- Code und Snapshots werden gemeinsam versioniert. Build-Metadaten enthalten Revision und Daten-Hashes; ein abweichender `OPEN_DATA_REF` wird zurückgewiesen. Siehe ADR 019.
- Die echte Vorschau verwendet reale redaktionelle Produktdaten. Synthetische Datensätze bleiben isolierte Testmittel.
- Navigation, Rechnungsdruck, Positionsentfernung, mobile Lesbarkeit und Profilübernahme wurden überarbeitet.
- README, Status und Abnahme nennen den tatsächlichen Funktionsumfang.

## Grenzen und zurückgestellte Eingaben

Der Nutzer liefert Domain, Betreiberangaben, Partnerverträge und Fachfreigaben später. Bis dahin bleiben Indexierung und öffentliche Produktionsfreigabe gesperrt. Die Vorschau kann mit echten Daten getestet werden; Kosten- und Reiseauskünfte tragen ihren Prüfstatus. Fehlende Preise, Produktbilder und Freigaben werden nicht erfunden. Die Auswahl realer Produkte ist klein und beansprucht keine Marktübersicht.

Eine tatsächliche Partnerfeed-Anbindung muss nach Erhalt des konkreten Vertrags und Feedformats ergänzt und abgenommen werden. Versicherungsangebote und Werbung bleiben deaktiviert.

## Veröffentlichung

Der gespeicherte Cloudflare-Login ist abgelaufen und lässt sich nicht automatisch erneuern. Im GitHub-Repository sind keine Deployment-Secrets oder Variablen eingerichtet. Der bisherige öffentliche Preview-Link zeigt deshalb weiterhin den älteren Stand. Die Aktualisierung erfordert einen erneuten Cloudflare-Login; anschließend:

```sh
PUBLIC_SITE_URL=https://petatlas-de-preview.shuu9599.workers.dev npm run build:app
npx wrangler deploy --config wrangler.preview.jsonc
```

Danach müssen `build-info.json`, HTTP-Header, noindex und die Hauptabläufe am tatsächlich veröffentlichten Link geprüft werden. Bis dahin ist die V2-Vorschau lokal gebaut und in CI geprüft, aber nicht als aktualisiert veröffentlicht dokumentiert.

## Quellenbeobachtung und Betrieb

Die vier bestehenden GitHub-Quellenmeldungen bleiben offen. Am 09.09.2026 ließen sich die GOT-Übersicht und die niederländische NVWA-Seite erneut lesen; die NVWA nennt weiterhin die im Repository verzeichneten EU-Rechtsgrundlagen. Ein unveränderter Sachverhalt lässt sich daraus nicht für jede Regel ableiten. EUR-Lex und die italienische Behördenseite liefern bei automatisierten Abrufen weiterhin Browserprüfungen. Es wurde keine fachliche Freigabe und kein neuer Vergleichsstand aus einer Bot-Seite abgeleitet. Diese Fälle benötigen die im Projekt vorgesehene manuelle Quellenprüfung.

`main` hat laut GitHub API keine klassische Branch Protection. Vor dem öffentlichen Betrieb sollten die erfolgreichen CI- und Security-Prüfungen verbindlich für Änderungen an main werden. Es wurden keine Rechte oder Kontoeinstellungen verändert.

Die konkreten Prüfergebnisse stehen in `ACCEPTANCE.md`.
