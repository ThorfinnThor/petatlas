# Rollback

Ein Rollback ist nicht „den alten Stand wieder hinstellen“. Es ist die Frage: **darf der alte Stand heute noch ausgeliefert werden?** Die Antwort kann nein lauten, obwohl er damals in Ordnung war — und genau dafür gibt es hier eine Prüfung statt eines Knopfes.

## Drei Fälle, drei Wege

| Fall | Was zurückgeht | Wer es kann |
|---|---|---|
| **Codefehler** | ein Commit im Repository | jede Person mit Schreibrecht, über einen neuen Commit |
| **Datenfehler** | ein Snapshot- oder Regelstand | dieselbe, über einen Commit, der die Dateien zurückholt |
| **Auslieferungsfehler** | ein Deployment beim Anbieter | nur der Betreiber, **heute nicht erprobt** (siehe unten) |

Die ersten beiden Fälle laufen über Git und sind unten als Handgriff beschrieben. Der dritte hängt an einem Cloudflare-Projekt, das es noch nicht gibt.

## Vor jedem Rollback: die Zulässigkeitsprüfung

```bash
npm run rollback:pruefen -- <git-ref>
```

`scripts/publish/rollback.ts` prüft einen Kandidatenstand **gegen die heutigen Regeln**, nicht gegen die von damals:

1. **Vollständig und lesbar?** Fehlt eine der erklärten Dateien oder ist sie kein gültiges JSON, ist der Stand nicht zulässig. Ein halber Datenstand wird nicht ausgeliefert.
2. **Rechte heute noch erteilt?** Jede Quelle hinter dem Stand wird gegen das heutige Register geprüft. Steht eine auf `pending`, `rejected` oder fehlt sie ganz, lautet die Antwort nein: **ein Rollback darf einen Rechtewiderruf nicht rückgängig machen.** Für den Ortsdatensatz werden alle sechzehn Regionalquellen einzeln geprüft.
3. **Inzwischen zu alt?** Ein Stand altert weiter, während er im Archiv liegt. Reißt er die Sperrschwelle aus `src/features/freshness/datasets.ts`, ist er nicht mehr brauchbar.
4. **Freigaben.** Der Bericht sagt, ob der Stand fachliche Freigaben enthält. Ob sie gelten, entscheidet beim Ausliefern erneut die Regelmaschine — Signatur **und** Alter (`src/features/travel/freigabe.ts`).

Der Lauf endet mit Rückgabewert 1, wenn der Stand nicht zulässig wäre. Er **verändert nichts**. Ein Skript, das ungefragt Daten zurückschreibt, wäre an genau der falschen Stelle bequem.

### Probe vom 2026-09-08

Geprüft wurden `HEAD` und ein 25 Commits älterer Stand. Beide sind zulässig: alle fünf Dateien vorhanden, 18 Quellen weiterhin freigegeben, der Gebührenstand 0 beziehungsweise 2 Tage alt, keine fachliche Reisefreigabe enthalten (der Reisecheck bliebe in der Vorschau).

Die Ablehnungen sind einzeln geprüft (`tests/publish/rollback.test.ts`): fehlende Datei, unlesbares JSON, eine Quelle mit heute widerrufenen Rechten, eine Quelle, die nicht mehr im Register steht, ein Stand ohne Datumsangabe und ein Stand, der zum Stichtag 2028-01-01 die 400-Tage-Grenze reißt.

## Handgriff: Daten zurückholen

```bash
# 1. Kandidaten aussuchen und prüfen
git log --oneline -- data-snapshots content-data
npm run rollback:pruefen -- <ref>

# 2. Nur die Datendateien zurückholen, Code unangetastet lassen
git checkout <ref> -- data-snapshots content-data

# 3. Prüfkette und Rauchprobe
npm run verify
npm run build:site
node scripts/monitor/smoke.ts --dist dist

# 4. Als eigener Commit, mit Begründung
git commit -m "Datenstand auf <ref> zurückgeholt: <Grund>"
```

**Keine erzwungene Historienüberschreibung.** Kein `push --force`, kein `reset --hard` auf einem geteilten Branch. Ein Rollback ist ein neuer Commit, der sagt, was er tut — sonst lässt sich später nicht mehr feststellen, welcher Stand wann ausgeliefert wurde.

## Handgriff: Code zurückholen

```bash
git revert <commit>          # ein einzelner Fehler
git revert <alt>..<neu>      # eine Reihe von Commits
npm run verify
```

Auch hier gilt Punkt 2 der Zulässigkeitsprüfung: ein Code-Rollback darf keine inzwischen widerrufenen Datenrechte und keine abgelaufenen Reiseregeln wiederbeleben. Läuft der zurückgeholte Code gegen die heutigen Daten und die heutige Registry, erledigt das die Prüfkette — ein Register auf `pending` sperrt die Ausgabe unabhängig davon, wie alt der Code ist.

## Auslieferung zurückholen — nicht erprobt

Cloudflare Pages kann ein früheres Deployment wieder aktiv schalten. **Dieser Weg ist hier nicht erprobt**, weil es kein Projekt gibt: kein Account, kein Deployment, keine Zugangsdaten (`docs/CLOUDFLARE_SETUP.md`, `docs/EXTERNAL_SETUP.md`). Was hier stünde, wäre abgeschrieben statt gemessen — und ein abgeschriebenes Runbook ist im Ernstfall schlimmer als keins, weil sich jemand darauf verlässt.

Beim Einrichten ist nachzutragen:

1. Der tatsächliche Weg zum Zurückschalten, aus der Dokumentation des Anbieters zum Zeitpunkt der Einrichtung.
2. Eine **echte Probe**: ein Deployment zurückschalten, danach `node scripts/monitor/smoke.ts --base <adresse>` laufen lassen und das Ergebnis hier eintragen.
3. Wer es darf und wie die Entscheidung festgehalten wird.

Bis dahin gilt: die Auslieferung wird über einen neuen Build korrigiert, nicht über ein Zurückschalten.

## Was ein Rollback nicht behebt

- **Einen Rechtewiderruf.** Er wirkt sofort und für alle Stände. Die Ausgabe wird gesperrt, nicht zurückgerollt.
- **Eine abgelaufene fachliche Freigabe.** Ein älterer Stand hat sie auch nicht.
- **Einen unerreichbaren Quellserver.** Der letzte gültige Snapshot bleibt ohnehin stehen; ein Rollback macht ihn nicht jünger.
