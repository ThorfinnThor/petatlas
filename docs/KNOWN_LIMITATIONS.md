# Bekannte Grenzen

Was diese Plattform **nicht** kann, nicht weiß und nicht verspricht. Stand 2026-09-09.

Diese Liste ist kein Mängelbericht, sondern der Teil der Wahrheit, der sonst in einem grünen Prüflauf untergeht. Wer sie liest, weiß, worauf er sich nicht verlassen darf.

## Inhaltlich

- **Keine fachlich geprüften Gebühren.** Der Rechner rechnet nachvollziehbar mit der amtlichen Gebührenordnung, aber niemand mit fachlicher Eignung hat Quellenstand und Rechenannahmen abgenommen (B-002). Jede Ausgabe trägt diesen Hinweis.
- **Keine fachlich geprüften Reiseregeln.** Die Regeln sind mit Fundstelle erfasst, aber nicht freigegeben (B-004). Der Reisecheck gibt deshalb **kein** positives Gesamtergebnis, sondern wertet einzelne Punkte aus und sagt, was er nicht sagen kann.
- **Kein Notdienstverzeichnis.** Aus OpenStreetMap lässt sich nicht ableiten, wer heute Nacht Dienst hat. Die Karte sagt das ausdrücklich.
- **Keine Diagnose, keine Dosierung, keine Behandlungsempfehlung.** Das ist kein fehlendes Feature, sondern eine Grenze des Startumfangs.
- **Keine Bewertungen, keine Tests, keine Empfehlungen.** Es gibt keine Nutzerbewertungen und keine redaktionellen Tests; entsprechend gibt es auch kein Bewertungs-Markup, und der SEO-Gate weist es zurück.
- **Keine Preise.** Kein Partnervertrag, also kein Angebot und kein Grundpreis — mit Begründung auf der Seite statt einer leeren Stelle.

- **Kleine Produktauswahl.** Vier Futtervarianten und drei Zubehörprodukte mit Herstellerquellen; keine verifizierten Barcodes, Produktfotos oder aktuellen Händlerangebote.

## Datenseitig

- **Ortsdaten sind eine Momentaufnahme.** Der aktuelle Abrufstand ist 07.09.2026. Änderungen seit diesem Tag sind erst nach einem validierten Snapshot-Update sichtbar.
- **Die Ortsdaten sind so vollständig wie OpenStreetMap.** Fehlt eine Praxis dort, fehlt sie hier. Öffnungszeiten, Telefonnummern und Websites sind unvollständig und werden nicht ergänzt.
- **Der Gebührenkatalog ist der Stand vom 7. April 2023.** Das ist die aktuelle Fassung der Verordnung, nicht ein veralteter Abruf.
- **Zwei beobachtete Regelquellen sind nicht automatisch prüfbar:** EUR-Lex antwortet einem einfachen Abruf mit HTTP 202 und leerem Körper, die italienische Seite mit einer Bot-Prüfung. Beides wird nicht umgangen; beide melden dauerhaft `nicht_pruefbar`.
- **Länderseiten können veraltet sein.** Österreich und die Niederlande werden seit 09.09.2026 anhand belegter offizieller Adressen beobachtet. Eine erreichbare Seite ist keine fachliche Freigabe.
- **Der Gebührenabruf gelingt aus der CI heraus nicht.** `www.gesetze-im-internet.de` nimmt die Verbindung aus dem Runner-Netz nicht an. Die Aktualisierung ist bis auf Weiteres ein manueller Lauf.

## Betrieblich

- **Keine Verfügbarkeitszusage.** Es gibt keine SLA, keine Reaktionszeit und keine Rufbereitschaft. Ein täglicher Lauf stellt Fragen; ob jemand die Antwort liest, ist Betriebsdisziplin.
- **Der Zeitplan überwacht sich nicht selbst.** Fällt der GitHub-Scheduler aus, fällt die Überwachung mit aus — ohne Meldung. GitHub schaltet Zeitpläne außerdem nach 60 Tagen ohne Aktivität ab.
- **Zwischen zwei Läufen liegt ein Tag.** Ein Ausfall kurz nach dem Lauf wird frühestens am nächsten Morgen bemerkt.
- **Eine dauerhaft unerreichbare Quelle wird spät zum Alarm.** Erst wenn ihr Datensatz die Sperrschwelle reißt — beim Gebührenkatalog nach 400 Tagen.
- **Öffentliche Freigabe fehlt.** Es gibt ein getrenntes Cloudflare-Vorschauprojekt. Die V2-Abnahme und Aktualisierung werden im Handoff dokumentiert; die Vorschau ersetzt keine Launch-Freigabe.
- **Statische Seiten altern.** Eine ausgelieferte Seite kann Tage alt sein. Preise blendet der Browser nach Ablauf aus, aber ein Text bleibt so lange stehen, bis neu gebaut wird.

## Technisch

- **Kein Lighthouse-Score und keine Felddaten.** Die gemessenen LCP-Werte stammen von einem lokalen Server und sind eine untere Schranke. Echte Werte brauchen echte Besucher.
- **Kein Screenreader-Lauf und keine Prüfung mit Betroffenen.** Die Regelprüfung nach WCAG 2.1 AA ist grün; das ist eine Aussage über das Markup, nicht über das Hörerlebnis.
- **Safari tabt ab Werk nicht auf Links.** Eine Browsereinstellung, kein Mangel der Seite — aber Tastaturbedienung sieht dort anders aus.
- **Laufzeitdaten werden geprüft.** Handgeschriebene Guards ersetzen seit M22-02 die Schemabibliothek im Browser; Paritätstests prüfen beide Fassungen.
- **Getrennte Suchen.** Die Volltextsuche findet Seiteninhalte, darunter statische Gebührenseiten. Orts- und Produktsuche arbeiten gezielt auf ihren Datensätzen.

## Rechtlich

- **Keine Betreiberangaben.** Impressum und Datenschutzerklärung sind unvollständig, und der Produktionsbuild bricht deshalb ab. Das ist die Sperre, nicht ein Versehen.
- **Keine Erklärung zur Barrierefreiheit.** Ob das BFSG für dieses Angebot überhaupt gilt, ist nicht geprüft.
- **Keine juristische Prüfung.** Weder Datenschutz noch Werbekennzeichnung noch Barrierefreiheit sind von einer dazu befugten Person bewertet worden.

## Verwandte Register

`problems.md` beschreibt die Betriebsfälle, die nicht kaputt sind, aber in die Irre führen — mit Ursache, Handgriff und dem, was man dabei **nicht** tun soll.

## Was daraus folgt

Nichts davon hindert die Weiterentwicklung. Alles davon hindert eine Veröffentlichung, die mehr behauptet, als hier steht. Die Reihenfolge, in der diese Punkte auflösbar sind, steht in `docs/reviews/launch.md`.
