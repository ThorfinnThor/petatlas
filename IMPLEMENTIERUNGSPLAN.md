# Implementierungsplan: datengetriebene Haustierplattform

**Deutschland zuerst. International vorbereitete Architektur. Statisches HTML und JSON statt Laufzeitdatenbank.**

Version 1.0 — 6. September 2026. Arbeitstitel PetAtlas, nicht markenrechtlich geprüft.

## 1. Auftrag und Fertigstellungsziel

Ein öffentliches GitHub-Projekt soll eine deutschsprachige Haustierplattform tragen. GitHub Actions übernimmt kontrollierte Ingestion und Qualitätsprüfungen. Build und Deployment laufen bei Cloudflare. Der Browser erhält statisches HTML, CSS, JavaScript und kleine zweckgebundene JSON-Dateien. Kein Supabase, keine gehostete Produkt-/Nutzerdatenbank und kein SSR im Startumfang.

Das Ziel ist nicht ein weiterer Blog mit vielen automatisch erzeugten Texten. Die erste produktive Version soll diese überprüfbaren Nutzerpfade bieten: Tierarztgebühren nachvollziehen; relevante Orte auf einer bundesweiten erfassten Karte finden; einen begrenzten Deutschland-Auslandsreisecheck durchlaufen; Pflege-/Healthzubehör und Spielzeug anhand belegter Eigenschaften finden; Futterangebote mengenrichtig vergleichen; eine optionale Merkliste bzw. ein Profil lokal im Browser verwenden.

Der Plan ist in **20 Meilensteine M00–M19 mit je sechs Teilaufgaben**, insgesamt **120 Aufgaben**, gegliedert. Jede Aufgabe hat Liefergegenstände, Abnahmebedingungen und Dependencies. Der Status wird in Dateien gespeichert, nicht nur im Gespräch mit dem Agenten. Dieses Dokument erstellt noch keine Website und keine Cloud-Ressourcen.

## 2. Festgelegte Abgrenzungen

Deutschland ist der einzige Absatzmarkt zum Start. Ein deutscher Reisecheck für Italien startet keinen italienischen Markt. USA und weitere europäische Märkte werden über deaktivierte Konfigurationen und synthetische Vertragstests vorbereitet, nicht mit ungeprüften übersetzten Inhalten live geschaltet.

Hunde und Katzen bilden den ersten fachlichen Tierumfang; die lokale Karte ist zunächst vor allem hundebezogen. Weitere Tierarten brauchen eigene Quellen/Regeln und sind nicht durch eine beliebige Dropdown-Erweiterung abgedeckt.

Health bedeutet im Startumfang Pflege-, Zahnpflege- und Mobilitätszubehör mit belegten Produkteigenschaften. Supplements, medizinische Tests, Medikamente, Diagnose- und Dosierungsempfehlungen gehören nicht ungeprüft in eine automatische Matching-Engine. Solche Erweiterungen bleiben möglich, erhalten aber eigene Evidenz-/Rechts-/Partnergates.

Nicht im ersten produktiven Umfang: Konten, Cloud-Profile, Newsletter, Uploads, zentrale Nutzerbewertungen, persönliche Preisalarme, KI-Chatbot, serverseitiges Klicktracking und stündlicher Vollsite-Wetterbuild. Ad-Platzierungen können strukturell vorgesehen werden; echte Werbung/Tracking erst nach separater Freigabe aktivieren.

## 3. Die drei wichtigsten Architekturentscheidungen

**Erstens: Cloudflare Static Assets, nicht Serverlogik pro Besucher.** Astro rendert vorab. Die hier ausgewählte Cloudflare-Variante heißt Workers Static Assets, benötigt aber für dieses Projekt kein Worker-Script pro Request. Reine Asset-Auslieferung und Build-/Worker-Ausführung sind unterschiedliche Ressourcen. [S01–S04]

**Zweitens: öffentliches Repo, aber keine öffentlichen geschützten Rohfeeds.** Offene Daten und zugehörige Rechtehinweise können in versionierten Snapshots liegen. Affiliate-Feeds werden standardmäßig nur im vertrauenswürdigen Cloudflare-Build abgerufen; in die Website gelangen ausschließlich erlaubte Anzeigefelder. Ein statisches JSON im Browser ist ebenfalls eine öffentliche Ausgabe. [S27–S28]

**Drittens: technische Fertigstellung und Live-Freigabe getrennt.** Claude kann mit sauberen Fixtures Adapter, Rechner, UI und Tests entwickeln. Fehlende Konten, Partnerzulassungen oder Fachprüfungen sperren das betroffene Live-Feature, nicht pauschal jede weitere Arbeit. Der Agent darf keine Freigaben erfinden.

## 4. Informationsarchitektur

```text
/de-de/
/de-de/tierarztkosten/
/de-de/tierarztkosten/<gepruefter-leistungs-slug>/
/de-de/karte/
/de-de/orte/<qualifizierter-orts-slug>/
/de-de/reisecheck/
/de-de/reisen/<unterstuetztes-ziel>/
/de-de/pflege/
/de-de/spielzeug/
/de-de/spielzeug/finder/
/de-de/futter/
/de-de/produkte/<produkt-slug>/
/de-de/merkliste/
/de-de/quellen/
/de-de/datenstand/
/de-de/impressum/
/de-de/datenschutz/
/data/v1/...
```

Diese Liste beschreibt Seitentypen, keine Pflicht, jede mögliche Kombination zu generieren. Inaktive oder ungeprüfte Funktionen werden nicht als leere SEO-Seiten veröffentlicht. Quelle, Datenstand, Methodik und Werbung sind sichtbar und konsistent eingebunden. Die Root-Weiterleitung führt definiert zum Startmarkt; kein IP-basiertes Umleiten.

## 5. Ausführungsprinzip für Claude Code

Kurzform: lesen -> nächste ausführbare Aufgabe wählen -> implementieren -> wirklich testen -> Ergebnis dokumentieren -> kleinen Checkpoint erstellen -> weiterarbeiten. Eine Statusabfrage nennt Meilenstein und Teilaufgabe, nicht nur „Frontend fast fertig“.

Der vollständige Arbeitsvertrag steht in CLAUDE.md und der Startprompt in STARTPROMPT.md. Die knappe CLAUDE.md bleibt im Kontext; große Fachspezifikationen nur bei Bedarf lesen. Tests und spezifische Verifikationsschritte sind ein zentraler Bestandteil des autonomen Arbeitsmodells. [S14]

Unaufsichtigtes Coding ist nicht gleich unbegrenzte Laufzeit: Kontext-/Nutzungslimits, eine gestoppte Sitzung oder fehlende Rechte bleiben reale Grenzen. Ein Handoff muss ermöglichen, genau dort fortzufahren, ohne Architektur und Aufgaben neu zu erfinden.

## 6. Meilensteinübersicht

| ID | Bereich | Teilaufgaben |
|---|---|---:|
| M00 | Projektvertrag und sichere Ausgangslage | 6 |
| M01 | Repository und technische Grundausstattung | 6 |
| M02 | Statussteuerung und Fortsetzungsprotokoll | 6 |
| M03 | Domänenmodelle und Internationalisierung | 6 |
| M04 | Informationsarchitektur und Bedienoberfläche | 6 |
| M05 | Quellenregister und Publikationsrechte | 6 |
| M06 | Generisches Import- und Snapshot-System | 6 |
| M07 | GitHub CI und Cloudflare-Deployment | 6 |
| M08 | Tierarztkosten-Rechner | 6 |
| M09 | Versicherungs-Affiliate ohne Scheinberatung | 6 |
| M10 | Deutschlandweite Ortsdaten | 6 |
| M11 | Hunde-Karte und lokale Landingpages | 6 |
| M12 | Haustier-Reisecheck für deutsche Nutzer | 6 |
| M13 | Affiliate-Produktfeeds und Angebotskatalog | 6 |
| M14 | Health-/Pflegeprodukte und Spielzeug-Finder | 6 |
| M15 | Futtervergleich und optionale offene Anreicherung | 6 |
| M16 | Lokales Tierprofil, Merkliste und Packliste | 6 |
| M17 | Geplante Ingestion und Datenbetrieb | 6 |
| M18 | SEO, Sicherheit, Zugänglichkeit und Freigaben | 6 |
| M19 | Endabnahme, Betriebshandbuch und Ausbauprobe | 6 |


---

## 7. Verbindliche Entscheidungen

Stand: 2026-09-06. Diese Entscheidungen sind Vorgaben des Plans, keine behaupteten bereits ausgeführten Arbeiten.

| ID | Entscheidung | Begründung / Konsequenz |
|---|---|---|
| ADR-001 | Deutschland-first, internationalisierbar | Nur Markt DE ist öffentlich aktiv. Zielstaaten im Reisecheck sind keine gestarteten Absatzmärkte. |
| ADR-002 | Astro, statische Ausgabe | HTML wird beim Build erzeugt; Interaktion im Browser. Kein SSR, keine Server Actions. |
| ADR-003 | Cloudflare Workers Static Assets, assets-only | Neues Cloudflare-Projekt, keine Worker-Request-Logik. Name „Workers“ bedeutet hier nicht, dass für jeden Seitenaufruf Rechenlogik läuft. [S02–S04] |
| ADR-004 | Build und Deploy bei Cloudflare | GitHub Actions übernehmen Tests, Import und Überwachung; sie sind nicht der zweite Produktions-Deploymentpfad. |
| ADR-005 | Öffentliches GitHub-Repo | Nur veröffentlichungsfähige Inhalte. Keine Bestandsrepos ungeprüft auf public umstellen. |
| ADR-006 | Keine Laufzeit-Datenbank | Kein Supabase, Postgres, D1, KV, Firebase oder eigener API-Server im Startumfang. Temporäre Build-Dateien und ein flüchtiger Osmium-Index sind keine gehostete Produktdatenbank. |
| ADR-007 | Datenklassen statt „alles ist JSON“ | Öffentliche Open-Data-Snapshots, vertragliche Affiliate-Feeds, eigene Redaktion und lokale Nutzerdaten getrennt behandeln. |
| ADR-008 | Affiliate-Feeds standardmäßig nur im vertrauenswürdigen Cloudflare-Build | Keine Rohfeeds in Git, Actions-Artefakten oder öffentlichen Build-Logs. Nur vertraglich freigegebene Anzeigefelder gelangen in HTML/JSON. |
| ADR-009 | Versionierte offene Daten im separaten data-live-Branch | main enthält Code, Rechtekonfiguration, redaktionell freigegebene Regeln und kleine Testdaten. Automatik schreibt nicht in main. |
| ADR-010 | Kein Markt-/Sprachraten | /de-de/ ist die erste Route; Markt, Sprache, Währung und geografisches Ziel sind unterschiedliche Felder. Keine IP-Weiterleitung. |
| ADR-011 | Fachliche Fail-closed-Regeln | Unbekannte Einreisevoraussetzung, ungeprüfte Behandlung oder unbekannte Produkteignung darf nicht zu einem positiven Ergebnis werden. |
| ADR-012 | Kontextbezogene Werbung statt Diagnose-Funnel | Medizinische Inhalte, Risikohinweise und Erlöslogik organisatorisch trennen. Keine Angst- oder Akutnotfall-Vermarktung. |
| ADR-013 | Feature Flags je Markt und Freigabestatus | Fehlende echte Daten deaktivieren eine Funktion; sie rechtfertigen keine veröffentlichten Testdaten. |
| ADR-014 | Repo-öffentlich ist nicht automatisch Open Source | Keine pauschale MIT-Lizenz über Code, fremde Daten, Bilder und Texte legen. Code-Lizenzentscheidung separat dokumentieren. |
| ADR-015 | Keine erfundenen Qualitätsbeweise | Keine Fake-Tests, Bewertungen, Tierärzte als Autoren, Partnerverträge, Statistiken oder Sicherheitsgarantien. |
| ADR-016 | Autonomie ist überprüfbarer Fortschritt | Kleine Aufgaben, automatisierte Tests, Git-Checkpoints, Blocker und Handoff. Keine Endlosschleifen oder ausgeschalteten Schutzmechanismen. |

### Nicht ohne neue Entscheidung hinzufügen

Bezahlte Infrastruktur, Login, Newsletter-Versand, Uploads, zentrale Nutzerbewertungen, Cloud-Profil, KI-Ratgeber im Besucherpfad, proprietäre Geocoding-API, serverseitiges Affiliate-Klicktracking, internationale Live-Märkte und automatisch übernommene Behandlungs-/Reiseregeln.

Wenn eine Entscheidung technisch nicht tragfähig ist, dokumentiere Messung, Alternativen und Kosten in einer neuen ADR. Bis zur Entscheidung arbeite an unabhängigen Aufgaben weiter. „Bequemer“ ist kein ausreichender Grund, das Static-first-Prinzip aufzugeben.

---

## 8. Architektur und Datenverträge

### 1. Gesamtsystem

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

### 2. Stack und Versionspolitik

Astro mit `output: 'static'`, TypeScript strict, npm mit `package-lock.json`, Node 24 LTS als Startlinie. Patchversion und konkrete stabile Abhängigkeiten beim Bootstrap anhand der Primärdokumentation prüfen und fixieren. Keine ungeprüften `latest`-Referenzen in wiederholbaren Builds. [S01, S15]

Für die Oberfläche Astro-Komponenten, normale CSS-Dateien mit Design Tokens und kleine TypeScript-Module. Kein React/Vue/Svelte als Pflichtabhängigkeit. Leaflet nur für die explizit aktivierte Karte. Pagefind für statische Volltextsuche; Browserfilter für Produkte. Zod für Dateneingänge, Vitest für Unit-/Integrationstests, Playwright für End-to-End-Tests, axe-core für zusätzliche Zugänglichkeitsprüfungen. Die tatsächlich kompatiblen Versionen werden in `docs/TOOLCHAIN.md` dokumentiert. [S16–S17]

Für große OSM-Dateien darf ein isoliertes Build-Werkzeug wie `osmium-tool` verwendet werden. Rohdaten werden gestreamt bzw. disk-basiert verarbeitet, nicht komplett in ein JavaScript-Array geladen. Keine zusätzliche Produktdatenbank daraus machen.

### 3. Repository-Struktur des zu bauenden Produkts

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

### 4. Marktmodell

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

### 5. Datenverträge

#### Provenienz

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

#### Rechtekonfiguration

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

#### Produkt ist nicht Angebot

`Product` beschreibt ein konkretes Produkt bzw. eine Variante: interne ID, Tierart, Kategorie, Marke, GTIN als String, Größe, Nettofüllmenge, Material und verifizierte Attribute.

`Offer` beschreibt ein Angebot eines Händlers: `offerId`, `productId`, `merchantId`, `marketId`, `currency`, `priceMinor`, `shippingMinor|null`, `availability`, `affiliateUrl`, `fetchedAt`, `expiresAt`, `displayPermission`, `imagePermission`.

GTIN-Prüfziffer validieren, führende Nullen erhalten, Varianten und Multipacks nicht zusammenschmelzen. Gleicher Produktname ist kein Identitätsbeweis. Mengenpreise und Gesamtpreise getrennt berechnen. Unbekannter Versand ist nicht kostenlos. Händler-Rabatt, bedingter Neukundenpreis und regulärer Preis bleiben getrennte Angebotsarten.

#### Orte

Stabile ID z. B. `osm:node:12345`, nicht aus Name/Adresse erzeugen. Kategorie, Geometrie, Koordinaten, Ortszuordnung, Kontakt, Öffnungszeiten und Provenienz getrennt. `emergency`, `wheelchair`, `fenced` und `dogAllowed` sind tri-state. Keine automatische Gleichsetzung von Tierarzt, Tierklinik und Notdienst.

Öffentliche Website und Telefonnummer nur übernehmen, wenn die konkrete Quelle und Datenschutzprüfung dies tragen. Keine privaten Ansprechpartnerlisten, E-Mail-Adressen von Tierhaltern oder OSM-Bearbeiter-Metadaten kopieren.

#### Gebühren und Behandlungsvorlagen

`FeeItem`: amtliche Positions-ID, Gebührenkatalogversion, Originalbezeichnung, Tierartbezug, Basiseinheit, Betrag, Quellenfundstelle.

`CostScenario`: redaktionell definierte Zusammenstellung von Positionen mit Mengen, Ausschlüssen und fachlicher Freigabe. Eine GOT-Position ist kein vollständiges Behandlungspaket. Den vollständigen Import darf man durchsuchen; ungeprüfte OP-Gesamtpakete nicht automatisch daraus generieren.

`CostResult`: Einzelpositionen, Multiplikatoren, Nettosumme, separat behandelte Zusatzkosten, Umsatzsteuerannahme, Bruttosumme, nicht enthaltene Kosten und Katalogversion. Dezimalfaktoren als validierte Dezimaldarstellung/Skalierung, keine unkontrollierte Gleitkomma-Geldarithmetik.

#### Reiseregeln

`TravelRule` enthält Herkunft, Ziel, Transit, Tierart, Reisekontext, anwendbaren Zeitraum, offizielle Quelle, geprüfte Prädikate und verständliche Hinweistexte. Eine kleine deklarative DSL mit festen Operatoren verwenden: `all`, `any`, `eq`, `in`, `dateBefore`, `dateAfter`, `daysBetween`. Keine JavaScript-Snippets aus JSON, kein `eval`.

Das Ergebnis ist eine Checkliste mit Zuständen `fulfilled`, `not_fulfilled`, `unknown`, `not_applicable`. Ein Gesamtstatus „alle von uns geprüften Voraussetzungen erfüllt“ ist nur bei vollständigem bekannten Anwendungsbereich erlaubt; er ist keine Einreisegarantie. Unbekannte Transitländer oder Reisekontexte beenden die automatische Freigabe.

### 6. JSON-Strategie

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

### 7. Lokale Nutzerfunktionen

Profil zunächst nur im Speicher des Tabs. Option „Auf diesem Gerät speichern“ aktiviert nach bewusster Auswahl eine versionierte lokale Speicherung. Import/Export als lokal herunterladbare JSON-Datei; Schema- und Größenprüfung beim Import. Kein Name, keine Adresse oder E-Mail erforderlich. Standort nur nach ausdrücklicher Benutzeraktion, nicht automatisch beim ersten Laden.

Hinweise: kein Geräteabgleich, kein Backup, keine zentrale Wiederherstellung. Löschknopf entfernt sämtliche lokalen Projektschlüssel. Private Merkliste, Packliste und Budget bleiben im Browser. Kein geheimes Gesundheitsprofil in Querystrings oder Affiliate-Sub-IDs.

