# Verbindliche Architekturentscheidungen

Stand: 2026-09-06. Diese Entscheidungen sind Vorgaben des Plans, keine behaupteten bereits ausgeführten Arbeiten.

| ID | Entscheidung | Begründung / Konsequenz |
|---|---|---|
| ADR-001 | Deutschland-first, internationalisierbar | Nur Markt DE ist öffentlich aktiv. Zielstaaten im Reisecheck sind keine gestarteten Absatzmärkte. |
| ADR-002 | Astro, statische Ausgabe | HTML wird beim Build erzeugt; Interaktion im Browser. Kein SSR, keine Server Actions. |
| ADR-003 | Cloudflare Workers Static Assets, assets-only | Neues Cloudflare-Projekt, keine Worker-Request-Logik. Name „Workers“ bedeutet hier nicht, dass für jeden Seitenaufruf Rechenlogik läuft. [S02–S04] |
| ADR-004 | Build und Deploy bei Cloudflare | GitHub Actions übernehmen Tests, Import und Überwachung; sie sind nicht der zweite Produktions-Deploymentpfad. |
| ADR-005 | Öffentliches GitHub-Repo | Nur veröffentlichungsfähige Inhalte. Keine Bestandsrepos ungeprüft auf public umstellen. |
| ADR-006 | Keine Laufzeit-Datenbank | Kein Supabase, Postgres, D1, KV, Firebase oder eigener API-Server im Startumfang. Temporäre Build-Dateien und ein flüchtiger Osmium-Index sind keine gehostete Produktdatenbank. |
| ADR-007 | Datenklassen statt „alles ist JSON“ | Öffentliche Open-Data-Snapshots, vertragliche Affiliate-Feeds, eigene Redaktion und lokale Nutzerdaten getrennt behandeln. |
| ADR-008 | Affiliate-Feeds standardmäßig nur im vertrauenswürdigen Cloudflare-Build | Keine Rohfeeds in Git, Actions-Artefakten oder öffentlichen Build-Logs. Nur vertraglich freigegebene Anzeigefelder gelangen in HTML/JSON. |
| ADR-009 | Versionierte offene Daten im separaten data-live-Branch | main enthält Code, Rechtekonfiguration, redaktionell freigegebene Regeln und kleine Testdaten. Automatik schreibt nicht in main. |
| ADR-010 | Kein Markt-/Sprachraten | /de-de/ ist die erste Route; Markt, Sprache, Währung und geografisches Ziel sind unterschiedliche Felder. Keine IP-Weiterleitung. |
| ADR-011 | Fachliche Fail-closed-Regeln | Unbekannte Einreisevoraussetzung, ungeprüfte Behandlung oder unbekannte Produkteignung darf nicht zu einem positiven Ergebnis werden. |
| ADR-012 | Kontextbezogene Werbung statt Diagnose-Funnel | Medizinische Inhalte, Risikohinweise und Erlöslogik organisatorisch trennen. Keine Angst- oder Akutnotfall-Vermarktung. |
| ADR-013 | Feature Flags je Markt und Freigabestatus | Fehlende echte Daten deaktivieren eine Funktion; sie rechtfertigen keine veröffentlichten Testdaten. |
| ADR-014 | Repo-öffentlich ist nicht automatisch Open Source | Keine pauschale MIT-Lizenz über Code, fremde Daten, Bilder und Texte legen. Code-Lizenzentscheidung separat dokumentieren. |
| ADR-015 | Keine erfundenen Qualitätsbeweise | Keine Fake-Tests, Bewertungen, Tierärzte als Autoren, Partnerverträge, Statistiken oder Sicherheitsgarantien. |
| ADR-016 | Autonomie ist überprüfbarer Fortschritt | Kleine Aufgaben, automatisierte Tests, Git-Checkpoints, Blocker und Handoff. Keine Endlosschleifen oder ausgeschalteten Schutzmechanismen. |

## Nicht ohne neue Entscheidung hinzufügen

Bezahlte Infrastruktur, Login, Newsletter-Versand, Uploads, zentrale Nutzerbewertungen, Cloud-Profil, KI-Ratgeber im Besucherpfad, proprietäre Geocoding-API, serverseitiges Affiliate-Klicktracking, internationale Live-Märkte und automatisch übernommene Behandlungs-/Reiseregeln.

Wenn eine Entscheidung technisch nicht tragfähig ist, dokumentiere Messung, Alternativen und Kosten in einer neuen ADR. Bis zur Entscheidung arbeite an unabhängigen Aufgaben weiter. „Bequemer“ ist kein ausreichender Grund, das Static-first-Prinzip aufzugeben.
