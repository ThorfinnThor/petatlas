# Betriebshandbuch

Handgriffe, keine Beschreibungen. Jeder Abschnitt nennt Auslöser, Befehle, Dateien und woran man erkennt, dass es geklappt hat. Die Hintergründe stehen in `docs/OPERATIONS.md`, `docs/MONITORING.md` und `docs/ROLLBACK.md`; hier steht, was zu **tun** ist.

Vorbedingung für alles: ein Checkout und `npm ci` (siehe `docs/DEVELOPER_SETUP.md`). Kein Secret nötig, außer wo es ausdrücklich dabeisteht.

---

## 1. Eine neue Datenquelle aufnehmen

**Auslöser:** Es soll eine weitere offene Quelle ausgeliefert werden.

1. Rechte prüfen, **bevor** irgendetwas geladen wird: Lizenz, kommerzielle Nutzung, Weitergabe als öffentliches JSON, Attributionspflicht, Bildrechte. Ergebnis mit Fundstelle und Datum in `docs/SOURCE_REVIEWS.md`.
2. Registryeintrag anlegen: `config/sources/<id>.json`. Ohne `rights.status: "verified"` wird nichts veröffentlicht — das ist die Sperre, nicht ein Hinweis.
3. Adapter schreiben unter `scripts/ingest/adapters/`, Normalisierung unter `scripts/normalize/`.
4. Abrufbedingungen messen, nicht annehmen: `robots.txt`, Impressum, ETag und Last-Modified. Vorgehen und Wortlaut wie beim Gebührenkatalog in `docs/SOURCE_REVIEWS.md`.
5. Prüfen: `npm run check:licenses && npm run verify`.
6. Erst danach in `.github/workflows/ingest-open.yml` aufnehmen.

**Fertig, wenn** `npm run check:licenses` die neue Quelle als freigegeben zählt und ein Snapshot entsteht, den `npm run verify` annimmt.

---

## 2. Einen Partner sperren

**Auslöser:** Ein Vertrag endet, wird ausgesetzt oder eine Auflage ist verletzt.

```bash
# In config/publishers/<domain>/programs.json: status auf "ended" setzen
# oder approval.expiresAt auf ein vergangenes Datum.
npm run verify
npm run build:site && npm run check:dist
```

**Fertig, wenn** der Katalog leer ist und die Begründung dasteht (`[data-testid="katalog-leer"]`), kein Partnerlink mehr im Output auftaucht und `npm run check:dist` ohne Fund durchläuft.

Sofortwirkung ohne Build ist **nicht** möglich: die Seiten sind statisch. Muss es sofort sein, ist der Weg ein neuer Build oder das Zurückschalten auf einen älteren Stand (Abschnitt 4).

---

## 3. Einen Datenstand erneuern

```bash
npm run snapshot:got -- --fetch          # Gebührenkatalog (nur lokal, siehe SOURCE_REVIEWS)
npm run snapshot:municipal -- --fetch    # kommunale Quelle
npm run ingest:osm-de                    # bundesweit, rund 4,6 GiB und etwa eine Stunde
npm run snapshot:places -- --extract <datei>
npm run verify && npm run check:municipal
```

**Fertig, wenn** `verify` grün ist und `git diff data-snapshots/` genau die erwartete Änderung zeigt. Ein Fehlschlag beim Abruf lässt den vorhandenen Snapshot stehen — das ist beabsichtigt und kein Grund, ihn von Hand zu ersetzen.

---

## 4. Datenstand zurückrollen

```bash
git log --oneline -- data-snapshots content-data
npm run rollback:pruefen -- <ref>        # prueft gegen die HEUTIGEN Rechte
git checkout <ref> -- data-snapshots content-data
npm run verify && npm run build:site
node scripts/monitor/smoke.ts --dist dist
git commit -m "Datenstand auf <ref> zurückgeholt: <Grund>"
```

**Fertig, wenn** `rollback:pruefen` den Stand als zulässig meldet und die Rauchprobe ohne Fehler durchläuft. Sagt die Prüfung nein, wird nicht zurückgerollt — Einzelheiten in `docs/ROLLBACK.md`.

---

## 5. Ein Secret wechseln

Es gibt heute genau zwei Namen, und beide liegen **nur** in den GitHub-Einstellungen, nie im Repository:

