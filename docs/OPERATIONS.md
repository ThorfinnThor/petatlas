# Build, Deployment, Ingestion und Betrieb

## 1. Verantwortlichkeiten

GitHub enthält den öffentlichen Code und zulässige Daten. GitHub Actions führt Tests und geplante Datenarbeiten aus. Cloudflare baut und veröffentlicht die eigentliche Website. Es gibt im MVP genau einen Produktions-Deploymentpfad: Cloudflare Builds -> statische Assets. [S04–S05]

GitHub- und Cloudflare-Konten, gewünschter Repository-Inhaber, Domain und Rechtefreigaben sind echte externe Voraussetzungen. Fehlen sie, werden lokale Implementierung und Test-Build fortgesetzt; ein Cloud-Deployment wird nicht als erledigt markiert.

## 2. Branch-Modell

`main`: geprüfter Code, Konfiguration, redaktionell/fachlich freigegebene Regeln. Änderungen über kleine Feature-Branches und Prüfungen. Der Agent darf kein vorhandenes Repo löschen, keine unbeteiligten Änderungen zurücksetzen und keine fremde Historie überschreiben.

`data-live`: nur zur öffentlichen Weitergabe freigegebene normalisierte Open-Data-Snapshots mit Manifest. Keine ausführbaren Skripte, Markdown-Programme, Affiliate-Rohfeeds oder Nutzerdaten. Automatik darf diesen Branch in engen Pfaden aktualisieren, nicht `main` oder Workflow-Dateien.

`feat/Mxx-...`: laufende Umsetzung. Claude kann nach erfolgreicher Teilabnahme lokale Commits erstellen. Automatischer Push in das eindeutig zugewiesene Projekt ist zulässig, sobald Repository und Rechte geklärt sind. Die erste öffentliche Produktionsfreigabe bleibt an die Launch-Checkliste gebunden.

Ein `GITHUB_TOKEN` besitzt keine magische Dateipfad-Beschränkung. `contents: write` ist breiter als „nur Daten schreiben“. Deshalb Laufzeitvalidierung des Diffs plus Branch-/Ruleset-Schutz für `main` und `.github` konfigurieren. Ein separater Daten-Repository- oder GitHub-App-Pfad ist eine spätere Sicherheitsoption, kein still eingeführtes zweites Pflichtsystem.

## 3. Drei Build-Modi

### development

Kleine eindeutig synthetische Fixtures, lokale URLs, keine echten Partner-Secrets. Alle Kernabläufe müssen damit reproduzierbar funktionieren. Der Modus enthält einen sichtbaren Testdaten-Hinweis und darf nicht als öffentliche Produktseite ausgegeben werden.

### preview

Öffentliche freigegebene Daten erlaubt; Affiliate-Funktionen standardmäßig aus. Keine Produktions-Secrets für beliebige Pull Requests oder externe Forks. `noindex`, keine Aufnahme in die Produktions-Sitemap. `noindex` ist keine Zugriffssperre: Ein öffentlich erreichbares Preview darf ebenfalls keine vertraulichen Inhalte enthalten.

### production

Pflichtdaten und Review-Freigaben strikt prüfen. Platzhalter-Partner, Fake-Bewertungen, `example.invalid`, Testpreise und ungeprüfte Rechts-/Medizinaussagen sperren den jeweiligen Veröffentlichungsweg. Unabhängige geprüfte Funktionen dürfen ohne gesperrte Funktionen veröffentlicht werden, wenn der Launch-Modus dies ausdrücklich erlaubt.

## 4. Cloudflare-Konfiguration

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

## 5. Geplante offene Datenimporte

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

### Umgesetzter Stand (M17-01/M17-02)

`.github/workflows/ingest-open.yml` läuft wöchentlich (montags 04:17 UTC) und auf Zuruf. Er erneuert die Snapshots, prüft sie mit der vollen Prüfkette und öffnet einen **Pull Request** — er schreibt nicht nach `main`. Je Quelle gilt ein Zeitlimit von fünf Minuten und drei Versuche mit wachsender Pause; ein Fehlschlag lässt den vorhandenen Snapshot unangetastet, weil die Snapshotskripte selbst so gebaut sind.