### 8. Erweiterung ohne Neubau

Ein neuer Markt benötigt Konfiguration, übersetzte Oberfläche, geprüfte Quellen/Regeln, passende Angebote, Rechts-/Datenschutzprüfung und Freigabe. Er wird nicht durch bloßes Aktivieren eines Flags „fertig“.

Der spätere US-Kostenadapter darf Mess-/Schätzpreise als eigenen Quellentyp liefern. Er darf niemals mit GOT-Faktoren oder dem Label „gesetzlicher Gebührensatz“ versehen werden. Market-Capability-Tests müssen beweisen, dass ein nicht vorhandener Kostenadapter zu `unsupported` führt.

Spätere Speicheroptionen wie Cloudflare R2 sind nur nach belegtem Bedarf und Freigabe erlaubt, beispielsweise wenn offene Snapshots und rechtlich zulässige Preisverläufe die vereinbarten Git-/Asset-Budgets sprengen. R2 wäre Objektspeicher, kein Grund, jetzt doch eine Laufzeit-Datenbank einzubauen.

---

## 9. Quellen und Rechte

### Grundregel

Öffentlich lesbar, kostenlos abrufbar, kommerziell verwendbar und öffentlich weiterverteilbar sind vier verschiedene Eigenschaften. Das öffentliche Repo und die statischen JSON-Endpunkte benötigen ausdrücklich passende Veröffentlichungsrechte. Dieser Plan gibt keinen einzelnen importierten Datensatz pauschal frei.

Die Quellen [S18–S31] sind überprüfte Einstiegsquellen. Vor jedem echten Import wird die konkrete Distribution mit ihren aktuellen Bedingungen erfasst. Unklare Rechte -> `pending` und nur Adapter/Fixtures bauen, keine Rohdaten veröffentlichen. Rechtliche Einschätzungen in diesem Plan sind technische Risikovorgaben, keine individuelle Rechtsberatung.

### Startquellen und ihre Rolle

| Quelle | Startrolle | Verarbeitung | Bedingung vor Live-Nutzung |
|---|---|---|---|
| GOT / Gesetze im Internet | Pflicht: Gebührenkatalog | XML bevorzugen, HTML-Fallback; Positionen exakt übernehmen | Fassung, Änderungsstand, Parser-Stichprobe und fachlich geprüfte Rechenregeln; keine fremden Kommentare übernehmen. [S18–S19] |
| OSM über Geofabrik | Pflicht: bundesweite POIs | PBF zunächst regional, dann alle deutschen Extrakte; nur benötigte Tags | ODbL-Attribution, Download-/Weitergabeweg der abgeleiteten Daten, dokumentierte Lizenzgrenzen. [S21–S23] |
| OSM-Kartenkacheln | Austauschbarer Darstellungsdienst | Nur interaktives Laden nach Kartenaktivierung | Aktuelle Tile-Policy und Datenschutzhinweis; kein Scraping, Preloading, Offline-Download, Proxy zur Limitumgehung. Kein SLA versprechen. [S24] |
| Kommunale Open Data | Optionale lokale Vertiefung | Ein Adapter pro konkreter Distribution | Lizenz und Aktualität pro Datensatz; keine Annahme, dass jeder GovData-Treffer offen ist. |
| EU-Kommission und amtliche Zielstaat-Quellen | Pflicht: Reisecheck | Geprüfte deklarative Regeln; Quelländerungen automatisch erkennen | Anwendungsbereich, Inkrafttreten, Transit und Rückreise; fachliche Freigabe vor Veröffentlichung. [S25–S26] |
| Awin / weitere vertragliche Feeds | Pflicht-Adapter, Freigabe abhängig von Account | Abruf nur im geschützten Build; minimale Anzeigefelder | Programmzulassung und konkrete Website-/JSON-/Bild-/Cache-Rechte. Keine Konditionen aus früheren Chatnachrichten übernehmen. [S27–S28] |
| Open Pet Food Facts | Optionale Futteranreicherung | Gemessene Stichprobe, später nur benötigte Produkte | Exakte OPFF-Distribution, API-Regeln, ODbL-/Inhalts-/Bildrechte; keine umfassende Abdeckung behaupten. [S29–S30] |
| DWD Open Data | Ausbau, nicht Launch-Abhängigkeit | Eigenes statisches Wetterpaket mit Frischegrenzen | Produktbezogene Rechte/Attribution und fachlich geprüfte Hinweistexte. Keine medizinische „sicher Gassi“-Prognose aus Temperatur allein. [S31] |
| Wikidata | Optionaler Identifikator-/Sprachlayer | Kleine definierte Abfragen, keine Rassen-Gesundheitserfindung | Konkrete CC0-Ressource und Qualitätsprüfung; keine Wikimedia-Bilder pauschal mitlizenzieren. |
| RASFF / BVL / Safety Gate | Späterer Rückrufbereich | Erst Quellen-/API-/Markenabdeckung prüfen | Keine bereits verfügbare universelle JSON-API oder vollständige EAN-Abdeckung voraussetzen. Negative Treffer sind keine Sicherheitszertifikate. |
| EEA Badegewässer | Spätere Kartenanreicherung | Gewässerdatensatz getrennt von Hundeerlaubnis | Datensatzrechte und Erhebungsjahr; Badegewässerqualität bedeutet nicht hundefreundlich oder aktuell algenfrei. |
| FEDIAF / ESCCAP | Nicht automatisiert importieren | Im Startumfang höchstens zulässige Verweise | Schriftliche Erlaubnis und konkrete Bedingungen erforderlich, soweit keine passende freie Lizenz nachgewiesen ist. |
| EMA / UPD | Nicht Launch-abhängig | Zunächst offizielle Verlinkung | Konkrete API-/Weiterverwendungsrechte und medizinisches Review; kein ungesicherter Massenimport. |

### Wichtige Korrekturen gegenüber einer zu einfachen Datenstrategie

**ODbL:** Separate Ordner sind gute Provenienz, aber kein juristischer Schutzschalter. Ob ein Join, eine korrigierte Ortsliste, ein Produktmatching oder ein exportierter Score eine abgeleitete Datenbank erzeugt, hängt von der tatsächlichen Verarbeitung ab. Dokumentiere den Datenfluss und erfülle gegebenenfalls Share-Alike-/Bereitstellungspflichten. Eigene Daten werden nicht allein durch ein neues ID-Feld lizenzfrei. [S22]

**Affiliate:** Ein erlaubter Produktvergleich heißt nicht automatisch, dass eine komplette Händlerdatenbank in einem öffentlichen GitHub-Repository oder als öffentliches JSON-Archiv liegen darf. Rechte für Webanzeige, Rohdatenweitergabe, Bilder, Historie und Caching separat erfassen. Keine Vertragsdokumente mit vertraulichen Konditionen in ein öffentliches Issue kopieren. [S27–S28]

**Gesetze:** Gebührenpositionen und amtliche Regeln dürfen nicht mit privaten Erläuterungen vermischt werden. Ein vollständiger technischer GOT-Import erzeugt noch keine medizinisch valide OP-Kostenschätzung. Das amtliche Gebührenverzeichnis ist zudem kein einzigartiger exklusiver Datensatz. [S18–S19]

**Öffentliches Geschäftsmodell:** Öffentlich ausgelieferte Daten und öffentliche Repository-Inhalte sind kopierbar. Differenzierung muss aus guter Aufbereitung, überprüften Zuordnungen, hilfreicher Bedienung und eigenen rechtmäßig erhobenen Erfahrungen kommen, nicht aus einem behaupteten geheimen Datenbestand.

### Source Registry: Pflichtfelder

`id`, `name`, `resourceUrl`, `publisher`, `format`, `marketScope`, `sourceKind`, `rights`, `fetchPolicy`, `freshnessPolicy`, `allowedOutputClasses`, `fieldAllowlist`, `rateLimit`, `schemaVersion`, `termsHash`, `checkedAt`, `lastSuccessfulImportAt`, `reviewOwner`, `approvalEvidence`.

Felder können `null` sein, aber ein Publisher darf daraus keine Erlaubnis ableiten. Startzustand einer neuen Quelle ist `pending`. Rechtstext und Nutzungsbedingungen nach Möglichkeit als Hash plus öffentliche Referenz festhalten; eine vollständige Kopie nur bei erlaubter Speicherung.

### Vorschläge für Frischepolitik

Dies sind Projektgrenzen, keine Zusagen der Datenanbieter:

| Quelle | Normaler Prüf-/Importtakt | Warnung / Sperre |
|---|---|---|
| GOT | Änderungsscan wöchentlich, Import nach freigegebener Änderung | Erkannte fachliche Änderung sperrt betroffene Szenarien bis Review; nach 30 Tagen ohne Quellenprüfung keine Aussage „aktuell geprüft“. |
| OSM | Start wöchentlich | Ab 30 Tagen deutliches Alterssignal; bei Ausfall letzten Stand anzeigen, keine aktuellen Öffnungszeiten garantieren. |
| Kommunale Regeln | Quellencheck wöchentlich; Review mindestens monatlich | Widerspruch, fehlender Geltungszeitraum oder abgelaufene Prüfung -> betreffende Regel nicht als verbindliches Ergebnis ausgeben. |
| Reise | Quelländerungscheck täglich; planmäßiges Review maximal 30 Tage | Neue Quellfassung, unbekanntes Inkrafttreten oder abgelaufenes Review -> keine positive Gesamtcheckliste. |
| Angebote | Abruf täglich oder gemäß Vertrag | Standardmäßig nach 24 Stunden Preis nicht mehr als aktuelles Angebot verwenden; Vertrag kann kürzere Frist verlangen. |
| Optionale OPFF-Daten | Wöchentlich bzw. bedarfsbezogen | Herkunft und Aktualität immer sichtbar; fehlende Nährwertangaben bleiben unbekannt. |
| Späteres Wetter | Nur mit getrenntem Aktualisierungsbudget | Veraltete Daten zeigen keinen grünen Sicherheitszustand; konkrete TTL pro Wetterprodukt. |

### Quellenqualität und Widersprüche

Quellenpriorität ist feld- und themenabhängig: amtliche Einreiseregel vor Reiseblog, konkrete Herstellergrößenangabe vor automatisch extrahiertem Beschreibungstext. OSM und kommunale Ortsdaten werden nicht blind überschrieben. Jeder Konflikt erhält eine maschinenlesbare Notiz; ungeklärte Felder bleiben unbekannt oder werden nicht angezeigt.

Keine Quelle darf stillschweigend durch eine beliebige Suchmaschinenfundstelle ersetzt werden, nur um einen grünen Build zu erzeugen. Fehlt ein API-Zugang, ist ein lizenzierter manueller Datensatz mit klarer Quelle ein zulässiger Übergang; erfundene Produktionsdaten sind es nicht.

---

## 10. Alle Arbeitspakete

120 einzelne Aufgaben. Jede ID bleibt stabil. Der tatsächliche Status liegt ausschließlich in `project/tasks.json`. Alle Aufgaben beginnen als `todo`.

Externe Konto-, Fach- und Launchfreigaben sind separat markiert. Sie dürfen nicht das Implementieren unabhängiger Module verhindern. Maßgeblich sind die einzelnen Dependencies, nicht pauschal die Fertigstellung eines gesamten vorangehenden Meilensteins.

### M00 — Projektvertrag und sichere Ausgangslage

**Ziel:** Projektgrenzen festhalten, bevor ein Agent Repository- oder Infrastrukturentscheidungen trifft.

**Technische Voraussetzungen:** keine

#### M00-01 — Arbeitsverzeichnis prüfen

**Umsetzung:** Bestehende Dateien, git status, vorhandene Remotes und fremde Änderungen inventarisieren. Bei bestehendem Produkt nur additiv arbeiten; kein neues Scaffold darüberkopieren.

**Liefergegenstände:** `docs/BASELINE.md`

**Abnahme:** Ein dokumentierter Ausgangszustand existiert; keine fremden Änderungen wurden gelöscht.

**Abhängigkeiten:** keine

#### M00-02 — Festgelegten Umfang übernehmen

**Umsetzung:** ADR-001 bis ADR-016 lesen und Startumfang, aktive Märkte und ausdrücklich ausgeschlossene Funktionen festhalten.

**Liefergegenstände:** `docs/DECISIONS.md`; `config/launch.json`

**Abnahme:** Deutschland ist der einzige aktive Markt; kein ungeplantes Backend und keine Zusatzprodukte sind in der Roadmap.

**Abhängigkeiten:** M00-01

#### M00-03 — Benennung zentralisieren

**Umsetzung:** Arbeitstitel PetAtlas ausschließlich als austauschbaren internen Namen verwenden; Branding, Basisdomain und Betreiberangaben zentral konfigurieren. Keine Markenverfügbarkeit behaupten.

**Liefergegenstände:** `config/site.ts`; `docs/EXTERNAL_SETUP.md`

**Abnahme:** Namenswechsel ist ohne Suchen/Ersetzen in Fachlogik möglich; fehlende echte Domain sperrt production, nicht development.

**Abhängigkeiten:** M00-02, M00-01

#### M00-04 — Autonomierechte festlegen

**Umsetzung:** Lesen, Codeänderungen, lokale Tests und kleine lokale Commits erlauben. Öffentliche Repo-Erstellung nur im eindeutig zugeordneten Account; kein bestehendes privates Repo ungeprüft umstellen.

**Liefergegenstände:** `CLAUDE.md`; `docs/SECURITY_SCOPE.md`

**Abnahme:** Erlaubte Aktionen, externe Schreibgrenzen und verbotene destruktive Befehle sind konkret dokumentiert.

**Abhängigkeiten:** M00-03, M00-01

#### M00-05 — Kosten- und Lizenzgrenzen festlegen

**Umsetzung:** Kein kostenpflichtiger Tarif, keine Domainbestellung und keine blanket Open-Source-Lizenz ohne Entscheidung. Rechtehinweise für eigene und fremde Inhalte trennen.

**Liefergegenstände:** `licenses/README.md`; `docs/DECISIONS.md`

**Abnahme:** Repo-Publicity wird nicht mit MIT oder pauschaler Weiterverwendungserlaubnis gleichgesetzt.

**Abhängigkeiten:** M00-04, M00-01

#### M00-06 — Externe Voraussetzungen erfassen

**Umsetzung:** GitHub-Inhaber, Cloudflare-Projekt, Domain, Betreiberangaben, Partneraccounts und Fachreviews in einer Liste mit Status und zuständigem Entscheider erfassen. Nur Secret-Namen, niemals Werte.

**Liefergegenstände:** `docs/EXTERNAL_SETUP.md`; `docs/BLOCKERS.md`

**Abnahme:** Fehlende Angaben sind sichtbar, aber lokale Entwicklung ist nicht blockiert.

**Abhängigkeiten:** M00-05, M00-01

### M01 — Repository und technische Grundausstattung

**Ziel:** Ein schlankes, lokal reproduzierbares Astro-Projekt erstellen und den öffentlichen Git-Pfad sicher vorbereiten.

**Technische Voraussetzungen:** M00-01, M00-02

#### M01-01 — Astro-Scaffold anlegen

**Umsetzung:** Astro static, TypeScript strict, npm-Lockfile und Node-24-LTS-Linie einrichten. Bestehende kompatible Struktur erhalten.

**Liefergegenstände:** `package.json`; `package-lock.json`; `astro.config.mjs`; `.nvmrc`

**Abnahme:** Ein sauberer Clone lässt sich reproduzierbar installieren; Startseite wird rein statisch gebaut.

**Abhängigkeiten:** M00-01, M00-02

#### M01-02 — Öffentliches Repo einrichten **[Externer Freigabepunkt]**

**Umsetzung:** Nach Secret-/Historienprüfung ein neues public Repo im autorisierten GitHub-Account erstellen oder das explizit zugewiesene Repo verwenden. Origin und Default-Branch dokumentieren.

**Liefergegenstände:** `docs/REPOSITORY.md`; `GitHub repository`

**Abnahme:** Echte Remote-URL und Public-Status geprüft; wenn Zugriff fehlt, Integration blocked statt behauptetem Erfolg.

**Abhängigkeiten:** M00-01, M00-02, M01-01

#### M01-03 — Basisqualität installieren

**Umsetzung:** Linting, Typecheck, Vitest, Playwright und Formatierung konfigurieren. Abhängigkeiten pinnen und Versionsbegründung festhalten.

**Liefergegenstände:** `eslint config`; `tsconfig`; `vitest config`; `playwright config`

**Abnahme:** Ein absichtlich eingeführter Typ-/Lintfehler würde die Pipeline scheitern lassen; Testsample läuft.

**Abhängigkeiten:** M00-01, M00-02, M01-01

#### M01-04 — Geheimnisse und Buildreste ausschließen

**Umsetzung:** .gitignore für .work, .generated, dist, echte .env-Dateien und Reports; .env.example ausschließlich mit leeren oder sicheren Beispielwerten anlegen.

**Liefergegenstände:** `.gitignore`; `.env.example`; `scripts/checks/secrets.ts`

**Abnahme:** Canary-Secret wird im Repo-/dist-Audit erkannt; Fixtures bleiben eindeutig bezeichnet.

**Abhängigkeiten:** M00-01, M00-02, M01-03, M01-01

#### M01-05 — Test- und Produktionsmodus trennen

**Umsetzung:** development, preview und production als explizite Build-Modi implementieren. Fixture-Daten dürfen nicht durch eine fehlende Umgebungsvariable versehentlich live werden.

**Liefergegenstände:** `config/build.ts`; `fixtures/`; `tests/build-mode.test.ts`

**Abnahme:** Fixture-Build funktioniert ohne Netz; production verweigert ungeklärte Pflichtkonfiguration.

**Abhängigkeiten:** M00-01, M00-02, M01-04, M01-01

#### M01-06 — Grundlegenden Browser-Smoke ausführen

**Umsetzung:** Startseite, 404 und ein Formular unter lokalem statischem Preview im Browser öffnen, Konsolenfehler und Mobilansicht prüfen.

**Liefergegenstände:** `tests/e2e/smoke.spec.ts`; `docs/TOOLCHAIN.md`

**Abnahme:** Tatsächliche Browserprüfung mit Screenshot und Testlog; keine nur angenommene Funktionsfähigkeit.

**Abhängigkeiten:** M00-01, M00-02, M01-05, M01-01

### M02 — Statussteuerung und Fortsetzungsprotokoll

