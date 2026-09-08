# Sicherheitsreview der CI

Stand 2026-09-06 (M07-02). Beschreibt, wogegen die Workflows schützen sollen und wogegen ausdrücklich nicht.

## Bedrohungsmodell

| Angriffsweg | Maßnahme |
|---|---|
| Ein Tag einer fremden Action wird auf anderen Code verschoben | Alle `uses:` sind auf volle 40-stellige Commit-SHAs gepinnt; `scripts/checks/workflows.sh` bricht ab, sobald ein Verweis das nicht ist — und ebenso, wenn es keine einzige `uses:`-Zeile findet, damit die Regel nicht ins Leere läuft |
| Ein fremder Pull Request liest Produktions-Secrets | Die auf Pull Requests laufenden Workflows benutzen **kein einziges Secret**. `pull_request_target` ist verboten und wird geprüft |
| Ein Workflow bekommt zu viele Rechte | `permissions: contents: read` auf oberster Ebene, zusätzlich je Job; ein Prüfschritt verlangt eine ausdrückliche Angabe in jeder Workflowdatei |
| Der Checkout hinterlässt ein verwendbares Token im Runner | `persist-credentials: false` in jedem Checkout |
| Eine Abhängigkeit wird stillschweigend aktualisiert | `npm ci` statt `npm install`; ein Schritt prüft, dass das Lockfile unverändert bleibt, ein weiterer, dass alle 17 Abhängigkeiten exakt gepinnt sind |
| Eine bekannte Schwachstelle bleibt unbemerkt | `npm audit --audit-level=high`, zusätzlich wöchentlich zeitgesteuert |
| Ein Geheimnis gerät ins Repository oder in die Ausgabe | `check:security` über versionierte Dateien und über `dist/`; in der CI zusätzlich mit voller Historie ausgecheckt |
| Ungeprüfte Daten werden veröffentlicht | `check:licenses` prüft Registry und Ausgabe |
| Etwas Unerwünschtes liegt im ausgelieferten Verzeichnis | `check:dist` prüft jede Datei gegen Allowlists: erlaubte Dateitypen, keine Quell- oder Rohdateien, Bilder nur mit benannter Herkunft und Lizenz, keine Inline-Skripte und Event-Attribute, keine Unterressourcen von fremden Hosts, keine privaten Felder in öffentlichem JSON, vollständige CSP |

## Was die Workflows dürfen

Alles, was auf einen Pull Request hin läuft — `ci.yml` und `security.yml` —, darf lesen und sonst nichts: kein `packages: write`, kein `id-token: write`, kein Secret.

Damit kann ein Pull Request aus einem fremden Fork die volle Prüfkette durchlaufen, ohne dass ihm dabei irgendetwas anvertraut wird. Das ist Absicht: eine CI, die für Fremde ausfällt, wird umgangen; eine CI, die Fremden Secrets gibt, wird ausgenutzt.

Eine Ausnahme gibt es, und sie ist bewusst eng gezogen: `ingest-open.yml` läuft **nur** nach Zeitplan oder auf ausdrückliche Auslösung, nie durch einen Pull Request und damit nie unter fremdem Code. Der Job hat `contents: write` und `pull-requests: write` und benutzt `GITHUB_TOKEN`, um einen Pull Request mit dem neuen Datenstand zu öffnen. Nach `main` schreibt er nicht.

`GITHUB_TOKEN` ist kein hinterlegtes Secret, sondern ein pro Lauf ausgestelltes Token, dessen Rechte der Workflow selbst begrenzt.

Der zweite und bislang letzte erklärte Name ist `CLOUDFLARE_DEPLOY_HOOK` in `rebuild-commerce.yml` (M17-03): die Adresse, die einen Build anstößt. Ihr Token steht im **Pfad**, nicht in der Query — die Kürzung aus dem Commerce-Build würde ihn mitprotokollieren, deshalb kürzt `scripts/publish/deploy-hook.ts` auf den Ursprung und schickt die Adresse an keinen anderen Host als `api.cloudflare.com`. Auch dieser Lauf wird nie durch einen Pull Request ausgelöst.

Jeder weitere Secret-Verweis macht den Lauf rot, bis ihn jemand in `scripts/checks/workflows.sh` einträgt und begründet.

## Warum die Härtung ein Skript ist

Die vier Regeln — gepinnte Actions, kein `pull_request_target`, nur erklärte Secrets, ausdrückliche `permissions` — standen zuerst nur als Schritte in `security.yml`. Sie schlugen deshalb erst nach dem Push an: der Prüfstand stand vier Commits lang auf rot, während lokal alles grün aussah. Sie liegen jetzt in `scripts/checks/workflows.sh`, laufen in `npm run verify` mit und werden vom Workflow mit demselben Aufruf ausgeführt.

## Ausdrückliche Grenzen

- **Die CI ist kein Deploymentpfad.** Cloudflare baut und deployt (ADR-004). Kein Workflow hier veröffentlicht etwas.
- **`npm audit` ist keine Zusicherung.** Es meldet, was gemeldet wurde. Eine leere Meldung ist kein Beweis für Fehlerfreiheit.
- **Der Secret-Audit ist Mustererkennung.** Er findet bekannte Formate. Ein Geheimnis in einem unbekannten Format findet er nicht. Er ersetzt keine Sorgfalt beim Committen.
- **Ein gefundenes Geheimnis gilt als offengelegt.** Es wird rotiert, nicht nur aus der Historie entfernt.

## Wenn später doch ein Secret gebraucht wird

Ein zeitgesteuerter Rebuildjob braucht `CLOUDFLARE_BUILD_HOOK` (M17-02). Dann gilt:

1. Das Secret bekommt **einen** Job, nicht den ganzen Workflow.
2. Der Job läuft nur auf `main` oder `schedule`, nie auf `pull_request`.
3. Der Prüfschritt „Keine Secrets in Workflows referenziert“ wird um genau diese Stelle erweitert — mit Begründung im Commit, nicht durch Abschalten.
4. Eine Abfrage wie `if: github.ref == 'refs/heads/main'` im Repository-Code ist **keine** Secret-Grenze: unvertrauenswürdiger Code im selben Lauf könnte sie ändern. Die Grenze ist der Trigger und die Environment-Konfiguration.

## Bekannte Einschränkung

Branch- und Ruleset-Schutz für `main` und `.github/` ist Konfiguration im GitHub-Projekt und liegt außerhalb dieser Dateien. Solange er nicht gesetzt ist, kann jemand mit Schreibrecht die Workflows selbst ändern. Das ist eine Aufgabe für die Repository-Einstellungen, kein Codeproblem, und in `docs/EXTERNAL_SETUP.md` vermerkt.
