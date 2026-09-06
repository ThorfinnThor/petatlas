# Teststrategie und Abnahme

## 1. Definition of Done

Eine Aufgabe ist nur `done`, wenn ihre Liefergegenstände existieren, die geforderten Tests tatsächlich gelaufen sind, die relevanten Prüfungen bestanden wurden und ein Nachweis in `project/tasks.json` verzeichnet ist. Ein Screenshot allein beweist keine Rechenkorrektheit. Ein Unit-Test allein beweist kein funktionierendes Deployment. Ein implementierter Adapter beweist keine Partnerzulassung.

Jeder Nachweis enthält Testbefehl oder Prüfhandlung, Ergebnis, Commit/Dateireferenz und Datum. Fehlende Fach-/Kontofreigaben bleiben eigene offene oder blockierte Aufgaben, auch wenn der Code vollständig ist. Der Agent darf Anforderungen nicht abschwächen, Testfälle löschen oder `skip` hinzufügen, um Fortschritt zu behaupten.

## 2. Vorgesehene Befehle

Diese Befehle sind vom umsetzenden Agenten anzulegen. Dieses Planungspaket selbst enthält noch keine Website und behauptet nicht, dass die npm-Befehle bereits verfügbar sind.

```text
npm run dev
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:accessibility
npm run test:contracts
npm run data:validate
npm run data:license-check
npm run build:fixture
npm run build:production
npm run build:cloudflare
npm run check:dist
npm run check:links
npm run check:seo
npm run check:security
npm run check:budgets
npm run check:release
npm run verify
```

`verify` führt die schnelle notwendige Gesamtkette aus. Größere OSM-Downloads sind keine Pflicht jeder PR-Prüfung. Sie werden in zeitgesteuerten oder manuellen Integrationstests mit echten Quellen geprüft. Lokale Entwicklung und Unit-Tests dürfen nicht vom Internet oder echten Credentials abhängen.

Der mitgelieferte Statushelfer funktioniert unabhängig davon bereits: `python3 scripts/project_status.py`.

## 3. Gebührenrechner

Pflichtfälle: regulärer Faktor, Notdienst-Modus, mehrere Mengen, Dezimalfaktor, centgenaue Rundung, Zusatzkosten mit eigener Steuerbehandlung, fehlende Daten, doppelte Positionen, ungültige Mengeneinheit, Katalogwechsel und gesperrtes Szenario.

Synthetische Testpositionen verwenden: z. B. 10,00 EUR Grundwert × Faktor 2 × Menge 3 = 60,00 EUR netto. Das ist ein Rechentest, keine reale GOT-Position. Fachliche Golden Tests zusätzlich unabhängig gegen die verifizierte Originalquelle und einen dokumentierten Rechenweg prüfen. Erwartungswerte nicht mit derselben Implementierung erzeugen, die getestet wird.

Notdienst-Regeln aus der gültigen GOT übernehmen und prüfen; Pauschale nicht unbemerkt mit dem Leistungsfaktor multiplizieren. Steuersatz und Steuerbasis sind explizite Konfiguration, keine Annahme für alle zukünftigen Märkte. [S18]

Eine Behandlungsvorlage kann nur mit `clinicalReview=approved` öffentlich eine Gesamtschätzung liefern. Ohne vollständige Vorlage darf der Benutzer einzelne bekannte Positionen addieren; das Ergebnis muss fehlende Bestandteile klar nennen.

## 4. Reiseregeln

Testmatrix für jeden freigegebenen Zielstaat: passende/nicht passende Tierart, normales erwachsenes Tier, unvollständige Eingaben, vor/nach Inkrafttreten, Impf-/Dokumentfristen, falsch geordnete Daten, fehlendes Transitland, Drittland-Transit, Verkauf/Abgabe, unbegleitete Reise, größere Tiergruppe, junges Tier und geplante Rückreise.

V1 beschränkt sich auf einen expliziten Standardfall; alle anderen Kontexte geben `nicht unterstützt / amtlich prüfen` statt eine vermutete Checkliste zurück. Länder- und Verkehrsträger-Regeln dürfen nicht in einer scheinbar vollständigen EU-Pauschalregel verschwinden. Grenzfälle um Mitternacht/Zeitzonen als Kalenderdaten testen.

