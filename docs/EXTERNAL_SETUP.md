# Externe Einrichtung und Freigaben

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

## Benennung, Domain und Betreiberangaben (M00-03)

Produktname, Basis-URL und Betreiberangaben stehen ausschließlich in `config/site.ts`. Fachlogik importiert diese Werte; ein Namenswechsel ist eine Änderung an dieser Datei plus Übersetzungstexten, kein projektweites Suchen/Ersetzen.

- **Arbeitstitel „PetAtlas“:** intern und austauschbar (`brandNameIsWorkingTitle: true`). Es wird keine Markenverfügbarkeit, Eintragung oder Schutzfähigkeit behauptet. Eine Markenrecherche ist nicht erfolgt und ist Sache des Betreibers.
- **Basis-URL:** `PUBLIC_SITE_URL`. Ohne echten Wert gilt `https://example.invalid` — zulässig nur in `development` und `preview`. Ein `production`-Build mit Platzhalterdomain scheitert mit Fehler statt still zu veröffentlichen.
- **Betreiberangaben:** `legalName`, `address`, `contactEmail` und `responsibleForContent` sind bis zur Lieferung durch den Betreiber `null`. `production` scheitert, solange sie fehlen. Es werden keine Rechtsangaben erfunden (ADR-015).
- **Nachweis:** `node scripts/checks/site-config.check.mjs`.

Lokale Entwicklung ist durch die fehlende Domain nicht blockiert; nur `production` ist gesperrt.

## Secret-Namen und Ort

`CLOUDFLARE_BUILD_HOOK`: nur GitHub-Secret für vertrauenswürdigen manuellen/zeitgesteuerten Rebuildjob. Die gesamte Hook-URL ist geheim.

`AWIN_FEED_URL` beziehungsweise konkrete Partnerzugänge: nur Cloudflare-Build-Secrets im freigegebenen Produktionskontext. Kein `PUBLIC_`-Präfix.

`GITHUB_TOKEN`: automatisch je Workflow, minimale notwendige Job-Rechte. Kein persönlicher breit berechtigter Token als Standardersatz.

Weitere Secret-Namen nur bei realem Bedarf ergänzen; keine pauschale Sammlung von Zugängen. Vorzugsweise native GitHub-/Cloudflare-Verbindungen und restriktive projektbezogene Berechtigungen.

## Statusregister der externen Voraussetzungen (M00-06)

Stand 2026-09-06. `offen` heißt: noch nicht geliefert. Keine Zeile behauptet eine bestehende Verbindung. Es stehen ausschließlich Secret-**Namen** in diesem Dokument, niemals Werte.

| # | Voraussetzung | Status | Zuständiger Entscheider | Zuerst betroffene Aufgabe | Arbeit läuft weiter an |
|---|---|---|---|---|---|
| 1 | GitHub-Inhaber und Repo-Name für das öffentliche Repository | **erledigt 2026-09-06:** `ThorfinnThor/petatlas`, public, Default-Branch `main` | Betreiber | M01-02 | — |
| 2 | Cloudflare-Account und Repo-Anbindung | offen (keine Anmeldung im Projektkontext) | Betreiber | M07-03 | Build-/Konfigurationsarbeit lokal |
| 3 | Domain und `PUBLIC_SITE_URL` | offen | Betreiber | M18-05 | development/preview mit `example.invalid` |
| 4 | Impressum, Kontakt, echte Betreiberangaben | offen | Betreiber | M18-04 | Seitengerüst ohne Rechtsangaben |
| 5 | Prüfung der Datenrechte je Quelle | **erledigt 2026-09-06:** OSM-Extrakt `verified` (ODbL 1.0), GOT `verified` über den offiziellen XML-Download (ADR-018). Betriebsprüfung des Abrufs offen als M17-07 | prüfende Person; bei eindeutigen offenen Quellen dokumentierte Primärprüfung | — | — |
| 6 | Waren-Affiliateprogramm (Vertrag) | offen (kein Vertrag) | Betreiber | M13-01 | generischer Adapter, Katalog ohne Live-Feed |
| 7 | Versicherungs-Affiliate mit Rechtsprüfung | offen | Betreiber mit qualifizierter Rechtsprüfung | M09-02 | deaktivierte technische Slots |
| 8 | Fachfreigabe Gebührenregeln (GOT) | offen | fachlich geeignete prüfende Person | M08-06 | Rechenkern und synthetische Rechentests |
| 9 | Fachfreigabe Reiseregeln | offen | fachlich geeignete prüfende Person | M12-06 | Wizard-Logik mit fail-closed Ergebnissen |
| 10 | Tracking-/Ads-Freigabe | offen | Betreiber | M18-06 | Layout ohne Anzeigen |
| 11 | Secret `CLOUDFLARE_BUILD_HOOK` (GitHub-Secret) | offen | Betreiber | M17-02 | Workflow mit Dry-Run ohne Hook |
| 12 | Secret `AWIN_FEED_URL` bzw. konkreter Partnerzugang (Cloudflare-Build-Secret) | offen | Betreiber | M13-02 | Fixture-Feed lokal |

**Wirkung auf die laufende Arbeit:** keine dieser Voraussetzungen blockiert derzeit eine ausführbare Aufgabe. Erst wenn eine der genannten Aufgaben tatsächlich an der Reihe ist, wird ausschließlich diese Aufgabe auf `blocked` gesetzt und in `docs/BLOCKERS.md` mit Ursache, benötigter Handlung und Zuständigem eingetragen. Bis dahin gibt es keinen eingetragenen Blocker.

## Erster Live-Release

Freigabe muss das tatsächlich aktive Feature-Set nennen. Ein redaktioneller Start ohne Versicherungs- oder Warenpartner ist möglich, sofern die verbleibenden rechtlichen/fachlichen Anforderungen erfüllt sind. Er heißt nicht monetarisierter Start.

Ein einmal zugelassener weiterer Automatikbetrieb darf nur bereits freigegebene Pfade aktualisieren. Neue Rechtsregeln, neue medizinische Claims, neue Partnerverträge oder zusätzliche Datennutzungsformen erhalten ein eigenes Gate.
