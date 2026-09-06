# Architektur und verbindliche Schnittstellen

## 1. Gesamtsystem

```text
Öffentliche Quellen                 Redaktion / fachliche Freigabe
GOT, OSM, lizenzierte Kommunaldaten  Gebührenregeln, Reiselogik, Produktattribute
         |                                     |
GitHub Actions: kontrollierter Import          main-Branch / Review
         |
Rechteprüfung -> Validierung -> Differenzprüfung
         |
data-live-Branch: freigegebener offener Snapshot
         |                                    Partnerzugänge
         |                                    Cloudflare Build-Secrets
         +-------------------+------------------------+
                             |
                     Cloudflare Builds
             fixierter Code- und Open-Data-Commit
             optional: vertraglich erlaubter Feedabruf
                             |
               validieren -> normalisieren -> testen
                             |
          Astro HTML + kleine JSON-Dateien + Pagefind
                             |
                 Cloudflare Static Assets
                             |
          Browser: Rechner, Filter, Karten, Merkliste
```

Das Startprodukt braucht keinen Laufzeit-Server. Diese Aussage gilt nicht für spätere Konten, E-Mails, Uploads oder geheime serverseitige Berechnungen. Das sind eigene Erweiterungen, nicht „kostenlos statisch“ lösbare Restaufgaben.

## 2. Stack und Versionspolitik

Astro mit `output: 'static'`, TypeScript strict, npm mit `package-lock.json`, Node 24 LTS als Startlinie. Patchversion und konkrete stabile Abhängigkeiten beim Bootstrap anhand der Primärdokumentation prüfen und fixieren. Keine ungeprüften `latest`-Referenzen in wiederholbaren Builds. [S01, S15]

Für die Oberfläche Astro-Komponenten, normale CSS-Dateien mit Design Tokens und kleine TypeScript-Module. Kein React/Vue/Svelte als Pflichtabhängigkeit. Leaflet nur für die explizit aktivierte Karte. Pagefind für statische Volltextsuche; Browserfilter für Produkte. Zod für Dateneingänge, Vitest für Unit-/Integrationstests, Playwright für End-to-End-Tests, axe-core für zusätzliche Zugänglichkeitsprüfungen. Die tatsächlich kompatiblen Versionen werden in `docs/TOOLCHAIN.md` dokumentiert. [S16–S17]

Für große OSM-Dateien darf ein isoliertes Build-Werkzeug wie `osmium-tool` verwendet werden. Rohdaten werden gestreamt bzw. disk-basiert verarbeitet, nicht komplett in ein JavaScript-Array geladen. Keine zusätzliche Produktdatenbank daraus machen.

## 3. Repository-Struktur des zu bauenden Produkts

```text
.github/workflows/        ci, security, ingest-open, source-check, rebuild, smoke
CLAUDE.md                kurze Ausführungsregeln
IMPLEMENTIERUNGSPLAN.md   dieser Plan
project/tasks.json       maschinenlesbare Arbeitspakete
config/
  markets/               Absatzmärkte und Feature Flags
  locales/               Textbausteine und Route-Namen
  sources/               Quelle, Rechte, Abruf- und Frischepolitik
  publishers/            öffentliche Anzeigefreigaben, keine Tokens
  launch.json            redaktionelle/fachliche Freigaben
src/
  components/            Layout, Formulare, Provenance, Produktkarten
  layouts/
  pages/                 statische Routen; keine Live-API-Endpunkte
  content/               geprüfte Markdown-Inhalte
  domain/                schemas, money, units, source, market
  features/              costs, map, travel, commerce, care, toys, food, profile
  lib/                   browser-safe Hilfsfunktionen
scripts/
  ingest/                kontrollierte Build-Time-Adapter
  normalize/
  publish/
  checks/
  project_status.py
content-data/            kleine manuell freigegebene Regel-/Redaktionsdateien
fixtures/                ausschließlich synthetische oder zulässige Testdaten
public/                  bewusst öffentliche feste Assets
.work/                   ignorierte temporäre Import-/Feed-Daten
.generated/              ignorierte normalisierte Build-Eingaben
reports/                 lokale Testausgaben; vertrauliche Logs nie veröffentlichen
docs/                    Quellen, ADRs, Status, Betrieb, Abnahme
licenses/                Rechtehinweise pro Datenklasse
```

`dist/`, `.work/`, `.generated/`, `.env*` außer einer leeren `.env.example` und `reports/` stehen in `.gitignore`. Das ersetzt keine Prüfung des Build-Outputs. In `public/` gelegte Inhalte sind öffentlich; ein Unterordner namens `private` schützt sie nicht.

## 4. Marktmodell

```ts
type MarketId = string;  // in der Konfiguration z. B. DE oder US
interface MarketConfig {
  id: MarketId;
  enabled: boolean;
  primaryCountry: string;
  locale: string;       // de-DE, en-US
  pathPrefix: string;   // /de-de, /en-us
  currency: string;     // EUR, USD
  timeZone: string;     // Europe/Berlin, America/New_York
  measurementSystem: 'metric' | 'us';
  featureFlags: Record<string, boolean>;
  providerIds: Record<string, string | null>;
}
```