**Ziel:** Den Arbeitsstand unabhängig vom Chatfenster nachvollziehbar und nach Unterbrechungen fortsetzbar machen.

**Technische Voraussetzungen:** M00-02

#### M02-01 — Aufgabenmanifest übernehmen

**Umsetzung:** project/tasks.json aus dem Paket als alleinige maschinenlesbare Statusquelle übernehmen. IDs erhalten; neue Aufgaben bekommen neue IDs.

**Liefergegenstände:** `project/tasks.json`

**Abnahme:** Alle 120 Aufgaben sind eindeutig; vorhandene Nachweise werden beim Aktualisieren nicht überschrieben.

**Abhängigkeiten:** M00-02

#### M02-02 — Statuswerkzeug integrieren

**Umsetzung:** Mitgelieferten Python-Statushelfer behalten; optional npm-Alias status ergänzen. Filter pro Meilenstein und JSON-Ausgabe unterstützen.

**Liefergegenstände:** `scripts/project_status.py`; `package.json`

**Abnahme:** Statusgesamtübersicht und Status M08 funktionieren ohne laufende Website.

**Abhängigkeiten:** M00-02, M02-01

#### M02-03 — Statusartefakte pflegen

**Umsetzung:** STATUS, WORKLOG, BLOCKERS und HANDOFF als knappe menschliche Ansichten festlegen; task manifest bleibt autoritativ.

**Liefergegenstände:** `docs/STATUS.md`; `docs/WORKLOG.md`; `docs/HANDOFF.md`

**Abnahme:** Ein Beispielübergang todo -> in_progress -> done aktualisiert die Ansichten konsistent.

**Abhängigkeiten:** M00-02, M02-02, M02-01

#### M02-04 — Done-Nachweise validieren

**Umsetzung:** Automatische Prüfung auf Abhängigkeiten, Nachweise bei done, begründete Blocker und höchstens eine koordinierende Hauptaufgabe in Arbeit anlegen.

**Liefergegenstände:** `scripts/checks/task-state.ts oder Statushelfer-Erweiterung`; `Tests`

**Abnahme:** Eine done-Aufgabe ohne Nachweis oder ein unbekannter Dependency-Key führt zu Fehler.

**Abhängigkeiten:** M00-02, M02-03, M02-01

#### M02-05 — Arbeits- und Fehlerloop definieren

**Umsetzung:** Je Aufgabe lesen, prüfen, implementieren, testen, dokumentieren, committen. Bei drei erfolglosen Korrekturansätzen Ursache/Blocker erfassen und unabhängige Aufgabe wählen.

**Liefergegenstände:** `CLAUDE.md`; `docs/AUTONOMY.md`

**Abnahme:** Protokoll verhindert Endlosschleifen und das künstliche Grünmachen von Tests.

**Abhängigkeiten:** M00-02, M02-04, M02-01

#### M02-06 — Wiederaufnahme proben

**Umsetzung:** Kontextwechsel simulieren: neue Sitzung liest nur CLAUDE.md, Status, Handoff und betroffene Spezifikation, identifiziert korrekten nächsten Schritt.

**Liefergegenstände:** `docs/HANDOFF.md`; `docs/WORKLOG.md`

**Abnahme:** Der Arbeitsstand ist ohne frühere Chatnachrichten rekonstruierbar.

**Abhängigkeiten:** M00-02, M02-05, M02-01

### M03 — Domänenmodelle und Internationalisierung

**Ziel:** Fachlogik von Markt, Darstellung und Datenlieferanten entkoppeln.

**Technische Voraussetzungen:** M01-01, M02-01

#### M03-01 — Markt- und Locale-Schemas bauen

**Umsetzung:** DE aktiv, US und ein EU-Testmarkt inaktiv; Markt, Sprache, Währung, Zeitzone und Reiseziel als getrennte Konzepte.

**Liefergegenstände:** `src/domain/market.ts`; `config/markets/`; `tests/markets.test.ts`

**Abnahme:** Ein DE-Nutzer mit Reiseziel IT bleibt im Markt DE; keine US-Seite wird generiert.

**Abhängigkeiten:** M01-01, M02-01

#### M03-02 — Geld, Einheiten und Datum implementieren

**Umsetzung:** Integer-Geld, kontrollierte Dezimalfaktoren, Gramm/Meter und locale-spezifische Ausgabe; Kalenderdaten von UTC-Zeitstempeln trennen.

**Liefergegenstände:** `src/domain/money.ts`; `units.ts`; `dates.ts`

**Abnahme:** Rundungs-, Währungs-, Einheiten- und Zeitzonengrenzfälle sind getestet.

**Abhängigkeiten:** M01-01, M02-01, M03-01

#### M03-03 — Provenienz und Rechte typisieren

**Umsetzung:** Schemas aus ARCHITECTURE umsetzen; null ist unbekannt. Source-ID, Inhaltshash, Lizenz, Geltung und Review separat.

**Liefergegenstände:** `src/domain/source.ts`; `rights.ts`; `schemas/`

**Abnahme:** Unbekannte Rechte oder fehlende Pflichtprovenienz verhindern öffentliche Ausgabe.

**Abhängigkeiten:** M01-01, M02-01, M03-02, M03-01

#### M03-04 — Fachschemas implementieren

**Umsetzung:** Product, Offer, Place, FeeItem, CostScenario, TravelRule, PetProfile und OutputManifest mit Zod validieren.

**Liefergegenstände:** `src/domain/schemas/`; `tests/contracts/`

**Abnahme:** Ungültige GTIN, negative Geldwerte, fehlerhafte Koordinaten und ungültige Perioden werden erkannt.

**Abhängigkeiten:** M01-01, M02-01, M03-03, M03-01

#### M03-05 — Provider-Schnittstellen definieren

**Umsetzung:** Kosten-, Orts-, Reise- und Commerce-Provider erhalten marktbezogene IDs; unsupported ist ein definierter Rückgabewert.

**Liefergegenstände:** `src/domain/providers.ts`; `config/markets/DE.json`

**Abnahme:** Kein deutsches Gebührenfallback für unbekannten Markt; keine Providerwahl über verstreute if country-Blöcke.

**Abhängigkeiten:** M01-01, M02-01, M03-04, M03-01

#### M03-06 — Internationale Isolation testen

**Umsetzung:** Synthetischen US-Anbieter mit USD und Imperial-Anzeige durch dieselben Fachschnittstellen führen; keine echten US-Inhalte abrufen.

**Liefergegenstände:** `tests/international-contracts.test.ts`

**Abnahme:** US-Angebote erscheinen nicht in DE und eine englische Testansicht überschreibt keine deutschen Texte.

**Abhängigkeiten:** M01-01, M02-01, M03-05, M03-01

### M04 — Informationsarchitektur und Bedienoberfläche

**Ziel:** Das gemeinsame Layout für Rechner, Karte, Reise und Produkte erstellen, bevor viele Seiten entstehen.

**Technische Voraussetzungen:** M03-01, M01-01

#### M04-01 — Route Registry anlegen

**Umsetzung:** Einheitliche Pfade /de-de/ mit zentralen Slugs, canonical-Regeln und market-aware Link-Helfern definieren.

**Liefergegenstände:** `src/lib/routes.ts`; `config/locales/de-DE.json`

**Abnahme:** Keine hart codierten Domains; Slugänderungen lassen sich mit gezielten Redirects abbilden.

**Abhängigkeiten:** M03-01, M01-01

#### M04-02 — Designsystem implementieren

**Umsetzung:** Mobile-first Layout, lesbare Formulare, Ergebnisboxen, Warnungen, Datenstand, Quellen und Werbekennzeichnung als wiederverwendbare Komponenten.

**Liefergegenstände:** `src/components/`; `src/styles/tokens.css`; `layouts/`

**Abnahme:** Desktop/mobile ohne Layoutbruch; Informations- und Werbebereiche sind erkennbar verschieden.

**Abhängigkeiten:** M03-01, M01-01, M04-01

#### M04-03 — Navigation und Kernseiten bauen

**Umsetzung:** Home, Rechner, Karte, Reisecheck, Pflege, Spielzeug, Futter, Quellen und Datenstand als echte Templates anlegen. Nicht verfügbare Features aus Navigation entfernen.

**Liefergegenstände:** `src/pages/`; `src/layouts/`

**Abnahme:** Kein Navigationseintrag führt auf leere Coming-soon- oder Fixture-Produktionsseiten.

**Abhängigkeiten:** M03-01, M01-01, M04-02, M04-01

#### M04-04 — Statische Suche integrieren

**Umsetzung:** Pagefind nach HTML-Build ausführen; Sprache, Kategorien und Ausschluss privater-/Filterseiten konfigurieren.

**Liefergegenstände:** `scripts/build-search.ts`; `src/components/Search.astro`

**Abnahme:** Suche arbeitet ohne Backend und findet nur freigegebenen statischen Inhalt.

**Abhängigkeiten:** M03-01, M01-01, M04-03, M04-01

#### M04-05 — Zugängliche Formulare erstellen

**Umsetzung:** Labels, Tastaturbedienung, Validierungszusammenfassung, Fokusführung und Screenreader-Ankündigung für Ergebnisse implementieren.

**Liefergegenstände:** `src/components/forms/`; `tests/e2e/forms.spec.ts`

**Abnahme:** Rechner- und Filterformulare sind ohne Maus bedienbar; Errors haben programmatische Zuordnung.

**Abhängigkeiten:** M03-01, M01-01, M04-04, M04-01

#### M04-06 — Visuellen Baseline-Review durchführen

**Umsetzung:** Reale Browser-Screenshots von Home, Tool und Produktliste auf mehreren Breiten erstellen und offensichtliche Bedienmängel korrigieren.

**Liefergegenstände:** `docs/UI_BASELINE.md`; `E2E-Nachweise`

**Abnahme:** Kein abgeschnittener Text, sichtbarer Fokus und keine ungeklärten Konsolenfehler.

**Abhängigkeiten:** M03-01, M01-01, M04-05, M04-01

### M05 — Quellenregister und Publikationsrechte

**Ziel:** Vor echten Importen maschinenlesbar festlegen, was gelesen, gespeichert und veröffentlicht werden darf.

**Technische Voraussetzungen:** M03-03

#### M05-01 — Source Registry anlegen

**Umsetzung:** Konkrete Sources samt Ressource, Publisher, Format, Geltung, Quelle und Lizenzstatus konfigurieren. Kandidaten standardmäßig pending.

**Liefergegenstände:** `config/sources/`; `schemas/source.schema.json`

**Abnahme:** Ein Registryeintrag ist eine konkrete Distribution, kein pauschaler Name wie GovData.

**Abhängigkeiten:** M03-03

#### M05-02 — Publikationsklassen umsetzen

**Umsetzung:** public_open, public_display, restricted_raw und local_user trennen; Rechteprüfung je Ziel wie Repo, HTML, JSON, Bild oder Historie.

**Liefergegenstände:** `src/domain/publication-policy.ts`; `tests/rights.test.ts`

**Abnahme:** Ein kommerziell nutzbarer, aber nicht weiterverteilbarer Feed wird für Repo/JSON zuverlässig gesperrt.

**Abhängigkeiten:** M03-03, M05-01

#### M05-03 — Attribution und Lizenzseiten bauen

**Umsetzung:** Quellen-/Lizenzhinweise aus derselben Registry erzeugen; OSM-Hinweis direkt in Karte und Datenexporten.

**Liefergegenstände:** `src/pages/de-de/quellen/`; `licenses/`; `components/Attribution.astro`

**Abnahme:** Veröffentlichte Datensätze besitzen korrekte Zuordnung zu Quell- und Lizenzhinweisen.

**Abhängigkeiten:** M03-03, M05-02, M05-01

#### M05-04 — Erste offene Quellen verifizieren

**Umsetzung:** GOT und konkrete OSM-Distribution anhand aktueller Primärbedingungen prüfen; Nachweis, Hash und erlaubte Ausgabeformen erfassen.

**Liefergegenstände:** `config/sources/got.json`; `osm.json`; `docs/SOURCE_REVIEWS.md`

**Abnahme:** Echte Fundstellen dokumentiert; keine rückwirkend erfundene pauschale Freigabe.

**Abhängigkeiten:** M03-03, M05-03, M05-01

#### M05-05 — ODbL-Datenfluss dokumentieren

**Umsetzung:** Normalisierung, räumliche Filterung und spätere Joins beschreiben; abgeleitete offene Ausgaben und Lizenztexte gezielt bereitstellen.

**Liefergegenstände:** `docs/ODBL_DATAFLOW.md`; `licenses/ODbL-notice.md`

**Abnahme:** Keine Behauptung, getrennte Dateien allein befreiten eigene Joins von ODbL-Pflichten.

**Abhängigkeiten:** M03-03, M05-04, M05-01

#### M05-06 — Lizenzänderung und Sperren testen

**Umsetzung:** termsHash-Wechsel, abgelaufene Vertragsrechte und verweigerte Bilderlaubnis simulieren. Betroffene Ausgabe stoppen, übrige Module erhalten.

**Liefergegenstände:** `tests/license-regression.test.ts`; `scripts/checks/licenses.ts`

**Abnahme:** Rechteverlust wird nicht durch alten Cache oder letzten Datenstand umgangen.

**Abhängigkeiten:** M03-03, M05-05, M05-01

### M06 — Generisches Import- und Snapshot-System

**Ziel:** Datenabruf, Normalisierung und atomare Veröffentlichung robust machen.

**Technische Voraussetzungen:** M03-04, M05-01, M05-02

#### M06-01 — Adapter-API implementieren

**Umsetzung:** fetch, parse, normalize, validate, diff und publish trennen. Adapter mit kleinen Fixtures testen.

**Liefergegenstände:** `scripts/ingest/types.ts`; `adapters/`; `tests/ingest/`

**Abnahme:** Neuer Source erfordert keine Änderung an allen Feature-Modulen.

**Abhängigkeiten:** M03-04, M05-01, M05-02

#### M06-02 — Sicheren Fetcher implementieren

**Umsetzung:** HTTPS/Domain-Allowlist, Timeouts, Redirect-Validierung, Retry-After, Größenlimits und bereinigte Logs. Keine User-URL als Source.

**Liefergegenstände:** `scripts/ingest/fetch.ts`; `tests/fetch.test.ts`

**Abnahme:** Tests erkennen schädliche URL-Schemes, zu große/kaputte Dateien und unerlaubte Weiterleitung.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-01

#### M06-03 — Deterministische Normalisierung bauen

**Umsetzung:** Stable IDs, sortierte Arrays, einheitliche Einheiten und Inhalts-Hashes; null-Werte und Provenienz erhalten.

**Liefergegenstände:** `scripts/normalize/`; `tests/determinism.test.ts`

**Abnahme:** Gleicher Eingang erzeugt gleiche Fachdaten/Hashes, abgesehen von ausdrücklich getrennten Laufmetadaten.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-02, M06-01

#### M06-04 — Differenzprüfung und Quarantäne einbauen

**Umsetzung:** Leere Feeds, unerwartete Zählerrückgänge, neue Gebührenfassungen und schema-breaking Änderungen getrennt behandeln.

**Liefergegenstände:** `scripts/ingest/diff.ts`; `quarantine.ts`

**Abnahme:** Ein absichtlich leerer Source überschreibt den letzten gültigen Snapshot nicht.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-03, M06-01

#### M06-05 — Manifest und JSON-Sharding erstellen

**Umsetzung:** Hashes, BBox/Index, Größen, Source-Versionen und Dateiverweise erzeugen; Filecount-/Shard-Budgets prüfen.

**Liefergegenstände:** `scripts/publish/manifest.ts`; `shards.ts`

**Abnahme:** Keine all-data.json; Manifest referenziert nur vorhandene schema-valide Dateien.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-04, M06-01

#### M06-06 — Atomaren Offline-Pipeline-Test ausführen

**Umsetzung:** Zwei erfolgreiche Sources und einen fehlerhaften Source zusammenführen; neuer Snapshot wird erst vollständig freigegeben.

**Liefergegenstände:** `tests/snapshot-integration.test.ts`

**Abnahme:** Teilfehler erzeugt weder halbe Datensätze noch inkonsistente HTML/JSON-Abhängigkeiten.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-05, M06-01

### M07 — GitHub CI und Cloudflare-Deployment

**Ziel:** Früh einen überprüfbaren Static-Hosting-Pfad aufbauen, ohne sofort kommerzielle Daten live zu schalten.

**Technische Voraussetzungen:** M01-03, M01-05, M06-05

#### M07-01 — PR- und Main-CI konfigurieren

**Umsetzung:** Installation mit Lockfile, lint, typecheck, Unit-/Vertragstests, Fixture-Build und dist-Audit. Forks ohne Secrets.

**Liefergegenstände:** `.github/workflows/ci.yml`

**Abnahme:** Fehlerhafte Inputs stoppen CI; Workflow benötigt keine Partneraccounts.

**Abhängigkeiten:** M01-03, M01-05, M06-05

#### M07-02 — Supply-Chain-Schutz konfigurieren

**Umsetzung:** Actions auf volle überprüfte SHAs, minimale Berechtigungen, Dependencyupdates über PR; keine gefährliche privilege escalation.

**Liefergegenstände:** `.github/workflows/security.yml`; `docs/CI_SECURITY.md`

**Abnahme:** Workflow-Sicherheitsreview dokumentiert; untrusted PR-Code kann keine Produktions-Secrets lesen.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-01

#### M07-03 — Assets-only Wrangler-Konfiguration erstellen

**Umsetzung:** dist-Verzeichnis, HTML-Routing und 404; kein Worker main/SSR/DB-Binding. Statische Header generieren.

**Liefergegenstände:** `wrangler.jsonc`; `scripts/build-headers.ts`

**Abnahme:** Lokale Wrangler-Konfigprüfung und dist-Routingtest erfolgreich.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-02, M07-01

#### M07-04 — Cloudflare-Buildskript umsetzen

**Umsetzung:** Fixierter Open-Data-Commit, Rechteprüfung, optionaler vertrauenswürdiger Feedabruf, statischer Build, Pagefind und Output-Audit.

**Liefergegenstände:** `scripts/build-cloudflare.ts`; `package.json`

**Abnahme:** Deployment kann nicht vor erforderlichen lokalen Checks laufen; Build-Metadaten referenzieren exakte Inputs.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-03, M07-01

#### M07-05 — Preview-/Produktionsisolation testen

