# Lizenz- und Rechtegrenzen

Festgelegt in M00-05. Dieses Dokument beschreibt Grenzen und offene Entscheidungen, es erteilt keine Rechte.

## Grundsatz

Ein öffentliches Repository ist **keine** Lizenz. Sichtbarkeit auf GitHub bedeutet nicht, dass Dritte Code, Texte, Daten oder Bilder daraus weiterverwenden dürfen, und sie bedeutet nicht, dass der Betreiber die enthaltenen fremden Daten neu lizenzieren könnte (ADR-014).

Es wird **keine** projektweite `LICENSE`-Datei mit einer pauschalen MIT- oder vergleichbaren Erlaubnis angelegt. Eine solche Datei würde behaupten, das Projekt könne über ODbL-Daten, Herstellerbilder und vertragliche Partnerfeeds verfügen — das kann es nicht.

## Datenklassen und ihre getrennte Rechtelage

| Klasse | Beispiele | Rechtelage | Status |
|---|---|---|---|
| Eigener Code | `src/`, `scripts/`, `config/` | Der Betreiber ist Rechteinhaber und kann eine Lizenz wählen. | **offen** — Entscheidung steht aus, siehe unten |
| Eigene redaktionelle Texte | `src/content/`, `content-data/` | Betreiber ist Rechteinhaber; Lizenz kann von der Codelizenz abweichen. | **offen** |
| Offene Geodaten (OSM/Geofabrik) | Ortsdaten, abgeleitete POI-Listen | ODbL. Attribution verpflichtend; abgeleitete Datenbanken können Share-Alike- und Bereitstellungspflichten auslösen. Ein eigenes ID-Feld macht fremde Daten nicht lizenzfrei. | **zu prüfen vor Live-Import** |
| Kommunale Open Data | einzelne Distributionen über GovData u. a. | Lizenz je Datensatz einzeln. Kein Treffer gilt automatisch als offen. | **je Datensatz zu prüfen** |
| Open Pet Food Facts | Futterdaten, Produktbilder | Daten und Bilder unterliegen unterschiedlichen Bedingungen; Bildrechte nicht mit Datenrechten gleichsetzen. | **zu prüfen, optional** |
| Affiliate-/Händlerfeeds | Partnerfeeds | Vertraglich. Nur die vertraglich erlaubten Anzeigefelder dürfen in HTML/JSON. Rohfeeds gehören nicht ins Repo (ADR-008). | **vertragsabhängig, kein Vertrag vorhanden** |
| Hersteller-/Partnerbilder | Produktbilder | Nutzung nur im vertraglich erlaubten Rahmen; kein Weiterverbreitungsrecht durch Hotlinking oder Kopie. | **vertragsabhängig** |
| Fachverbandsinhalte (z. B. FEDIAF, ESCCAP) | Leitlinientexte | Kein automatisierter Import ohne nachgewiesene freie Lizenz oder schriftliche Erlaubnis; im Startumfang höchstens Verweise. | **gesperrt** |
| Lokale Nutzerdaten | Merkliste, Tierprofil im Browser | Verbleiben im Gerät des Nutzers; keine Übertragung, keine Veröffentlichung. | — |

## Offene Entscheidung: Codelizenz

Die Lizenz für den eigenen Code ist bewusst **noch nicht** gewählt. Bis zur Entscheidung des Betreibers gilt: alle Rechte vorbehalten. Die Entscheidung wird als eigene ADR in `docs/DECISIONS.md` dokumentiert und betrifft ausschließlich eigenen Code, nicht Daten, Bilder oder Partnerinhalte.

## Vor jedem Live-Import zu erfüllen

1. Quelle in der Source Registry (`config/sources/`) mit Lizenz, Publikationsrecht und Attributionspflicht eingetragen.
2. Tatsächlicher Datenfluss beschrieben: Welche fremden Felder erscheinen in öffentlichem HTML/JSON? Entsteht eine abgeleitete Datenbank?
3. Attributionsausgabe im Produkt umgesetzt, nicht nur in einer Dokumentationsdatei.
4. Bei ODbL-Verarbeitung: Share-Alike-/Bereitstellungspflicht geprüft und das Ergebnis dokumentiert.

Fremde Lizenztexte werden nur im erlaubten Umfang aus verifizierten Primärquellen übernommen. Lizenzbedingungen werden nicht paraphrasiert und als verbindlicher Volltext ausgegeben.

## Kosten

Keine kostenpflichtigen Tarife, keine Domainbestellung, keine Zusatzabonnements ohne ausdrückliche Freigabe des Betreibers (`docs/SECURITY_SCOPE.md`). Der Startumfang ist so entworfen, dass er auf kostenlosen Stufen von GitHub und Cloudflare lauffähig bleibt; das ist eine Entwurfsabsicht, keine zugesicherte Kostengarantie.

## Wo die Hinweise erzeugt werden (M05-03)

Quellen- und Lizenzhinweise auf der Website entstehen aus `config/sources/`, nicht aus einem separat gepflegten Text. Damit kann ein Hinweis nicht von der tatsächlichen Herkunft der Daten abweichen.

- `src/components/Attribution.astro` gibt den Hinweis für **eine** Quelle und **eine** Ausgabeform aus. Ist die Quelle für diese Ausgabeform nicht freigegeben, erscheint kein Datenhinweis, sondern die Feststellung, dass nichts angezeigt wird.
- `/de-de/quellen/` listet alle erfassten Quellen mit Distribution, geltenden Bedingungen, Abdeckung, Rechtestand und Attributionspflicht. Ungeprüfte Quellen bleiben in der Liste und werden als ungeprüft ausgewiesen.
- Diese Datei bleibt der Ort für die **Grenzen** je Datenklasse. Die Website zeigt den Stand; das Repository trägt die Begründung.

Die Attribution einer Quelle mit `shareAlike: true` weist zusätzlich auf die Weitergabepflicht hin. Der tatsächliche Datenfluss, aus dem sich diese Pflicht ergibt, wird in `docs/ODBL_DATAFLOW.md` beschrieben (M05-05).
