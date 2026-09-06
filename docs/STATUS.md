# Projektstatus

Stand: 2026-09-06, Ende Sitzung 2.

**Erledigt:** 13 von 120 Aufgaben. **In Arbeit:** keine. **Blockiert:** keine.
**Meilensteine vollständig:** M00 (6/6), M01 (6/6). Angefangen: M02 (1/6).

**Repository:** https://github.com/ThorfinnThor/petatlas (public, Branch `main`), Projektpfad `~/Projects/pet-platform`.

**Implementiert:** Projektvertrag und Autonomierahmen; Astro-7-Scaffold mit statischem Build; ESLint, Prettier, Vitest und Playwright mit gepinnten Versionen; Secret-Audit über Repo und `dist/`; explizite Build-Modi mit Fixture-Sperre für production; BaseLayout, 404-Seite und technische Formularprobe mit bestandenem Browser-Smoke.

**Nicht vorhanden:** Cloudflare-Projekt, GitHub-Actions-Workflows, Domain, Betreiberangaben, Domänenmodelle, echte Daten, Inhalte, Partnerverträge, Fachfreigaben. Keine Website online.

**Letzte tatsächlich ausgeführte Prüfungen:**
- `npx playwright test`: 18/18 über chromium-desktop, webkit-desktop, chromium-mobile.
- `npm run test:unit`: 33 Tests in 3 Dateien.
- `npm run lint`, `npm run typecheck`, `npm run format:check`: sauber.
- `npm run check:security`: 57 Dateien, kein Fund, Fixtures gekennzeichnet.
- `npm run build:production`: exit 1, weil `publicRelease.approved=false` — beabsichtigt.
- `npm run build:fixture` mit totem Proxy: exit 0, also ohne Netz baubar.

**Nächster Schritt:** M02-02 (Statuswerkzeug integrieren) oder M03-01 (Markt- und Locale-Schemas). Beide sind unabhängig ausführbar.

**Nächste externe Freigabe:** Cloudflare-Account und Repo-Anbindung, erstmals nötig für M07-03.

## Rollen der Statusdateien (M02-03)

`project/tasks.json` ist die einzige maßgebliche Quelle. Die folgenden Dateien sind knappe menschliche Ansichten darauf und dürfen ihr nie widersprechen.

| Datei | Inhalt | Aktualisierung |
|---|---|---|
| `project/tasks.json` | Status, Nachweise, Blocker, Abhängigkeiten je Aufgabe | nur über `scripts/task_update.py` |
| `docs/STATUS.md` | Momentaufnahme: Zahlen, letzte Prüfungen, nächster Schritt | bei jedem Checkpoint |
| `docs/WORKLOG.md` | Chronologie: Aufgabe, Änderung, ausgeführte Prüfung, Ergebnis | je abgeschlossener Aufgabe |
| `docs/BLOCKERS.md` | ausschließlich tatsächlich blockierte Aufgaben | beim Eintreten und Auflösen |
| `docs/HANDOFF.md` | Übergabe an eine frische Sitzung: Zustand, Umgebung, nächster Schritt | bei jedem Checkpoint |

Widerspricht eine Ansicht dem Manifest, gilt das Manifest und die Ansicht wird korrigiert — nie umgekehrt.

Maßgeblich ist `project/tasks.json`.