**Umsetzung:** Produktionsprojekt mit Secrets baut nur main; getrenntes Preview-Projekt ohne Partner-Secrets. Repository-interne Branch-Abfragen sind keine Secret-Grenze. production fail-closed; noindex kein Ersatz für Vertraulichkeit.

**Liefergegenstände:** `tests/build-security.test.ts`; `docs/CLOUDFLARE_SETUP.md`

**Abnahme:** Ein Fork-/Preview-Build kann keine echten Feed-Secrets beziehen oder vertrauliche Rohdaten ausgeben.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-04, M07-01

#### M07-06 — Cloudflare wirklich verbinden und Smoke testen **[Externer Freigabepunkt]**

**Umsetzung:** Autorisiertes GitHub-Repo mit Cloudflare Builds verbinden, Preview deployen, echte URL/Build-ID und Konfiguration prüfen.

**Liefergegenstände:** `Cloudflare project`; `docs/DEPLOYMENT_EVIDENCE.md`

**Abnahme:** Öffentliches oder geschütztes Preview tatsächlich erreichbar; ohne Accountzugang ausdrücklich blocked.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-05, M07-01

### M08 — Tierarztkosten-Rechner

**Ziel:** Den ersten fachlich belastbaren Nutzenpfad bauen: transparente Gebührenrechnung statt erfundener Pauschalpreise.

**Technische Voraussetzungen:** M03-02, M04-05, M05-04, M06-03

#### M08-01 — GOT-Importer erstellen

**Umsetzung:** Vollständigen Katalog aus verifizierter XML-/HTML-Quelle importieren; Positions-IDs, Originaltext, Mengenbezug und Version erhalten.

**Liefergegenstände:** `scripts/ingest/adapters/got.ts`; `tests/fixtures/got/`

**Abnahme:** Repräsentative Stichprobe inklusive Tierart-/Mengeneinheiten entspricht der Quelle; Parserfehler sind sichtbar.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03

#### M08-02 — Kostenengine implementieren

**Umsetzung:** Reguläre und Notdienstkontexte, Mengen, Faktoren, separate Zuschläge, Steuern und Rundung deterministisch rechnen.

**Liefergegenstände:** `src/features/costs/engine.ts`; `tests/costs/`

**Abnahme:** Unit- und unabhängige Golden Tests einschließlich Notdienstpauschale und Ausschlüssen bestanden.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-01

#### M08-03 — Szenariomodell und Reviewpfad bauen

**Umsetzung:** Nur klar definierte einfache Vorlagen vorbereiten; Behandlungsbestandteile, nicht enthaltene Kosten und Clinical-Reviewstatus speichern.

**Liefergegenstände:** `content-data/cost-scenarios/`; `schemas/cost-scenario.ts`

**Abnahme:** Ungeprüfte komplexe OP-Vorlage kann nicht als vollständige Kostenschätzung veröffentlicht werden.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-02, M08-01

#### M08-04 — Rechneroberfläche integrieren

**Umsetzung:** Tierart, Positionssuche, Mengen, Kontext und Faktor; Ergebnistabelle mit Netto/Brutto, Quelle, Stand und Einschränkungen.

**Liefergegenstände:** `src/pages/de-de/tierarztkosten/`; `costs UI`

**Abnahme:** Rechnung ist aus Einzelpositionen nachvollziehbar; leer/ungültig/unsupported sauber behandelt.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-03, M08-01

#### M08-05 — Druck- und Informationsseiten erstellen

**Umsetzung:** Browserdruck mit Quellen/Version; wenige freigegebene Leistungsseiten mit Rechner-Einstieg. Keine automatische Massenerzeugung jeder Kombination.

**Liefergegenstände:** `src/pages/de-de/tierarztkosten/[slug].astro`; `print.css`

**Abnahme:** Druckansicht vollständig; nur überprüfte Inhalte indexierbar.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-04, M08-01

#### M08-06 — Fachliche Rechenabnahme dokumentieren **[Externer Freigabepunkt]**

**Umsetzung:** Quellenstand und relevante Rechenannahmen fachlich prüfen lassen oder nachvollziehbar vorhandene qualifizierte Freigabe erfassen. Keine Autorität erfinden.

**Liefergegenstände:** `docs/reviews/costs.md`; `config/launch.json`

**Abnahme:** Live-Szenarien haben echte Freigabe; fehlendes Review blockiert nur deren öffentliche Aktivierung.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-05, M08-01

### M09 — Versicherungs-Affiliate ohne Scheinberatung

**Ziel:** Versicherungswerbung technisch integrierbar machen, ohne unzulässige individuelle Beratung zu automatisieren.

**Technische Voraussetzungen:** M03-04, M04-02, M05-02

#### M09-01 — Partnervertragsschema bauen

**Umsetzung:** Programmanbieter, Netzwerk, Geltung, erlaubte Website-/Platzierungsarten und Nachweise erfassen. Provisionen nicht clientseitig ausliefern.

**Liefergegenstände:** `config/publishers/insurance/`; `schemas/partner.ts`

**Abnahme:** Fehlende Vertragsfreigabe lässt keine aktive Versicherungs-CTA entstehen.

**Abhängigkeiten:** M03-04, M04-02, M05-02

#### M09-02 — Neutralen CTA-Baustein implementieren

**Umsetzung:** Explizit gekennzeichnete Information/Weiterleitung zum Anbieter, vom Kostenresultat getrennt. Keine ranglistenbasierte Auswahl nach Tierprofil.

**Liefergegenstände:** `src/components/InsuranceDisclosure.astro`; `PartnerCta.astro`

**Abnahme:** Aufruf überträgt keine Diagnose, Profilwerte oder eingegebenen Kosten.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-01

#### M09-03 — Zulässige Links validieren

**Umsetzung:** Nur genehmigte Host-/Programmzuordnung und erlaubte statische Kampagnenkennungen; rel sponsored, keine verdeckten Redirects.

**Liefergegenstände:** `src/features/commerce/links.ts`; `tests/affiliate-links.test.ts`

**Abnahme:** Ungültiger oder inaktiver Link wird ausgeblendet; keine Tracking-Requests in automatischen Live-Linktests.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-02, M09-01

#### M09-04 — Redaktion und Erlöslogik trennen

**Umsetzung:** Keine Aussagen zu garantierter Kostenerstattung oder Versicherbarkeit bestehender Beschwerden. Keine Akutnotfallseite mit aggressiver CTA.

**Liefergegenstände:** `content-data/insurance-disclosures/`; `tests/content-policy.test.ts`

**Abnahme:** Kein personalisiertes bestes Versicherungsprodukt und keine erfundenen Tarifdaten im UI.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-03, M09-01

#### M09-05 — Leere/gesperrte Partnerzustände testen

**Umsetzung:** Noch keine Zulassung, Programm beendet, falscher Markt, fehlende Werbekennzeichnung und erlaubte neutrale Shopalternative abdecken.

**Liefergegenstände:** `tests/insurance-integration.test.ts`

**Abnahme:** Seite bleibt informativ ohne aktiven Versicherungspartner; keine fake Provision/Angebote.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-04, M09-01

#### M09-06 — Vertragliche und rechtliche Freigabe einholen **[Externer Freigabepunkt]**

**Umsetzung:** Tatsächliche Partnerzulassung plus Prüfung der konkreten Ausgestaltung unter §34d dokumentieren. Ein Disclaimer ersetzt diese Prüfung nicht.

**Liefergegenstände:** `docs/reviews/insurance.md`; `partner approval reference`

**Abnahme:** Versicherungs-Modul erst nach echter Freigabe live; sonst blocked und Feature aus.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-05, M09-01

### M10 — Deutschlandweite Ortsdaten

**Ziel:** Bundesweite relevante POIs effizient importieren und die Abdeckung ehrlich ausweisen.

**Technische Voraussetzungen:** M05-04, M05-05, M06-06

#### M10-01 — OSM-Pilot regional importieren

**Umsetzung:** Mit kleinem Deutschland-Extrakt beginnen; tierärztliche Einrichtungen, Hundewiesen, Tierheime und weitere ausgewählte Tags extrahieren.

**Liefergegenstände:** `scripts/ingest/adapters/osm/`; `config/osm-tags.json`

**Abnahme:** Kleiner realer Pilot und reproduzierbarer Fixture-Test vorhanden; keine Browser-Overpass-Abfrage nötig.

**Abhängigkeiten:** M05-04, M05-05, M06-06

#### M10-02 — Geometrie und Kontakte normalisieren

**Umsetzung:** Nodes, Ways und Relations angemessen behandeln; stabile IDs, berechnete repräsentative Punkte und dokumentierte Koordinatenqualität.

**Liefergegenstände:** `scripts/normalize/places.ts`; `geometry tests`

**Abnahme:** Grenzen/Überlappungen erzeugen keine Doppelzählungen; defekte Geometrien werden nicht still nach Berlin verschoben.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-01

#### M10-03 — Ortsindex und räumliche Suche vorbereiten

**Umsetzung:** Suchbare Ortsnamen und Koordinaten aus freigegebener Quelle erzeugen; keine proprietäre PLZ-Datenbank voraussetzen. Distanz vs Gemeindegrenze kennzeichnen.

**Liefergegenstände:** `data place index generator`; `src/features/map/place-search.ts`

**Abnahme:** Autocomplete läuft lokal auf kleinen Daten; mehrdeutige Ortsnamen wird aufgelöst.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-02, M10-01

#### M10-04 — Bundesweiten Import skalieren

**Umsetzung:** Alle nötigen Deutschland-Regionen streamend/sequenziell oder kontrolliert parallel verarbeiten; Rohdaten vor dem Build entsorgen.

**Liefergegenstände:** `scripts/ingest/osm-country.ts`; `docs/OSM_BENCHMARK.md`

**Abnahme:** Alle vorgesehenen Regionen haben überprüften Snapshotstatus; Speicher-/Laufzeitbudget gemessen.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-03, M10-01

#### M10-05 — POIs sharden und Coverage ausgeben

**Umsetzung:** Räumliche Chunks, Kategorienzähler, Source-Alter, fehlende Regionen und sichere Exportprojektion erstellen.

**Liefergegenstände:** `public data generator`; `docs/COVERAGE.md`

**Abnahme:** Kartenindex klein; keine deutschlandweite Megadatei im initialen Browserpfad.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-04, M10-01

#### M10-06 — Echte Datenqualität abnehmen

**Umsetzung:** Stichproben verschiedener Kategorien/Regionen, Aktualitätsanzeige, Lizenzdownload und keine falsche Notdienst-Zusicherung prüfen.

**Liefergegenstände:** `docs/reviews/places.md`; `real-data test report`

**Abnahme:** Bundesweite erfasste Daten belegt, ohne Vollständigkeit aller realen Einrichtungen zu behaupten.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-05, M10-01

### M11 — Hunde-Karte und lokale Landingpages

**Ziel:** Die Ortsdaten für Nutzer und Suchmaschinen sinnvoll erschließen, ohne dünne Ortsseiten zu produzieren.

**Technische Voraussetzungen:** M04-03, M10-05

#### M11-01 — Zugängliche Listenansicht bauen

**Umsetzung:** Ort, Kategorie und Radius als Filter; Trefferliste mit Quelle und sinnvollen Kontakthinweisen. Serverlos und mit statischen Standardergebnissen.

**Liefergegenstände:** `src/features/map/list/`; `map page`

**Abnahme:** Liste bleibt ohne Karte nutzbar; keine Treffer bedeutet nur keine erfassten Treffer.

**Abhängigkeiten:** M04-03, M10-05

#### M11-02 — Karte lazy integrieren

**Umsetzung:** Leaflet nach Klick, konfigurierte Tile-Quelle und Attribution; nur sichtbare/nähere Daten nachladen.

**Liefergegenstände:** `src/features/map/map.ts`; `tile config`

**Abnahme:** Initial kein Tile-Request; Providerfehler beeinträchtigt Liste nicht; kein Prefetch/Bulk-Download.

**Abhängigkeiten:** M04-03, M10-05, M11-01

#### M11-03 — Marker und Geolocation behandeln

**Umsetzung:** Cluster/Rendergrenzen, Standortabfrage nur durch Nutzeraktion, Ablehnungs-/Timeoutpfade und klare Standortdatenhaltung.

**Liefergegenstände:** `tests/e2e/map.spec.ts`; `map controls`

**Abnahme:** Dichter Ausschnitt bleibt bedienbar; Standort wird nicht gespeichert/versendet ohne passende Aktion.

**Abhängigkeiten:** M04-03, M10-05, M11-02, M11-01

#### M11-04 — Lokale Seite aus Qualitäts-Allowlist generieren

**Umsetzung:** Bis zu 25 geeignete Städte als Startziel, ausschließlich bei genügend echten Daten. Kein garantierter Mindestbestand erfinden.

**Liefergegenstände:** `content-data/city-allowlist.json`; `local page template`

**Abnahme:** Indexierte Stadtseite besitzt echten lokalen Mehrwert und keine leeren Kategorien.

**Abhängigkeiten:** M04-03, M10-05, M11-03, M11-01

#### M11-05 — Kommunalen Pilot anbinden

**Umsetzung:** Eine konkret lizenzierte kommunale Zusatzquelle integrieren; Priorität/Konflikt zu OSM sichtbar behandeln. Nicht alle Kommunalregeln voraussetzen.

**Liefergegenstände:** `scripts/ingest/adapters/municipal/`; `local-source tests`

**Abnahme:** Quelle, Lizenz, Geltung und Konflikte nachvollziehbar; keine abgeleitete Hundeerlaubnis ohne Beleg.

**Abhängigkeiten:** M04-03, M10-05, M11-04, M11-01

#### M11-06 — Mobil-/SEO-/Ausfallabnahme durchführen

**Umsetzung:** Mobilkarte, Tastatur-Alternative, Provider-Ausfall, Nachbar-Shards, Ortswechsel und interne Links im echten Browser testen.

**Liefergegenstände:** `docs/reviews/map-ui.md`; `E2E reports`

**Abnahme:** Kein horizontaler Bedienbruch, keine fehlerhaften 200-Fallbacks und vollständige Attribution.

**Abhängigkeiten:** M04-03, M10-05, M11-05, M11-01

### M12 — Haustier-Reisecheck für deutsche Nutzer

**Ziel:** Einen bewusst begrenzten, versionierten Reisecheck statt einer unzuverlässigen weltweiten Regelsammlung bauen.

**Technische Voraussetzungen:** M03-04, M04-05, M05-02

#### M12-01 — Unterstützten Reisekontext definieren

**Umsetzung:** V1: privater Standardfall für erwachsene Hunde/Katzen, begleitete Reise ab Deutschland in zunächst AT, NL, FR, IT; Transit und Rückreise erfassen. Andere Fälle explizit unsupported.

**Liefergegenstände:** `content-data/travel/scope.json`; `docs/TRAVEL_SCOPE.md`

**Abnahme:** UI sagt klar, welche Fälle geprüft werden; keine scheinbar globale Abdeckung.

**Abhängigkeiten:** M03-04, M04-05, M05-02

#### M12-02 — Deklarative Rules Engine implementieren

**Umsetzung:** Feste Prädikate, gültige Zeiträume, Prioritäten und vier Ergebniszustände; keine ausführbaren Regeln aus Fremdtexten.

**Liefergegenstände:** `src/features/travel/engine.ts`; `tests/travel/`

**Abnahme:** Einheiten-, Kalender-, unbekannt-/nicht-anwendbar- und Versionsgrenztests bestanden.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-01

#### M12-03 — Offizielle Regelquellen modellieren

**Umsetzung:** Aktuelle EU-Regeln und Ziel-/Transitstaatquellen lesen, fachliche Felder und Fundstellen erfassen. Keine alten Chat-Angaben blind übernehmen.

**Liefergegenstände:** `content-data/travel/rules/`; `docs/reviews/travel-sources.md`

**Abnahme:** Jede vorbereitete Regel hat Quelle, Anwendungsbereich, Inkrafttreten und Reviewstatus.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-02, M12-01

#### M12-04 — Wizard und Ergebnisse integrieren

**Umsetzung:** Auswahl von Tier, Zeitraum, Dokumentstatus, Herkunft/Ziel/Transit; Checkliste mit unbekannten Punkten und offiziellen Links, keine Garantie.

**Liefergegenstände:** `src/pages/de-de/reisecheck/`; `travel UI`

**Abnahme:** Unvollständige oder nicht unterstützte Route erhält kein grünes Gesamtergebnis.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-03, M12-01

#### M12-05 — Packliste und Zielseiten erstellen

**Umsetzung:** Druckbare regelbezogene Aufgaben und nichtmedizinische Reiseausrüstung; nur unterstützte Ziele erhalten indexierbare Seiten. Airline-/Fährbedingungen getrennt ausweisen.

**Liefergegenstände:** `travel destination template`; `print rules`; `packing list`

**Abnahme:** Packliste ohne Backend, keine automatische Empfehlung von Medikamenten.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-04, M12-01

#### M12-06 — Reiseregeln fachlich freigeben und Regression testen **[Externer Freigabepunkt]**

**Umsetzung:** Alle Live-Regeln mit kompetenter Prüfung und vollständiger Testmatrix bestätigen. Quelländerung sperrt positive automatische Gesamtentscheidung.

**Liefergegenstände:** `docs/reviews/travel.md`; `config/launch.json`

**Abnahme:** Freigabe echt dokumentiert; ohne Review funktionsfähiger Preview, aber keine unüberprüfte Live-Reiseberatung.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-05, M12-01

### M13 — Affiliate-Produktfeeds und Angebotskatalog

**Ziel:** Einen belastbaren Produkt-/Angebotslayer aufbauen, der auch bei fehlenden Partnerzugängen technisch testbar bleibt.

**Technische Voraussetzungen:** M03-04, M05-02, M06-02, M07-04

#### M13-01 — Netzwerkadapter mit Fixtures erstellen

**Umsetzung:** Generische Schnittstelle plus Awin-CSV-Adapter; weitere Netzwerke nur nach realem Bedarf. Fixtures synthetisch statt veröffentlichter echter Rohfeeds.

**Liefergegenstände:** `scripts/ingest/adapters/awin.ts`; `fixtures/commerce/`

**Abnahme:** Parser arbeitet ohne Zugangsdaten; quoted CSV, Encoding, fehlende Felder und große Feeds getestet.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04

#### M13-02 — Produkte und Varianten normalisieren

**Umsetzung:** Product und Offer trennen, GTIN/Packung/Größe/Mengenbasis prüfen, potenzielle Dubletten quarantänisieren.

