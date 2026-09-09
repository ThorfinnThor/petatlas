# Abnahme von Produkteigenschaften (Pflege und Spielzeug)

**Stand 2026-09-09:** Drei reale Produkte sind redaktionell anhand ihrer Herstellerquellen erfasst (`content-data/attributes/real-review.json`). KONG Classic: Naturkautschuk und Tierart Hund; West Paw Toppl Large: Zogoflex, Spülmaschineneignung und Tierart Hund; TRIXIE Bürste 2315: Material und Länge. Jedes Attribut trägt Quelle und Erfassungsdatum. Es handelt sich um Herstellerangaben, nicht um eigene Messungen oder eine unabhängige Sicherheits-/Eignungsprüfung.

Die App zeigt diese kleine Auswahl mit erklärten Grenzen. Synthetische Datensätze sind isoliertes Testmaterial. Ohne Partnerfreigabe gibt es weiterhin keine Händlerangebote oder übernommenen Produktbilder. Die übergreifende öffentliche Datenrechte-Freigabe bleibt offen; M14-06 dokumentiert diesen verbleibenden Veröffentlichungs-/Angebotsumfang und bedeutet nicht mehr, dass die realen Attribute technisch fehlen.

## Was technisch bereits steht (M14-01 bis M14-05)

| | |
|---|---|
| Kategorien | `content-data/taxonomy/care.json`, `toys.json` — zehn Kategorien, acht begründete Ausschlüsse |
| Attribute | `src/domain/schemas/product-attributes.ts` — Wert, Einheit, Verifikationsstatus, Fundstelle, Prüfdatum |
| Matching | `src/features/care/matching.ts` — harte Filter nur auf belegten Werten, erklärbare weiche Kriterien |
| Oberfläche | Finder auf `/de-de/spielzeug/`, fünf Pflegekategorieseiten |
| Inhaltsregeln | `src/features/care/policy.ts` mit `tests/care-safety.test.ts` und `tests/toy-safety.test.ts` |

## Ablauf je Produkt

Für jedes Produkt, das aufgenommen werden soll:

1. **Nutzungsumfang prüfen.** Redaktionelle Herstellerfakten und kommerzielle Angebote sind getrennt zu behandeln. Für Angebote, Feedfelder und übernommene Bilder werden die jeweiligen Programmrechte benötigt; sie werden durch eine redaktionelle Erfassung nicht erteilt.
2. **Herstellerseite aufrufen** und die Fundstelle notieren — nicht die Händlerseite, wenn es die Herstellerangabe gibt.
3. **Je Attribut eintragen:** Wert, Einheit, `verification` (`manufacturer_stated`, `merchant_feed` oder `measured`), `sourceUrl`, `sourceLabel`, `checkedAt`.
4. **Fehlt eine Angabe, bleibt sie leer** — mit `value: null` und `verification: "unverified"`. Sie wird nicht aus der Produktbeschreibung, dem Namen, einem Vergleichsprodukt oder einem Sprachmodell ergänzt.
5. **Widersprüche stehen lassen.** Wenn Hersteller und Händler verschiedene Maße nennen, ist das ein `unverified`-Fall und kein Mittelwert.
6. `dataKind` der Datei auf `real` setzen, sobald sie echte Produkte enthält, und in dieser Datei vermerken, wer wann geprüft hat.
7. `npx vitest run tests/care tests/toys tests/care-safety.test.ts tests/toy-safety.test.ts` ausführen, ohne die Tests zu ändern.

## Was ein Live-Matching erklären muss

Für jedes angezeigte Produkt gilt: **jede** Aussage, die es passend macht, ist belegt und mit Fundstelle hinterlegt, und die nicht geprüften Merkmale stehen daneben. Ein Produkt ohne belegtes Merkmal erscheint mit dem Satz, dass es nur nicht ausgeschlossen ist — nicht als Empfehlung.

## Grenzen, die auch nach der Freigabe gelten

- Keine Arzneimittel, Supplemente, medizinischen Tests, Antiparasitika oder Therapiegeräte. Diese Grenze ist keine Frage des Aufwands, sondern der Sache.
- Keine Wirkversprechen, keine Dosierung, keine Haltbarkeitszusage, keine erfundenen Bewertungen — die Inhaltsregeln greifen unabhängig davon, wie die Daten hereinkommen.
- Keine Ableitung aus der Rasse. Sie bewirkt im Matching nachweislich nichts und soll es auch nach einer Freigabe nicht.