Keine live freigeschaltete Regel ohne offizielle Fundstelle, `effectiveFrom`, Reviewdatum und klaren Geltungsbereich. HTTP-Abruf-Erfolg ersetzt kein Review. [S25–S26]

## 5. Karten und Orte

Testfälle: unbekannte Position, abgelehnte Geolocation, eigener Ort ohne Treffer, sehr dichte Stadt, benachbarte Shards, Dublette über Regionengrenze, defekte Koordinate, überlappende OSM-Extrakte, unbekannte Öffnungszeiten, fehlende Telefonnummer, Tile-Provider-Ausfall.

Die Liste bleibt ohne JavaScript nutzbar. Karte lädt erst nach bewusster Aktivierung. Marker werden geclustert/begrenzt; größere Bereiche laden nicht ungefragt ganz Deutschland. OSM-Attribution muss in der Karte sichtbar bleiben; Daten-/Lizenzhinweise auch in Downloads. „Keine erfassten Treffer“ ist nicht „hier gibt es keinen Tierarzt“. [S22–S24]

Bei Ortszuordnung per Distanz statt Gemeindegrenze steht ausdrücklich „im Umkreis“, nicht fälschlich „in der Gemeinde“. Notdienst wird nur aus einer dazu geeigneten aktuellen Quelle angezeigt.

## 6. Angebote und Produktmatching

Testfälle: valide/ungültige GTIN, führende Null, Einzelpackung vs. Multipack, Gramm/Kilogramm-Umrechnung, EUR/USD-Mismatch, unbekannter Versand, Ausverkauf, Preis 0, fehlende Provision/Trackingfreigabe, abgelaufene Ausgaberechte, abgelaufener Preis, Rabatt nur für Neukunden, falsche Produktgröße und nicht verifizierte Attribute.

Default-Sortierung ist erklärbar und provisionunabhängig. Nur wirklich vergleichbare Varianten gemeinsam nach Gesamtpreis sortieren. Bei unbekanntem Versand lautet das Sortierlabel z. B. „Artikelpreis ohne unbekannte Versandkosten“, nicht „günstigstes Gesamtangebot“.

Fiktive Marken, Platzhalterpreise und Test-Affiliate-IDs müssen vom Produktionsaudit erkannt werden. Herstellerbilder nicht ohne Bilderlaubnis kopieren oder aus fremden Websites herunterladen. Ein fehlendes Bild erhält einen neutralen Platzhalter ohne falsches Produktfoto.

## 7. Health und Spielzeug

Im Startumfang Pflege-/Mobilitäts-/Zahnpflegezubehör und Spielzeug anhand belegter Produkteigenschaften. Keine automatisierte Diagnose, Dosierung, Behandlung oder aus Alter/Rasse abgeleitete Supplement-Pflicht. Medikamente, Gesundheits-Supplements und medizinisch interpretierte Tests bleiben bis zu gesonderter Evidenz-/Rechtsprüfung außerhalb automatischer Empfehlungen.

Pflichtfälle: falsche Tierart, fehlende Größe, widersprüchliche Herstellerangabe, unbekannte Kauintensitätsfreigabe, Material unbekannt, unpassende Gewichtsklasse. Unbekannt ist nicht geeignet. Ergebnis erläutert die tatsächlich geprüften Attribute. Nicht verwenden: „garantiert sicher“, „unzerstörbar“, erfundene Haltbarkeitsscores oder unbelegte Wirkaussagen.

## 8. Profil, Datenschutz und Sicherheit

Testen, dass initial keine Profilinformationen gespeichert oder an Dritte gesendet werden. Bewusst aktivierte lokale Speicherung, Löschen, Migration, korrupte Importdatei, Importgrößenlimit und deaktiviertes localStorage abdecken. Keine automatische Standortfreigabe. Keine Nutzereingaben in Pagefind-Index, Sitemap, URL-Parameter oder Affiliate-Sub-ID.

Browser-Netzwerkprüfung: Vor Karten-/Trackingfreigabe nur erlaubte first-party Requests. Partnerbilder können ebenfalls Third-Party-Requests verursachen; sie müssen in der echten Datenschutzkonfiguration berücksichtigt werden. Keine Behauptung „keine Cookies“ ohne Test aller aktiven Integrationen. [S33]