**Liefergegenstände:** `scripts/normalize/products.ts`; `offers.ts`; `tests/product-match/`

**Abnahme:** Falsche Multipack-/Größenmatches werden nicht als Preisvergleich veröffentlicht.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-01

#### M13-03 — Vertrauenswürdigen Cloudflare-Abruf implementieren

**Umsetzung:** Secrets ausschließlich Build-Time, Domain-Allowlist, Streaming, TTL und erlaubte öffentliche Felder. Nichts Vertrauliches ins Repo, Artifact oder Browserbundle.

**Liefergegenstände:** `scripts/build/commerce.ts`; `tests/feed-secrecy.test.ts`

**Abnahme:** Canary und private Felder fehlen in sämtlichen öffentlichen Outputs; fehlende Secret-Namen werden ohne Wert protokolliert.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-02, M13-01

#### M13-04 — Angebotsausgabe und Preislogik erstellen

**Umsetzung:** Klare Preise, Versand unbekannt/null, Grundpreis falls sinnvoll, Stand, Verfügbarkeit und abgelaufene Angebote. Kundenabhängige Rabatte separat.

**Liefergegenstände:** `src/features/commerce/pricing.ts`; `OfferCard.astro`

**Abnahme:** Keine falsche Kostenlos-/Bestpreisbehauptung; gleiche Variante und Markt für Vergleich Pflicht.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-03, M13-01

#### M13-05 — Katalogansichten und Filter bauen

**Umsetzung:** Kategorien, Eigenschaften, erklärbare Sortierung und Affiliatekennzeichnung; nur erlaubte öffentliche Projektion in JSON.

**Liefergegenstände:** `catalog pages`; `filters.ts`; `tests/e2e/catalog.spec.ts`

**Abnahme:** Sortierung ist provisionunabhängig; aktive Filter finden nur zulässige Angebote.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-04, M13-01

#### M13-06 — Mindestens einen echten Partner integrieren **[Externer Freigabepunkt]**

**Umsetzung:** Tatsächliche Programmfreigabe, Bilder-/Anzeige-/JSON-Rechte, echte Feedfelder und erlaubter Linkmodus verifizieren. Ohne Freigabe Slot deaktiviert lassen.

**Liefergegenstände:** `docs/reviews/commerce-partner.md`; `config/publishers/`

**Abnahme:** Echte zugelassene Integration nachgewiesen; keine alten Chat-Provisionswerte als Vertragsbeleg.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-05, M13-01

### M14 — Health-/Pflegeprodukte und Spielzeug-Finder

**Ziel:** Die gewünschten kommerziellen Kategorien durch belegte Eigenschaften statt unbelegte Gesundheitsversprechen differenzieren.

**Technische Voraussetzungen:** M04-05, M13-02, M13-04

#### M14-01 — Startkategorien und Grenzen festlegen

**Umsetzung:** Pflege-/Zahnpflege-/Mobilitätszubehör und Spielzeug auswählen. Medikamente, medizinische Tests und Supplements nur als spätere gesondert freizugebende Erweiterung.

**Liefergegenstände:** `content-data/taxonomy/care.json`; `toys.json`

**Abnahme:** Gesundheitsbereich erfüllt den Produktwunsch, ohne automatische Behandlungsvorschläge zu veröffentlichen.

**Abhängigkeiten:** M04-05, M13-02, M13-04

#### M14-02 — Attributschema und Herkunft erfassen

**Umsetzung:** Tierart, Abmessung, Herstellergrößenbereich, Material, Spieltyp, Waschbarkeit und belastbare Einschränkungen speichern; unbekannt explizit.

**Liefergegenstände:** `schemas/product-attributes.ts`; `attribute review data`

**Abnahme:** Jedes für Matching verwendete Attribut besitzt Quelle und Verifikationsstatus.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-01

#### M14-03 — Deterministisches Matching umsetzen

**Umsetzung:** Hard-Filter auf Tierart/Größe/Herstellergrenzen; weiche Sortierung nur nach erklärbaren Bedürfnissen wie Indoor oder Apportieren.

**Liefergegenstände:** `src/features/toys/matching.ts`; `care/matching.ts`

**Abnahme:** Rasse allein löst keine medizinische Empfehlung aus; unbekannte Eigenschaften werden nicht als passend behauptet.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-02, M14-01

#### M14-04 — Finder-Oberfläche und Erklärungen bauen

**Umsetzung:** Kurzer Fragebogen, Ergebnisbegründung und verlinkte Herstellerangaben. Kein erfundener Sicherheits- oder Haltbarkeitsscore.

**Liefergegenstände:** `toys finder`; `care category pages`

**Abnahme:** Nutzer erkennt, warum ein Produkt erscheint und welche Eigenschaften nicht geprüft sind.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-03, M14-01

#### M14-05 — Sicherheits- und Inhaltsregeln testen

**Umsetzung:** Heilversprechen, Dosierung, unzerstörbar, Fake-Sterne und automatische Supplementpflicht als negative Content-/Datenfälle prüfen.

**Liefergegenstände:** `tests/care-safety.test.ts`; `tests/toy-safety.test.ts`

**Abnahme:** Policy-Tests sperren unerlaubte Claims; passende neutrale Produkttexte bleiben möglich.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-04, M14-01

#### M14-06 — Reale Produkte attributseitig abnehmen

**Umsetzung:** Kleine sorgfältig geprüfte Auswahl veröffentlichen, sobald echte Angebotsrechte bestehen. Fehlende Daten nicht durch KI erfinden.

**Liefergegenstände:** `docs/reviews/care-toys.md`; `attribute approvals`

**Abnahme:** Jedes Live-Matching erklärt belegte Eigenschaften; nicht geprüfte Produkte erscheinen nur mit entsprechend begrenzter Aussage oder gar nicht.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-05, M14-01

### M15 — Futtervergleich und optionale offene Anreicherung

**Ziel:** Einen transparenten Mengen-/Preisvergleich bauen, ohne aus lückenhaften Labeldaten medizinische Ernährungsscores abzuleiten.

**Technische Voraussetzungen:** M13-02, M13-04

#### M15-01 — Futter-Domänenmodell ergänzen

**Umsetzung:** Tierart, Lebensphase laut Hersteller, Allein-/Ergänzungsfuttermittel falls belegt, Menge, Nährwertfelder und deren Einheiten/Bezug speichern.

**Liefergegenstände:** `schemas/food.ts`; `food taxonomy`

**Abnahme:** Keine Lebensphase/Bedarfsdeckung wird aus dem Namen oder Proteinwert geraten.

**Abhängigkeiten:** M13-02, M13-04

#### M15-02 — Grundpreis-/Multipack-Rechnung implementieren

**Umsetzung:** Einheitliche Mengenbasis und exakte Variante vergleichen; Versand separat, unbekannte Mengen nicht schätzen.

**Liefergegenstände:** `src/features/food/unit-price.ts`; `tests/food-pricing.test.ts`

**Abnahme:** Unabhängige Tests für 400g, 1kg, 6x400g und fehlerhafte Mengen bestanden.

**Abhängigkeiten:** M13-02, M13-04, M15-01

#### M15-03 — Produktsuche und Futteransichten bauen

**Umsetzung:** Name/Marke/GTIN-Suche, Angebotsvergleich und deklarierte Produktattribute. Barcodeeingabe zunächst Text; Kamera nicht Pflicht.

**Liefergegenstände:** `src/pages/de-de/futter/`; `food product template`

**Abnahme:** Echte Futterprodukte mit gleichen Varianten vergleichbar; ohne Nährwerte bleibt Preisvergleich nutzbar.

**Abhängigkeiten:** M13-02, M13-04, M15-02, M15-01

#### M15-04 — OPFF-Machbarkeit prüfen

**Umsetzung:** Konkrete API/Distribution und Rechte verifizieren; definierte Stichprobe gegen GTINs echter zulässiger Feedprodukte messen.

**Liefergegenstände:** `docs/OPFF_SPIKE.md`; `config/sources/opff.json`

**Abnahme:** Abdeckung, fehlende Felder und Lizenzfolgen dokumentiert; kein erfundener Trefferanteil.

**Abhängigkeiten:** M13-02, M13-04, M15-03, M15-01

#### M15-05 — OPFF nur bei Eignung anbinden

**Umsetzung:** Adapter und Lizenzprojektion implementieren oder mit begründetem Feature-Flag deaktiviert lassen; nicht als allgemeine Pflichtdatenbank behandeln.

**Liefergegenstände:** `scripts/ingest/adapters/opff.ts`; `tests/opff-fallback.test.ts`

**Abnahme:** Fallback auf Händler-/Herstellerlabeldaten funktioniert; keine ungenehmigten Bilder und keine FEDIAF-Tabellenkopie.

**Abhängigkeiten:** M13-02, M13-04, M15-04, M15-01

#### M15-06 — Futterdarstellung abnehmen

**Umsetzung:** Kein Testsieger/Nährwert-Healthscore ohne Methodik und Rechte; Rohdaten klar vom Preisvergleich trennen.

**Liefergegenstände:** `docs/reviews/food.md`; `E2E food tests`

**Abnahme:** Labelwerte, Quellen, Menge, Preisstand und Unbekanntwerte sind verständlich und korrekt.

**Abhängigkeiten:** M13-02, M13-04, M15-05, M15-01

### M16 — Lokales Tierprofil, Merkliste und Packliste

**Ziel:** Wiederkehrenden Nutzwert schaffen, ohne Konten oder zentrale Nutzerdatenbank einzuführen.

**Technische Voraussetzungen:** M03-04, M04-05, M14-03

#### M16-01 — Profil-State im Browser implementieren

**Umsetzung:** Tierart, optionale Größen-/Gewichtsangaben und Interessen im Tab halten. Keine Pflicht für Name, Adresse oder E-Mail.

**Liefergegenstände:** `src/features/profile/state.ts`; `profile form`

**Abnahme:** Initial keine Speicherung und keine Netzübertragung; Tools funktionieren ohne Profil.

**Abhängigkeiten:** M03-04, M04-05, M14-03

#### M16-02 — Optionale lokale Speicherung bauen

**Umsetzung:** Bewusste Auswahl, versioniertes Schema, Migration, Quota-/Storagefehler und vollständiges Löschen.

**Liefergegenstände:** `profile storage.ts`; `tests/profile-storage.test.ts`

**Abnahme:** Speichern und Löschen im Browser nachweisbar; kein serverseitiges Nutzerprofil entsteht.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-01

#### M16-03 — Merkliste integrieren

**Umsetzung:** Produkt-/Orts-IDs lokal merken; verschwundene Angebote und veraltete Referenzen sauber behandeln.

**Liefergegenstände:** `src/features/profile/favorites.ts`; `Merkliste page`

**Abnahme:** Merkliste lädt aktuelle zulässige Daten; alte Produkte führen nicht zu toten oder falschen Angeboten.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-02, M16-01

#### M16-04 — Reise-Packliste und Druck verbinden

**Umsetzung:** Eigene Checklistenzustände im Browser, druckbare Ansicht ohne Trackingdaten oder unnötige persönliche Angaben.

**Liefergegenstände:** `packing state`; `print templates`

**Abnahme:** Abhaken/Drucken benötigt keine Datenbank; gespeicherte Liste ist eindeutig gerätebezogen.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-03, M16-01

#### M16-05 — Sicheren Import/Export ergänzen

**Umsetzung:** Lokale JSON-Datei, Größenlimit, Schema-Prüfung und klare Datenschutzwarnung. Keine Datei an Server senden.

**Liefergegenstände:** `profile import-export.ts`; `tests/profile-import.test.ts`

**Abnahme:** Manipulierte Importdaten führen nicht zu XSS, unerlaubten Fetches oder Ausführen von Code.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-04, M16-01

#### M16-06 — Datenschutz- und Netzabnahme durchführen

**Umsetzung:** Mit Browser-Network-Test beweisen, dass Profileingaben nicht in URL, Analytics, Affiliate-Sub-ID oder fremde Requestdaten gelangen.

**Liefergegenstände:** `docs/reviews/local-profile.md`; `privacy E2E tests`

**Abnahme:** Anonymes Standardverhalten und Grenzen ohne Backup/Geräteabgleich korrekt beschrieben.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-05, M16-01

### M17 — Geplante Ingestion und Datenbetrieb

**Ziel:** Aktualisierung und Fehlersignale so aufbauen, dass die Website nicht unbemerkt mit kaputten Daten weiterläuft.

**Technische Voraussetzungen:** M06-06, M07-04, M10-05

#### M17-01 — data-live-Publisher umsetzen

**Umsetzung:** Nur erlaubte offene normalisierte Dateien und Manifest in separatem Branch; Diff-Whitelist, Atomarität, kein Push in main.

**Liefergegenstände:** `scripts/publish/data-branch.ts`; `data branch workflow`

**Abnahme:** Publish-Test erkennt fremde Code-/Secret-Dateien und verweigert sie.

**Abhängigkeiten:** M06-06, M07-04, M10-05

#### M17-02 — Offenen Importplan aktivierbar machen

**Umsetzung:** Wöchentliche/konfigurierte Jobs, dispatch, concurrency, Source-Timeouts, drei Versuche und bereinigte Summaries.

**Liefergegenstände:** `.github/workflows/ingest-open.yml`

**Abnahme:** Manueller vollständiger Lauf erfolgreich oder konkret begrenzt dokumentiert; Fehler ersetzen gültige Daten nicht.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-01

#### M17-03 — Täglichen Quellen-/Rebuildpfad hinzufügen

**Umsetzung:** Reise-/Regeländerungen erkennen; Commerce-Rebuild nur bei aktiven Partnern. Cloudflare-Hook als Secret und Buildstatus getrennt behandeln.

**Liefergegenstände:** `.github/workflows/source-check.yml`; `rebuild-commerce.yml`

**Abnahme:** Hook-Fehlschlag wird erkannt; keine minütlichen Vollsite-Builds oder Buildloops.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-02, M17-01

#### M17-04 — Frischeanzeige und Stale-Logik bauen

**Umsetzung:** Öffentlicher Datenstand und Source-Alter; abgelaufene Preise ausblenden; gesperrte Regeln ohne grünes Gesamtergebnis.

**Liefergegenstände:** `src/features/freshness/`; `public health generator`

**Abnahme:** Gefrorene Zeit im Test provoziert erwartete Warnungen/Sperren.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-03, M17-01

#### M17-05 — Smoke- und Alarmworkflow erstellen

**Umsetzung:** Seiten-/Datenstandprüfung, bereinigte Issues/Benachrichtigungen, Erklärung der 60-Tage-Scheduler-Grenze und unabhängigen Monitorlücke.

**Liefergegenstände:** `.github/workflows/smoke.yml`; `docs/MONITORING.md`

**Abnahme:** Ausfall und Datenüberalterung erzeugen nachvollziehbaren Alarm; keine falsche SLA.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-04, M17-01

#### M17-06 — Rollback und Budgetbericht proben

**Umsetzung:** Code-/Datenversion und aktives Feature-Set protokollieren, letzten gültigen zulässigen Stand wiederherstellen; Git-/Build-/Assetverbrauch messen.

**Liefergegenstände:** `docs/ROLLBACK.md`; `docs/BUDGET_REPORT.md`

**Abnahme:** Tatsächliche Probe oder lokal nachvollziehbare Simulation, getrennt vom noch blockierten Provider-Rollback.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-05, M17-01

### M18 — SEO, Sicherheit, Zugänglichkeit und Freigaben

**Ziel:** Die Plattform als überprüftes Produkt statt nur als funktionierende Sammlung von Komponenten abnehmen.

**Technische Voraussetzungen:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03

#### M18-01 — SEO-Gates implementieren

**Umsetzung:** Titel/H1, canonical, reale hreflang-Paare, Sitemap, robots/noindex, Pagefind-Ausschlüsse und richtige Statuscodes prüfen.

**Liefergegenstände:** `scripts/checks/seo.ts`; `sitemap generator`; `tests/seo/`

**Abnahme:** Keine Fixture-/dünnen Filter-/inaktiven Marktseiten im Index; kein Fake-Rating-Markup.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03

#### M18-02 — Sicherheits- und Output-Audit abschließen

**Umsetzung:** XSS, Feed-HTML, URL-Schemes, Secret-Canaries, CSP, private JSON-Felder und ungenehmigte Bilder prüfen.

**Liefergegenstände:** `scripts/checks/dist.ts`; `security tests`

**Abnahme:** dist enthält ausschließlich zulässige Dateien; bekannte Negativfälle schlagen fehl.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-01

#### M18-03 — Performance-/Dateibudgets messen

**Umsetzung:** Build auf repräsentativen Daten, Chunk/Filecounts, initiales JS, Map-Nachladen und Mobile-Lighthouse unter dokumentierten Bedingungen.

**Liefergegenstände:** `docs/PERFORMANCE.md`; `budget tests`

**Abnahme:** Budgets eingehalten oder konkreter Blocker; keine erfundenen LCP-/INP-Messwerte.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-02, M18-01

#### M18-04 — Zugänglichkeits- und Browsermatrix ausführen

**Umsetzung:** Tastatur, Screenreader-Hinweise, Kontraste, Zoom, mobiles Format und mindestens zwei Browserpfade prüfen.

**Liefergegenstände:** `docs/ACCESSIBILITY.md`; `Playwright/axe reports`

**Abnahme:** Kritische Befunde behoben; Tests und manuelle Beobachtungen nachvollziehbar.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-03, M18-01

#### M18-05 — Geschäfts- und Rechtsinformationen vorbereiten

**Umsetzung:** Echte Betreiberangaben, Datenschutz, Affiliatekennzeichnung, Methodik, Quellen und Kontaktwege integrieren. Ads standardmäßig aus; Consent-/BFSG-Prüfbedarf benennen.

**Liefergegenstände:** `legal pages`; `config/legal.ts`; `docs/LEGAL_CHECKLIST.md`

**Abnahme:** Keine erfundenen juristischen Personendaten; offene echte Freigaben als Blocker, nicht Textplatzhalter live.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-04, M18-01

#### M18-06 — Fachliche und rechtliche Launchfreigaben erfassen **[Externer Freigabepunkt]**

**Umsetzung:** Kosten, Reise, Versicherung soweit aktiv, Produktclaims, Datenrechte und konkrete Privacy-/Werbeausgestaltung extern bzw. qualifiziert freigeben lassen.

**Liefergegenstände:** `docs/reviews/launch.md`; `config/launch.json`

**Abnahme:** Launchstatus referenziert reale Nachweise und freigegebene Features; kein Agent erfindet eine Juristen-/Tierarztprüfung.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-05, M18-01

