# Handoff

Stand: 2026-09-07, Sitzung 9.

Eine frische Sitzung beginnt hier, nicht beim erneuten Erfinden der Architektur. Reihenfolge: `CLAUDE.md`, dieses Dokument, `npm run status`, dann der betroffene Abschnitt von `docs/MILESTONES.md`.

## Tatsächlicher Zustand

Projektpfad `~/Projects/pet-platform`. Branch `main`, `origin` = https://github.com/ThorfinnThor/petatlas (public), Stand gepusht.

**M00 bis M07 vollständig, M08 bei 5/6 (M08-06 blockiert), M10 und M11 vollständig, M09 bei 5/6, M12 bei 5/6, die sechste blockiert, M13 bei 5/6, die sechste blockiert, M14 bei 2/6 (82 von 121 Aufgaben).** Der genaue Stand steht in `project/tasks.json`; `npm run status` gibt ihn aus.

Vorhanden: Projektvertrag und Autonomierahmen; Astro 7 static mit TypeScript 6 strict und voller Prüfkette; Domänenmodelle für Markt, Geld, Einheiten, Datum, Provenienz, Rechte, Fachschemas und Provider; Route Registry, Designsystem, fünf Kernseiten, statische Suche und zugängliche Formularbausteine; Quellenregister mit Publikationsklassen, Attribution, ODbL-Datenfluss und Lizenzregression.

Zusätzlich vorhanden: Import- und Snapshot-System (Adapter-API, sicherer Fetcher, deterministische Normalisierung, Differenzprüfung mit Quarantäne, Sharding, Manifest, atomare Veröffentlichung).

Nicht vorhanden: Cloudflare-Projekt, echte Fachdaten, Rechner, Karte, Reisecheck, Katalog, Domain, Betreiberangaben, Partnerverträge, Fachfreigaben.

## Umgebung

Node v24.19.0, npm 11.17.0, Python 3.13.15. Für jeden npm-Befehl:

```
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
```

Fehlt die Datei: `security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem`. Ohne sie scheitert npm an `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`. `strict-ssl` bleibt aktiv.

Prüfkette vor jedem Commit:

```
npm run lint && npm run typecheck && npm run format:check && npm run test:unit && npm run check:security && npm run check:handoff
```

Bei UI-Änderungen zusätzlich `npx playwright test`. Ein hängengebliebener Preview-Server wird mit `npx astro preview stop` beendet.

## Nächster ausführbarer Schritt

**M14-03 — Deterministisches Matching umsetzen.** `src/features/toys/matching.ts` und `care/matching.ts`: harte Filter auf Tierart, Größe und Herstellergrenzen; weiche Sortierung nur nach erklärbaren Bedürfnissen wie „drinnen“ oder „apportiert gern“. Abnahme: eine Rasse allein löst keine medizinische Empfehlung aus, und eine unbekannte Eigenschaft wird nicht als passend behauptet.

Vorhanden: zehn Startkategorien mit Ausschlussliste, `attributErlaubt()`, das Attributschema mit Verifikationsstatus (`darfMatchen()` verlangt bekannten Wert **und** Beleg) sowie synthetische Prüfdaten in `content-data/attributes/`.

**M13-06 ist blockiert (B-005):** Der Angebotslayer ist fertig, aber es gibt keine Programmfreigabe eines Netzwerks. Ohne sie bleibt der Slot aus — kein Feedabruf, keine öffentliche Angebotsdatei, leerer Katalog mit Begründung. Prüfpunkte in `docs/reviews/commerce-partner.md`.

**M12-06 ist blockiert (B-004):** Der Reisecheck ist fertig, die Regeln sind mit Fundstelle erfasst, aber fachlich nicht geprüft. Er läuft deshalb in der Vorschau — ohne positives Gesamtergebnis, und das steckt im Motor, nicht nur im Text. Prüfpunkte und Freigabeschritte in `docs/reviews/travel.md`.

**M09-06 ist blockiert (B-003):** Kein Partnervertrag, keine Prüfung nach § 34d GewO. Ohne beides bleibt die Partnerkonfiguration leer und es entsteht keine Versicherungs-CTA. Prüfpunkte in `docs/reviews/insurance.md`.

**M08-06 ist blockiert (B-002):** Der Rechner ist fertig und getestet, aber die fachliche Abnahme fehlt. Er ist auf Wunsch des Betreibers in der **Vorschau** freigeschaltet und dort mit sichtbarem Warnhinweis erreichbar; die versionierte Marktkonfiguration bleibt auf `costs: false`. Die acht Prüfpunkte und die fünf Freigabeschritte stehen in `docs/reviews/costs.md`, die Merkliste in `TODO.md`.

**Rechner ansehen:** `ENABLE_FEATURES=costs npm run build:site && npx astro preview` — der Override wirkt nur in `development`.

**Live erreichbar:** https://petatlas-de-preview.shuu9599.workers.dev — technische Vorschau, `noindex`, mit freigeschaltetem Rechner. Nachweise in `docs/DEPLOYMENT_EVIDENCE.md`.

**Vor jedem Commit:** `npm run verify` — Lint, Typecheck, Format, Unit-Tests, Secret-Audit, Lizenz- und Handoff-Prüfung in einer Kette. Über den **Exit-Code** prüfen, nicht über die letzten Ausgabezeilen; in dieser Sitzung sind vier Commits mit roter Kette rausgegangen, weil ich nur die Ausgabe gelesen habe.

**Reihenfolge beim Abschluss einer Aufgabe:** erst `docs/HANDOFF.md` auf die *nächste* Aufgabe fortschreiben, dann den Status setzen und beides gemeinsam committen. Sonst schlägt `npm run check:handoff` in der CI fehl — genau das ist beim ersten CI-Lauf passiert.

Prüfkette vor jedem Commit: `npm run lint && npm run typecheck && npm run format:check && npm run test:unit && npm run check:security && npm run check:licenses && npm run check:handoff`, bei UI-Änderungen zusätzlich `npx playwright test`.

## Entschieden

**B-001 ist aufgelöst (ADR-018).** Der Gebührenkatalog wird über den offiziellen XML-ZIP-Download bezogen. Die Vorgaben zu Snapshots, Fehlerverhalten, Provenienz und Darstellung stehen in `docs/DECISIONS.md`; die verbleibende Betriebsprüfung ist Aufgabe M17-07.

## Cloudflare

Zugang liegt seit 2026-09-06 vor: OAuth-Token für `Shuu9599@gmail.com's Account`, hinterlegt in der lokalen wrangler-Konfiguration. **Wichtig:** wrangler scheitert ohne `NODE_EXTRA_CA_CERTS` mit „fetch failed“ — dieselbe Ursache wie bei npm.

## Nicht voraussetzen

Echte Domain, Betreiberangaben, Cloudflare-Verbindung, Affiliate-Secrets, veröffentlichungsfähige Partnerfeeds oder erfolgte medizinisch/rechtliche Freigaben. Alle Gates in `config/launch.json` stehen auf `false`, und `npm run build:production` bricht deshalb absichtlich ab.
