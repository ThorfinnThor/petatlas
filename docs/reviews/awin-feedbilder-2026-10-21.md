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

Die Programmbedingungen von ZooRoyal DE (`ui.awin.com/merchant-profile-terms/14979`) sind nur
angemeldet vollständig abrufbar. Der öffentlich indexierte Auszug verlangt, Urheber- und
Markenrechte der ZooRoyal Petcare GmbH zu beachten, und erlaubt die Nutzung der bereitgestellten
Werbemittel nur im Rahmen des Partnerprogramms. Laut Programmprofil stellt ZooRoyal Publishern
einen CSV-Datenfeed über das Sortiment bereit. Ein ausdrückliches Bildverbot ist im Auszug nicht
enthalten.

## Wie die Website die Bilder nutzt

- Bilder werden unverändert von `images2.productserve.com` (Awin) geladen, ohne Referrer, und nur
  verkleinert dargestellt.
- Jedes Bild steht auf einer Karte, die als Werbung gekennzeichnet zum Händler verlinkt, also im
  Rahmen der Vermarktung des Advertisers.
- Jede Karte nennt die Bildquelle sichtbar („Produktbild · ZooRoyal-Feed“) und im Alt-Text.
- Beide Feeds stehen mit Rechtsgrundlage im Quellenverzeichnis (`config/editorial-sources.json`).
- Keine Preise, Verfügbarkeiten, Bewertungen oder Händlerbeschreibungen.

## Offen

Die Programmbedingungen im Awin-Konto (ZooRoyal DE, Advertiser 14979) muss der Betreiber selbst
auf eine Einschränkung der Bildnutzung prüfen und das Ergebnis hier bestätigen. Erst danach wird
die Einschränkung in `config/publishers/commerce/programs.json` und `awin-zooroyal-2026-09-16.md`
angepasst. Bis dahin bleibt sie dort stehen.