### M19 — Endabnahme, Betriebshandbuch und Ausbauprobe

**Ziel:** Einen klaren Zustand mit getesteter Übergabe erreichen, statt das Projekt pauschal für fertig zu erklären.

**Technische Voraussetzungen:** M17-04, M18-01, M18-02

#### M19-01 — Gesamte Golden-Path-Suite ausführen

**Umsetzung:** Kosten -> Information, Ort -> Treffer, Reise -> Checkliste, Finder -> echtes oder gesperrtes Angebot, Futter -> Grundpreis, Profil -> Löschen testen.

**Liefergegenstände:** `docs/RELEASE_TESTS.md`; `verify reports`

**Abnahme:** Alle freigegebenen Kernpfade bestanden; nicht aktive Features sind klar deaktiviert.

**Abhängigkeiten:** M17-04, M18-01, M18-02

#### M19-02 — Frischen Clone und Offline-Entwicklung prüfen

**Umsetzung:** Neuer Checkout, sichere Installation, Fixture-Build und lokale Tests ohne Secrets/Account durchführen.

**Liefergegenstände:** `docs/DEVELOPER_SETUP.md`

**Abnahme:** Andere Entwickler können die Website reproduzierbar starten; keine lokalen versteckten Dateien erforderlich.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-01

#### M19-03 — Internationalisierung mit Testmarkt beweisen

**Umsetzung:** Deaktivierten US-/EU-Testmarkt über Konfig und Adaptervertrag testen; USD, Einheiten und fehlende Kostenquelle korrekt behandeln.

**Liefergegenstände:** `tests/expansion-proof.test.ts`; `docs/EXPANSION.md`

**Abnahme:** Kein Umbau am DE-Kern und keine Veröffentlichung ungeprüfter internationaler Seiten nötig.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-02, M19-01

#### M19-04 — Betriebshandbuch und Restrisiken fertigstellen

**Umsetzung:** Source hinzufügen, Partner sperren, Datenrollback, Secretrotation, Frischeprüfung, Gebühren-/Reisereview und Kostenlimits beschreiben.

**Liefergegenstände:** `docs/RUNBOOK.md`; `docs/KNOWN_LIMITATIONS.md`

**Abnahme:** Betreiber kann die wichtigsten Eingriffe anhand konkreter Dateien/Befehle durchführen.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-03, M19-01

#### M19-05 — Aufgaben-/Launchstatus abgleichen

**Umsetzung:** Alle 120 Tasks auf Nachweise prüfen; done, blocked und bewusst deferred getrennt zählen. Abnahmebericht nennt exaktes Feature-Set.

**Liefergegenstände:** `project/tasks.json`; `docs/STATUS.md`; `docs/HANDOFF.md`

**Abnahme:** Keine 100-Prozent-Behauptung bei offenen erforderlichen Freigaben; Status ist mit Dateien/Tests konsistent.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-04, M19-01

#### M19-06 — Freigegebenen Release wirklich veröffentlichen **[Externer Freigabepunkt]**

**Umsetzung:** Nur mit echten Betreiber-/Quellen-/Fachfreigaben und dokumentierter Veröffentlichungsautorisierung über Cloudflare deployen. URL, Build-ID, Code-/Daten-Commit und Smoke notieren.

**Liefergegenstände:** `docs/RELEASE.md`; `production deployment evidence`

**Abnahme:** Live-Abnahme real belegt; andernfalls technisch fertigen Stand und konkrete externe Blocker sauber übergeben.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-05, M19-01

---

## 11. Gebührenengine: Ausgangsspezifikation

Prüfstand: 2026-09-06. Implementierung muss den aktuellen Quellenstand bei Start noch einmal prüfen. Dieser Abschnitt spezifiziert den Standardfall Hund/Katze, keine vollständige Abbildung sämtlicher Sondertatbestände der GOT.

Der konsolidierte GOT-Text weist die Katalogbeträge als einfache Sätze ohne Umsatzsteuer aus. Regulär sieht er grundsätzlich den einfachen bis dreifachen Satz vor; für den einschlägigen tierärztlichen Notdienst zwei- bis vierfach zuzüglich einer Notdienstgebühr von 50 Euro. Die Pauschale ist in derselben Angelegenheit nicht je Tier erneut zu erheben. Vereinbarte Abweichungen/Sonderfälle und reguläre Sprechstunden müssen berücksichtigt bzw. als nicht unterstützt abgegrenzt werden. §6 verhindert die zusätzliche Berechnung bereits enthaltener Leistungen. [S18]

### Startkonfiguration, vor Aktivierung fachlich prüfen

```json
{
  "market": "DE",
  "currency": "EUR",
  "standardFactorMin": "1.00",
  "standardFactorMax": "3.00",
  "emergencyFactorMin": "2.00",
  "emergencyFactorMax": "4.00",
  "emergencyFeeMinor": 5000,
  "factorPrecision": 2,
  "baseAmountsExcludeVat": true,
  "specialAgreementsSupported": false,
  "clinicalReview": "pending"
}
```

Faktoren in Hundertsteln oder mit einer korrekt eingesetzten Dezimalbibliothek behandeln. Ein pauschaler Standardfaktor für alle ausgewählten Leistungen ist eine ausdrücklich erläuterte Nutzerannahme; unterschiedliche Faktoren je Position können später als erweitertes UI ergänzt werden.

Notdienst nicht allein aus `Date.now()` oder Uhrzeit ableiten. Nutzer wählt den zutreffenden Behandlungskontext. Zeiträume und Sprechstundenausnahmen aus dem aktuellen Verordnungstext prüfen; unklare Fälle verweisen auf die Praxis, statt automatisch Zuschläge festzustellen.

### Rechenpipeline

Position -> passende Tierart/Mengeneinheit prüfen -> Basissatz x Menge x Faktor -> definierte Cent-Rundung -> Einzelpositionssumme -> zulässige gesonderte Zuschläge -> Steuergruppen -> Bruttosumme. Zusatzmaterial, Medikamente, Fremdlabor und Wegegeld sind keine automatisch enthaltenen Posten.

Der allgemeine deutsche Umsatzsteuersatz beträgt nach §12 Abs.1 UStG 19 Prozent. Das ist kein Freibrief, ungeprüft jede Zusatzposition oder jeden späteren Markt gleich zu besteuern. Steuerregeln je Zeilentyp im Review festlegen; im UI die Annahme erläutern. [S36]

### Unabhängige synthetische Tests

Diese Zahlen sind Rechenfixtures, keine echten GOT-Leistungen:

- 1.000 Cent x Menge 3 x Faktor 2,00 -> 6.000 Cent netto.
- Derselbe Fall plus einmal 5.000 Cent synthetisch angesetzte Notdienstpauschale -> 11.000 Cent netto; bei einheitlich angenommenen 19 Prozent -> 13.090 Cent brutto.
- Menge 0, negativer Wert, unzulässiger Faktor, inkompatible Tierart oder fehlende Einheit -> Validierungsfehler, keine stille Korrektur.
- In einer Sammelangelegenheit mit mehreren Tieren Pauschale nicht ungefragt pro Tier wiederholen.
- Eine bereits im gewählten Leistungsansatz enthaltene Teilposition darf nicht automatisch zusätzlich summiert werden. Solche Regeln benötigen belegte Zuordnung; unbekannte Kombinationen offen kennzeichnen.

Centgenaue Rechenarithmetik ist keine Garantie, dass eine echte Praxisrechnung identisch ausfällt. Das Ergebnis ist eine transparente modellbasierte Orientierung, kein Kostenvoranschlag der behandelnden Praxis.

---

## 12. CI, Ingestion und Cloudflare-Betrieb

### 1. Verantwortlichkeiten

GitHub enthält den öffentlichen Code und zulässige Daten. GitHub Actions führt Tests und geplante Datenarbeiten aus. Cloudflare baut und veröffentlicht die eigentliche Website. Es gibt im MVP genau einen Produktions-Deploymentpfad: Cloudflare Builds -> statische Assets. [S04–S05]

GitHub- und Cloudflare-Konten, gewünschter Repository-Inhaber, Domain und Rechtefreigaben sind echte externe Voraussetzungen. Fehlen sie, werden lokale Implementierung und Test-Build fortgesetzt; ein Cloud-Deployment wird nicht als erledigt markiert.

### 2. Branch-Modell

`main`: geprüfter Code, Konfiguration, redaktionell/fachlich freigegebene Regeln. Änderungen über kleine Feature-Branches und Prüfungen. Der Agent darf kein vorhandenes Repo löschen, keine unbeteiligten Änderungen zurücksetzen und keine fremde Historie überschreiben.

`data-live`: nur zur öffentlichen Weitergabe freigegebene normalisierte Open-Data-Snapshots mit Manifest. Keine ausführbaren Skripte, Markdown-Programme, Affiliate-Rohfeeds oder Nutzerdaten. Automatik darf diesen Branch in engen Pfaden aktualisieren, nicht `main` oder Workflow-Dateien.

`feat/Mxx-...`: laufende Umsetzung. Claude kann nach erfolgreicher Teilabnahme lokale Commits erstellen. Automatischer Push in das eindeutig zugewiesene Projekt ist zulässig, sobald Repository und Rechte geklärt sind. Die erste öffentliche Produktionsfreigabe bleibt an die Launch-Checkliste gebunden.

Ein `GITHUB_TOKEN` besitzt keine magische Dateipfad-Beschränkung. `contents: write` ist breiter als „nur Daten schreiben“. Deshalb Laufzeitvalidierung des Diffs plus Branch-/Ruleset-Schutz für `main` und `.github` konfigurieren. Ein separater Daten-Repository- oder GitHub-App-Pfad ist eine spätere Sicherheitsoption, kein still eingeführtes zweites Pflichtsystem.

### 3. Drei Build-Modi

#### development

Kleine eindeutig synthetische Fixtures, lokale URLs, keine echten Partner-Secrets. Alle Kernabläufe müssen damit reproduzierbar funktionieren. Der Modus enthält einen sichtbaren Testdaten-Hinweis und darf nicht als öffentliche Produktseite ausgegeben werden.

#### preview

Öffentliche freigegebene Daten erlaubt; Affiliate-Funktionen standardmäßig aus. Keine Produktions-Secrets für beliebige Pull Requests oder externe Forks. `noindex`, keine Aufnahme in die Produktions-Sitemap. `noindex` ist keine Zugriffssperre: Ein öffentlich erreichbares Preview darf ebenfalls keine vertraulichen Inhalte enthalten.

#### production

Pflichtdaten und Review-Freigaben strikt prüfen. Platzhalter-Partner, Fake-Bewertungen, `example.invalid`, Testpreise und ungeprüfte Rechts-/Medizinaussagen sperren den jeweiligen Veröffentlichungsweg. Unabhängige geprüfte Funktionen dürfen ohne gesperrte Funktionen veröffentlicht werden, wenn der Launch-Modus dies ausdrücklich erlaubt.

### 4. Cloudflare-Konfiguration

Workers Static Assets als assets-only Projekt einrichten. Kein `main`-Worker-Script, kein `run_worker_first`, kein SSR-Adapter, keine D1-/KV-/R2-Bindings. Astro erzeugt `dist/`; Wrangler lädt diese Dateien hoch. [S02–S04, S08]

Produktionsbranch `main`. Im Produktionsprojekt mit Partner-Secrets sind automatische Builds anderer Branches deaktiviert. Eine Cloudflare-Testvorschau läuft bei Bedarf in einem getrennten Preview-Projekt ohne Partner-Secrets und ohne Produktionsrechte; dieses ist kein zweiter Produktions-Deploymentpfad. Eine `if (branch === "main")`-Abfrage in Repository-Code ist keine Secret-Isolation, weil unvertrauenswürdiger Build-Code diese Abfrage verändern könnte. Build-Befehl des zu implementierenden Projekts: `npm run build:cloudflare`. Deployment: `npx --no-install wrangler deploy`. Wrangler als fixierte Entwicklungsabhängigkeit, nicht bei jedem Build aus einer ungebundenen latest-Version nachladen.

`build:cloudflare` muss in dieser Reihenfolge arbeiten:

1. Konfiguration, Freigabestatus und zulässige Quellen prüfen.
2. Den aktuellen `data-live`-Commit einmal auflösen und ausschließlich Dateien genau dieses Commits abrufen. In einem Build nicht mehrfach „latest“ auflösen.
3. Hashes, Schemas, Größen und Ausgabe-Rechte prüfen; den Daten-Commit im Build-Manifest festhalten.
4. Nur im vertrauenswürdigen Produktionskontext zugelassene Produktfeeds abrufen. Secret-URLs nie ausgeben.
5. Normalisieren, öffentliche Projektion erstellen und Fach-/Rechtechecks ausführen.
6. Astro bauen, Pagefind erzeugen, Sitemaps/Headers schreiben.
7. Fertiges `dist/` auf Secrets, private Felder, Platzhalter, Größe, URLs und ungültige Abhängigkeiten prüfen.
8. Deployment erst nach erfolgreicher lokaler Build-Prüfkette freigeben.

Cloudflare muss vor dem Deploy dieselben relevanten Prüfungen ausführen; ein eventuell noch laufender grüner GitHub-Check ist kein Deployment-Gate. Teure vollständige Browsermatrizen laufen in GitHub CI, Kernprüfungen und Output-Audit zusätzlich im Cloudflare-Build.

### 5. Geplante offene Datenimporte

Workflow `ingest-open.yml`: `workflow_dispatch` und ein wöchentlicher Zeitplan außerhalb der vollen Stunde. Beispiel `17 3 * * 1` in UTC; Zeitzone dokumentieren. Ingestion läuft von einer vertrauenswürdigen Fassung des Default-Branches. [S11]

Ablauf:

- Source Registry laden; fällige und freigegebene Sources ermitteln.
- Quelle unter definierten Timeout-, Redirect-, Größen- und Rate-Limits abrufen.
- Ein Source-Job schreibt nur in ein temporäres Arbeitsverzeichnis.
- Eingänge validieren, normalisieren, deterministisch sortieren und Differenz zum letzten freigegebenen Stand prüfen.
- Auffälligkeiten quarantänisieren; keine komplette Karte durch einen fehlerhaften leeren Feed ersetzen.
- Erfolgreiche Sources mit bestehenden weiterhin zulässigen Snapshots anderer Sources zu einem Manifest zusammenfügen.
- Bei Änderung einen atomaren Daten-Commit erstellen. Bei unveränderten Inhalten keine reinen Zeitstempel-Commits erzeugen.
- Erst danach den Cloudflare-Deploy-Hook für `main` auslösen. Der Hook ist ein Secret. Antwort auf Erfolg prüfen; Hook-Aufruf ist noch kein erfolgreicher Build. [S05]

Der Importer führt niemals Code aus dem Daten-Branch oder der Fremdquelle aus. HTML, CSV und JSON gelten als nicht vertrauenswürdige Daten. Markdown/MDX wird nicht aus Feeds ausgeführt. Source-URLs sind konfiguriert; Benutzer können den Importer nicht als allgemeinen URL-Fetcher steuern.

### 6. Rebuilds für Produktpreise

Zusätzlicher Workflow `rebuild-commerce.yml`: täglich, beispielsweise `43 4 * * *` UTC. Er enthält keine Händler-Secrets; er löst lediglich den vertrauenswürdigen Cloudflare-Build aus. Dort erfolgt der Feedabruf. Der Workflow wird erst aktiv, wenn mindestens ein Partner und seine Ausgaberechte freigegeben sind.

Nicht für jeden Artikel, jede Quelle oder jedes Produkt einen Build auslösen. Pro geplanten Lauf aggregieren. Überschneidungen über `concurrency` bzw. einen kontrollierten Build-Takt begrenzen. Builds im Normalbetrieb auf ein überschaubares tägliches Budget begrenzen; häufig aktualisiertes Wetter bekommt später einen separaten kleinen Daten-Build statt die gesamte Website stündlich neu zu bauen.

### 7. Letzter funktionierender Stand und Ablauf von Angeboten

Offene Snapshots können aus dem `data-live`-Branch wiederverwendet werden. Für geschützte Affiliate-Rohfeeds gibt es im MVP bewusst keinen garantiert dauerhaften Cache. Ein flüchtiger Build-Cache ist keine Datenbank und kein Recovery-Vertrag.

Fällt ein Händler aus, werden nur dessen Preise/Angebote weggelassen, sofern die restliche Website korrekt gebaut werden kann. Keine leeren Preise als 0 Euro veröffentlichen. Ist der komplette Build ungültig, bleibt das letzte Cloudflare-Deployment bestehen.

Weil ein stehen gebliebenes Deployment alte Preise enthalten kann, braucht jeder Preis `fetchedAt`/`expiresAt`, eine sichtbare Standangabe und eine Browserprüfung, die nach Ablauf die Zahl ausblendet und „Aktuellen Preis beim Anbieter prüfen“ zeigt. Statische HTML-/strukturierte Daten können ohne erfolgreichen Neu-Build nicht rückwirkend aktualisiert werden. Deshalb im Startumfang keine Preis-Offers als JSON-LD, kein angeblich aktueller Preis im SEO-Titel, kurze Browser-Revalidierung und ein Alarm bei fehlendem Tagesbuild. Bei strengeren Vertragsfristen ist entweder ein nachweislich zulässiger engerer Betriebsprozess oder ein später freigegebener dynamischer Ansatz nötig; Static-only nicht als universelle Lösung behaupten.

### 8. Fehlerpolitik und Schwellenwerte

Je Source maximal drei Abrufversuche mit Backoff/Jitter; `Retry-After` respektieren. Timeouts für Anfrage und Gesamtlauf. Redirect-Ziele erneut gegen Domain-Allowlist prüfen, Größenlimits auch nach Dekompression. Keine Umgehung von Captchas oder Zugangsbeschränkungen.

Projektstandard für strukturierte POIs: unerwarteter Rückgang um mehr als 20 Prozent oder Verlust einer ganzen bereits unterstützten Region -> Quarantäne statt Veröffentlichung. Diese Schwelle ist ein Startwert und wird anhand realer Daten justiert, nicht als Qualitätsgesetz behandelt. Bei Gebühren und Reiseregeln jede semantische Änderung in fachliches Review geben, selbst wenn sich nur eine Zahl ändert.

Fehlschlag eines optionalen Sources darf nicht sämtliche anderen Features abschalten. Fehlschlag der Rechteprüfung darf nicht mit „letzter bekannter Stand“ umgangen werden, wenn die Rechte erloschen sind.

