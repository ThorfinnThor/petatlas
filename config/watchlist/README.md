# Beobachtete Regelquellen

Diese Liste ist **nicht** die Source Registry. Aus den hier genannten Seiten
entsteht keine Datei im Build. Sie tragen die Rechtsgrundlage und die
Landesangaben, aus denen ein Mensch Regeln ableitet — und genau deshalb muss
ein Wechsel auffallen, ohne dass ihn jemand zufällig bemerkt
(`docs/reviews/travel-sources.md`, offener Punkt 5).

Gespeichert wird nur, was zum Vergleich nötig ist: ETag, Last-Modified und ein
Hash über den normalisierten Text. Kein Inhalt, keine Weitergabe.

## Wie eine Adresse hier hereinkommt

Nur belegt. Für Österreich und die Niederlande fehlte bis M22-03 eine Adresse,
weil eine **geratene** Adresse schlechter ist als keine: sie meldet jahrelang
„unverändert“, ohne je die richtige Seite gelesen zu haben. Vier plausible
Adressen antworteten mit 404.

Gefunden wurden die richtigen am 2026-09-09 im Verzeichnis der Kommission
(„EU countries' specific information“), das seitdem selbst beobachtet wird:
ändert es sich, können sich die Landesadressen geändert haben. Jede neue
Adresse wurde abgerufen, ihr Marker geprüft und ihr Inhalt gelesen — die
Befunde stehen in `docs/reviews/travel-sources.md`.

Ein Eintrag heißt **nicht**, dass die Seite fachlich taugt. Die österreichische
Seite steht hier, obwohl sie eine aufgehobene Verordnung nennt. Genau deshalb:
eine Änderung wäre das Zeichen, dass sie nachgezogen ist.

## Der Marker

Jeder Eintrag nennt eine Zeichenfolge, die auf der gelesenen Seite vorkommt.
Fehlt sie, gilt der Befund als `nicht_pruefbar` — die abgerufene Seite ist
dann nicht die geprüfte Seite, sondern eine Fehler-, Einwilligungs- oder
Bot-Prüfungsseite. Der Marker wird byteweise gesucht und darf deshalb nur
ASCII-Zeichen enthalten; das erspart eine Zeichensatzerkennung, die bei
`gesetze-im-internet.de` (Latin-1) sonst nötig wäre.