Secret-Tests prüfen Repo, Buildartefakte, HTML, JavaScript, JSON und Logs. Test-Token als Canary einsetzen; echten Token nie in den Testbericht schreiben.

## 9. SEO und redaktionelle Qualität

Indexierbare Seite braucht echte Daten oder eigenständigen hilfreichen Inhalt, eindeutigen Titel, H1, Quellen, Datumsangabe und funktionierende interne Links. Keine hunderttausend Kombinationen von Rasse × Ort × Spielzeug × Gesundheitsproblem.

Zunächst eine kuratierte Orts-Allowlist, z. B. bis zu 25 Städte mit ausreichend erfassten Daten. Die Karte darf bundesweit sein, obwohl nicht jede Gemeinde eine indexierbare Landingpage bekommt. Datenlücken dürfen nicht mit generierten Floskeln verdeckt werden.

Kein `AggregateRating` ohne echte veröffentlichte Bewertungen. Keine fingierte `Review`-/`MedicalWebPage`-Autorität. `hreflang` nur für existierende echte Sprachversionen; neue Zielstaatseite im deutschen Reisebereich ist keine Übersetzung. Pagefind schließt Merkliste, private Eingaben, Test- und Filterzustände aus. [S16–S17]

## 10. Performance und Zugänglichkeit

Projektziele, keine Hosting-Zusagen: LCP-Ziel <= 2,5 Sekunden, CLS <= 0,1 unter dokumentierten Testbedingungen. INP wird nicht durch einen einzelnen Lighthouse-Lauf als bestanden behauptet. Initiales allgemeines JavaScript möglichst <= 50 KiB gzip; zusätzliche Tool-Module budgetieren, Karte separat lazy laden. Die gemessenen Werte und Testgeräte dokumentieren.

Tastaturnavigation, sichtbarer Fokus, Labels, Fehlermeldungen, Screenreader-Ergebnisansagen, Kontraste, 200-Prozent-Zoom, mobile Layouts und Druckversionen prüfen. Keine horizontale Scrollpflicht für die Hauptbedienung. Browser-Tests mindestens Chromium und ein zweiter Engine-/Browserpfad; Desktop und mobiles Format. Screenshots zeigen tatsächlichen Build, keine Design-Mockups.

## 11. Internationale Architektur-Abnahme

Ein deaktivierter US-Testmarkt verwendet englische Texte, USD und andere Einheiten, ohne DE-Konfiguration zu überschreiben. Gebührenmodul liefert `unsupported`, wenn kein US-Adapter existiert. US-Testangebot erscheint nicht in DE-Listen. Deutscher Nutzer mit Reiseziel FR bleibt in `market=DE`.

Die Tests verwenden synthetische US-Daten ausschließlich als Fixtures. Sie erzeugen keine indexierbaren US-Seiten und belegen keinen bereits gestarteten US-Markt.

## 12. Öffentliche Freigabestufen

**A — technisches Preview:** Kerncode und Tests, klar als Test markierte Fixtures, kein vermeintlicher Live-Datenbetrieb. Kein öffentliches Monetarisierungsversprechen.

**B — redaktioneller Start:** Betreiberangaben, Datenschutz, Datenrechte, tatsächliche Daten, fachliche Freigaben und Sicherheitsprüfungen vorhanden. Nicht freigegebene Partnerfunktionen aus. Technische Einschränkungen werden sichtbar angegeben.

**C — monetarisierter Start:** Stufe B plus mindestens eine tatsächlich zugelassene und getestete Monetarisierungsintegration mit passenden Vertragsrechten. Versicherungslogik separat freigeben; eine Waren-Affiliatezulassung ist keine Versicherungserlaubnis. [S20, S27–S28]

Die rechtliche Anwendbarkeit von Werbekennzeichnung, Grundpreisen, Endgeräte-Einwilligung, Anbieterpflichten und gegebenenfalls Barrierefreiheitsrecht muss am konkreten Produkt geprüft werden. Ein allgemeiner Disclaimer ersetzt diese Prüfung nicht. [S32–S35]