Nur DE ist aktiv. US und ein zweiter europäischer Markt sind deaktivierte Testkonfigurationen. Keine US-Live-Seiten, US-Partner oder US-Preisschätzungen im deutschen MVP. Reiseziel IT kann bereits für deutsche Nutzer unterstützt werden, ohne `market=IT` zu starten.

`Intl.NumberFormat` und `Intl.DateTimeFormat` verwenden. Geld als ganzzahlige Untereinheiten mit ISO-Währung; Gewichte intern in Gramm; Distanzen in Metern. Datum, lokales Kalenderdatum, Zeitzone und UTC-Zeitstempel nicht vermischen. Datenbank-IDs bleiben stabil, auch wenn Sprache und Slug wechseln. Kein globales `€` oder `de-DE` außerhalb der Markt-/Locale-Schicht.

## 5. Datenverträge

### Provenienz

Jeder importierte fachliche Datensatz benötigt mindestens:

```ts
interface Provenance {
  sourceId: string;
  sourceRecordId: string;
  sourceUrl: string;             // öffentliche Referenz ohne Zugangstoken
  retrievedAt: string;          // Abrufzeitpunkt
  sourceUpdatedAt: string | null;
  contentHash: string;
  licenseId: string;
  normalizationVersion: string;
  validFrom: string | null;
  validTo: string | null;
  reviewedAt: string | null;    // fachliche Prüfung, nicht HTTP-Abruf
  reviewStatus: 'unreviewed' | 'approved' | 'withdrawn';
}
```

Ein HTTP-304-Abruf aktualisiert `lastCheckedAt` des Sources, nicht automatisch `reviewedAt` der fachlichen Regel. Fehlende Werte bleiben `null`; sie werden nicht zu 0, „nein“, „sicher“ oder „geeignet“.

### Rechtekonfiguration

```ts
interface SourceRights {
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  licenseId: string | null;
  licenseUrl: string | null;
  commercialUse: boolean | null;
  publicRedistribution: boolean | null;
  websiteDisplay: boolean | null;
  publicJsonDelivery: boolean | null;
  publicRepository: boolean | null;
  attributionRequired: boolean;
  shareAlike: boolean;
  imagesAllowed: boolean | null;
  mayStoreHistory: boolean | null;
  mayCacheOriginals: boolean | null;
  termsHash: string | null;
  checkedAt: string | null;
  approvalEvidence: string | null;
}
```

Die Rechte beziehen sich auf eine konkrete Ressource und Ausgabeform. `commercialUse=true` allein reicht ausdrücklich nicht aus. Der Publisher prüft für jede Zieldatei deren Ausgabeklasse. Secrets und personenbezogene Inhalte haben unabhängig von einer Datenlizenz eigene Sperren.

### Produkt ist nicht Angebot

`Product` beschreibt ein konkretes Produkt bzw. eine Variante: interne ID, Tierart, Kategorie, Marke, GTIN als String, Größe, Nettofüllmenge, Material und verifizierte Attribute.

`Offer` beschreibt ein Angebot eines Händlers: `offerId`, `productId`, `merchantId`, `marketId`, `currency`, `priceMinor`, `shippingMinor|null`, `availability`, `affiliateUrl`, `fetchedAt`, `expiresAt`, `displayPermission`, `imagePermission`.

GTIN-Prüfziffer validieren, führende Nullen erhalten, Varianten und Multipacks nicht zusammenschmelzen. Gleicher Produktname ist kein Identitätsbeweis. Mengenpreise und Gesamtpreise getrennt berechnen. Unbekannter Versand ist nicht kostenlos. Händler-Rabatt, bedingter Neukundenpreis und regulärer Preis bleiben getrennte Angebotsarten.

### Orte

Stabile ID z. B. `osm:node:12345`, nicht aus Name/Adresse erzeugen. Kategorie, Geometrie, Koordinaten, Ortszuordnung, Kontakt, Öffnungszeiten und Provenienz getrennt. `emergency`, `wheelchair`, `fenced` und `dogAllowed` sind tri-state. Keine automatische Gleichsetzung von Tierarzt, Tierklinik und Notdienst.

Öffentliche Website und Telefonnummer nur übernehmen, wenn die konkrete Quelle und Datenschutzprüfung dies tragen. Keine privaten Ansprechpartnerlisten, E-Mail-Adressen von Tierhaltern oder OSM-Bearbeiter-Metadaten kopieren.

### Gebühren und Behandlungsvorlagen

`FeeItem`: amtliche Positions-ID, Gebührenkatalogversion, Originalbezeichnung, Tierartbezug, Basiseinheit, Betrag, Quellenfundstelle.

`CostScenario`: redaktionell definierte Zusammenstellung von Positionen mit Mengen, Ausschlüssen und fachlicher Freigabe. Eine GOT-Position ist kein vollständiges Behandlungspaket. Den vollständigen Import darf man durchsuchen; ungeprüfte OP-Gesamtpakete nicht automatisch daraus generieren.

