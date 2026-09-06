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

## Secret-Namen und Ort

`CLOUDFLARE_BUILD_HOOK`: nur GitHub-Secret für vertrauenswürdigen manuellen/zeitgesteuerten Rebuildjob. Die gesamte Hook-URL ist geheim.

`AWIN_FEED_URL` beziehungsweise konkrete Partnerzugänge: nur Cloudflare-Build-Secrets im freigegebenen Produktionskontext. Kein `PUBLIC_`-Präfix.

`GITHUB_TOKEN`: automatisch je Workflow, minimale notwendige Job-Rechte. Kein persönlicher breit berechtigter Token als Standardersatz.

Weitere Secret-Namen nur bei realem Bedarf ergänzen; keine pauschale Sammlung von Zugängen. Vorzugsweise native GitHub-/Cloudflare-Verbindungen und restriktive projektbezogene Berechtigungen.

## Erster Live-Release

Freigabe muss das tatsächlich aktive Feature-Set nennen. Ein redaktioneller Start ohne Versicherungs- oder Warenpartner ist möglich, sofern die verbleibenden rechtlichen/fachlichen Anforderungen erfüllt sind. Er heißt nicht monetarisierter Start.

Ein einmal zugelassener weiterer Automatikbetrieb darf nur bereits freigegebene Pfade aktualisieren. Neue Rechtsregeln, neue medizinische Claims, neue Partnerverträge oder zusätzliche Datennutzungsformen erhalten ein eigenes Gate.
