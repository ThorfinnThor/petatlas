# Launchfreigaben

Stand **2026-09-08**. **Keine der hier genannten Freigaben ist erteilt.** Dieses Dokument beschreibt, was für jede Freigabe verlangt wird, wer sie erteilt und woran man erkennt, dass sie erteilt wurde. Es erteilt selbst keine.

Das ist die wichtigste Aussage dieser Datei: **kein Agent und kein Skript trägt eine fachliche oder rechtliche Freigabe ein.** `npm run check:release` kann einer Behauptung widersprechen, aber keine begründen.

## Wie eine Freigabe zustande kommt

1. Die zuständige Person beantwortet die Prüfpunkte im jeweiligen Review-Dokument.
2. Sie trägt das Ergebnis dort ein — mit Datum, Namen und Fundstelle.
3. Sie setzt das zugehörige Gate in `config/launch.json` auf `approved: true` und ergänzt `approvedBy` und `approvedAt`.
4. `npm run check:release` prüft danach nur noch die Form: Person vorhanden, Datum vorhanden, benannter Nachweis vorhanden. Es prüft **nicht** den Inhalt — das kann es nicht.

Ein Häkchen ohne Namen ist keine Freigabe, und ein Verweis auf ein Dokument, das es nicht gibt, ist schlimmer als kein Verweis. Beides macht die Prüfung rot.

## Stand der acht Gates

| Gate | Wer entscheidet | Nachweis | Stand | Was fehlt |
|---|---|---|---|---|
| `operatorImprint` | Betreiber | `docs/LEGAL_CHECKLIST.md` | **offen** | Name, Anschrift, Kontakt, inhaltlich verantwortliche Person |
| `domain` | Betreiber | `docs/CLOUDFLARE_SETUP.md` | **offen** | Domain und `PUBLIC_SITE_URL`; bis dahin nur `example.invalid` in development |
| `dataRights` | prüfende Person | `docs/SOURCE_REVIEWS.md` | **offen** | Bestätigung der Publikationsrechte je Quelle einschließlich öffentlicher JSON-Weitergabe |
| `costsRules` | fachlich prüfende Person | `docs/reviews/costs.md` | **offen** | acht Prüfpunkte zum Gebührenrechner (B-002) |
| `travelRules` | fachlich prüfende Person | `docs/reviews/travel.md` | **offen** | acht Prüfpunkte zu den Reiseregeln, dazu die Inhaltssignatur in `content-data/travel/approvals.json` (B-004) |
| `insuranceAffiliate` | Betreiber mit Rechtsprüfung | `docs/reviews/insurance.md` | **offen** | Programmzulassung und Prüfung nach § 34d GewO (B-003) |
| `commerceAffiliate` | Betreiber | `docs/reviews/commerce-partner.md` | **offen** | Programmfreigabe eines Netzwerks und geprüfte Anzeigerechte (B-005) |
| `adsTracking` | Betreiber | `docs/LEGAL_CHECKLIST.md` | **offen** | bleibt bewusst aus; eine Freigabe wäre eine eigene Entscheidung mit eigener Datenschutzprüfung |

Dazu kommen vier offene Rechtspflichten aus `docs/LEGAL_CHECKLIST.md`: Anbieterkennzeichnung, Datenschutzerklärung, Erklärung zur Barrierefreiheit und der Hinweis zur Verbraucherstreitbeilegung.

## Was heute belegt ist

Diese Punkte brauchen keine externe Freigabe mehr, weil sie gemessen und dokumentiert sind:

| Punkt | Nachweis |
|---|---|
| Keine Werbung, kein Tracking, keine Cookies | aus den Gates abgeleitet, `tests/legal.test.ts` |
| Kennzeichnung bezahlter Verweise | `tests/affiliate-links.test.ts`, `tests/e2e/versicherung.spec.ts` |
| Kein erfundenes Bewertungs-Markup | `scripts/checks/seo.ts`, `tests/seo/` |
| Nur zulässige Dateien in der Auslieferung | `scripts/checks/dist.ts` |
| Zugänglichkeit nach WCAG 2.1 AA, soweit maschinell prüfbar | `docs/ACCESSIBILITY.md` |
| Leistung und Budgets | `docs/PERFORMANCE.md`, `docs/BUDGET_REPORT.md` |
| Datenstand und Frische | `docs/MONITORING.md`, `/data/v1/health.json` |
| Rollback | `docs/ROLLBACK.md` |

## Reihenfolge

`operatorImprint` und `domain` zuerst: ohne sie bricht der Produktionsbuild ab, und ohne Produktionsbuild ist jede weitere Freigabe folgenlos. Danach `dataRights`, dann die fachlichen Gates, zuletzt die Partnergates.

Die öffentliche Freigabe (`publicRelease`) steht erst, wenn **alle** Gates stehen und keine Rechtspflicht offen ist. `npm run check:release` widerspricht jedem anderen Zustand.

## Was ausdrücklich nicht passiert ist

- Niemand hat den Gebührenrechner fachlich geprüft.
- Niemand hat die Reiseregeln fachlich geprüft.
- Keine juristische Person hat Datenschutz, Impressum oder Barrierefreiheit bewertet.
- Es gibt keinen Partnervertrag und keine Programmzulassung.

Diese vier Sätze stehen hier, damit sie nicht später aus einem grünen Prüflauf herausgelesen werden. Ein grüner Lauf heißt: der Stand behauptet nichts, was er nicht belegen kann. Er heißt nicht, dass geprüft wurde.
