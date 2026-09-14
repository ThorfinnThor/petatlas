# Umsetzungsnachweis IMPLEMENTIERUNG_WAUANDMIAU

Prüfstand: lokaler Real-Data-Preview-Build am 14. September 2026, Basiscommit
`a213d157e78fabf8b3a2db009f3669b4f7f45633` plus die in diesem Arbeitspaket
dokumentierten Änderungen. Der vollständige Cloudflare-Build erzeugte 1.241 Seiten und
bestand alle 15 Build-, Daten-, Rechte-, Sicherheits-, Link-, SEO- und Budgetprüfungen.

## Umgesetzter Stand

| ID | Ergebnis | Nachweis |
|---|---|---|
| WM-01 | Die falsche pauschale Sechs-Tiere-Aussage ist durch den tatsächlichen Regelumfang und die Ausnahmen ersetzt. | `content-data/travel/packing-list.json`, `content-data/travel/scope.json` |
| WM-02 | Rechner und Ausdruck heißen „Berechnungsübersicht“ und erklären ausdrücklich, dass sie weder Rechnung noch Kostenvoranschlag sind. | `src/components/pages/Costs.astro`, `src/features/costs/ui.ts` |
| WM-03 | Der Profiltext unterscheidet die lokale Funktion von Hosting- und Drittverarbeitung; Datenschutz ist direkt verlinkt. | `src/components/pages/Profile.astro`, DS-Prüfung unten |
| WM-04 | Daten-/Inhaltsquellen und externe Dienste/Herstellerquellen werden getrennt dargestellt. | `config/editorial-sources.json`, `src/domain/editorial-sources.ts`, `src/components/pages/Sources.astro` |
| WM-05 | Autorisierte Amazon-Textlinks und ein nicht freigegebener Angebotsfeed haben getrennte Statusfelder. | `config/commerce/status.json`, `src/features/commerce/status.ts`, Methodikseite |
| WM-06 | Die gelieferten Betreiberangaben sind zentral eingebunden; unbekannte bedingte Angaben werden nicht erfunden. | `config/operator.json`, Impressum |
| WM-07 | Die Datenschutzerklärung bildet die implementierten Vorgänge ab; der kontospezifische Vertragsabgleich ist als menschlicher Restpunkt isoliert. | `docs/reviews/data-processing-inventory-2026-09-14.md`, Datenschutzseite |
| WM-08 | Eigener Datenschutzabschnitt, Anfragelink je Eintrag und importfeste Sperr-/Korrekturlogik für HTML, JSON und Suchindex. | `config/directory-controls.json`, `src/features/map/directory-controls.ts`, `tests/places/directory-controls.test.ts` |
| WM-09 | Technische Kernversprechen wurden im gebauten Stand und mit Unit-/Integrationstests geprüft; Details unten. | Browserprüfung und Testbefehle unten |
| WM-10 | Kein unbelegter VSBG-Standardtext ergänzt. Die dafür benötigten Tatsachen bleiben als Betreiberentscheidung offen. | `config/legal.ts`, `config/legal-review.json` |
| WM-11 | Bedienhilfen, Kontaktweg und bekannte Testgrenzen sind veröffentlicht; BFSG-Einordnung und echte Screenreader-/Nutzertests werden nicht erfunden. | Barrierefreiheitsseite, `docs/ACCESSIBILITY.md` |
| WM-12 | Notdienstgebühr wird einmal je Angelegenheit modelliert und unmittelbar erklärt; die zwölf technischen Sollfallgruppen sind abgedeckt. | `tests/costs/wm-golden.test.ts`, Rechner und Positionsseiten |
| WM-13 | Regelumfang, Fachfreigabe, Versionssignatur, Ablauf und Grenzfälle bleiben technisch getrennt. | `src/features/travel/freigabe.ts`, Reise-Tests, korrigierte Scope-Texte |
| WM-14 | Ernährung besitzt eine eigene Freigabe und wird nicht durch GOT-/Reisefreigaben freigeschaltet. | `config/reviews/nutrition.json`, `tests/nutrition-review.test.ts`, Ergänzungsfuttermittelseite |
| WM-15 | Daten, Inhalte, Bilder, Schriften, Bibliotheken und Partnernutzung sind inventarisiert; fehlende Rechte stoppen die betroffene Ausgabe. | `docs/reviews/asset-rights-inventory-2026-09-14.md`, `npm run check:licenses` |
| WM-16 | Quellenalter, Rechte-, Experten-, Partner- und Funktionsstatus sind getrennt; Abrufdatum erzeugt keine Fachfreigabe. | Datenstand, Methodik, `config/reviews/nutrition.json`, Reise-Freigabelogik |
| WM-17 | Canonical, interne Links und Buildadresse verwenden `https://wauandmiau.de`; Vorschau bleibt `noindex`. Produktionsvarianten werden erst mit dem freigegebenen Stand getestet. | `npm run build:app`, Output-Audits |
| WM-18 | Technischer Nachweis und Restentscheidungen sind dokumentiert. Eine menschliche Freigabe wird nicht aus bestandenen Tests abgeleitet. | dieses Dokument und Launch-Gates |

