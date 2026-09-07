# Attributprüfungen

Ein Attribut ohne Herkunft ist eine Behauptung. Jede Angabe hier trägt deshalb `verification`, `sourceLabel`, `sourceUrl` und `checkedAt`.

`dataKind` sagt, ob eine Datei echte oder synthetische Daten enthält. Derzeit gibt es nur **synthetische**: echte Produktdaten setzen echte Angebotsrechte voraus (M13-06, M14-06), und ohne sie würde eine „geprüfte“ Produktliste eine Sorgfalt vortäuschen, die nur aus einem Feed abgeschrieben wäre.

## Regeln

1. `value: null` heißt **unbekannt**. Dann ist `verification` zwingend `unverified` — was niemand weiß, kann niemand belegen.
2. `unverified` ist kein schwacher Beleg, sondern gar keiner. Solche Attribute dürfen kein Produkt als passend erscheinen lassen (`darfMatchen()`).
3. Ein belegtes Attribut braucht Fundstelle und Prüfdatum. Eine Zahl braucht eine Einheit; eine Zahl ohne Einheit ist keine Angabe.
4. Fehlt eine Herstellerangabe, wird sie **nicht** ergänzt — weder aus einer Beschreibung noch aus einem Produktnamen noch aus einem Modell.