### 9. Sicherheitsregeln für öffentliches CI

Standard `permissions: contents: read`; Schreibberechtigungen nur im konkreten Publish-Job. Actions auf überprüfte volle Commit-SHAs pinnen. Fork-PRs erhalten keine Produktions-/Affiliate-Secrets; kein untrusted Checkout in privilegierten `pull_request_target`- oder `workflow_run`-Kontexten. Keine vertraulichen Rohdaten oder kompletten Environment-Dumps in Logs. [S12–S13]

Ausschließlich freigegebene öffentliche Dateien als Actions-Artefakte hochladen. Artefakte, Logs, Caches, Screenshots und Fehlerreporter eines öffentlichen Projekts nicht als Geheimnisspeicher betrachten. Artefaktname oder ZIP-Passwort ersetzen keine Prüfung der Vertraulichkeit. Keine Secrets in clientseitige `PUBLIC_*`-Variablen.

CSV-Formeln und HTML aus Quellen als Text behandeln. URL-Schemes `javascript:`, `data:` und nicht freigegebene Hosts sperren. Keine Tracking-URL automatisch besuchen, um „den Affiliate-Link zu testen“; das kann Attribution auslösen. Strukturvalidierung und freigegebene Testlinks genügen.

### 10. Header und Cache

`_headers` bei jedem Build erzeugen. HTML und veränderliche Manifeste revalidieren; gehashte nicht kurzfristig zu widerrufende Assets langfristig cachen. Sicherheitsheader mindestens `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, CSP sowie `frame-ancestors`/X-Frame-Options passend zur tatsächlichen Website. [S09]

CSP nicht blind auf `unsafe-inline` erweitern. Inline-Skripte möglichst vermeiden oder mit Build-Hashes erlauben; tatsächliche Map-/Style-Anforderungen testen. Bei vielen Inline-Hashes das Headerlängenlimit beachten. JSON erhält richtigen Content-Type und `nosniff`. Kein pauschales CORS-* auf allen Daten, insbesondere keine Behauptung, CORS würde Kopieren verhindern.

404 muss HTTP 404 sein, keine SPA-200-Fallback-Seite. URL-Normalisierung und trailing slashes einmal konfigurieren. Preview-Domains `noindex` und Produktionscanonical ohne Fehlweiterleitung.

### 11. Monitoring

`/data/v1/health.json` bzw. `/datenstand/` enthält nur öffentliche Statusdaten: Code-Commit, Daten-Commit, Builddatum, Source-Alter, aktive Features und Zähler. Keine Tokens, privaten Partnerkonditionen oder personenbezogenen Inhalte.

GitHub-Smoke-Workflow prüft Status, definierte Seiten, Ablauf wichtiger Quellen und Schema-Konsistenz. Öffentliche Issues enthalten nur bereinigte Fehlerberichte. GitHub-Zeitpläne sind keine Alarm-SLA und können bei Inaktivität deaktiviert werden; denselben Scheduler sich selbst überwachen zu lassen deckt diesen Ausfall nicht ab. Betreiber prüft Actions-/Build-Benachrichtigungen und `/datenstand/` regelmäßig. Ein unabhängiger Monitoringdienst oder späterer kleiner Cloudflare-Zeitgeber ist eine separat freizugebende Betriebsverbesserung. [S11]

### 12. Budgets und Eskalation

Am Quellenprüftag nennt Cloudflare im Free-Tarif 3.000 Build-Minuten monatlich, 20 Minuten pro Build, 20.000 Static Assets und 25 MiB je Asset. Maßgeblich sind die Bedingungen bei Einrichtung. Reine Static-Asset-Auslieferung und Build-Ressourcen sind getrennt zu betrachten. [S03, S06–S07]

Eigene Startbudgets: Warnung ab 12.000 veröffentlichten Dateien; harter Projektstopp vor 18.000. Ein normaler JSON-Chunk bleibt deutlich unter dem Plattform-Dateilimit. Repository-Snapshot maximal 50 MiB; Git-Datenhistorie monatlich messen, ab 250 MiB einen Kompressions-/Archivierungsplan vorlegen. Keine großen PBF-Rohdateien in Git oder Cloudflare Assets. Kein automatischer Wechsel zu kostenpflichtigen Tarifen.

Diese Budgets sind Designgrenzen, keine laufenden Kostenschätzungen oder Kapazitätsgarantien. Domain, Kartendienst, fachliche Prüfung und Partnerdienstleistungen können Kosten verursachen.

### 13. Rollback

Code-Commit und Daten-Commit im Releaseprotokoll festhalten. Einen bekannten guten Cloudflare-Stand wiederherstellen und danach Smoke-Tests durchführen. Ein Code-Rollback darf keine inzwischen widerrufenen Datenrechte oder abgelaufenen Reiseregeln reaktivieren. Rollback-Entscheidung gegen aktuelle Sperrliste prüfen.

Daten-Rollback verändert den freigegebenen Snapshot nachvollziehbar; keine erzwungene Historienüberschreibung. Die tatsächlichen Provider-Rollback-Befehle beim Einrichten aus aktueller Dokumentation prüfen und als getestetes Runbook festhalten.

---

## 13. Qualitäts- und Launch-Gates

### 1. Definition of Done

Eine Aufgabe ist nur `done`, wenn ihre Liefergegenstände existieren, die geforderten Tests tatsächlich gelaufen sind, die relevanten Prüfungen bestanden wurden und ein Nachweis in `project/tasks.json` verzeichnet ist. Ein Screenshot allein beweist keine Rechenkorrektheit. Ein Unit-Test allein beweist kein funktionierendes Deployment. Ein implementierter Adapter beweist keine Partnerzulassung.

Jeder Nachweis enthält Testbefehl oder Prüfhandlung, Ergebnis, Commit/Dateireferenz und Datum. Fehlende Fach-/Kontofreigaben bleiben eigene offene oder blockierte Aufgaben, auch wenn der Code vollständig ist. Der Agent darf Anforderungen nicht abschwächen, Testfälle löschen oder `skip` hinzufügen, um Fortschritt zu behaupten.

### 2. Vorgesehene Befehle

Diese Befehle sind vom umsetzenden Agenten anzulegen. Dieses Planungspaket selbst enthält noch keine Website und behauptet nicht, dass die npm-Befehle bereits verfügbar sind.

```text
npm run dev
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:accessibility
npm run test:contracts
npm run data:validate
npm run data:license-check
npm run build:fixture
npm run build:production
npm run build:cloudflare
npm run check:dist
npm run check:links
npm run check:seo
npm run check:security
npm run check:budgets
npm run check:release
npm run verify
```

`verify` führt die schnelle notwendige Gesamtkette aus. Größere OSM-Downloads sind keine Pflicht jeder PR-Prüfung. Sie werden in zeitgesteuerten oder manuellen Integrationstests mit echten Quellen geprüft. Lokale Entwicklung und Unit-Tests dürfen nicht vom Internet oder echten Credentials abhängen.

Der mitgelieferte Statushelfer funktioniert unabhängig davon bereits: `python3 scripts/project_status.py`.

### 3. Gebührenrechner

Pflichtfälle: regulärer Faktor, Notdienst-Modus, mehrere Mengen, Dezimalfaktor, centgenaue Rundung, Zusatzkosten mit eigener Steuerbehandlung, fehlende Daten, doppelte Positionen, ungültige Mengeneinheit, Katalogwechsel und gesperrtes Szenario.

Synthetische Testpositionen verwenden: z. B. 10,00 EUR Grundwert × Faktor 2 × Menge 3 = 60,00 EUR netto. Das ist ein Rechentest, keine reale GOT-Position. Fachliche Golden Tests zusätzlich unabhängig gegen die verifizierte Originalquelle und einen dokumentierten Rechenweg prüfen. Erwartungswerte nicht mit derselben Implementierung erzeugen, die getestet wird.

Notdienst-Regeln aus der gültigen GOT übernehmen und prüfen; Pauschale nicht unbemerkt mit dem Leistungsfaktor multiplizieren. Steuersatz und Steuerbasis sind explizite Konfiguration, keine Annahme für alle zukünftigen Märkte. [S18]

Eine Behandlungsvorlage kann nur mit `clinicalReview=approved` öffentlich eine Gesamtschätzung liefern. Ohne vollständige Vorlage darf der Benutzer einzelne bekannte Positionen addieren; das Ergebnis muss fehlende Bestandteile klar nennen.

### 4. Reiseregeln

Testmatrix für jeden freigegebenen Zielstaat: passende/nicht passende Tierart, normales erwachsenes Tier, unvollständige Eingaben, vor/nach Inkrafttreten, Impf-/Dokumentfristen, falsch geordnete Daten, fehlendes Transitland, Drittland-Transit, Verkauf/Abgabe, unbegleitete Reise, größere Tiergruppe, junges Tier und geplante Rückreise.

V1 beschränkt sich auf einen expliziten Standardfall; alle anderen Kontexte geben `nicht unterstützt / amtlich prüfen` statt eine vermutete Checkliste zurück. Länder- und Verkehrsträger-Regeln dürfen nicht in einer scheinbar vollständigen EU-Pauschalregel verschwinden. Grenzfälle um Mitternacht/Zeitzonen als Kalenderdaten testen.

Keine live freigeschaltete Regel ohne offizielle Fundstelle, `effectiveFrom`, Reviewdatum und klaren Geltungsbereich. HTTP-Abruf-Erfolg ersetzt kein Review. [S25–S26]

### 5. Karten und Orte

Testfälle: unbekannte Position, abgelehnte Geolocation, eigener Ort ohne Treffer, sehr dichte Stadt, benachbarte Shards, Dublette über Regionengrenze, defekte Koordinate, überlappende OSM-Extrakte, unbekannte Öffnungszeiten, fehlende Telefonnummer, Tile-Provider-Ausfall.

Die Liste bleibt ohne JavaScript nutzbar. Karte lädt erst nach bewusster Aktivierung. Marker werden geclustert/begrenzt; größere Bereiche laden nicht ungefragt ganz Deutschland. OSM-Attribution muss in der Karte sichtbar bleiben; Daten-/Lizenzhinweise auch in Downloads. „Keine erfassten Treffer“ ist nicht „hier gibt es keinen Tierarzt“. [S22–S24]

Bei Ortszuordnung per Distanz statt Gemeindegrenze steht ausdrücklich „im Umkreis“, nicht fälschlich „in der Gemeinde“. Notdienst wird nur aus einer dazu geeigneten aktuellen Quelle angezeigt.

### 6. Angebote und Produktmatching

Testfälle: valide/ungültige GTIN, führende Null, Einzelpackung vs. Multipack, Gramm/Kilogramm-Umrechnung, EUR/USD-Mismatch, unbekannter Versand, Ausverkauf, Preis 0, fehlende Provision/Trackingfreigabe, abgelaufene Ausgaberechte, abgelaufener Preis, Rabatt nur für Neukunden, falsche Produktgröße und nicht verifizierte Attribute.

Default-Sortierung ist erklärbar und provisionunabhängig. Nur wirklich vergleichbare Varianten gemeinsam nach Gesamtpreis sortieren. Bei unbekanntem Versand lautet das Sortierlabel z. B. „Artikelpreis ohne unbekannte Versandkosten“, nicht „günstigstes Gesamtangebot“.

Fiktive Marken, Platzhalterpreise und Test-Affiliate-IDs müssen vom Produktionsaudit erkannt werden. Herstellerbilder nicht ohne Bilderlaubnis kopieren oder aus fremden Websites herunterladen. Ein fehlendes Bild erhält einen neutralen Platzhalter ohne falsches Produktfoto.

### 7. Health und Spielzeug

Im Startumfang Pflege-/Mobilitäts-/Zahnpflegezubehör und Spielzeug anhand belegter Produkteigenschaften. Keine automatisierte Diagnose, Dosierung, Behandlung oder aus Alter/Rasse abgeleitete Supplement-Pflicht. Medikamente, Gesundheits-Supplements und medizinisch interpretierte Tests bleiben bis zu gesonderter Evidenz-/Rechtsprüfung außerhalb automatischer Empfehlungen.

Pflichtfälle: falsche Tierart, fehlende Größe, widersprüchliche Herstellerangabe, unbekannte Kauintensitätsfreigabe, Material unbekannt, unpassende Gewichtsklasse. Unbekannt ist nicht geeignet. Ergebnis erläutert die tatsächlich geprüften Attribute. Nicht verwenden: „garantiert sicher“, „unzerstörbar“, erfundene Haltbarkeitsscores oder unbelegte Wirkaussagen.

### 8. Profil, Datenschutz und Sicherheit

Testen, dass initial keine Profilinformationen gespeichert oder an Dritte gesendet werden. Bewusst aktivierte lokale Speicherung, Löschen, Migration, korrupte Importdatei, Importgrößenlimit und deaktiviertes localStorage abdecken. Keine automatische Standortfreigabe. Keine Nutzereingaben in Pagefind-Index, Sitemap, URL-Parameter oder Affiliate-Sub-ID.

Browser-Netzwerkprüfung: Vor Karten-/Trackingfreigabe nur erlaubte first-party Requests. Partnerbilder können ebenfalls Third-Party-Requests verursachen; sie müssen in der echten Datenschutzkonfiguration berücksichtigt werden. Keine Behauptung „keine Cookies“ ohne Test aller aktiven Integrationen. [S33]

Secret-Tests prüfen Repo, Buildartefakte, HTML, JavaScript, JSON und Logs. Test-Token als Canary einsetzen; echten Token nie in den Testbericht schreiben.

### 9. SEO und redaktionelle Qualität

Indexierbare Seite braucht echte Daten oder eigenständigen hilfreichen Inhalt, eindeutigen Titel, H1, Quellen, Datumsangabe und funktionierende interne Links. Keine hunderttausend Kombinationen von Rasse × Ort × Spielzeug × Gesundheitsproblem.

Zunächst eine kuratierte Orts-Allowlist, z. B. bis zu 25 Städte mit ausreichend erfassten Daten. Die Karte darf bundesweit sein, obwohl nicht jede Gemeinde eine indexierbare Landingpage bekommt. Datenlücken dürfen nicht mit generierten Floskeln verdeckt werden.

Kein `AggregateRating` ohne echte veröffentlichte Bewertungen. Keine fingierte `Review`-/`MedicalWebPage`-Autorität. `hreflang` nur für existierende echte Sprachversionen; neue Zielstaatseite im deutschen Reisebereich ist keine Übersetzung. Pagefind schließt Merkliste, private Eingaben, Test- und Filterzustände aus. [S16–S17]

### 10. Performance und Zugänglichkeit

Projektziele, keine Hosting-Zusagen: LCP-Ziel <= 2,5 Sekunden, CLS <= 0,1 unter dokumentierten Testbedingungen. INP wird nicht durch einen einzelnen Lighthouse-Lauf als bestanden behauptet. Initiales allgemeines JavaScript möglichst <= 50 KiB gzip; zusätzliche Tool-Module budgetieren, Karte separat lazy laden. Die gemessenen Werte und Testgeräte dokumentieren.

Tastaturnavigation, sichtbarer Fokus, Labels, Fehlermeldungen, Screenreader-Ergebnisansagen, Kontraste, 200-Prozent-Zoom, mobile Layouts und Druckversionen prüfen. Keine horizontale Scrollpflicht für die Hauptbedienung. Browser-Tests mindestens Chromium und ein zweiter Engine-/Browserpfad; Desktop und mobiles Format. Screenshots zeigen tatsächlichen Build, keine Design-Mockups.

### 11. Internationale Architektur-Abnahme

Ein deaktivierter US-Testmarkt verwendet englische Texte, USD und andere Einheiten, ohne DE-Konfiguration zu überschreiben. Gebührenmodul liefert `unsupported`, wenn kein US-Adapter existiert. US-Testangebot erscheint nicht in DE-Listen. Deutscher Nutzer mit Reiseziel FR bleibt in `market=DE`.

Die Tests verwenden synthetische US-Daten ausschließlich als Fixtures. Sie erzeugen keine indexierbaren US-Seiten und belegen keinen bereits gestarteten US-Markt.

### 12. Öffentliche Freigabestufen

**A — technisches Preview:** Kerncode und Tests, klar als Test markierte Fixtures, kein vermeintlicher Live-Datenbetrieb. Kein öffentliches Monetarisierungsversprechen.

**B — redaktioneller Start:** Betreiberangaben, Datenschutz, Datenrechte, tatsächliche Daten, fachliche Freigaben und Sicherheitsprüfungen vorhanden. Nicht freigegebene Partnerfunktionen aus. Technische Einschränkungen werden sichtbar angegeben.

**C — monetarisierter Start:** Stufe B plus mindestens eine tatsächlich zugelassene und getestete Monetarisierungsintegration mit passenden Vertragsrechten. Versicherungslogik separat freigeben; eine Waren-Affiliatezulassung ist keine Versicherungserlaubnis. [S20, S27–S28]

Die rechtliche Anwendbarkeit von Werbekennzeichnung, Grundpreisen, Endgeräte-Einwilligung, Anbieterpflichten und gegebenenfalls Barrierefreiheitsrecht muss am konkreten Produkt geprüft werden. Ein allgemeiner Disclaimer ersetzt diese Prüfung nicht. [S32–S35]

---

## 14. Externe Voraussetzungen

Diese Tabelle ist ein Einrichtungsplan, kein Nachweis bereits bestehender Verbindungen. Keine Secret-Werte eintragen.

| Voraussetzung | Wer entscheidet / richtet ein? | Technischer Umgang bis dahin |
|---|---|---|
| GitHub-Account und gewünschter Repo-Inhaber | Betreiber; vorhandene eindeutige CLI-Authentifizierung nutzbar | Lokal entwickeln; M01-02 bei echtem Zugriffsproblem blockieren. |
| Neues öffentliches Repository | Agent darf nach autorisierter Zuordnung und Secretprüfung erstellen | Kein bestehendes privates Repo ohne Historienprüfung öffentlich machen. |
| Cloudflare-Account und Repo-Anbindung | Betreiber autorisiert die Verbindung | Konfiguration/Build lokal fertigstellen; Providerintegration separat blockieren. |
| Cloudflare-Build-/Deploy-Kontext | Projektadministration | Produktion baut nur main; etwaige Preview-Builds in separatem Projekt ohne Partner-Secrets. |
| Domain / SITE_URL | Betreiber wählt und kauft bei Bedarf selbst | example.invalid nur in development; keine Domain automatisch kaufen. |
| Impressum, Kontakt und echte Betreiberinformationen | Betreiber | Keine erfundenen Rechtsangaben; öffentliche Freigabe gesperrt. |
| Datenrechte | Zuständige prüfende Person, bei eindeutigen offenen Quellen dokumentierte Primärprüfung | Unklarer Source bleibt pending; Adapter mit synthetischen Fixtures bauen. |
| Waren-Affiliateprogramme | Betreiber beantragt / akzeptiert Verträge | Kandidaten und generische Adapter, keine erfundene Zulassung. |
| Versicherungs-Affiliate / konkrete Vermittlungsstruktur | Betreiber mit qualifizierter Rechtsprüfung | Nur technische deaktivierte Slots; kein individualisierter Tarifvergleich. |
| Fachliche Prüfung Gebühren-/Reiseregeln | Tatsächlich geeignete prüfende Person | Vorschau möglich, ungeprüfte Live-Regeln gesperrt. |
| Tracking-/Ads-Freigabe | Betreiber nach Prüfung der konkreten Integrationen | Ads und Marketing-Tracking aus; bloße Layoutslots nicht mit echten Anzeigen befüllen. |

### Secret-Namen und Ort

`CLOUDFLARE_BUILD_HOOK`: nur GitHub-Secret für vertrauenswürdigen manuellen/zeitgesteuerten Rebuildjob. Die gesamte Hook-URL ist geheim.

`AWIN_FEED_URL` beziehungsweise konkrete Partnerzugänge: nur Cloudflare-Build-Secrets im freigegebenen Produktionskontext. Kein `PUBLIC_`-Präfix.

`GITHUB_TOKEN`: automatisch je Workflow, minimale notwendige Job-Rechte. Kein persönlicher breit berechtigter Token als Standardersatz.

Weitere Secret-Namen nur bei realem Bedarf ergänzen; keine pauschale Sammlung von Zugängen. Vorzugsweise native GitHub-/Cloudflare-Verbindungen und restriktive projektbezogene Berechtigungen.

### Erster Live-Release

Freigabe muss das tatsächlich aktive Feature-Set nennen. Ein redaktioneller Start ohne Versicherungs- oder Warenpartner ist möglich, sofern die verbleibenden rechtlichen/fachlichen Anforderungen erfüllt sind. Er heißt nicht monetarisierter Start.

Ein einmal zugelassener weiterer Automatikbetrieb darf nur bereits freigegebene Pfade aktualisieren. Neue Rechtsregeln, neue medizinische Claims, neue Partnerverträge oder zusätzliche Datennutzungsformen erhalten ein eigenes Gate.

---

## 15. Späterer Ausbau

Nicht heimlich während M00–M19 ergänzen. Jeder Ausbau bekommt eigene IDs, Scope, Rechteprüfung, Tests und Betriebsbudget.

### E01 — DWD-Wetterhinweise

Eigener kleiner Daten-/Asset-Build, damit häufigere Wetteraktualisierungen nicht die komplette Website neu bauen. Wetterhinweise und Datenstand, keine medizinische Sicherheitsampel allein aus Temperatur. Lokale Frischeprüfung und Ausfallzustand erforderlich. Zusätzliche Cloudflare-Projekte oder alternative Scheduler erst nach Freigabe.

### E02 — Rückruf- und Sicherheitsinformationen

Zunächst tatsächliche API, Lizenz, Aktualität, Marken-/Chargen-/EAN-Abdeckung und Quellenlage klären. „Keine Meldung in den erfassten Quellen“ statt „sicher“. Rückrufe nicht als Angstverkaufsfläche missbrauchen. Für Warnmeldungen keine Echtzeit- oder Vollständigkeitsgarantie auf Basis eines GitHub-Cronjobs abgeben.

### E03 — Budgetrechner

Nutzer gibt Verbrauch/Mengen und frei gewählte Kostenannahmen ein; geprüfte Preise ergänzen. Keinen monatlichen Tierarztbedarf oder eine nötige Versicherung erfinden. Steuer nur für konkret verifizierte Kommune. Erstmal lokal rechnen, ohne Profilserver.

### E04 — Preisverlauf und Preisalarme

Historien nur mit erlaubter Datenspeicherung. Persistente öffentliche Historie kann zunächst ein eng budgetierter Snapshot sein; geschützte Rohfeeds bleiben unzulässig. Persönlicher E-Mail-Preisalarm benötigt einen bewusst ausgewählten zusätzlichen Dienst/Backend und Einwilligungsprozess. Nicht als bereits durch Static JSON erledigt behaupten.

### E05 — Gesundheitsergänzungen

Supplements, Tests und Tierarzneimittel nur nach produkt-/claimbezogener Prüfung von Evidenz, Einordnung, Werberegeln und Partnerrechten. Kein klinisches Matching allein aus Rasse, Alter oder Symptomen. EMA/ESCCAP/FEDIAF nicht automatisch durch ein Webscraping-Modul ersetzen.

### E06 — Weitere Märkte

Vor jedem Marktstart echte Händler, Produkte, Regeln, Sprache, Datenrechte, Währung/Einheiten, Datenschutz und Betrieb prüfen. Ein Sprachmodell darf DE-Texte nicht pauschal übersetzen und als lokal validierte Information veröffentlichen.

### E07 — Ads und Messung

Zuerst reale Affiliate-Konversionen über die zugelassenen Partnerberichte und erlaubte statische Kampagnenkennungen auswerten. Keine personenbezogenen Sub-IDs. Display Ads benötigen gesonderte Netzwerk-/Datenschutz-/Consent-Konfiguration und Performance-Abnahme; Gesundheits-/Reise-Toolbedienung nicht mit Anzeigen überdecken.

### E08 — Nutzerbewertungen und eigenes Testprogramm

Ein echter Bewertungsdienst braucht Moderation, Missbrauchsschutz, Speicher-/Datenschutzkonzept und tatsächliche Beiträge. Kein statisch generiertes Bewertungsvolumen. Für eigene Produkttests Stichprobe, Methode, Messgrößen und Interessenkonflikte offenlegen. Erst nach eigener Datenerhebung echte Haltbarkeits- oder Nutzungsstatistiken veröffentlichen.

---

## 16. Start und Wiederaufnahme

Kopiere den folgenden Text in Claude Code, nachdem dieses Paket in das vorgesehene Projektverzeichnis entpackt wurde. Ein vorhandenes CLAUDE.md nicht unbesehen überschreiben; Regeln zusammenführen.

```text
Du setzt jetzt die Haustierplattform aus diesem Repository um.

