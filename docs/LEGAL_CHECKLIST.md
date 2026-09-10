# Rechtliche Prüfliste

Stand **2026-09-09**. Quellen-Vorprüfung und konkrete Abnahmeentscheidungen: `docs/reviews/preflight-2026-09-09.md`. Diese Liste ist **kein Rechtsrat** und ersetzt keine Prüfung durch eine dazu befugte Person. Sie zählt auf, was zu klären ist, wer entscheidet und was heute fehlt. Kein Eintrag hier behauptet eine erfolgte Freigabe; die Freigaben stehen in `config/launch.json` und werden nur von der zuständigen Person mit Nachweis eingetragen.

Maschinenlesbar steht dieselbe Aufstellung in `config/legal.ts` und wird von `tests/legal.test.ts` gegen die Launch-Gates geprüft.

## Pflichtangaben

| Punkt | Grundlage | Stand | Wer entscheidet | Was fehlt |
|---|---|---|---|---|
| Anbieterkennzeichnung | § 5 DDG, § 18 Abs. 2 MStV | **offen** | Betreiber | Name, Anschrift, Kontakt, inhaltlich verantwortliche Person |
| Datenschutzerklärung | Art. 13 DSGVO | **offen** | Betreiber mit Rechtsprüfung | Verantwortlicher, Rechtsgrundlagen, Betroffenenrechte |
| Kennzeichnung bezahlter Empfehlungen | § 5a Abs. 4 UWG, § 6 DDG | erfüllt | Betreiber | — belegt durch Tests |
| Nachvollziehbarkeit der Angaben | redaktionelle Sorgfalt | erfüllt | Betreiber | — Methodikseite und `/data/v1/health.json` |
| Erklärung zur Barrierefreiheit | BFSG/BFSGV | **offen** | Betreiber mit fachlicher Bewertung | Geltungsbereich, Rückmeldeweg, Bewertung |
| Einwilligung für Zugriffe auf das Endgerät | § 25 TDDDG | entfällt derzeit | Betreiber | — kein Tracking, keine fremden Einbettungen beim Aufruf |
| Verbraucherstreitbeilegung | § 36 VSBG | **offen** | Betreiber | Unternehmereigenschaft, Beschäftigtenzahl und Teilnahmeverpflichtung/-zusage prüfen |

## Was heute nachweislich gilt

- **Keine Werbung, kein Tracking, keine Cookies.** Kein Partnerprogramm ist freigegeben, `adsTracking` steht auf `false`, und es gibt keine Analysedienste. Der Zustand wird nicht behauptet, sondern aus den Launch-Gates abgeleitet (`werbeStand()`); ein Test hält beide Seiten zusammen.
- **Kartenkacheln werden erst auf Anforderung geladen.** Vor der Anforderung sieht der Kacheldienst keine IP-Adresse. Das ist technisch geprüft (`tests/performance/seitenbudgets.spec.ts`, `tests/e2e-features/map.spec.ts`). Daraus folgt keine pauschale rechtliche Freistellung: Endgerätezugriffe nach § 25 TDDDG und personenbezogene Übermittlungen nach DSGVO sind getrennt zu bewerten.
- **Kein Platzhaltertext.** Impressum, Datenschutz und Barrierefreiheitsseite sagen, dass Angaben fehlen, statt erfundene zu zeigen. Der Produktionsbuild bricht ohne echte Betreiberangaben ab (`config/site.ts`, ADR-015).
- **Keine erfundenen Bewertungen.** Der SEO-Gate weist Bewertungs-Markup zurück (`scripts/checks/seo.ts`).

## Was ausdrücklich noch nicht geprüft ist

1. **Ob das BFSG für dieses Angebot gilt.** Das Gesetz nimmt Kleinstunternehmen teilweise aus, und die Einordnung hängt am Betreiber. Diese Frage ist nicht beantwortet, und die Barrierefreiheitsseite behauptet nichts anderes.
2. **Die datenschutzrechtliche Bewertung der Kartenkacheln.** Der Abruf geschieht auf Anforderung; ob das im konkreten Fall genügt oder ob eine Einwilligung nötig ist, gehört in die Rechtsprüfung. Der Hinweistext auf der Kartenseite nennt den Vorgang bereits.
3. **Die Ausgestaltung der Affiliatekennzeichnung** im konkreten Partnervertrag. Der Wortlaut steht je Programm in `config/publishers/`; es gibt noch keinen Vertrag.
4. **Versicherungsvermittlung.** Sobald ein Versicherungshinweis erscheint, stellt sich die Frage nach § 34d GewO. Der Slot ist deshalb aus (B-003, `docs/reviews/insurance.md`).
5. **Verbraucherpflichten:** § 36 VSBG gesondert nach Unternehmereigenschaft, Website/AGB, Beschäftigtenzahl und Teilnahmezusage/-verpflichtung prüfen. Widerruf und Vertragsinformationen hängen zusätzlich vom konkreten Vertragsschluss ab; ein solcher ist im Startumfang nicht vorgesehen.

## Reihenfolge

Ohne 1 und 2 aus der Pflichttabelle gibt es keinen Produktionsbuild — das ist technisch erzwungen, nicht nur vereinbart. Alles Weitere hängt daran:

1. Betreiberangaben und Domain (`operatorImprint`, `domain`).
2. Datenschutzerklärung auf Basis dieser Angaben.
3. Bewertung zur Barrierefreiheit und Rückmeldeweg.
4. Erst danach fachliche Freigaben für Gebühren und Reiseregeln, dann Partnerverträge.

Jeder dieser Schritte endet mit einem Eintrag in `config/launch.json` **durch die zuständige Person** und einem Nachweis in `docs/reviews/`.

## Aktualisierung 10.09.2026

Die obige Momentaufnahme vom 09.09. ist für Betreiberangaben und Amazon-Textlinks überholt. Der aktuelle Nachweis ist `docs/reviews/legal-amazon-2026-09-10.md`: Impressum, Datenschutzhinweise und Rückmeldekontakt sind ergänzt; ausdrücklich beauftragte Amazon-Textlinks verwenden Werbung/Partnerhinweis. Kein Analyse-Tracking und keine Amazon-Einbettung beim Seitenaufruf. Vertrags-/Kontonachweise und weitere angefragte Betreiberfakten bleiben offen. Keine pauschale Rechtsfreigabe.
