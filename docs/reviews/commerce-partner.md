# Freigabe eines Warenpartners

**Status: Fressnapf-Links am 14.09.2026 und die Nutzung des Awin-Produktfeeds am 15.09.2026 freigegeben.** Der Betreiber hat die Annahme von `wauandmiau.de` im Awin-Programm Fressnapf-Online-Shop DE (Advertiser-ID 14757) bestätigt. Die Freigabe umfasst klar gekennzeichnete Kategorie- und Produkt-Deeplinks sowie die im Feed bereitgestellten Produktbilder für eindeutig zugeordnete redaktionelle Produkte. Preise, Verfügbarkeit, Bewertungen und Händlerbeschreibungen werden nicht übernommen. Details: `docs/reviews/awin-partners-2026-09-14.md`.

Dieses Dokument ist die Checkliste für den Tag, an dem sich das ändern soll. Es ist **keine Rechtsberatung**.

## Was technisch bereits steht (M13-01 bis M13-05)

| | |
|---|---|
| Feedparser | `scripts/ingest/adapters/awin.ts` — CSV nach RFC 4180, ohne Zugangsdaten |
| Normalisierung | `scripts/normalize/products.ts`, `offers.ts` — Vergleichbarkeit, Quarantäne |
| Buildpfad | `scripts/build/commerce.ts` — Secret-Namen statt Werten, Host-Allowlist, TTL, Projektion |
| Preislogik | `src/features/commerce/pricing.ts` — keine Kostenlos- und keine Bestpreisbehauptung |
| Oberfläche | `OfferCard.astro`, `/de-de/angebote/` mit erklärter Sortierung |
| Erlaubnisprüfung | `angebotsErlaubnis()` in `src/features/commerce/partner.ts` |

Die nachfolgende Checkliste bleibt für jede spätere Erweiterung des Feedumfangs verbindlich. Der aktuelle Umfang ist auf Bilder und Deep Links begrenzt.

## Prüfpunkte

1. **Programmfreigabe.** Liegt eine schriftliche Freigabe des Netzwerks für einen benannten Betreiber und eine benannte Domain vor? Eine Anmeldung ist keine Freigabe, und eine Bestätigungsmail über eine Registrierung auch nicht.
2. **Anzeigerechte.** Welche Felder des Feeds dürfen öffentlich gezeigt werden — Produktname, Preis, Verfügbarkeit, Beschreibung? Welche ausdrücklich nicht?
3. **Bildrechte — getrennt zu prüfen.** Für Fressnapf ist die Nutzung der über den Awin-Feed bereitgestellten Bilder im Partnerkontext am 15.09.2026 bestätigt. Andere Händler- oder Herstellerbilder bleiben ausgeschlossen.
4. **JSON-Weitergabe — getrennt zu prüfen.** Eine öffentlich abrufbare Angebotsdatei ist eine eigene Ausgabeform, nicht dasselbe wie die Anzeige im HTML. Erlaubt der Vertrag sie?
5. **Feedfelder.** Welche Spalten liefert der echte Feed tatsächlich? Der Parser verlangt sieben Pflichtspalten; weicht der Feed ab, ist das eine Änderung am Adapter und keine Auslegungssache.
6. **Linkmodus.** Ist der Deeplink mit statischer Kennung erlaubt? Verdeckte Weiterleitungen und dynamische Parameter aus Nutzereingaben sind ausgeschlossen (`pruefeZiel()` in `links.ts`).
7. **Preis- und Verfügbarkeitsaktualität.** Wie oft darf und muss abgerufen werden? Der TTL steht in `config/commerce/feeds.json`.
8. **Beendigung.** Wie erfährt der Betrieb von einer beendeten Zulassung, und wie schnell verschwinden die Angebote?

## Freigabeschritte

1. Prüfpunkte hier beantworten, mit Datum, Namen und Nachweis.
2. Programm in `config/publishers/commerce/programs.json` aktuell halten (`status: "approved"`, vollständige `approval`, erlaubte Zielhosts, statische Kennungen). Bildrechte werden ausdrücklich vermerkt; ohne Vermerk bleiben sie aus.
3. Feed-Secret als Build-Secret hinterlegen — nie im Repository.
4. `npx vitest run tests/commerce tests/product-match tests/feed-secrecy.test.ts` ausführen, ohne die Tests zu ändern.
5. Gate `commerceAffiliate` in `config/launch.json` nur so lange freigeschaltet lassen, wie die Partnerschaft aktiv ist.
6. Vor jedem Produktionsdeployment die Freigabe- und Linktests ausführen.

## Anmerkung

Ein Provisionswert aus einer Netzwerkoberfläche oder aus einem alten Gespräch ist **kein Vertragsbeleg**. Was gilt, steht im Vertrag; und in dieser Konfiguration steht ohnehin kein Provisionswert, weil sie im Browser lesbar ist.

## Ergänzungen

Der Betreiber hat am 10.09.2026 statische Amazon-Textlinks mit seiner ID beauftragt. Umfang und Nachweis stehen in ADR-020 und `legal-amazon-2026-09-10.md`. Am 15.09.2026 hat er zusätzlich bestätigt, dass Bilder aus dem Fressnapf-Awin-Feed übernommen werden dürfen. Der Import speichert keine geheime Feedadresse und veröffentlicht keine Preise oder Verfügbarkeiten.
