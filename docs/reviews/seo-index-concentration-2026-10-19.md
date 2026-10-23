# SEO-Indexkonzentration vom 19.10.2026

## Befund (Google Search Console, Domain-Property)

- Die Domain ging am 22.09.2026 live (die frühere Domain wurde am 23.09. ohne
  Weiterleitung getrennt). Ab dem 24.09. kamen 140–300 Impressionen pro Tag.
- Ab dem 09.10. fielen die Impressionen, seit dem 11.10. sind es 0–2 pro Tag.
- Die Seiten bleiben indexiert (URL-Prüfung: „Seite ist indexiert“, Bericht:
  1.110 indexiert). Es gibt keine manuelle Maßnahme.
- Rund 85 % aller Impressionen kamen von GOT-Einzel- und Gruppenseiten, also von
  Hunderten gleich aufgebauter Seiten aus einer amtlichen Tabelle (Grundbetrag ×
  1/2/3, gleicher Rahmentext). Das Muster entspricht einer algorithmischen
  Abwertung wegen skalierter Inhalte am Ende des Spam-Updates vom September 2026.

## Änderung

Indexierbar sind jetzt 114 statt 457 Seiten. Alle übrigen Seiten bleiben
erreichbar, tragen `noindex` und fehlen in der Sitemap. Keine Seite kommt neu in
den Index: die neue Liste ist eine echte Teilmenge der alten.

| Seitentyp | vorher | jetzt | Regel |
| --- | ---: | ---: | --- |
| GOT-Einzelseite | 298 | 47 | Qualitätswert ≥ 750 (Hund/Katze/Heimtier und mindestens zwei Alltagsmerkmale) oder gemessene Nachfrage (`GOT_NACHFRAGE`) |
| GOT-Gruppe | 71 | 13 | mindestens 15 Positionen |
| Stadtseite | 42 | 15 | mindestens 60 gemessene lokale Orte |
| Futterprodukt | 7 | 0 | ~270 Wörter, mehrere fast gleiche Packungsgrößen je Sorte |
| redaktionelle Seiten, Tools, Vergleiche, Ratgeber, Reisecheck, Blog | 39 | 39 | unverändert |

Code: `src/features/seo/index-quality.ts` (`SEO_INDEX_BUDGET`, Korridor 100–160).

## Erwartung und Rückweg

Erholung nach einer algorithmischen Abwertung dauert Wochen bis Monate. Nach 2
und 6 Wochen in der Search Console prüfen: Impressionen der behaltenen Seiten,
Anteil „Gecrawlt – zurzeit nicht indexiert“.

Neue Seiten erst wieder freigeben, wenn sie redaktionell eigenständig sind
(z. B. GOT-Seiten mit echten Fallbeispielen für Hund und Katze), nie als Block.
Rückweg: `SEO_INDEX_BUDGET` in `index-quality.ts` auf die Werte vom 24.09.
zurücksetzen.

## Nachtrag 23.10.2026: Entfernen beschleunigen

Search Console (Daten bis 20.10.): 1.080 Seiten indexiert, nur 15 als „Durch
noindex ausgeschlossen“ erkannt. Google crawlt die Domain nach der Welle im
September nur noch selten; ohne Anstoß blieben die rund 1.100 auf `noindex`
gesetzten Seiten noch Wochen im Index. Keine manuelle Maßnahme, keine
Sicherheitsprobleme, Host ohne Fehler.

Deshalb erzeugt `scripts/publish/sitemap.ts` vorübergehend
`/sitemap-entfernt.xml`: alle `noindex`-Seiten unter `tierarztkosten/`,
`tierarzt-karte/` und `futter/` mit `lastmod` 2026-10-19 (1.138 Seiten). Sie ist
in der Search Console eingereicht, steht nicht in robots.txt und wird über
`ENTFERNT_SITEMAP_AKTIV` abgeschaltet, sobald der Bericht „Durch noindex
ausgeschlossen“ die Seiten weitgehend zeigt. Danach auch in der Search Console
entfernen.

Die frühere Domain gehört dem Betreiber nicht mehr; eine Weiterleitung oder
Adressänderung ist deshalb nicht möglich.

