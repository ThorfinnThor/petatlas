# Freigabe eines Warenpartners

**Status: nicht freigegeben.** `config/publishers/commerce/programs.json` ist leer, `config/launch.json` führt das Gate `commerceAffiliate` auf `approved: false`, und der Katalog zeigt seinen Leerzustand. Es wird kein Feed abgerufen und keine öffentliche Angebotsdatei geschrieben.

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

Es fehlt also nichts Technisches. Es fehlt ein Vertrag.

## Prüfpunkte

1. **Programmfreigabe.** Liegt eine schriftliche Freigabe des Netzwerks für einen benannten Betreiber und eine benannte Domain vor? Eine Anmeldung ist keine Freigabe, und eine Bestätigungsmail über eine Registrierung auch nicht.
2. **Anzeigerechte.** Welche Felder des Feeds dürfen öffentlich gezeigt werden — Produktname, Preis, Verfügbarkeit, Beschreibung? Welche ausdrücklich nicht?
3. **Bildrechte — getrennt zu prüfen.** Produktbilder sind nicht automatisch mitlizenziert; sie gehören oft dem Hersteller, nicht dem Händler. Ohne ausdrückliche Erlaubnis wird kein Bild eingebunden (`imagePermission` bleibt `false`).
4. **JSON-Weitergabe — getrennt zu prüfen.** Eine öffentlich abrufbare Angebotsdatei ist eine eigene Ausgabeform, nicht dasselbe wie die Anzeige im HTML. Erlaubt der Vertrag sie?
5. **Feedfelder.** Welche Spalten liefert der echte Feed tatsächlich? Der Parser verlangt sieben Pflichtspalten; weicht der Feed ab, ist das eine Änderung am Adapter und keine Auslegungssache.
6. **Linkmodus.** Ist der Deeplink mit statischer Kennung erlaubt? Verdeckte Weiterleitungen und dynamische Parameter aus Nutzereingaben sind ausgeschlossen (`pruefeZiel()` in `links.ts`).
7. **Preis- und Verfügbarkeitsaktualität.** Wie oft darf und muss abgerufen werden? Der TTL steht in `config/commerce/feeds.json`.
8. **Beendigung.** Wie erfährt der Betrieb von einer beendeten Zulassung, und wie schnell verschwinden die Angebote?

## Freigabeschritte

1. Prüfpunkte hier beantworten, mit Datum, Namen und Nachweis.
2. Programm in `config/publishers/commerce/programs.json` eintragen (`status: "approved"`, vollständige `approval`, erlaubte Zielhosts, statische Kampagnenkennungen). Bildrechte werden ausdrücklich vermerkt; ohne Vermerk bleiben sie aus.
3. Feed-Secret als Build-Secret hinterlegen — nie im Repository.
4. `npx vitest run tests/commerce tests/product-match tests/feed-secrecy.test.ts` ausführen, ohne die Tests zu ändern.
5. Gate `commerceAffiliate` in `config/launch.json` freischalten.
6. Erst danach ein Produktionsdeployment mit eingeschaltetem Feature `commerce`.

## Anmerkung

Ein Provisionswert aus einer Netzwerkoberfläche oder aus einem alten Gespräch ist **kein Vertragsbeleg**. Was gilt, steht im Vertrag; und in dieser Konfiguration steht ohnehin kein Provisionswert, weil sie im Browser lesbar ist.
