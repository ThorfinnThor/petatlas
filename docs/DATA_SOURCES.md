# Datenquellen, Rechte und Freigabepolitik

## Grundregel

Öffentlich lesbar, kostenlos abrufbar, kommerziell verwendbar und öffentlich weiterverteilbar sind vier verschiedene Eigenschaften. Das öffentliche Repo und die statischen JSON-Endpunkte benötigen ausdrücklich passende Veröffentlichungsrechte. Dieser Plan gibt keinen einzelnen importierten Datensatz pauschal frei.

Die Quellen [S18–S31] sind überprüfte Einstiegsquellen. Vor jedem echten Import wird die konkrete Distribution mit ihren aktuellen Bedingungen erfasst. Unklare Rechte -> `pending` und nur Adapter/Fixtures bauen, keine Rohdaten veröffentlichen. Rechtliche Einschätzungen in diesem Plan sind technische Risikovorgaben, keine individuelle Rechtsberatung.

## Startquellen und ihre Rolle

| Quelle | Startrolle | Verarbeitung | Bedingung vor Live-Nutzung |
|---|---|---|---|
| GOT / Gesetze im Internet | Pflicht: Gebührenkatalog | XML bevorzugen, HTML-Fallback; Positionen exakt übernehmen | Fassung, Änderungsstand, Parser-Stichprobe und fachlich geprüfte Rechenregeln; keine fremden Kommentare übernehmen. [S18–S19] |
| OSM über Geofabrik | Pflicht: bundesweite POIs | PBF zunächst regional, dann alle deutschen Extrakte; nur benötigte Tags | ODbL-Attribution, Download-/Weitergabeweg der abgeleiteten Daten, dokumentierte Lizenzgrenzen. [S21–S23] |
| OSM-Kartenkacheln | Austauschbarer Darstellungsdienst | Nur interaktives Laden nach Kartenaktivierung | Aktuelle Tile-Policy und Datenschutzhinweis; kein Scraping, Preloading, Offline-Download, Proxy zur Limitumgehung. Kein SLA versprechen. [S24] |
| Kommunale Open Data | Optionale lokale Vertiefung | Ein Adapter pro konkreter Distribution | Lizenz und Aktualität pro Datensatz; keine Annahme, dass jeder GovData-Treffer offen ist. |
| EU-Kommission und amtliche Zielstaat-Quellen | Pflicht: Reisecheck | Geprüfte deklarative Regeln; Quelländerungen automatisch erkennen | Anwendungsbereich, Inkrafttreten, Transit und Rückreise; fachliche Freigabe vor Veröffentlichung. [S25–S26] |
| Awin / weitere vertragliche Feeds | Pflicht-Adapter, Freigabe abhängig von Account | Abruf nur im geschützten Build; minimale Anzeigefelder | Programmzulassung und konkrete Website-/JSON-/Bild-/Cache-Rechte. Keine Konditionen aus früheren Chatnachrichten übernehmen. [S27–S28] |
| Open Pet Food Facts | Optionale Futteranreicherung | Gemessene Stichprobe, später nur benötigte Produkte | Exakte OPFF-Distribution, API-Regeln, ODbL-/Inhalts-/Bildrechte; keine umfassende Abdeckung behaupten. [S29–S30] |
| DWD Open Data | Ausbau, nicht Launch-Abhängigkeit | Eigenes statisches Wetterpaket mit Frischegrenzen | Produktbezogene Rechte/Attribution und fachlich geprüfte Hinweistexte. Keine medizinische „sicher Gassi“-Prognose aus Temperatur allein. [S31] |
| Wikidata | Optionaler Identifikator-/Sprachlayer | Kleine definierte Abfragen, keine Rassen-Gesundheitserfindung | Konkrete CC0-Ressource und Qualitätsprüfung; keine Wikimedia-Bilder pauschal mitlizenzieren. |
| RASFF / BVL / Safety Gate | Späterer Rückrufbereich | Erst Quellen-/API-/Markenabdeckung prüfen | Keine bereits verfügbare universelle JSON-API oder vollständige EAN-Abdeckung voraussetzen. Negative Treffer sind keine Sicherheitszertifikate. |
| EEA Badegewässer | Spätere Kartenanreicherung | Gewässerdatensatz getrennt von Hundeerlaubnis | Datensatzrechte und Erhebungsjahr; Badegewässerqualität bedeutet nicht hundefreundlich oder aktuell algenfrei. |
| FEDIAF / ESCCAP | Nicht automatisiert importieren | Im Startumfang höchstens zulässige Verweise | Schriftliche Erlaubnis und konkrete Bedingungen erforderlich, soweit keine passende freie Lizenz nachgewiesen ist. |
| EMA / UPD | Nicht Launch-abhängig | Zunächst offizielle Verlinkung | Konkrete API-/Weiterverwendungsrechte und medizinisches Review; kein ungesicherter Massenimport. |

## Wichtige Korrekturen gegenüber einer zu einfachen Datenstrategie

