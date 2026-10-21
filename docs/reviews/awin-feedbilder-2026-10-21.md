# Awin-Feedbilder von Fressnapf und ZooRoyal – Rechtsgrundlage

**Stand:** 21.10.2026
**Anlass:** Seit dem Katalogausbau (#97, #101) zeigen Futter-, Pflege-, Spielzeug- und
Ergänzungsfutterseiten Händlerprodukte aus den Awin-Feeds von Fressnapf (Advertiser 14757,
240 Produkte) und ZooRoyal (Advertiser 14979, 312 Produkte) mit Produktbild. Für Fressnapf liegt
die Bestätigung des Betreibers vom 15.09.2026 vor (`awin-partners-2026-09-14.md`). Für ZooRoyal
hält `awin-zooroyal-2026-09-16.md` fest, dass Bilder erst nach dokumentierter Feed- und
Nutzungsfreigabe übernommen werden. Dieser Bericht hält fest, was öffentlich zur Nutzung
nachprüfbar ist.

## Was die Awin-Publisher-AGB regeln

Geprüft wurde die öffentlich abrufbare deutsche Fassung der Allgemeinen Geschäftsbedingungen für
Publisher (Awin, Fassung 2019,
`https://s3.amazonaws.com/docs.awin.com/Legal/Publisher+terms+and+conditions+2019+DE.pdf`).
Eine neuere deutsche Fassung war öffentlich nicht auffindbar; die im Awin-Konto hinterlegte
Fassung ist maßgeblich.

- **Begriff:** „Advertiser-Materialien“ umfassen ausdrücklich Bilder und Daten, die der
  Advertiser bereitstellt. Bilder aus dem Produktfeed eines Advertisers fallen darunter.
- **Ziffer 4.4:** Ein für das Programm zugelassener Publisher darf die Advertiser-Materialien in
  seinem Angebot veröffentlichen, soweit AGB und Programmbedingungen es zulassen.
- **Ziffer 10.1:** Awin gewährt für die Dauer der Programmteilnahme eine widerrufliche, nicht
  exklusive Unterlizenz zur Veröffentlichung der **unveränderten** Advertiser-Materialien, soweit
  das für die Vermarktung des Advertisers und seiner Produkte nötig ist.
- **Ziffer 4.6:** Auf Verlangen des Advertisers oder von Awin sind die Materialien umgehend zu
  entfernen.

## Was die ZooRoyal-Programmbedingungen sagen

Am 21.10.2026 im Awin-Konto des Betreibers gelesen: „ZooRoyal DE – Program terms and conditions“,
Stand 21.03.2025 (PDF unter Programmprofil 14979 → Program Terms; nicht im Repository abgelegt).
Das Programm ist beigetreten („Joined“ seit 16.09.2026), der Shopfeed umfasst laut Profil 21.368
Produkte in zwei Feeds; die Programmbeschreibung bietet Publishern ausdrücklich einen
„CSV-Datenfeed über das komplette Produktprogramm“ an.

- **Ziffer 3 und 7:** Urheber- und Markenrechte der ZooRoyal Petcare GmbH sind zu beachten. Die
  zur Verfügung gestellten Werbemittel dürfen nur im Rahmen des Partnerprogramms genutzt werden.
  Änderungen an Texten und Bildern oder eigene Werbeaussagen nur nach vorheriger Absprache.
- **Ziffer 7:** Jede über das Affiliateprogramm hinausgehende Nutzung, insbesondere gewerbliche
  Verbreitung oder Vervielfältigung, ist untersagt oder braucht eine vorherige schriftliche
  Zustimmung; das gilt auch für die Aufnahme in elektronische Datenbanken.
- **Ziffer 1, 3, 6, 8:** keine Inhalte zu Politik, Erotik, Waffen, Gewalt, Drogen; „ZooRoyal“ nicht
  im HTML-Header oder Domainnamen; kein Keyword-Marketing und kein Brand-Bidding; kein Postview.
- Ein ausdrückliches Verbot von Feedbildern enthalten die Bedingungen nicht.

**Ergebnis:** Feedbilder und Produktnamen dürfen unverändert auf Seiten verwendet werden, die über
das Partnerprogramm zu ZooRoyal verlinken. Die Website erfüllt das (siehe unten). Der Seitentitel
der Händlerseiten enthält „ZooRoyal“ nicht; die Marke steht nur im Seiteninhalt.

## Wie die Website die Bilder nutzt

- Bilder werden unverändert von `images2.productserve.com` (Awin) geladen, ohne Referrer, und nur
  verkleinert dargestellt.
- Jedes Bild steht auf einer Karte, die als Werbung gekennzeichnet zum Händler verlinkt, also im
  Rahmen der Vermarktung des Advertisers.
- Jede Karte nennt die Bildquelle sichtbar („Produktbild · ZooRoyal-Feed“) und im Alt-Text.
- Beide Feeds stehen mit Rechtsgrundlage im Quellenverzeichnis (`config/editorial-sources.json`).
- Keine Preise, Verfügbarkeiten, Bewertungen oder Händlerbeschreibungen.

## Offen

Die Katalogdateien `content-data/products/zooroyal-catalog.json` und `zooroyal-feed.json` liegen in
einem öffentlichen GitHub-Repository. Sie enthalten Produktnamen, Bildadressen und Partnerlinks,
keine Bilddateien. Sie dienen allein dem Bau der Website; ob ihre Veröffentlichung im Repository
schon als „Aufnahme in elektronische Datenbanken“ außerhalb des Partnerprogramms gilt, entscheidet
der Betreiber (Repository privat schalten, Dateien vom Build-Schritt erzeugen lassen oder
ZooRoyal fragen).