`CostResult`: Einzelpositionen, Multiplikatoren, Nettosumme, separat behandelte Zusatzkosten, Umsatzsteuerannahme, Bruttosumme, nicht enthaltene Kosten und Katalogversion. Dezimalfaktoren als validierte Dezimaldarstellung/Skalierung, keine unkontrollierte Gleitkomma-Geldarithmetik.

### Reiseregeln

`TravelRule` enthält Herkunft, Ziel, Transit, Tierart, Reisekontext, anwendbaren Zeitraum, offizielle Quelle, geprüfte Prädikate und verständliche Hinweistexte. Eine kleine deklarative DSL mit festen Operatoren verwenden: `all`, `any`, `eq`, `in`, `dateBefore`, `dateAfter`, `daysBetween`. Keine JavaScript-Snippets aus JSON, kein `eval`.

Das Ergebnis ist eine Checkliste mit Zuständen `fulfilled`, `not_fulfilled`, `unknown`, `not_applicable`. Ein Gesamtstatus „alle von uns geprüften Voraussetzungen erfüllt“ ist nur bei vollständigem bekannten Anwendungsbereich erlaubt; er ist keine Einreisegarantie. Unbekannte Transitländer oder Reisekontexte beenden die automatische Freigabe.

## 6. JSON-Strategie

Keine einzelne `all-data.json`. Daten nach Zweck und Größe teilen:

```text
/data/v1/manifest.json
/data/v1/fees/de/got.<hash>.json
/data/v1/places/de/index.<hash>.json
/data/v1/places/de/cells/<cell>.<hash>.json
/data/v1/travel/de/<destination>.<hash>.json
/data/v1/catalog/de/<category>.<hash>.json
/data/v1/offers/de/<category>.<hash>.json  # nur bei expliziter Freigabe
/data/v1/sources/public-status.<hash>.json
```

Ausgabeordner sind versioniert; Dateinamen enthalten Inhalts-Hashes. Das kleine Manifest nennt IDs, Hashes, Größen, gültige Zeiträume und Abhängigkeiten. Veröffentlichte Daten werden mit dem zugehörigen HTML atomar als ein Deployment ausgeliefert. Ein Besucher einer älteren HTML-Version darf bei inzwischen entfernten Chunks nicht endlos scheitern: 404 einmal durch Manifest-Neuladen behandeln und bei Versionskonflikt einen Neu-laden-Hinweis anbieten. Kein PWA-Cache im MVP.

Zielwerte des Projekts: normale JSON-Shards maximal 512 KiB unkomprimiert, große Geo-Shards maximal 1 MiB. Überschreitung führt zu weiterer räumlicher Teilung; nicht einfach den Grenzwert erhöhen. Ein globaler Index enthält nur Metadaten/BBox/Dateiverweise, nicht alle Marker. Eine größere lizenzpflichtige ODbL-Download-Datei ist ein separater Ausgabeweg und darf nicht in den initialen Browserpfad geraten.

Auch ein nur vom Browser geladener JSON-Feed ist öffentlich. CORS, robots.txt, zufällige Dateinamen oder fehlende Links verhindern keine Weitergabe. Besteht keine Erlaubnis für diese Ausgabeform, nur erlaubte minimale Anzeigedaten in HTML ausgeben oder den Partner nicht integrieren. HTML löst fehlende Anzeigerechte ebenfalls nicht.

## 7. Lokale Nutzerfunktionen

Profil zunächst nur im Speicher des Tabs. Option „Auf diesem Gerät speichern“ aktiviert nach bewusster Auswahl eine versionierte lokale Speicherung. Import/Export als lokal herunterladbare JSON-Datei; Schema- und Größenprüfung beim Import. Kein Name, keine Adresse oder E-Mail erforderlich. Standort nur nach ausdrücklicher Benutzeraktion, nicht automatisch beim ersten Laden.

Hinweise: kein Geräteabgleich, kein Backup, keine zentrale Wiederherstellung. Löschknopf entfernt sämtliche lokalen Projektschlüssel. Private Merkliste, Packliste und Budget bleiben im Browser. Kein geheimes Gesundheitsprofil in Querystrings oder Affiliate-Sub-IDs.

## 8. Erweiterung ohne Neubau

Ein neuer Markt benötigt Konfiguration, übersetzte Oberfläche, geprüfte Quellen/Regeln, passende Angebote, Rechts-/Datenschutzprüfung und Freigabe. Er wird nicht durch bloßes Aktivieren eines Flags „fertig“.

Der spätere US-Kostenadapter darf Mess-/Schätzpreise als eigenen Quellentyp liefern. Er darf niemals mit GOT-Faktoren oder dem Label „gesetzlicher Gebührensatz“ versehen werden. Market-Capability-Tests müssen beweisen, dass ein nicht vorhandener Kostenadapter zu `unsupported` führt.

Spätere Speicheroptionen wie Cloudflare R2 sind nur nach belegtem Bedarf und Freigabe erlaubt, beispielsweise wenn offene Snapshots und rechtlich zulässige Preisverläufe die vereinbarten Git-/Asset-Budgets sprengen. R2 wäre Objektspeicher, kein Grund, jetzt doch eine Laufzeit-Datenbank einzubauen.
