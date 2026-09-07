# Umfang des Reisechecks (M12-01)

Eine Reiseseite, die alles zu können scheint, ist gefährlicher als eine, die wenig kann und das sagt. Deshalb beginnt der Reisecheck nicht mit Regeln, sondern mit seiner Grenze.

## Fassung v1

| | |
|---|---|
| Von | Deutschland |
| Nach | Österreich, Frankreich, Italien, Niederlande |
| Richtung | Hinreise und Rückreise |
| Durchreise | Österreich, Belgien, Frankreich, Italien, Luxemburg, Niederlande |
| Tiere | eigener Hund oder eigene Katze, ab 12 Monaten, bis zu 5 Tiere |
| Anlass | private Reise mit Begleitperson |

Maßgeblich ist `content-data/travel/scope.json`; diese Tabelle ist ihre Lesefassung. Ein neues Zielland ist deshalb eine Datenänderung samt Regeln und Prüfung — keine Zeile in einem `if`.

## Warum diese vier Staaten

Es sind die vier häufigsten Reiseziele für eine Autoreise aus Deutschland, für die sich die Regeln vollständig aus amtlichen Quellen belegen lassen. Jedes weitere Land bedeutet: Quelle lesen, Fundstelle erfassen, Geltung bestimmen, fachlich prüfen. Eine Länderliste ohne diese Arbeit sähe aus wie eine weltweite Abdeckung — und wäre eine.

## Warum eine Altersgrenze von zwölf Monaten

Das ist eine **Umfangsgrenze dieser Anwendung, keine Rechtsaussage.** Für junge Tiere gelten zusätzliche Voraussetzungen rund um Impfzeitpunkte und Mindestalter, die v1 nicht prüft. Die Grenze ist bewusst großzügig gewählt, damit kein Grenzfall in den geprüften Bereich rutscht. Sie sagt nichts darüber, ab wann eine Reise mit einem jungen Tier zulässig ist.

## Was ausdrücklich nicht geprüft wird

Zehn Fälle stehen mit Begründung in der Umfangsdatei und werden auf der Seite vollständig angezeigt:

1. andere Zielstaaten,
2. Durchreise durch Nicht-EU-Staaten (etwa die Schweiz),
3. andere Tierarten als Hund und Katze,
4. Tiere unter zwölf Monaten,
5. mehr als fünf Tiere,
6. Verkauf, Abgabe, Vermittlung, gewerblicher Transport,
7. Transport ohne Begleitperson,
8. Bedingungen von Fluggesellschaften, Bahn und Fähren,
9. Rückreise aus einem Staat außerhalb der EU,
10. Ausnahmen wegen Krankheit, Trächtigkeit oder Behandlung.

Der Unterschied, auf den es ankommt: **nicht geprüft heißt nicht unzulässig.** Die Seite sagt das wörtlich, weil ein „wird nicht unterstützt“ sonst wie ein „geht nicht“ gelesen wird.

## Fail-closed

`pruefeUmfang()` gibt nur dann „unterstützt“ zurück, wenn **jede** Angabe im Umfang liegt. Ein unbekanntes Alter ist nicht „erwachsen“, ein unbekanntes Land ist nicht „vermutlich EU“, ein unbekannter Reisezweck ist nicht „privat“. Alle Gründe werden gesammelt, nicht nur der erste — wer zwei Dinge ändern muss, soll beide erfahren.

## Was noch fehlt

Die eigentlichen Regeln. Solange sie fehlen, steht auf der Seite keine Beispielprüfung: eine Checkliste aus erfundenen Regeln wäre schlimmer als gar keine. Reihenfolge der nächsten Schritte: Regelmaschine (M12-02), belegte Regeln mit Fundstelle und Geltung (M12-03), Oberfläche (M12-04), Packliste und Zielseiten (M12-05), fachliche Freigabe (M12-06, externer Freigabepunkt).