`.github/workflows/data-branch.yml` schreibt die ausgelieferten Datendateien in den Branch `data-live`. Der Publisher lässt nur Dateien aus einer Allowlist durch, prüft jede mit dem Secret-Audit und verweigert `main` und `master` als Ziel.

**Was dort ausdrücklich nicht läuft:** der bundesweite OSM-Import. Er lädt rund 4,6 GiB in sechzehn Regionen, braucht Pausen zwischen den Abrufen (die Geofabrik antwortet sonst mit 502) und lief lokal rund eine Stunde. Auf einem GitHub-Runner wäre das ein Kampf gegen Zeit- und Plattengrenzen und ein unnötiger Druck auf einen fremden Server. Er bleibt ein **manueller Lauf**: `npm run ingest:osm-de`, danach `npm run snapshot:places` und `npm run build:places`. Die Messwerte stehen in `docs/OSM_BENCHMARK.md`.

**Der GOT-Abruf steht seit M17-07 im wöchentlichen Zeitplan**, bedingt über ETag und `Last-Modified`; ein HTTP 304 lässt den Snapshot unverändert.

**Er gelingt von einem GitHub-Runner aus jedoch nicht.** Am 2026-09-08 in zwei Workflows und fünf Versuchen gemessen: `www.gesetze-im-internet.de:443` nimmt die Verbindung aus diesem Netz nicht an (`UND_ERR_CONNECT_TIMEOUT` nach 10 s), während derselbe Abruf vom Arbeitsrechner sofort funktioniert. Der Versuch bleibt im Zeitplan — er kostet nichts und greift von selbst, sollte die Erreichbarkeit zurückkehren. **Verlassen kann man sich nicht darauf: die Aktualisierung des Gebührenkatalogs ist bis auf Weiteres ein manueller Lauf**, so wie der bundesweite OSM-Import. Ein Fehlschlag ersetzt keine Daten. Einzelheiten in `docs/SOURCE_REVIEWS.md`.

Der Importer führt niemals Code aus dem Daten-Branch oder der Fremdquelle aus. HTML, CSV und JSON gelten als nicht vertrauenswürdige Daten. Markdown/MDX wird nicht aus Feeds ausgeführt. Source-URLs sind konfiguriert; Benutzer können den Importer nicht als allgemeinen URL-Fetcher steuern.

### Beobachtung der Regelquellen (M17-03)

`.github/workflows/source-check.yml` läuft täglich um 05:23 UTC und auf Zuruf. Er vergleicht die Seiten aus `config/watchlist/rule-sources.json` mit dem festgehaltenen Stand in `data-snapshots/watch/rule-sources.json` und meldet, was ein Mensch ansehen muss — je Seite höchstens eine offene Meldung, mit stabilem Titel.

Fünf Befunde, und „unverändert“ ist nur einer davon: `unveraendert`, `geaendert`, `nicht_pruefbar`, `fehler`, `neu`. Eine Antwort ohne den erwarteten Marker gilt als **nicht prüfbar**, nicht als unverändert — sonst würde eine Bot-Prüfung zum neuen Sollzustand.

Zwei Quellen melden dauerhaft `nicht_pruefbar`, und das ist der ehrliche Befund: EUR-Lex beantwortet einen einfachen Abruf mit HTTP 202 und leerem Körper, die italienische Seite mit einer Bot-Prüfung. Beides wird nicht umgangen. Für Österreich und die Niederlande fehlt eine belegte Adresse; sie kommen dazu, sobald die fachliche Prüfung (M12-06) die tatsächlich gelesenen Adressen festhält.

Der Lauf **committet nichts**. Würde er den Vergleichsstand selbst fortschreiben, wäre jede Änderung im selben Moment wieder „gesehen“, ohne dass sie jemand gesehen hat. Er ändert auch keine Regel und stößt keinen Build an: eine Reiseregel wird fachlich geprüft, bevor sie gilt.

## 6. Rebuilds für Produktpreise

