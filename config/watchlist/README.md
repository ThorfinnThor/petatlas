# Beobachtete Regelquellen

Diese Liste ist **nicht** die Source Registry. Aus den hier genannten Seiten
entsteht keine Datei im Build. Sie tragen die Rechtsgrundlage und die
Landesangaben, aus denen ein Mensch Regeln ableitet — und genau deshalb muss
ein Wechsel auffallen, ohne dass ihn jemand zufällig bemerkt
(`docs/reviews/travel-sources.md`, offener Punkt 5).

Gespeichert wird nur, was zum Vergleich nötig ist: ETag, Last-Modified und ein
Hash über den normalisierten Text. Kein Inhalt, keine Weitergabe.

## Warum zwei Zielstaaten fehlen

Für Österreich und die Niederlande ist im Repository **keine genaue Adresse**
festgehalten. Am 2026-09-08 wurden zwei plausible Adressen probeweise
abgerufen; beide antworteten mit 404. Eine geratene Adresse zu beobachten wäre
schlimmer als keine: sie meldet jahrelang „unverändert“, obwohl sie nie die
richtige Seite gelesen hat. Beide Zielstaaten kommen dazu, sobald die
fachliche Prüfung (M12-06) die tatsächlich gelesenen Adressen festhält.

## Der Marker

Jeder Eintrag nennt eine Zeichenfolge, die auf der gelesenen Seite vorkommt.
Fehlt sie, gilt der Befund als `nicht_pruefbar` — die abgerufene Seite ist
dann nicht die geprüfte Seite, sondern eine Fehler-, Einwilligungs- oder
Bot-Prüfungsseite. Der Marker wird byteweise gesucht und darf deshalb nur
ASCII-Zeichen enthalten; das erspart eine Zeichensatzerkennung, die bei
`gesetze-im-internet.de` (Latin-1) sonst nötig wäre.