| Name | Wofür | Wo |
|---|---|---|
| `GITHUB_TOKEN` | wird pro Lauf ausgestellt | nichts zu tun |
| `CLOUDFLARE_DEPLOY_HOOK` | stößt einen Build an | Repository-Secret |

Wechsel: neuen Hook bei Cloudflare erzeugen, Secret ersetzen, alten Hook löschen, `rebuild-commerce.yml` einmal auf Zuruf starten. **Fertig, wenn** der Lauf `ausgeloest` meldet. Der alte Hook muss danach ins Leere laufen — das gehört geprüft, nicht angenommen.

Kommt ein weiteres Secret dazu, muss es in `scripts/checks/workflows.sh` eingetragen und begründet werden, sonst wird der Prüfstand rot. Das ist Absicht.

---

## 6. Frische prüfen

```bash
npm run build:site
node scripts/monitor/smoke.ts --dist dist
node scripts/monitor/source-drift.ts --fetch     # beobachtete Regelquellen
```

**Fertig, wenn** kein ausgelieferter Datensatz `veraltet` ist und der Bauzeitpunkt jünger als 48 Stunden ist. Meldet die Quellenbeobachtung `geaendert`, gehört die Seite angesehen, bevor irgendetwas übernommen wird; danach `data-snapshots/watch/rule-sources.json` mit committen.

---

## 7. Eine fachliche Freigabe eintragen

**Nur durch die zuständige Person.** Kein Agent, kein Skript.

1. Prüfpunkte im jeweiligen Dokument unter `docs/reviews/` beantworten, mit Datum und Namen.
2. Bei Reiseregeln zusätzlich die Inhaltssignatur eintragen: `content-data/travel/approvals.json`. Die Signatur bindet die Freigabe an genau den geprüften Inhalt.
3. Gate in `config/launch.json` auf `approved: true` setzen, mit `approvedBy` und `approvedAt`.
4. `npm run check:release` — die Prüfung widerspricht, wenn Person, Datum oder Nachweis fehlen.

**Fertig, wenn** `check:release` ohne Beanstandung durchläuft und die betroffene Funktion im Build erscheint.

---

## 8. Kosten im Blick behalten

```bash
npm run build:site && npm run check:budgets
```

Grenzen und gemessene Werte: `config/budgets.json`, `docs/BUDGET_REPORT.md`. Bei Warnung: teilen statt Grenze anheben. Eine Grenze zu ändern ist eine Entscheidung und gehört im Commit begründet.

**Nie ohne Freigabe:** kostenpflichtige Tarife, Domainkäufe, zusätzliche Abonnements.

---

## 9. Wenn die Website falsche Daten zeigt

1. **Nicht** die Auslieferung abschalten. Erst sehen, was falsch ist.
2. Datenstand ansehen: `/de-de/datenstand/` und `/data/v1/health.json`.
3. Betrifft es eine Quelle: Snapshot zurückrollen (Abschnitt 4).
4. Betrifft es eine Regel: das zugehörige Gate in `config/launch.json` auf `false` setzen und neu bauen. Die Funktion verschwindet dann samt Seite — mit Begründung, nicht als leere Seite.
5. Betrifft es einen Partner: Abschnitt 2.

---

## 10. Wenn ein Lauf rot ist

| Lauf | Erste Frage |
|---|---|
| CI | Welcher Schritt? `npm run verify` lokal wiederholen. |
| Security | Neues Secret in einem Workflow? Neue Abhängigkeit ungepinnt? |
| Rauchprobe | Fehlt eine Seite, oder ist der Bauzeitpunkt zu alt? |
| Quellenbeobachtung | `geaendert` heißt: eine Seite ansehen, nicht das Skript reparieren. |
| Import | Ein Fehlschlag beim Abruf ist kein Datenverlust; der Snapshot bleibt. |

Bevor lange gesucht wird: `problems.md` sammelt die Fälle, die **nicht** kaputt sind, aber so aussehen — der GOT-Abruf aus der CI und die irreführende Wrangler-Meldung stehen dort mit Ursache und Handgriff.

Ein offenes Issue der Rauchprobe muss geschlossen werden, wenn die Ursache behoben ist — sonst erinnert der Lauf nicht mehr, weil er die Meldung für schon vorhanden hält.
