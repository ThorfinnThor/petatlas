# Handoff

Stand: 2026-09-08, Sitzung 11.

Eine frische Sitzung beginnt hier, nicht beim erneuten Erfinden der Architektur. Reihenfolge: `CLAUDE.md`, dieses Dokument, `npm run status`, dann der betroffene Abschnitt von `docs/MILESTONES.md`.

## Tatsächlicher Zustand

Projektpfad `~/Projects/pet-platform`. Branch `main`, `origin` = https://github.com/ThorfinnThor/petatlas (public), Stand gepusht.

**Der ursprüngliche Plan (M00–M19) ist abgearbeitet; seit dem 2026-09-08 läuft der Block M20 bis M22 für Inhaltstiefe, Designvertrag und Datenqualität. M00 bis M07 vollständig, M08 bei 5/6 (M08-06 blockiert), M10 und M11 vollständig, M09 bei 5/6, M12 bei 5/6, die sechste blockiert, M13 bei 5/6, die sechste blockiert, M14 bei 5/6, die sechste blockiert, M15 vollständig, M16 vollständig, M17 vollständig, M18 bei 5/6, die sechste blockiert, M19 bei 5/6, die sechste blockiert (122 von 134 Aufgaben, 7 blockiert).** Der genaue Stand steht in `project/tasks.json`; `npm run status` gibt ihn aus.

Vorhanden: Projektvertrag und Autonomierahmen; Astro 7 static mit TypeScript 6 strict und voller Prüfkette; Domänenmodelle für Markt, Geld, Einheiten, Datum, Provenienz, Rechte, Fachschemas und Provider; Route Registry, Designsystem, fünf Kernseiten, statische Suche und zugängliche Formularbausteine; Quellenregister mit Publikationsklassen, Attribution, ODbL-Datenfluss und Lizenzregression.

Zusätzlich vorhanden: Import- und Snapshot-System (Adapter-API, sicherer Fetcher, deterministische Normalisierung, Differenzprüfung mit Quarantäne, Sharding, Manifest, atomare Veröffentlichung).

Fertig aus dem Block M20 bis M22: 1006 Gebührenpositionen mit eigener Seite, 150 Gruppenseiten und ein Katalogeinstieg (M20-01); 42 statt 25 Stadtseiten (M20-02); die zweite kommunale Quelle — Hamburg, 140 Auslaufzonen nach § 8 HundeG unter `dl-de/by-2-0` — samt verallgemeinertem Snapshot- und Abgleichlauf über ein Quellenverzeichnis, und beide kommunalen Quellen sind jetzt auf den Stadtseiten sichtbar statt nur im Repository (M20-03); der bundesweite OSM-Import mit Standdatum im Snapshot (M22-01); die Komponentenbibliothek unter `src/components/ui/` mit Button, Card, Badge, Alert, PageHeader, EmptyState und Breadcrumbs (M21-01, M21-02). Der Build erzeugt 1232 Seiten mit freigeschalteten Funktionen, 12 ohne.

Nicht vorhanden: Cloudflare-Projekt, echte Fachdaten, Rechner, Karte, Reisecheck, Katalog, Domain, Betreiberangaben, Partnerverträge, Fachfreigaben.

## Umgebung

Node v24.19.0, npm 11.17.0, Python 3.13.15.

```
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
```

**Am 2026-09-08 in einem frischen Clone nachgemessen und die frühere Angabe hier korrigiert:** `npm ci`, `npm run verify`, `npm run build:site` und `npx playwright test` laufen **ohne** diese Variable. Sie wird nur für zwei Dinge gebraucht — den Abruf von `gdi.berlin.de` (sonst `SELF_SIGNED_CERT_IN_CHAIN`) und `wrangler`. Wrangler meldet ohne sie „auth token has expired“; das Token ist aber intakt, nur der Refresh scheitert an derselben fehlenden Wurzel.

Fehlt die Datei: `security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem`. `strict-ssl` bleibt aktiv; es wird nichts abgeschaltet. Einzelheiten in `docs/DEVELOPER_SETUP.md` und `docs/TOOLCHAIN.md`.

Prüfkette vor jedem Commit:

```
npm run lint && npm run typecheck && npm run format:check && npm run test:unit && npm run check:security && npm run check:workflows && npm run check:handoff
```

Bei UI-Änderungen zusätzlich `npx playwright test`. Ein hängengebliebener Preview-Server wird mit `npx astro preview stop` beendet.

## Nächster ausführbarer Schritt

**M21-05 — Radio Cards für kleine Entscheidungen.** Tierart und Kontext als anklickbare Karten mit echtem Radio im DOM (Abschnitt 13.6).

Danach M21-06 (Produktkarte und Bildschirmmappe), M22-02 bis M22-04 (Datenqualität). Der Block ist in `docs/MILESTONES.md` und im Manifest beschrieben.