Zusätzlicher Workflow `rebuild-commerce.yml`: täglich, beispielsweise `43 4 * * *` UTC. Er enthält keine Händler-Secrets; er löst lediglich den vertrauenswürdigen Cloudflare-Build aus. Dort erfolgt der Feedabruf. Der Workflow wird erst aktiv, wenn mindestens ein Partner und seine Ausgaberechte freigegeben sind.

### Umgesetzter Stand (M17-03)

`.github/workflows/rebuild-commerce.yml` läuft täglich um 05:47 UTC und auf Zuruf. Der erste Schritt ist die Frage, ob es überhaupt ein zugelassenes Warenprogramm für einen aktiven Markt gibt (`scripts/publish/commerce-rebuild.ts`). Heute lautet die Antwort nein (M13-06), und dann endet der Lauf dort: kein Feedabruf, kein Rebuild, kein Hook.

Hook und Buildstatus bleiben getrennt. `scripts/publish/deploy-hook.ts` ruft den Hook auf und meldet einen Fehlschlag als Fehlschlag; dass der Aufruf angenommen wurde, ist ausdrücklich **keine** Aussage über den Build bei Cloudflare. Der Hook geht an keinen anderen Host als `api.cloudflare.com`, und protokolliert wird nur der Ursprung — sein Token steht im Pfad, nicht in der Query. Fehlt das Secret, wird übersprungen statt gescheitert.

Dass daraus keine Buildschleife wird, hängt nicht am Wohlverhalten, sondern an den Triggern: weder `source-check.yml` noch `rebuild-commerce.yml` noch `ingest-open.yml` reagiert auf `push`, `pull_request` oder `workflow_run`, keiner läuft häufiger als täglich, und jeder hat eine `concurrency`-Gruppe. `tests/workflows/trigger-grenzen.test.ts` prüft das an den Dateien.

Nicht für jeden Artikel, jede Quelle oder jedes Produkt einen Build auslösen. Pro geplanten Lauf aggregieren. Überschneidungen über `concurrency` bzw. einen kontrollierten Build-Takt begrenzen. Builds im Normalbetrieb auf ein überschaubares tägliches Budget begrenzen; häufig aktualisiertes Wetter bekommt später einen separaten kleinen Daten-Build statt die gesamte Website stündlich neu zu bauen.

## 7. Letzter funktionierender Stand und Ablauf von Angeboten

Offene Snapshots können aus dem `data-live`-Branch wiederverwendet werden. Für geschützte Affiliate-Rohfeeds gibt es im MVP bewusst keinen garantiert dauerhaften Cache. Ein flüchtiger Build-Cache ist keine Datenbank und kein Recovery-Vertrag.

Fällt ein Händler aus, werden nur dessen Preise/Angebote weggelassen, sofern die restliche Website korrekt gebaut werden kann. Keine leeren Preise als 0 Euro veröffentlichen. Ist der komplette Build ungültig, bleibt das letzte Cloudflare-Deployment bestehen.

Weil ein stehen gebliebenes Deployment alte Preise enthalten kann, braucht jeder Preis `fetchedAt`/`expiresAt`, eine sichtbare Standangabe und eine Browserprüfung, die nach Ablauf die Zahl ausblendet und „Aktuellen Preis beim Anbieter prüfen“ zeigt. Statische HTML-/strukturierte Daten können ohne erfolgreichen Neu-Build nicht rückwirkend aktualisiert werden. Deshalb im Startumfang keine Preis-Offers als JSON-LD, kein angeblich aktueller Preis im SEO-Titel, kurze Browser-Revalidierung und ein Alarm bei fehlendem Tagesbuild. Bei strengeren Vertragsfristen ist entweder ein nachweislich zulässiger engerer Betriebsprozess oder ein später freigegebener dynamischer Ansatz nötig; Static-only nicht als universelle Lösung behaupten.

## 8. Fehlerpolitik und Schwellenwerte

