# Attributprüfungen

Ein Attribut ohne Herkunft ist eine Behauptung. Jede Angabe hier trägt deshalb `verification`, `sourceLabel`, `sourceUrl` und `checkedAt`.

`real-review.json` enthält sieben belegte Herstellerattribute zu drei realen Produkten: KONG Classic, West Paw Toppl Large und TRIXIE Bürste 2315. `synthetic-review.json` bleibt ausschließlich Testmaterial. Die echte App verwendet die realen Daten. Herstellerfakten sind keine unabhängigen Produkttests, Sicherheits- oder Eignungsfreigaben. Preise, Angebote, Bilder und Partnerfeeds sind ohne entsprechende Rechte nicht Bestandteil dieser redaktionellen Auswahl.

## Regeln

1. `value: null` heißt **unbekannt**. Dann ist `verification` zwingend `unverified` — was niemand weiß, kann niemand belegen.
2. `unverified` ist kein schwacher Beleg, sondern gar keiner. Solche Attribute dürfen kein Produkt als passend erscheinen lassen (`darfMatchen()`).
3. Ein belegtes Attribut braucht Fundstelle und Prüfdatum. Eine Zahl braucht eine Einheit; eine Zahl ohne Einheit ist keine Angabe.
4. Fehlt eine Herstellerangabe, wird sie **nicht** ergänzt — weder aus einer Beschreibung noch aus einem Produktnamen noch aus einem Modell.
