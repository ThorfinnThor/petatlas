# Handoff

## Stand 20.10.2026 · Inhaltsoffensive

Das Aufgabenmanifest ist abgeschlossen (138 von 138); es gibt keine ausführbare Aufgabe im Manifest. Die laufende Arbeit ist die Inhaltsoffensive nach dem Indexeinbruch vom 11.10.2026. Maßgeblich sind `docs/CONTENT_STANDARD.md` und die Reihenfolge in `docs/reviews/content-scorecard-2026-10-20.md`.

| Schritt | Stand | Nachweis |
| --- | --- | --- |
| Index auf 114 Seiten konzentriert | gemergt (PR #90) | `docs/reviews/seo-index-concentration-2026-10-19.md` |
| Inhaltsstandard + Futter-Pilot (4 Vergleiche) | gemergt (PR #91) | `docs/reviews/content-scorecard-2026-10-20.md` |
| Tierarztkosten: 8 Behandlungsseiten | gemergt als Entwurf, `noindex` bis zur fachlichen Prüfung (PR #92) | `docs/reviews/behandlungsvorlagen-pruefbogen-2026-10-20.md` |
| Neun Produktvergleiche mit Bewertungsschema | PR #93 | `docs/HANDOFF_PRODUKTVERGLEICHE.md` |
| Stadtseiten: Sprechzeiten, Hundewiesen, Notdienst mit Quelle | gemergt (PR #94) | `docs/reviews/city-pages-2026-10-20.md` |
| Reisecheck: Fristenplan je Zielland | PR #95 | `docs/reviews/travel-deadlines-2026-10-20.md` |

**Nächster Schritt der Inhaltsoffensive:** Alle fünf Seitentypen der Scorecard sind überarbeitet. Als Nächstes die Wirkung in der Search Console beobachten und neue Seiten nur in kleinen Gruppen (≤ 10 pro Woche) in den Index geben. Offene Prüfungen: Notdienstnummern stichprobenweise anrufen, Formulierungen des Fristenplans durch die prüfende Person durchsehen lassen.

**Offen beim Betreiber:** Bildrechte für Herstellerfotos (Vergleiche zeigen keine Produktbilder), fachliche Prüfung der Behandlungsseiten, monatliche Preisprüfung der Vergleiche mit `scripts/audit/product-comparison/crosscheck.py`.

**Lokale Eigenheiten:** `npm ci` braucht `NODE_EXTRA_CA_CERTS` (siehe `problems.md`, P-002). Auf diesem Rechner laufen zeitweise Vorschauserver aus einem anderen Checkout (`~/Documents/Codex/…/petatlas`) auf den Ports 4330–4335; Playwright mit `reuseExistingServer` und `design:audit` prüfen dann stillschweigend den falschen Stand. Vorher mit `lsof -iTCP -sTCP:LISTEN` prüfen und einen freien Port nehmen.


## Tatsächlicher Zustand

Arbeitsstand (138 von 138 Aufgaben, 0 blockiert).

M23-03 ist implementiert und lokal geprüft: bestätigte GOT-Sonderabrechnungen, Chip-/Pass-/Impfdetails, nationale Länderhinweise und Nahrungsergänzung. Produktionsbuild, vollständige Browser-CI und Live-Smoke-Tests sind auf der gemergten Revision erfolgreich. Quellen, Grenzen und Partnerplan: `IMPLEMENTATION_REVIEW_2026-09-09.md` und `AFFILIATE_PLAN.md`.

## Nächster ausführbarer Schritt

Es gibt keine ausführbare Aufgabe. Der Fressnapf-Awin-Feedimport ist technisch vorbereitet. Die externe Hinterlegung des GitHub-Secrets `AWIN_FEED_LIST_URL` ermöglicht dem manuellen Workflow, eindeutig zugeordnete Produktbilder und Deep Links als geprüften Pull Request bereitzustellen. HanseMerkur und die bisherigen Fressnapf-Kategorielinks sind bereits aktiv.

## Ergänzung 10.09.2026 · Wau & Miau / Rechtliches und Amazon

PR 9 wurde als 27c38db in main integriert und auf Cloudflare veröffentlicht (402e0bc4-dc83-45f6-94b1-70d4a3d898d8): Hunde/Katzen, neue Bildwelt, zwei Katzenratgeber und reale Katzenprodukte.

Der Betreiber hat Name/Anschrift/E-Mail und die Amazon-ID wauandmiau-21 geliefert. Umsetzung/Nachweise: `docs/reviews/legal-amazon-2026-09-10.md`. Die öffentliche Freigabe und die sieben zuvor offenen externen Gates sind dokumentiert; der aktuelle Aufgabenstand beträgt 138 von 138.

Der geprüfte Umsetzungsauftrag `IMPLEMENTIERUNG_WAUANDMIAU.md` wurde technisch eingearbeitet. Die Änderungen trennen redaktionelle Quellen, externe Dienste, Affiliate-Textlinks und Feeds; ergänzen die Verzeichnis-Datenschutzinformationen samt importfester Sperr-/Berichtigungslogik; präzisieren Reise-, Profil- und GOT-Texte; führen eine eigene Ernährungsfreigabe und ein vollständiges Rechteinventar ein. Der Real-Data-Preview-Build mit 1.241 Seiten besteht alle 15 Buildprüfungen. Umsetzungs- und Browsernachweis: `docs/reviews/wm-implementation-2026-09-14.md`. Die dort benannten fachlichen, rechtlichen und betrieblichen Entscheidungen bleiben absichtlich offen; kein Agent hat menschliche Freigaben gesetzt.

## 2026-09-10 · Produktfinder-Karten

Screenshot-Befund korrigiert: Checkboxkarten mit separaten Erklärungen, Spielzeug- und Futterlisten als 3/2/1-Spaltenraster. Spielzeugbestand von 4 auf 12 (6 je Tierart) erweitert, Herstellerbelege in `docs/reviews/product-finder-2026-09-10.md`. Wasser-Matching ohne belegte Schwimmfähigkeit korrigiert. 1453 Unit-Tests und 15 Build-Prüfschritte lokal bestanden; CUA 390/1440 geprüft. Neue CI-Browserfälle angelegt.

Produktkarten nutzen weiterhin Symbolbilder als Ausweichdarstellung. Für eindeutig zugeordnete Fressnapf-Produkte werden nach dem Feed-Sync die vom Awin-Feed bereitgestellten Produktbilder und direkten Partnerlinks angezeigt.