Je Source maximal drei Abrufversuche mit Backoff/Jitter; `Retry-After` respektieren. Timeouts für Anfrage und Gesamtlauf. Redirect-Ziele erneut gegen Domain-Allowlist prüfen, Größenlimits auch nach Dekompression. Keine Umgehung von Captchas oder Zugangsbeschränkungen.

Projektstandard für strukturierte POIs: unerwarteter Rückgang um mehr als 20 Prozent oder Verlust einer ganzen bereits unterstützten Region -> Quarantäne statt Veröffentlichung. Diese Schwelle ist ein Startwert und wird anhand realer Daten justiert, nicht als Qualitätsgesetz behandelt. Bei Gebühren und Reiseregeln jede semantische Änderung in fachliches Review geben, selbst wenn sich nur eine Zahl ändert.

Fehlschlag eines optionalen Sources darf nicht sämtliche anderen Features abschalten. Fehlschlag der Rechteprüfung darf nicht mit „letzter bekannter Stand“ umgangen werden, wenn die Rechte erloschen sind.

## 9. Sicherheitsregeln für öffentliches CI

Standard `permissions: contents: read`; Schreibberechtigungen nur im konkreten Publish-Job. Actions auf überprüfte volle Commit-SHAs pinnen. Fork-PRs erhalten keine Produktions-/Affiliate-Secrets; kein untrusted Checkout in privilegierten `pull_request_target`- oder `workflow_run`-Kontexten. Keine vertraulichen Rohdaten oder kompletten Environment-Dumps in Logs. [S12–S13]

Ausschließlich freigegebene öffentliche Dateien als Actions-Artefakte hochladen. Artefakte, Logs, Caches, Screenshots und Fehlerreporter eines öffentlichen Projekts nicht als Geheimnisspeicher betrachten. Artefaktname oder ZIP-Passwort ersetzen keine Prüfung der Vertraulichkeit. Keine Secrets in clientseitige `PUBLIC_*`-Variablen.

CSV-Formeln und HTML aus Quellen als Text behandeln. URL-Schemes `javascript:`, `data:` und nicht freigegebene Hosts sperren. Keine Tracking-URL automatisch besuchen, um „den Affiliate-Link zu testen“; das kann Attribution auslösen. Strukturvalidierung und freigegebene Testlinks genügen.

## 10. Header und Cache

