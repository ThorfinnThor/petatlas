# Bekannte Probleme im Betrieb

Register für Dinge, die **nicht** kaputt sind, aber im Betrieb in die Irre führen. Jeder Eintrag nennt, was passiert, was die Ursache ist, was zu tun ist — und was ausdrücklich **nicht** zu tun ist.

Abzugrenzen von:

- `docs/BLOCKERS.md` — externe Voraussetzungen, die eine Aufgabe blockieren.
- `docs/KNOWN_LIMITATIONS.md` — was die Plattform bewusst nicht kann.
- `TODO.md` — Entscheidungen, die außerhalb des Codes fallen müssen.

---

## P-001 — Der GOT-Abruf gelingt aus der CI heraus nicht

**Symptom:** `.github/workflows/ingest-open.yml` meldet im Schritt „Gebührenkatalog abrufen“ dreimal `Snapshot nicht erneuert: fetch failed`, danach „Gebührenkatalog nach drei Versuchen nicht erreichbar“. Der Lauf bleibt trotzdem grün.

**Ursache, gemessen am 2026-09-08:** `www.gesetze-im-internet.de:443` nimmt die Verbindung aus dem Runner-Netz nicht an. Fünf Versuche in zwei Workflows, jedes Mal ein Verbindungszeitlimit (`UND_ERR_CONNECT_TIMEOUT` nach 10 s). **Kein** 403, **kein** Zertifikatsfehler, **keine** Antwort mit Hinweis — der Server antwortet schlicht nicht. Vom Arbeitsrechner aus funktioniert derselbe Abruf sofort.

**Was zu tun ist:** Die Aktualisierung des Gebührenkatalogs ist bis auf Weiteres ein **manueller Lauf**:

```bash
npm run snapshot:got -- --fetch
npm run verify
```

Ein unveränderter Datenstand ist dabei der Normalfall: die Quelle antwortet auf die mitgeführten Validatoren mit HTTP 304, und der Snapshot bleibt unangetastet.

**Was nicht zu tun ist:**

- **Nicht** die Versuchszahl oder das Zeitlimit hochdrehen. Der Server antwortet nicht; Drängeln ändert daran nichts und belastet eine fremde Infrastruktur.
- **Nicht** über einen Proxy oder Spiegel ausweichen. ADR-018 legt den offiziellen ZIP-Download als einzigen Bezugsweg fest.
- **Nicht** den Zeitplan entfernen. Der Versuch kostet nichts und greift von selbst, sollte die Erreichbarkeit zurückkehren.

**Womit es auffällt:** Der Datenstand altert sichtbar (`/de-de/datenstand/`, `/data/v1/health.json`). Ab 400 Tagen ohne Abruf meldet die Rauchprobe den Gebührenkatalog als veraltet. Zwischen dem ersten Fehlschlag und diesem Alarm kann also über ein Jahr liegen — das ist der Preis dafür, dass ein einzelner Fehlschlag keinen Alarm auslöst.

**Einzelheiten:** `docs/SOURCE_REVIEWS.md`, Abschnitt „Aus der CI heraus nicht erreichbar“.

---

## P-002 — Wrangler meldet fälschlich ein abgelaufenes Token

**Symptom:**

```
✘ [ERROR] Not logged in. Your auth token has expired and could not be refreshed,
  and the environment is non-interactive. Run `wrangler login` …
```

**Ursache, gemessen am 2026-09-08:** Das Token ist **intakt**. Ohne `NODE_EXTRA_CA_CERTS` fehlt Node auf diesem Rechner ein Wurzelzertifikat; der Refresh-Aufruf scheitert an TLS, und wrangler deutet das als abgelaufenes Token.

| Aufruf | ohne die Variable | mit ihr |
|---|---|---|
| `npx wrangler whoami` | „auth token has expired“ | angemeldet als `shuu9599@gmail.com` |

**Was zu tun ist:**

```bash
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
npx wrangler whoami
```

Fehlt die Datei: `security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem`

**Was nicht zu tun ist:**

- **Nicht** `wrangler login` ausführen. Die Anmeldung ist in Ordnung; ein neuer Anmeldevorgang behebt nichts und ersetzt ein funktionierendes Token.
- **Nicht** `strict-ssl` abschalten oder `NODE_TLS_REJECT_UNAUTHORIZED=0` setzen. Es wird ein fehlender Vertrauensanker ergänzt, keine Prüfung abgeschaltet.

**Zur Einordnung:** Für `npm ci`, `npm run verify`, `npm run build:site` und die Playwright-Läufe wird die Variable **nicht** gebraucht — das ist am 2026-09-08 in einem frischen Clone nachgemessen worden. Nur zwei Dinge brauchen sie: dieser wrangler-Aufruf und der Abruf von `gdi.berlin.de` (kommunale Quelle, sonst `SELF_SIGNED_CERT_IN_CHAIN`).

**Einzelheiten:** `docs/DEVELOPER_SETUP.md`, `docs/TOOLCHAIN.md`.

---

## Weitere gemessene Eigenheiten

Diese stehen ausführlich in `docs/KNOWN_LIMITATIONS.md` und sind hier nur genannt, damit man sie beim Suchen findet:

- **EUR-Lex** beantwortet einen einfachen Abruf mit HTTP 202 und leerem Körper; die italienische Ministeriumsseite mit einer Bot-Prüfung. Beide melden dauerhaft `nicht_pruefbar` — das ist der ehrliche Befund, keine Fehlfunktion.
- **Der Ortsdatensatz nennt seinen Stand nicht**, weil der Import ihn bis M17-04 nicht mitschrieb. Der nächste Lauf trägt ihn ein.
- **Safari tabt ab Werk nicht auf Links.** Eine Browsereinstellung, kein Mangel der Seite.
- **GitHub schaltet Zeitpläne nach 60 Tagen ohne Aktivität ab.** Danach läuft die Überwachung nicht mehr — ohne Meldung, denn die Meldung käme aus dem Lauf.
