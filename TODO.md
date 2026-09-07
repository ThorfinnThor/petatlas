# Offene Punkte

Kurzliste der Dinge, die eine Entscheidung oder Handlung außerhalb des Codes brauchen. Der maßgebliche Aufgabenstand steht in `project/tasks.json` (`npm run status`); diese Datei ist die menschliche Merkliste daneben.

## 1. Fachliche Abnahme des Tierarztkosten-Rechners

**Status:** offen · **Aufgabe:** M08-06 · **Blocker:** B-002 · **Zuständig:** Betreiber

Der Rechner ist fertig, getestet und zum Ausprobieren freigeschaltet. Die Rechenannahmen sind **nicht** fachlich abgenommen. Solange das so ist, trägt die Seite einen sichtbaren Warnhinweis.

**Was zu tun ist:** die acht Prüfpunkte in **[docs/reviews/costs.md](docs/reviews/costs.md)** beantworten und dort mit Datum und prüfender Person eintragen. Danach die fünf Freigabeschritte ausführen, die am Ende desselben Dokuments stehen.

Die acht Punkte in Kurzform:

1. Quellenstand — ist `GOT 2022` mit dem Änderungsstand vom 15.3.2023 noch geltend?
2. Faktoren — regulär 1,00 bis 3,00, Notdienst 2,00 bis 4,00?
3. Notdienstgebühr — 50,00 €, einmal je Angelegenheit?
4. Umsatzsteuer — 19 Prozent auf alles, auch auf die Notdienstgebühr?
5. Rundung — je Position kaufmännisch auf den Cent, dann mal Menge?
6. Doppelbewertungen nach § 6 — reicht der Hinweis, oder braucht es eine belegte Zuordnungstabelle?
7. Darstellung — genügen die Hinweise „kein amtlicher Rechner“ und die Liste der nicht enthaltenen Posten?
8. Die zwei Szenarien — je einzeln abnehmen.

**Anmerkung zur geplanten Prüfung:** Eine Prüfung durch ein Sprachmodell ist eine nützliche Vorabkontrolle, aber keine qualifizierte fachliche Abnahme. Wenn die Freigabe darauf gestützt wird, sollte in `docs/reviews/costs.md` genau so stehen, worauf sie beruht — damit später niemand eine Autorität annimmt, die es nicht gab.

## 2. Kartenkacheln vor einem kommerziellen Start klären

**Status:** offen · **Zuständig:** Betreiber · **Blockiert nichts**

Die Karte lädt Kacheln von `tile.openstreetmap.org`. Die Nutzungspolitik der OpenStreetMap Foundation sagt ausdrücklich, dass es **keinen SLA** gibt und dass der Zugang jederzeit entzogen werden kann — und dass kommerzielle Dienste sich dessen besonders bewusst sein sollten.

Für eine technische Vorschau ist das in Ordnung. Vor einem Start mit nennenswertem Verkehr oder mit Monetarisierung gehört ein eigener oder bezahlter Kacheldienst her. Die Konfiguration ist dafür vorbereitet: `config/tiles.json` enthält Adresse, Attribution und Hosts an einer Stelle, und der Host steht auch in der Content Security Policy nur dort.

## 3. Weitere offene Voraussetzungen

Diese blockieren derzeit nichts und stehen mit Status, Entscheider und zuerst betroffener Aufgabe im Register in **[docs/EXTERNAL_SETUP.md](docs/EXTERNAL_SETUP.md)**:

- Domain und `PUBLIC_SITE_URL`
- Impressum, Kontakt und echte Betreiberangaben
- Waren-Affiliateprogramm, Versicherungs-Affiliate, Tracking-/Ads-Freigabe
- Branch-Protection im GitHub-Projekt (`docs/CI_SECURITY.md`)
- Betriebsprüfung vor dem zeitgesteuerten GOT-Abruf (Aufgabe M17-07)

## 4. Nicht angelegt, mit Absicht

Das Cloudflare-**Produktionsprojekt** existiert nicht. Ohne Domain, Betreiberangaben und freigegebene Funktion gäbe es nichts zu veröffentlichen. Details in `docs/DEPLOYMENT_EVIDENCE.md`.