## Technische Abnahme WM-09

Browser: Codex In-App Browser auf `http://127.0.0.1:4331`, frischer lokaler Build.

| Test | Ergebnis |
|---|---|
| DS-01/12 | Startseite lädt Bilder und Schriften vom eigenen Host. Output-Audit erlaubt als optionalen Unterressourcenhost nur `tile.openstreetmap.org`; keine Tracker oder Händler-Einbettungen. |
| DS-02/03/05 | `WM_TEST_ONLY_914` blieb vor der Speicherhandlung nur im Formular. Nach vollständiger Eingabe und „Auf diesem Gerät speichern“ wurde der Wert nach Reload wiederhergestellt; „Gespeicherten Stand löschen“ entfernte ihn wieder. |
| DS-04 | Profil- und Partnerlinktests finden keine Profilparameter oder Übertragungsroute. |
| DS-06 | Export/Import-, Schema-, Größen- und ungültige-Daten-Fälle sind in den Profiltests abgedeckt. Eine echte Dateiübertragung an einen Server existiert nicht. |
| DS-07 | Nach Reload der Kartenseite waren 0 Leaflet-Tile-Bilder vorhanden. |
| DS-08 | Erst nach „Karte anzeigen“ wurden zwölf sichtbare Kacheln von `tile.openstreetmap.org` geladen; Attribution „© OpenStreetMap-Mitwirkende“ war sichtbar. |
| DS-09 | Die Seite löst beim Laden keinen Standortdialog aus; Standort wird nur über die beschriftete Schaltfläche angefordert. Ablehnung und Testposition sind in den Geolocation-Tests abgedeckt. |
| DS-10 | Zwei Amazon-Links im Startseitenbestand: feste Suchziele, `tag=wauandmiau-21`, `rel="sponsored nofollow noopener"`; 0 Amazon-Skripte, Bilder, Iframes, Prefetches oder Preconnects. |
| DS-11 | Merkliste und Packliste besitzen getrennte lokale Speicher- und Löschtests. |

Playwright/Chromium konnte auf diesem Host nicht starten: Chromium brach vor jedem Test
bei `MachPortRendezvousServer` mit macOS-Fehler 1100 ab. Das ist kein fehlgeschlagener
Anwendungstest, aber die vollständige CI-Browsermatrix muss auf einem geeigneten Runner erneut
laufen. Die oben genannten Browserfälle wurden deshalb zusätzlich im sichtbaren In-App-Browser
geprüft.

## Noch menschlich erforderlich

Folgende Punkte können ohne reale Tatsachen oder benannte Fachperson nicht seriös als erledigt
markiert werden:

- Betreiber: Erreichbarkeit von `info@wauandmiau.de`, Register-/USt-/Wirtschafts-ID soweit
  vorhanden, besondere Erlaubnispflichten und ein zusätzlicher schneller Kontaktweg.
- Datenschutz: tatsächlicher Cloudflare-Vertrag/DPA und Einstellungen; Mailanbieter, AVV,
  Speicher-/Löschkonzept; Interessenabwägung und Art.-14-Prozess für personenbezogene
  Verzeichniseinträge.
- Unternehmen/Recht: Beschäftigtenzahl zum 31.12.2025, Teilnahmezusage oder -pflicht für VSBG;
  Beschäftigte und Umsatz/Bilanz sowie Angebotsumfang für die BFSG-Einordnung.
- Fachlichkeit: benannte fachkundige Person, Datum und geprüfter Inhalts-Hash jeweils getrennt
  für GOT, Reisen und Ernährung.
- Rechte/Partner: datierte Gesamtfreigabe des Rechteinventars; bestätigte Partnerkonto- und
  Websitezuordnung sowie gesonderte Rechte vor jedem Daten-, Preis- oder Bildfeed.
- Veröffentlichung: Launch-Gates durch die jeweils zuständige Person freigeben und denselben
  Commit anschließend unter HTTP/HTTPS-/WWW-Varianten, Sicherheitsheadern, 404, Mobilansicht
  und Cachezustand auf der Produktionsdomain prüfen.

Bis diese Entscheidungen belegt sind, bleiben positive Reise-Gesamtwertungen,
fachliche Freigabeanzeigen, Produktfeeds, Produktbilder und Preise gesperrt. Der Build bleibt als
nicht indexierbare Vorschau gekennzeichnet.
