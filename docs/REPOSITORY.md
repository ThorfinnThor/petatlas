# Repository

Festgelegt in M01-02 nach ausdrücklicher Zuweisung durch den Betreiber.

| Feld | Wert |
|---|---|
| Inhaber | `ThorfinnThor` (persönliches GitHub-Konto) |
| Repository | `petatlas` |
| URL | https://github.com/ThorfinnThor/petatlas |
| Sichtbarkeit | public |
| Default-Branch | `main` |
| Remote-Name lokal | `origin` (HTTPS) |

Das Repository wurde in M01-02 **neu angelegt**. Es wurde kein bestehendes privates Repository auf public umgestellt und keine fremde Historie übernommen oder umgeschrieben.

## Vor der Veröffentlichung durchgeführte Prüfung

- 39 versionierte Dateien; `.work/`, `.env*` (außer `templates/.env.example`), `dist/`, `.astro/`, `node_modules/` und `__pycache__/` sind nicht versioniert.
- Suche über **alle** Commits nach `gho_`, `ghp_`, `github_pat_`, `sk-…`, `AKIA…`, privaten Schlüsselblöcken und `xox…`-Tokens: keine Treffer.
- Suche nach `secret|token|password|api_key`-Zuweisungen mit Wert im Arbeitsbaum: keine Treffer außerhalb der Dokumentation, die ausschließlich Secret-**Namen** nennt.
- Die Historie beginnt mit dem ersten Commit dieses Projekts; kein Import fremder Historie.

## Geltende Grenzen

`main` ist der einzige Branch. Automatische Importe schreiben später nicht nach `main`, sondern in den separaten Datenbranch `data-live` (ADR-009).

Öffentlich heißt nicht Open Source: es gibt keine projektweite Lizenz, siehe `licenses/README.md` und ADR-017.

Secrets liegen niemals im Repository. Ihre Ablageorte stehen in `docs/EXTERNAL_SETUP.md`, dort nur mit Namen.

Cloudflare ist noch **nicht** mit diesem Repository verbunden (M07-03, offen).
