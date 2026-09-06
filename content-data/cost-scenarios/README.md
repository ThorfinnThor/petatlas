# Kostenszenarien

Ein Szenario bündelt mehrere Katalogpositionen zu einer typischen Situation. Das ist eine **redaktionelle Aussage**, keine Ableitung aus der Verordnung: die GOT sagt nicht, welche Positionen zu einer Kastration gehören.

Deshalb gilt:

- Jedes Szenario startet mit `clinicalReview: "unreviewed"`. Ohne Freigabe darf daraus **keine Gesamtschätzung** angezeigt werden; der Nutzer kann nur einzelne Positionen addieren, und die Oberfläche benennt, was fehlt.
- `approved` verlangt Prüfzeitpunkt **und** prüfende Person. Das Schema lehnt eine halbe Freigabe ab.
- Aufgenommen werden nur **einfache, klar abgrenzbare** Vorlagen. Komplexe Operationen mit vielen situationsabhängigen Positionen gehören nicht hierher: eine solche Vorlage würde eine Genauigkeit vortäuschen, die es nicht gibt.
- `exclusions` nennt ausdrücklich, was **nicht** enthalten ist. Eine leere Liste ist eine Aussage und keine Auslassung.
- Positionen dürfen nicht doppelt vorkommen; Mengen gehören in `quantity` (§ 6 GOT, Verbot von Doppelbewertungen).

Die fachliche Abnahme ist Aufgabe M08-06 und ein eigenes Gate. Ein geklärter Bezugsweg der Quelle ersetzt sie nicht.
