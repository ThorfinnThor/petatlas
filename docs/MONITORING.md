# Überwachung

Dieses Dokument beschreibt, **was überwacht wird, was nicht, und woran die Überwachung selbst scheitern kann.** Der zweite und dritte Teil sind der wichtigere: eine Überwachung, deren Lücken niemand kennt, ist gefährlicher als gar keine, weil sie Ruhe suggeriert.

## Keine Verfügbarkeitszusage

Es gibt hier **keine SLA**, keine Reaktionszeit und keine Rufbereitschaft. Was es gibt, ist ein täglicher Lauf, der Fragen stellt, und eine Meldung, wenn eine Antwort nicht stimmt. Ob jemand die Meldung liest, ist eine Frage der Betriebsdisziplin, nicht der Technik.

## Was geprüft wird

`.github/workflows/smoke.yml` läuft täglich um 06:11 UTC und auf Zuruf. Er baut die Website aus dem Stand des Repositories und ruft `scripts/monitor/smoke.ts` auf:

| Prüfung | Was sie erkennt |
|---|---|
| Pflichtseiten vorhanden und mit ihrem Kennzeichen | fehlende Seite, Fehlerseite, fremde Seite unter der richtigen Adresse |
| `/data/v1/manifest.json` vorhanden | ein Build, der keine Daten mitgeliefert hat |
| `/data/v1/health.json` lesbar | ein Build, dessen Zustandsdatei kaputt oder leer ist |
| Bauzeitpunkt jünger als 48 Stunden | ein **stehen gebliebenes Deployment**: der Build schlägt fehl, die alte Auslieferung bleibt stehen, und ohne diese Prüfung merkt es niemand |
| kein ausgelieferter Datensatz `veraltet` | Datenüberalterung |
| Datensätze mit unbekanntem Alter | Warnung, kein Fehler: unbekannt ist keine Entwarnung, aber auch kein Ausfall |

Ein bekannter **gesperrter** Datensatz — etwa die Reiseregeln ohne fachliche Freigabe — ist ausdrücklich kein Ausfall. Er steht im Bericht, macht den Lauf aber nicht rot: sonst gewöhnt man sich an ein rotes Licht, und dann übersieht man das nächste.

## Zwei Betriebsarten

- `--dist <verzeichnis>` prüft den gebauten Stand. Das geht **ohne Deployment** und ist heute der Regelfall.
- `--base <adresse>` prüft eine ausgelieferte Website über HTTP. Der Workflow tut das zusätzlich, sobald `vars.SMOKE_BASE_URL` gesetzt ist. Ist sie leer, wird der Teil übersprungen — und das steht im Protokoll und in der Zusammenfassung. Ein übersprungener Teil darf nicht wie ein bestandener aussehen.

Die Adresse ist eine Repository-Variable, kein Secret: eine öffentliche Website ist keine Vertraulichkeit.

## Die Meldung

Bei einem Fehlschlag öffnet der Lauf **ein** Issue mit stabilem Titel („Rauchprobe fehlgeschlagen“). Ist es schon offen, wird es nicht noch einmal geöffnet: ein täglicher Lauf soll an ein offenes Problem erinnern, nicht das Issue-Board fluten. Das Issue enthält den Bericht und den Link auf den Lauf — keine Adressen mit Token, keine Secretnamen, keine personenbezogenen Angaben.

Dieselbe Form nutzt `source-check.yml` für beobachtete Quellen: ein Issue je Seite, stabiler Titel, keine Wiederholung.

## Wo diese Überwachung nicht hinreicht

**1. Der Zeitplan überwacht sich nicht selbst.** Fällt der GitHub-Scheduler aus, läuft die Rauchprobe nicht — und niemand bekommt eine Meldung, denn die Meldung käme ja aus dem Lauf. Ein ausgefallener Wächter sieht von außen genauso aus wie ein Wächter, der nichts zu melden hat. Das ist die grundsätzliche Lücke jeder Überwachung, die auf derselben Plattform läuft wie das Überwachte.

**2. GitHub deaktiviert Zeitpläne nach 60 Tagen ohne Aktivität** im Repository. Ein ruhiges Repository verliert damit still seine Überwachung. Wer sich auf den Zeitplan verlässt, muss entweder regelmäßig committen oder die Läufe gelegentlich von Hand anstoßen und dabei nachsehen, ob der Zeitplan noch aktiv ist.

**3. Zwischen zwei Läufen liegt ein Tag.** Ein Ausfall um 06:12 UTC wird frühestens am nächsten Morgen bemerkt. Häufiger zu prüfen wäre möglich, kostet aber Laufzeit und bringt ohne jemanden, der nachts hinsieht, wenig.

**4. Eine Quelle, die dauerhaft nicht erreichbar ist, fällt nur im Bericht auf.** Der GOT-Abruf gelingt aus der CI heraus nicht (`docs/SOURCE_REVIEWS.md`). Der Importlauf bleibt deshalb grün und schreibt „nicht erreichbar“ in seine Zusammenfassung. Erst wenn der Gebührenkatalog die Sperrschwelle von 400 Tagen reißt, wird daraus ein Fehler in der Rauchprobe. Das ist beabsichtigt — aber es heißt, dass zwischen dem ersten Fehlschlag und dem Alarm über ein Jahr liegen kann.

**5. Ein unabhängiger Monitor fehlt.** Ein externer Dienst oder ein kleiner Zeitgeber bei Cloudflare würde die Lücken 1 bis 3 schließen. Beides ist eine eigene Betriebsentscheidung mit eigenen Kosten und ist **nicht** freigegeben. Bis dahin gilt: der Betreiber sieht die Actions-Benachrichtigungen und `/de-de/datenstand/` regelmäßig an.

## Was der Betreiber tun muss

- Actions-Benachrichtigungen für dieses Repository aktiviert lassen.
- Alle paar Wochen nachsehen, ob die Zeitpläne noch aktiv sind (Punkt 2).
- `/de-de/datenstand/` ansehen, bevor man sich auf eine Zahl verlässt.
- Ein offenes Issue der Rauchprobe schließen, wenn die Ursache behoben ist — sonst erinnert der Lauf nicht mehr, weil er die Meldung für schon vorhanden hält.
