# Cloudflare-Einrichtung

Stand 2026-09-06 (M07-05). Beschreibt, wie Produktion und Preview getrennt bleiben und woran diese Trennung tatsächlich hängt.

## Zugang

| | |
|---|---|
| Konto | persönliches Konto des Betreibers, OAuth-Token in der lokalen wrangler-Konfiguration |
| Projektname | `petatlas-de` |
| Typ | Workers Static Assets, assets-only |
| Produktionsbranch | `main` |

Die Zugangsdaten liegen ausschließlich in `~/Library/Preferences/.wrangler/config/`. Weder Token noch Konto-ID stehen im Repository.

**Bekannte Stolperstelle:** wrangler scheitert auf dieser Maschine ohne `NODE_EXTRA_CA_CERTS` mit „fetch failed“ — dieselbe Ursache wie bei npm. Siehe `docs/TOOLCHAIN.md`.

## Zwei Projekte, nicht zwei Branches

**Produktionsprojekt `petatlas-de`.** Baut ausschließlich `main`. Automatische Builds anderer Branches sind abgeschaltet. Nur hier dürfen später Partner-Secrets liegen.

**Preview-Projekt, getrennt.** Falls eine öffentliche Vorschau gebraucht wird, entsteht sie in einem **eigenen Cloudflare-Projekt ohne Partner-Secrets und ohne Produktionsrechte**. Es ist kein zweiter Deploymentpfad in die Produktion.

### Warum nicht einfach eine Branch-Abfrage

Eine Zeile wie

```
if (branch === 'main') { /* Secrets verwenden */ }
```

im Repository-Code ist **keine** Secret-Grenze. Der Code, der diese Abfrage auswertet, stammt aus demselben Repository, das ein Pull Request verändern kann. Wer die Abfrage ändern darf, hat die Grenze überschritten.

Die tatsächliche Grenze ist die **Projekt- und Kontokonfiguration bei Cloudflare**: welches Projekt welche Secrets kennt und welche Branches es überhaupt baut. Das steht außerhalb des Repositories und lässt sich durch einen Commit nicht verschieben.

## Was den Build zusätzlich absichert

`npm run build:cloudflare` läuft im Cloudflare-Buildkontext und bricht ab, bevor etwas ausgeliefert wird, wenn:

- `production` ohne dokumentierte Launch-Freigabe gebaut wird,
- ein Nicht-Entwicklungsbuild synthetische Fixtures ausliefern würde,
- ein Feed-Secret gesetzt ist, obwohl kein Partnervertrag freigegeben ist,
- die Rechteprüfung der Quellen fehlschlägt,
- der Secret-Audit über `dist/` etwas findet.

Ein grüner GitHub-Check ist **kein** Deployment-Gate. Cloudflare prüft selbst.

## `noindex` ist keine Zugriffssperre

Ein Preview mit `noindex` ist trotzdem öffentlich erreichbar, sobald jemand die Adresse kennt. Suchmaschinen halten sich daran, Menschen und Skripte nicht. Daraus folgt:

- Ein Preview darf **keine** vertraulichen Rohdaten enthalten, auch nicht in einer JSON-Datei, die niemand verlinkt.
- Partnerfunktionen bleiben im Preview grundsätzlich aus (`affiliateEnabled: false`, unabhängig von den Gates).
- Wer eine Vorschau wirklich schützen will, braucht Cloudflare Access oder ein Passwort — nicht `noindex`.

## Fail-closed

Ohne gesetzten `BUILD_MODE` ist der Modus `development`: Fixtures, sichtbarer Testdatenhinweis, `noindex`. Eine vergessene Umgebungsvariable macht also nie versehentlich Produktion. Der umgekehrte Weg — `production` — verlangt drei ausdrückliche Dinge: echte Domain, vollständige Betreiberangaben und die dokumentierte Launch-Freigabe in `config/launch.json`.

## Was hier noch nicht behauptet wird

- Es ist **keine Domain** verbunden. `PUBLIC_SITE_URL` ist nicht gesetzt.
- Es liegen **keine Betreiberangaben** vor; `production` ist deshalb ohnehin gesperrt.
- Es gibt **keinen Partnervertrag** und folglich kein Feed-Secret.
- Der erste tatsächliche Deployversuch und seine Nachweise stehen in `docs/DEPLOYMENT_EVIDENCE.md` (M07-06).