`_headers` bei jedem Build erzeugen. HTML und veränderliche Manifeste revalidieren; gehashte nicht kurzfristig zu widerrufende Assets langfristig cachen. Sicherheitsheader mindestens `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, CSP sowie `frame-ancestors`/X-Frame-Options passend zur tatsächlichen Website. [S09]

CSP nicht blind auf `unsafe-inline` erweitern. Inline-Skripte möglichst vermeiden oder mit Build-Hashes erlauben; tatsächliche Map-/Style-Anforderungen testen. Bei vielen Inline-Hashes das Headerlängenlimit beachten. JSON erhält richtigen Content-Type und `nosniff`. Kein pauschales CORS-* auf allen Daten, insbesondere keine Behauptung, CORS würde Kopieren verhindern.

404 muss HTTP 404 sein, keine SPA-200-Fallback-Seite. URL-Normalisierung und trailing slashes einmal konfigurieren. Preview-Domains `noindex` und Produktionscanonical ohne Fehlweiterleitung.

## 11. Monitoring

`/data/v1/health.json` bzw. `/datenstand/` enthält nur öffentliche Statusdaten: Code-Commit, Daten-Commit, Builddatum, Source-Alter, aktive Features und Zähler. Keine Tokens, privaten Partnerkonditionen oder personenbezogenen Inhalte.

### Umgesetzter Stand (M17-04)

`/data/v1/health.json` entsteht bei jedem `build:site` aus `src/features/freshness/`. Dieselbe Funktion speist `/de-de/datenstand/`; Seite und Datei können deshalb nicht auseinanderlaufen. Die Datei wird mit `max-age=0, must-revalidate` ausgeliefert — eine Datei, die das Alter der Daten nennt, darf nicht selbst aus einem Cache kommen.

Je Datensatz stehen Warn- und Sperrschwelle **mit Begründung** in `src/features/freshness/datasets.ts`. Vier Bewertungen: `frisch`, `alternd`, `veraltet`, `unbekannt`. Ein fehlender Stand, ein unlesbares Datum und ein Datum in der Zukunft sind `unbekannt` — und unbekannt gilt nie als aktuell.

Zwei Wirkungen werden unterschieden. `warnt` gilt für Karte, Gebührenkatalog und kommunale Flächen: ein alter Stand ist dort ein Hinweis, kein Ausfall. `sperrt` gilt für Reiseregeln und Preise: dort führt ein alter Stand in die Irre.

- **Preise:** jedes Angebot bekommt beim Normalisieren einen Ablauf — nennt der Feed keinen, wird er aus Abrufzeitpunkt und dem TTL aus `config/commerce/feeds.json` gerechnet. Im Browser blendet `src/features/freshness/offer-expiry.ts` abgelaufene Preise aus und setzt „Aktuellen Preis beim Anbieter prüfen“ an ihre Stelle. Geprüft wird das an einer Probekarte, die zur Bauzeit gültig und beim Ansehen abgelaufen ist (`tests/e2e/angebote.spec.ts`).
- **Reiseregeln:** eine fachliche Freigabe altert mit. Nach 180 Tagen ist sie ein Hinweis, nach 365 Tagen trägt sie kein positives Gesamtergebnis mehr; der Reisecheck fällt dann in den Vorschaumodus zurück. Der Prüftag kommt aus dem Browser, nicht aus dem Build.

GitHub-Smoke-Workflow prüft Status, definierte Seiten, Ablauf wichtiger Quellen und Schema-Konsistenz. Öffentliche Issues enthalten nur bereinigte Fehlerberichte. GitHub-Zeitpläne sind keine Alarm-SLA und können bei Inaktivität deaktiviert werden; denselben Scheduler sich selbst überwachen zu lassen deckt diesen Ausfall nicht ab. Betreiber prüft Actions-/Build-Benachrichtigungen und `/datenstand/` regelmäßig. Ein unabhängiger Monitoringdienst oder späterer kleiner Cloudflare-Zeitgeber ist eine separat freizugebende Betriebsverbesserung. [S11]

## 12. Budgets und Eskalation

Am Quellenprüftag nennt Cloudflare im Free-Tarif 3.000 Build-Minuten monatlich, 20 Minuten pro Build, 20.000 Static Assets und 25 MiB je Asset. Maßgeblich sind die Bedingungen bei Einrichtung. Reine Static-Asset-Auslieferung und Build-Ressourcen sind getrennt zu betrachten. [S03, S06–S07]

Eigene Startbudgets: Warnung ab 12.000 veröffentlichten Dateien; harter Projektstopp vor 18.000. Ein normaler JSON-Chunk bleibt deutlich unter dem Plattform-Dateilimit. Repository-Snapshot maximal 50 MiB; Git-Datenhistorie monatlich messen, ab 250 MiB einen Kompressions-/Archivierungsplan vorlegen. Keine großen PBF-Rohdateien in Git oder Cloudflare Assets. Kein automatischer Wechsel zu kostenpflichtigen Tarifen.

Diese Budgets sind Designgrenzen, keine laufenden Kostenschätzungen oder Kapazitätsgarantien. Domain, Kartendienst, fachliche Prüfung und Partnerdienstleistungen können Kosten verursachen.

## 13. Rollback

Code-Commit und Daten-Commit im Releaseprotokoll festhalten. Einen bekannten guten Cloudflare-Stand wiederherstellen und danach Smoke-Tests durchführen. Ein Code-Rollback darf keine inzwischen widerrufenen Datenrechte oder abgelaufenen Reiseregeln reaktivieren. Rollback-Entscheidung gegen aktuelle Sperrliste prüfen.

Daten-Rollback verändert den freigegebenen Snapshot nachvollziehbar; keine erzwungene Historienüberschreibung. Die tatsächlichen Provider-Rollback-Befehle beim Einrichten aus aktueller Dokumentation prüfen und als getestetes Runbook festhalten.
