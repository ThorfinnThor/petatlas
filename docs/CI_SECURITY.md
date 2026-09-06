# Sicherheitsreview der CI

Stand 2026-09-06 (M07-02). Beschreibt, wogegen die Workflows schützen sollen und wogegen ausdrücklich nicht.

## Bedrohungsmodell

| Angriffsweg | Maßnahme |
|---|---|
| Ein Tag einer fremden Action wird auf anderen Code verschoben | Alle `uses:` sind auf volle 40-stellige Commit-SHAs gepinnt; ein Prüfschritt bricht ab, sobald ein Verweis das nicht ist |
| Ein fremder Pull Request liest Produktions-Secrets | Beide Workflows benutzen **kein einziges Secret**. `pull_request_target` ist verboten und wird geprüft |
| Ein Workflow bekommt zu viele Rechte | `permissions: contents: read` auf oberster Ebene, zusätzlich je Job; ein Prüfschritt verlangt eine ausdrückliche Angabe in jeder Workflowdatei |
| Der Checkout hinterlässt ein verwendbares Token im Runner | `persist-credentials: false` in jedem Checkout |
| Eine Abhängigkeit wird stillschweigend aktualisiert | `npm ci` statt `npm install`; ein Schritt prüft, dass das Lockfile unverändert bleibt, ein weiterer, dass alle 17 Abhängigkeiten exakt gepinnt sind |
| Eine bekannte Schwachstelle bleibt unbemerkt | `npm audit --audit-level=high`, zusätzlich wöchentlich zeitgesteuert |
| Ein Geheimnis gerät ins Repository oder in die Ausgabe | `check:security` über versionierte Dateien und über `dist/`; in der CI zusätzlich mit voller Historie ausgecheckt |
| Ungeprüfte Daten werden veröffentlicht | `check:licenses` prüft Registry und Ausgabe |

## Was die Workflows dürfen

Lesen. Sonst nichts. Es gibt keinen Job mit `contents: write`, `packages: write`, `id-token: write` oder einem anderen erhöhten Recht, und keinen, der ein Secret anfordert.

Damit kann ein Pull Request aus einem fremden Fork die volle Prüfkette durchlaufen, ohne dass ihm dabei irgendetwas anvertraut wird. Das ist Absicht: eine CI, die für Fremde ausfällt, wird umgangen; eine CI, die Fremden Secrets gibt, wird ausgenutzt.

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
