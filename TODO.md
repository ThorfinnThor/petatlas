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

## 2. Partnervertrag und § 34d-Prüfung für das Versicherungsmodul

**Status:** offen · **Aufgabe:** M09-06 · **Blocker:** B-003 · **Zuständig:** Betreiber

Das Modul ist gebaut und getestet, aber es gibt **keinen Partnervertrag** und keine Prüfung der konkreten Ausgestaltung. Solange das so ist, ist die Partnerkonfiguration leer, das Feature `commerce` aus und kein einziger Anbieterlink erreichbar. Die Seite bleibt mit ihren fünf Hinweistexten trotzdem informativ.

**Was zu tun ist:** die acht Prüfpunkte in **[docs/reviews/insurance.md](docs/reviews/insurance.md)** beantworten und dort mit Datum und prüfender Person eintragen, danach die sechs Freigabeschritte ausführen. Der wichtigste Punkt ist der zweite: ob die konkrete Ausgestaltung eine Versicherungsvermittlung nach § 34d GewO ist. Das entscheidet nicht die Absicht, sondern was die Seite tatsächlich tut — und die Frage gehört zu einer Person mit einschlägiger Qualifikation.

## 3. Fachliche Prüfung der Reiseregeln

**Status:** offen · **Aufgabe:** M12-06 · **Blocker:** B-004 · **Zuständig:** Betreiber mit fachlich prüfender Person

Der Reisecheck ist fertig und bedienbar, die Regeln sind aus der Delegierten Verordnung (EU) 2026/131 mit Fundstelle erfasst — aber **nicht fachlich geprüft**. Solange das so ist, läuft der Check in der Vorschau: einzelne Punkte werden ausgewertet, ein positives Gesamtergebnis entsteht nicht.

**Was zu tun ist:** die acht Prüfpunkte in **[docs/reviews/travel.md](docs/reviews/travel.md)** beantworten und die sechs Freigabeschritte ausführen. Besonders offen: nationale Sonderregeln der vier Zielstaaten und die italienische Quelle, die sich nicht automatisiert lesen ließ (siehe [docs/reviews/travel-sources.md](docs/reviews/travel-sources.md)).

**Eingebaut ist bereits:** Ändert sich der Regelsatz nach einer Freigabe, fällt der Check automatisch in die Vorschau zurück — die Freigabe nennt die Signatur des Inhalts, den sie geprüft hat.

## 4. Kartenkacheln vor einem kommerziellen Start klären

**Status:** offen · **Zuständig:** Betreiber · **Blockiert nichts**

Die Karte lädt Kacheln von `tile.openstreetmap.org`. Die Nutzungspolitik der OpenStreetMap Foundation sagt ausdrücklich, dass es **keinen SLA** gibt und dass der Zugang jederzeit entzogen werden kann — und dass kommerzielle Dienste sich dessen besonders bewusst sein sollten.

Für eine technische Vorschau ist das in Ordnung. Vor einem Start mit nennenswertem Verkehr oder mit Monetarisierung gehört ein eigener oder bezahlter Kacheldienst her. Die Konfiguration ist dafür vorbereitet: `config/tiles.json` enthält Adresse, Attribution und Hosts an einer Stelle, und der Host steht auch in der Content Security Policy nur dort.

## 5. Weitere offene Voraussetzungen

Diese blockieren derzeit nichts und stehen mit Status, Entscheider und zuerst betroffener Aufgabe im Register in **[docs/EXTERNAL_SETUP.md](docs/EXTERNAL_SETUP.md)**:

- Domain und `PUBLIC_SITE_URL`
- Impressum, Kontakt und echte Betreiberangaben
- Waren-Affiliateprogramm, Versicherungs-Affiliate, Tracking-/Ads-Freigabe
- Branch-Protection im GitHub-Projekt (`docs/CI_SECURITY.md`)
- Betriebsprüfung vor dem zeitgesteuerten GOT-Abruf (Aufgabe M17-07)

## 4. Nicht angelegt, mit Absicht

Das Cloudflare-**Produktionsprojekt** existiert nicht. Ohne Domain, Betreiberangaben und freigegebene Funktion gäbe es nichts zu veröffentlichen. Details in `docs/DEPLOYMENT_EVIDENCE.md`.