**Fallstrick aus der letzten Aufgabe:** eine statische `.astro`-Seite unter einer abschaltbaren Funktion wird trotzdem gebaut — `getStaticPaths` wirkt dort nicht. `npm run build` brach deshalb seit dem Katalogeinstieg ab, ohne dass `npm run verify` es merkte (die Kette baut die Seiten nicht). Solche Seiten gehören als Restroute (`katalog/[...rest].astro`) angelegt, und `npm run build` **ohne** `ENABLE_FEATURES` gehört zur Prüfung dazu.

**M14-06 ist blockiert (B-006):** Echte Produkte lassen sich attributseitig erst abnehmen, wenn Angebotsrechte bestehen. Finder und Pflegeseiten laufen mit ausdrücklich synthetischen Daten. Ablauf in `docs/reviews/care-toys.md`.

**M13-06 ist blockiert (B-005):** Der Angebotslayer ist fertig, aber es gibt keine Programmfreigabe eines Netzwerks. Ohne sie bleibt der Slot aus — kein Feedabruf, keine öffentliche Angebotsdatei, leerer Katalog mit Begründung. Prüfpunkte in `docs/reviews/commerce-partner.md`.

**M12-06 ist blockiert (B-004):** Der Reisecheck ist fertig, die Regeln sind mit Fundstelle erfasst, aber fachlich nicht geprüft. Er läuft deshalb in der Vorschau — ohne positives Gesamtergebnis, und das steckt im Motor, nicht nur im Text. Prüfpunkte und Freigabeschritte in `docs/reviews/travel.md`.

**M09-06 ist blockiert (B-003):** Kein Partnervertrag, keine Prüfung nach § 34d GewO. Ohne beides bleibt die Partnerkonfiguration leer und es entsteht keine Versicherungs-CTA. Prüfpunkte in `docs/reviews/insurance.md`.

**M08-06 ist blockiert (B-002):** Der Rechner ist fertig und getestet, aber die fachliche Abnahme fehlt. Er ist auf Wunsch des Betreibers in der **Vorschau** freigeschaltet und dort mit sichtbarem Warnhinweis erreichbar; die versionierte Marktkonfiguration bleibt auf `costs: false`. Die acht Prüfpunkte und die fünf Freigabeschritte stehen in `docs/reviews/costs.md`, die Merkliste in `TODO.md`.

**Rechner ansehen:** `ENABLE_FEATURES=costs npm run build:site && npx astro preview` — der Override wirkt nur in `development`.

**Live erreichbar:** https://petatlas-de-preview.shuu9599.workers.dev — technische Vorschau, `noindex`, mit freigeschaltetem Rechner. Nachweise in `docs/DEPLOYMENT_EVIDENCE.md`.

**Vor jedem Commit:** `npm run verify` — Lint, Typecheck, Format, Unit-Tests, Secret-Audit, Lizenz- und Handoff-Prüfung in einer Kette. Über den **Exit-Code** prüfen, nicht über die letzten Ausgabezeilen; in dieser Sitzung sind vier Commits mit roter Kette rausgegangen, weil ich nur die Ausgabe gelesen habe.

**Reihenfolge beim Abschluss einer Aufgabe:** erst `docs/HANDOFF.md` auf die *nächste* Aufgabe fortschreiben, dann den Status setzen und beides gemeinsam committen. Sonst schlägt `npm run check:handoff` in der CI fehl — genau das ist beim ersten CI-Lauf passiert.

Prüfkette vor jedem Commit: `npm run lint && npm run typecheck && npm run format:check && npm run test:unit && npm run check:security && npm run check:workflows && npm run check:licenses && npm run check:handoff`, bei UI-Änderungen zusätzlich `npx playwright test`.

## Entschieden

**B-001 ist aufgelöst (ADR-018).** Der Gebührenkatalog wird über den offiziellen XML-ZIP-Download bezogen. Die Vorgaben zu Snapshots, Fehlerverhalten, Provenienz und Darstellung stehen in `docs/DECISIONS.md`; die Betriebsprüfung der Abrufbedingungen ist erledigt und in `docs/SOURCE_REVIEWS.md` dokumentiert.

## Cloudflare

Zugang liegt seit 2026-09-06 vor: OAuth-Token für `Shuu9599@gmail.com's Account`, hinterlegt in der lokalen wrangler-Konfiguration. **Wichtig:** wrangler braucht `NODE_EXTRA_CA_CERTS`; ohne die Variable meldet es fälschlich ein abgelaufenes Token (am 2026-09-08 nachgemessen).

## Nicht voraussetzen

Echte Domain, Betreiberangaben, Cloudflare-Verbindung, Affiliate-Secrets, veröffentlichungsfähige Partnerfeeds oder erfolgte medizinisch/rechtliche Freigaben. Alle Gates in `config/launch.json` stehen auf `false`, und `npm run build:production` bricht deshalb absichtlich ab.