**ODbL:** Separate Ordner sind gute Provenienz, aber kein juristischer Schutzschalter. Ob ein Join, eine korrigierte Ortsliste, ein Produktmatching oder ein exportierter Score eine abgeleitete Datenbank erzeugt, hängt von der tatsächlichen Verarbeitung ab. Dokumentiere den Datenfluss und erfülle gegebenenfalls Share-Alike-/Bereitstellungspflichten. Eigene Daten werden nicht allein durch ein neues ID-Feld lizenzfrei. [S22]

**Affiliate:** Ein erlaubter Produktvergleich heißt nicht automatisch, dass eine komplette Händlerdatenbank in einem öffentlichen GitHub-Repository oder als öffentliches JSON-Archiv liegen darf. Rechte für Webanzeige, Rohdatenweitergabe, Bilder, Historie und Caching separat erfassen. Keine Vertragsdokumente mit vertraulichen Konditionen in ein öffentliches Issue kopieren. [S27–S28]

**Gesetze:** Gebührenpositionen und amtliche Regeln dürfen nicht mit privaten Erläuterungen vermischt werden. Ein vollständiger technischer GOT-Import erzeugt noch keine medizinisch valide OP-Kostenschätzung. Das amtliche Gebührenverzeichnis ist zudem kein einzigartiger exklusiver Datensatz. [S18–S19]

**Öffentliches Geschäftsmodell:** Öffentlich ausgelieferte Daten und öffentliche Repository-Inhalte sind kopierbar. Differenzierung muss aus guter Aufbereitung, überprüften Zuordnungen, hilfreicher Bedienung und eigenen rechtmäßig erhobenen Erfahrungen kommen, nicht aus einem behaupteten geheimen Datenbestand.

## Source Registry: Pflichtfelder

`id`, `name`, `resourceUrl`, `publisher`, `format`, `marketScope`, `sourceKind`, `rights`, `fetchPolicy`, `freshnessPolicy`, `allowedOutputClasses`, `fieldAllowlist`, `rateLimit`, `schemaVersion`, `termsHash`, `checkedAt`, `lastSuccessfulImportAt`, `reviewOwner`, `approvalEvidence`.

Felder können `null` sein, aber ein Publisher darf daraus keine Erlaubnis ableiten. Startzustand einer neuen Quelle ist `pending`. Rechtstext und Nutzungsbedingungen nach Möglichkeit als Hash plus öffentliche Referenz festhalten; eine vollständige Kopie nur bei erlaubter Speicherung.

## Vorschläge für Frischepolitik

Dies sind Projektgrenzen, keine Zusagen der Datenanbieter:

| Quelle | Normaler Prüf-/Importtakt | Warnung / Sperre |
|---|---|---|
| GOT | Änderungsscan wöchentlich, Import nach freigegebener Änderung | Erkannte fachliche Änderung sperrt betroffene Szenarien bis Review; nach 30 Tagen ohne Quellenprüfung keine Aussage „aktuell geprüft“. |
| OSM | Start wöchentlich | Ab 30 Tagen deutliches Alterssignal; bei Ausfall letzten Stand anzeigen, keine aktuellen Öffnungszeiten garantieren. |
| Kommunale Regeln | Quellencheck wöchentlich; Review mindestens monatlich | Widerspruch, fehlender Geltungszeitraum oder abgelaufene Prüfung -> betreffende Regel nicht als verbindliches Ergebnis ausgeben. |
| Reise | Quelländerungscheck täglich; planmäßiges Review maximal 30 Tage | Neue Quellfassung, unbekanntes Inkrafttreten oder abgelaufenes Review -> keine positive Gesamtcheckliste. |
| Angebote | Abruf täglich oder gemäß Vertrag | Standardmäßig nach 24 Stunden Preis nicht mehr als aktuelles Angebot verwenden; Vertrag kann kürzere Frist verlangen. |
| Optionale OPFF-Daten | Wöchentlich bzw. bedarfsbezogen | Herkunft und Aktualität immer sichtbar; fehlende Nährwertangaben bleiben unbekannt. |
| Späteres Wetter | Nur mit getrenntem Aktualisierungsbudget | Veraltete Daten zeigen keinen grünen Sicherheitszustand; konkrete TTL pro Wetterprodukt. |

## Quellenqualität und Widersprüche

Quellenpriorität ist feld- und themenabhängig: amtliche Einreiseregel vor Reiseblog, konkrete Herstellergrößenangabe vor automatisch extrahiertem Beschreibungstext. OSM und kommunale Ortsdaten werden nicht blind überschrieben. Jeder Konflikt erhält eine maschinenlesbare Notiz; ungeklärte Felder bleiben unbekannt oder werden nicht angezeigt.

Keine Quelle darf stillschweigend durch eine beliebige Suchmaschinenfundstelle ersetzt werden, nur um einen grünen Build zu erzeugen. Fehlt ein API-Zugang, ist ein lizenzierter manueller Datensatz mit klarer Quelle ein zulässiger Übergang; erfundene Produktionsdaten sind es nicht.