Lies CLAUDE.md, README.md, docs/DECISIONS.md und die Statusdateien.
Die vollständige Spezifikation steht in IMPLEMENTIERUNGSPLAN.md;
für die Ausführung verwende die modularen docs-Dateien und project/tasks.json.

Arbeite den Plan M00–M19 mit seinen 120 Einzelaufgaben ab.
Baue das Produkt tatsächlich, nicht nur Architektur, Mockups oder TODO-Dateien.
Wähle ausführbare Aufgaben nach ihren Abhängigkeiten. Deutschland ist der einzige
Startmarkt. Europa und USA werden nur durch Markt-/Locale-/Providerverträge vorbereitet.

Verwende Astro static, TypeScript, öffentliche zulässige JSON-Snapshots,
GitHub Actions für CI/Import und Cloudflare Builds + Static Assets für Build/Deployment.
Kein Supabase, keine Laufzeitdatenbank, kein SSR und kein ungeplantes API-Backend.

Führe nach jedem sinnvollen Abschnitt die passenden Tests aus.
Prüfe UI-Änderungen zusätzlich im Browser. Pflege task status, Nachweise,
STATUS.md, BLOCKERS.md und HANDOFF.md. Erstelle kleine überprüfbare Commits.

Halte nicht nach dem ersten Scaffold an. Arbeite an der nächsten ausführbaren
Aufgabe weiter. Fehlt ein Account, ein Secret, ein Partnervertrag oder ein Fachreview,
blockiere nur die betroffene Integration, verwende eindeutig synthetische Fixtures
für lokale Tests und arbeite an unabhängigen Aufgaben weiter.

Du darfst keine Datenrechte, echten Testergebnisse, Partnerschaften oder
medizinischen/rechtlichen Freigaben erfinden. Kein veröffentlichter Produktionsinhalt
mit Fake-Daten. Geschützte Affiliate-Rohfeeds und Tokens gehören weder ins öffentliche
Repository noch in Browser-JSON, Logs oder öffentliche Artefakte.

Verwende nur eindeutig autorisierte Konten/Projekt-Remotes. Keine kostenpflichtigen
Ressourcen, keine Vertragszustimmungen und kein Veröffentlichen ungeprüfter Inhalte.
Erste Produktion nur nach den echten Launch-Gates des Plans.

Antworte auf Statusfragen mit Meilenstein-ID, Aufgaben-ID, erledigten Aufgaben,
letztem tatsächlich ausgeführten Test, Blockern und nächstem Schritt.

Beginne jetzt mit der Prüfung des Arbeitsverzeichnisses und M00-01.
Ist bereits Arbeit vorhanden, setze am dokumentierten Checkpoint fort.
```

### Fortsetzung nach einer Unterbrechung

```text
Setze die Umsetzung fort. Lies CLAUDE.md, project/tasks.json und docs/HANDOFF.md.
Prüfe den tatsächlichen Git-Zustand und die letzten Testnachweise. Erfinde keinen
neuen Gesamtplan, sondern fahre mit der nächsten ausführbaren Aufgabe fort.
Blockierte externe Freigaben bleiben blockiert; arbeite an unabhängigen Aufgaben weiter.
```

### Präzise Statusabfrage

```text
Status M12: Welche Teilaufgaben sind erledigt, woran arbeitest du gerade,
welcher Test wurde zuletzt wirklich ausgeführt, was ist blockiert und was folgt?
Trenne implementierten Code von fachlich freigegebenem Live-Betrieb.
```

### Erwartete Statusform, nur ein Formatbeispiel

```text
Meilenstein: M12 — Reisecheck
Aktuell: M12-04 — Wizard und Ergebnisse
Erledigt: [echte Anzahl]/6 Teilaufgaben
Letzter Test: [tatsächlicher Befehl, Ergebnis, Commit]
Blocker: [echter Blocker oder keiner]
Nächster Schritt: [konkrete Aufgabe]
Live-Freigabe: [ja/nein mit Nachweis]
```

Der Prompt ersetzt keine vorhandenen Sicherheitsfreigaben, laufende Claude-Code-Sitzung oder Kontozugänge. Er ermöglicht strukturiertes Weiterarbeiten; unbegrenzt ununterbrochene Ausführung wird nicht garantiert.

---

## 17. Primärquellen

Prüfstand: 6. September 2026. Nur Primärquellen. Links sind Einstiegs- und Nachweisquellen, keine automatisch erteilten Projektrechte. Bei Integration die genaue Ressource und maßgebliche Fassung prüfen. Fachliche und rechtliche Freigaben werden dadurch nicht ersetzt.

### S01 — Astro: statische Ausgabe

`https://docs.astro.build/en/reference/configuration-reference/`

Statisches Rendering als Framework-Grundlage.

### S02 — Cloudflare: Astro auf Workers

`https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/`

Astro kann ohne Cloudflare-Adapter als rein statische Website veröffentlicht werden.

### S03 — Cloudflare: Static Assets, Abrechnung und Grenzen

`https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/`

Reine Asset-Anfragen sind kostenlos und unbegrenzt; Worker-Ausführung ist davon getrennt.

### S04 — Cloudflare: Workers Builds

`https://developers.cloudflare.com/workers/ci-cd/builds/`

Git-Anbindung, Build- und Deploy-Konfiguration.

### S05 — Cloudflare: Deploy Hooks

`https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/`

POST-Hook löst einen Build für den konfigurierten Branch aus; Hook-URL ist ein Zugangsschlüssel.

### S06 — Cloudflare: Build-Limits und Preise

`https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/`

Am Prüftag: Free 3.000 Build-Minuten/Monat, 20 Minuten Build-Timeout, eine gleichzeitige Ausführung.

### S07 — Cloudflare: Workers-Limits

`https://developers.cloudflare.com/workers/platform/limits/`

Am Prüftag: 20.000 Static Assets im Free-Tarif und 25 MiB je Datei; vor Einrichtung erneut prüfen.

### S08 — Cloudflare: Wrangler-Konfiguration

`https://developers.cloudflare.com/workers/wrangler/configuration/`

assets.directory, HTML-Routing und 404-Verhalten.

### S09 — Cloudflare: Asset-Headers

`https://developers.cloudflare.com/workers/static-assets/headers/`

_headers, Cache-Control und Sicherheitsheader für statische Antworten.

### S10 — GitHub: Actions-Abrechnung

`https://docs.github.com/en/billing/concepts/product-billing/github-actions`

Standard-GitHub-Runner für öffentliche Repositories werden kostenlos angeboten; andere Grenzen separat prüfen.

### S11 — GitHub: Workflow-Ereignisse und Zeitpläne

`https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows`

Zeitpläne können sich verzögern oder ausfallen; öffentliches Repo ohne Aktivität kann nach 60 Tagen deaktivierte Zeitpläne haben.

### S12 — GitHub: sichere Actions-Nutzung

`https://docs.github.com/en/actions/reference/security/secure-use`

Minimale Berechtigungen, Schutz vor nicht vertrauenswürdigem Code und Pinning von Actions.

### S13 — GitHub: Secrets

`https://docs.github.com/actions/security-guides/using-secrets-in-github-actions`

Konfiguration und Umgang mit Workflow-Secrets.

### S14 — Claude Code: Best Practices

`https://code.claude.com/docs/en/best-practices`

Verifizierbare Aufgaben, knappe CLAUDE.md, Kontextmanagement und überprüfbare Arbeitsübergaben.

### S15 — Node.js: Release-Status

`https://nodejs.org/en/about/previous-releases`

Node 24 wird am Prüftag als LTS geführt; Patchversion beim Projektstart festlegen.

### S16 — Pagefind: statische Suche

`https://pagefind.app/docs/`

Suchindex wird nach dem HTML-Build erstellt; keine Suchserver-Infrastruktur nötig.

### S17 — Pagefind: mehrsprachige Suche

`https://pagefind.app/docs/multilingual/`

Sprachzuordnung aus dem lang-Attribut des HTML-Dokuments.

### S18 — GOT: konsolidierter Verordnungstext

`https://www.gesetze-im-internet.de/got_2022/BJNR140100022.html`

Datenbasis für Gebührenpositionen und Regeln; amtliche Verkündung und Änderungsstand zusätzlich dokumentieren.

### S19 — UrhG § 5: amtliche Werke

`https://www.gesetze-im-internet.de/urhg/__5.html`

Urheberrechtliche Einordnung von Gesetzen und Verordnungen, nicht von fremden Kommentaren oder Website-Designs.

### S20 — GewO § 34d

`https://www.gesetze-im-internet.de/gewo/__34d.html`

Versicherungsvermittlung einschließlich bestimmter internetbasierter Auswahl- und Vergleichsangebote.

### S21 — Geofabrik: Deutschland-Extrakte

`https://download.geofabrik.de/europe/germany.html`

PBF-Extrakte und regionale Unterteilungen; kein vollständiger Deutschland-Download im Besucherbrowser.

### S22 — Open Database License 1.0

`https://opendatacommons.org/licenses/odbl/1-0/`

Datenbankrechte, abgeleitete Datenbanken und zusammengefasste Datenbanken; getrennte Dateien allein lösen keine Lizenzfrage.

### S23 — OSMF: Lizenz-FAQ

`https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ`

Kommerzielle OSM-Datennutzung und Attribution.

### S24 — OSMF: Tile Usage Policy

`https://operations.osmfoundation.org/policies/tiles/`

Nutzungsgrenzen der öffentlichen Raster-Kartenserver, keine Offline-/Massen-Downloads.

### S25 — EU-Kommission: Reisen mit Haustier innerhalb der EU

`https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/travelling-pet-within-eu_en`

Aktuelle Einstiegsquelle für die rechtlich gepflegte Reise-Regelbasis.

### S26 — EU-Kommission: Hunde, Katzen, Frettchen

`https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets_en`

Verknüpfte Rechtsakte und Abgrenzung nichtkommerzieller Tierbewegungen.

### S27 — Awin: Publisher-Produktfeed-Leitfaden

`https://help.awin.com/developers/docs/product-feed-publisher-guide-intro`

Produktfeeds und Deeplinks; daraus folgt keine pauschale Erlaubnis zur öffentlichen Weitergabe aller Feed-Daten.

### S28 — Awin: Publisher-Vertragsbedingungen

`https://www.awin.com/gb/publisher-terms`

Anwendbare Netzwerk- und ergänzende Verträge müssen je Account/Programm geprüft werden.

### S29 — Open Food Facts: API und Lizenzhinweise

`https://openfoodfacts.github.io/openfoodfacts-server/api/`

Datenbank-/Inhalts-/Bildrechte getrennt; konkrete OPFF-Distribution zusätzlich verifizieren.

### S30 — Open Pet Food Facts: Projektseite

`https://wiki.openfoodfacts.org/Open_Pet_Food_Facts`

Einstieg in Tierfutterdaten; Abdeckung und Felder vor Produktentscheidung messen.

### S31 — DWD: Open-Data-FAQ

`https://www.dwd.de/DE/leistungen/opendata/faqs_opendata.html`

Open-Data-Nutzung mit CC BY 4.0 und Quellenvermerk; konkretes Produkt prüfen.

### S32 — DDG § 5

`https://www.gesetze-im-internet.de/ddg/__5.html`

Anbieterinformationen/Impressum als Freigabepunkt.

### S33 — TDDDG § 25

`https://www.gesetze-im-internet.de/ttdsg/__25.html`

Endgerätezugriffe und Einwilligung einschließlich gesetzlicher Ausnahmen.

### S34 — UWG § 5a

`https://www.gesetze-im-internet.de/uwg_2004/__5a.html`

Kennzeichnung kommerzieller Zwecke und Vermeidung irreführender Auslassungen.

### S35 — PAngV § 4

`https://www.gesetze-im-internet.de/pangv_2022/__4.html`

Grundpreisangaben; konkrete Anwendung auf das Geschäftsmodell prüfen.

### S36 — UStG § 12

`https://www.gesetze-im-internet.de/ustg_1980/__12.html`

Allgemeiner Umsatzsteuersatz; konkrete Zeilen-/Sonderfallbehandlung separat prüfen.
