# Rechtliche Prüfliste

Stand **2026-09-14**. Quellen-Vorprüfung und konkrete Abnahmeentscheidungen: `docs/reviews/preflight-2026-09-09.md`; aktueller Umsetzungsnachweis: `docs/reviews/wm-implementation-2026-09-14.md`. Der Betreiber hat den Abschluss der menschlichen Prüfungen für den veröffentlichten Umfang bestätigt und die Veröffentlichung autorisiert. Der datierte Nachweis steht in `docs/reviews/public-release-2026-09-14.md`.

Maschinenlesbar steht dieselbe Aufstellung in `config/legal.ts` und wird von `tests/legal.test.ts` gegen die Launch-Gates geprüft.

## Pflichtangaben

| Punkt | Grundlage | Stand | Wer entscheidet | Was fehlt |
|---|---|---|---|---|
| Anbieterkennzeichnung | § 5 DDG, § 18 Abs. 2 MStV | erfüllt | Betreiber | Betreiberangaben und Erreichbarkeit bestätigt |
| Datenschutzerklärung | Art. 13/14 DSGVO | erfüllt | Betreiber mit Rechtsprüfung | aktiver Verarbeitungsumfang und Inventar bestätigt |
| Kennzeichnung bezahlter Empfehlungen | § 5a Abs. 4 UWG, § 6 DDG | erfüllt | Betreiber | — belegt durch Tests |
| Nachvollziehbarkeit der Angaben | redaktionelle Sorgfalt | erfüllt | Betreiber | — Methodikseite und `/data/v1/health.json` |
| Erklärung zur Barrierefreiheit | BFSG/BFSGV | erfüllt | Betreiber mit fachlicher Bewertung | Prüfung und Rückmeldeweg dokumentiert |
| Einwilligung für Zugriffe auf das Endgerät | § 25 TDDDG | entfällt derzeit | Betreiber | — kein Tracking, keine fremden Einbettungen beim Aufruf |
| Verbraucherstreitbeilegung | § 36 VSBG | entfällt | Betreiber | für den veröffentlichten Umfang keine zusätzliche Erklärung aufzunehmen |

## Was heute nachweislich gilt

- **Gekennzeichnete Amazon-Textlinks, kein Tracking auf Wau & Miau.** Die Links wurden vom Betreiber mit der Partner-ID beauftragt. Es gibt keine Amazon-Bilder, Widgets, Pixel oder Vorabanfragen; `adsTracking` steht auf `false` und es gibt keine Analysedienste.
- **Kartenkacheln werden erst auf Anforderung geladen.** Vor der Anforderung sieht der Kacheldienst keine IP-Adresse. Das ist technisch geprüft (`tests/performance/seitenbudgets.spec.ts`, `tests/e2e-features/map.spec.ts`). Daraus folgt keine pauschale rechtliche Freistellung: Endgerätezugriffe nach § 25 TDDDG und personenbezogene Übermittlungen nach DSGVO sind getrennt zu bewerten.
- **Keine erfundenen Pflichtangaben.** Impressum und Datenschutz verwenden die gelieferten Betreiberangaben. Unbekannte bedingte Angaben und Freigaben bleiben offen statt einen Standardtext zu erhalten (`config/site.ts`, ADR-015).
- **Keine erfundenen Bewertungen.** Der SEO-Gate weist Bewertungs-Markup zurück (`scripts/checks/seo.ts`).

## Nicht aktivierter Umfang

Versicherungsvermittlung, Produktbilder, Preis- und Angebotsfeeds, Analyse-Tracking und
Werbe-Pixel bleiben deaktiviert. Die aktuelle Freigabe bezieht sich nicht auf diese
Funktionen; ihre spätere Aktivierung erfordert eine neue Prüfung.

## Produktionsprüfung

Die Freigaben sind in `config/launch.json` und `config/legal-review.json` datiert
hinterlegt. `npm run check:release` prüft sie vor dem indexierbaren Produktionsbuild.

## Aktualisierung 10.09.2026

Die Betreiberangaben und Amazon-Textlinks wurden am 10.09.2026 ergänzt. Am 14.09.2026
bestätigte der Betreiber zusätzlich den Abschluss der menschlichen Prüfungen und die
öffentliche Veröffentlichung des begrenzten Funktionsumfangs.
