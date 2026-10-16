# Redaktionsplan: drei bis fünf datenbasierte Artikel pro Woche

Stand: 15. Oktober 2026

## Ziel

Dein Haustierportal veröffentlicht zunächst drei hochwertige Ratgeber pro Woche. Ein vierter
oder fünfter Beitrag erscheint nur, wenn ein eigenständiger Suchzweck, belastbare Daten und ein
aktueller Quellenstand vorliegen. Die Veröffentlichungsmenge ist kein eigenes Qualitätsziel.

Jeder Beitrag muss:

- eine konkrete Frage von Hunde- oder Katzenhaltern beantworten,
- mehrere passende Datenpunkte zu einer verständlichen Aussage verbinden,
- Primär- oder Herstellerquellen direkt nennen,
- einen anderen Aufbau und einen eigenständigen Mehrwert haben,
- die Grenzen der Daten offen benennen,
- zu einem vorhandenen Werkzeug oder einer passenden Vertiefung führen,
- vor der Indexierung das bestehende SEO-Budget berücksichtigen.

## Warum Luna und Sol unterschiedlich eingesetzt werden

Die [offizielle OpenAI-Modellauswahl](https://developers.openai.com/api/docs/guides/model-selection)
beschreibt Luna als effizientes Modell für klar abgegrenzte, häufige Aufgaben und Sol als Modell
für komplexe, koordinierte Arbeitsergebnisse. Die
[Dokumentation zu Reasoning-Modellen](https://developers.openai.com/api/docs/guides/reasoning)
empfiehlt niedrige Reasoning-Stufen für Extraktion und Entwürfe und mittlere bis hohe Stufen für
Planung, Recherche und anspruchsvolle Wissensarbeit.

Für diesen Workflow gilt deshalb:

| Aufgabe | Modell | Reasoning | Ergebnis |
| --- | --- | --- | --- |
| Dateninventar und Änderungen seit dem letzten Lauf | Luna | niedrig | maschinenlesbarer Datenbericht |
| Themenkandidaten aus freigegebenen Daten erzeugen | Luna | mittel | Kandidatenliste ohne Veröffentlichung |
| Quellenpaket und Artikelbriefing erstellen | Luna | mittel | Briefing mit belegbaren Aussagen |
| Priorisierung, Suchzweck und Kannibalisierungsprüfung | Sol | mittel | freigegebener Wochenplan |
| Artikel aus mehreren Quellen schreiben | Sol | mittel | vollständiger Entwurf |
| Medizinische, rechtliche und finanzielle Risikoprüfung | Sol | hoch | Freigabe oder konkrete Sperrgründe |
| Links, Metadaten, Format und technische Checks | Luna | niedrig | Prüfbericht und kleine Korrekturen |
| Endabnahme eines neuen Seitentyps oder Templates | Sol | hoch | technische und redaktionelle Abnahme |

Luna veröffentlicht nie selbstständig. Sol darf nur veröffentlichen, wenn sämtliche Gates dieses
Dokuments bestanden sind. Eine menschliche Fachfreigabe bleibt erforderlich, sobald ein Artikel
über die bereits freigegebenen Aussagen und Quellen hinausgeht.

## Verbindliches Modellwechsel-Protokoll

Der Benutzer wechselt das Modell in Codex manuell. Deshalb muss der aktive Agent jeden Wechsel
rechtzeitig und eindeutig ankündigen. Ein modellabhängiger Schritt beginnt erst, nachdem der
Benutzer den Wechsel bestätigt hat.

Vor einem Luna-Schritt lautet der Hinweis:

> **Modellwechsel erforderlich:** Bitte jetzt zu **Luna** mit der genannten Reasoning-Stufe
> wechseln und anschließend „gewechselt“ schreiben. Der nächste Schritt ist: _[Aufgabe nennen]_.

Nach dem Luna-Schritt und vor der Rückkehr zu Sol lautet der Hinweis:

> **Luna-Schritt abgeschlossen. Modellwechsel erforderlich:** Bitte jetzt zurück zu **Sol** mit
> der genannten Reasoning-Stufe wechseln und anschließend „gewechselt“ schreiben. Der nächste
> Schritt ist: _[Aufgabe nennen]_.

Dabei gelten folgende Regeln:

1. Der Agent nennt Modell, Reasoning-Stufe und den konkreten nächsten Arbeitsschritt.
2. Der Agent beginnt den modellabhängigen Schritt nicht stillschweigend mit dem aktuellen Modell.
3. Vor dem Wechsel fasst der Agent den abgeschlossenen Stand, geänderte Dateien und offene Punkte
   so zusammen, dass das andere Modell ohne Informationsverlust fortsetzen kann.
4. Der Arbeitsstand wird zusätzlich im vorgesehenen Redaktionsprotokoll gespeichert; der Chat ist
   nicht die einzige Übergabequelle.
5. Wenn mehrere unmittelbar aufeinanderfolgende Schritte dasselbe Modell benötigen, ist kein
   erneuter Wechsel dazwischen nötig. Der Agent kündigt erst den tatsächlich nächsten Wechsel an.
6. Für rein mechanische Prüfungen, die bereits zum laufenden Arbeitspaket gehören, wird kein
   unnötiger Modellwechsel verlangt.

Die erste technische Einrichtung startet mit **Sol, Reasoning hoch**. Beim späteren wöchentlichen
Ablauf kündigt Sol vor Schritt 1 den Wechsel zu **Luna** an. Nach Schritt 4 kündigt Luna den Wechsel
zurück zu **Sol** für Auswahl, Artikelarbeit, Risikoprüfung und Veröffentlichung an. Falls Schritt 7
als eigener mechanischer QA-Lauf ausgeführt wird, wird erneut Luna angekündigt und anschließend
für Schritt 8 wieder Sol.

## Verfügbare Datenbasis

| Themenfeld | Bestand | Sinnvolle Nutzung |
| --- | ---: | --- |
| GOT | 1.006 amtliche Gebührenpositionen | Kostenbestandteile bündeln und verständlich erklären |
| Orte | 9.381 erfasste Orte | lokale Übersichten, Abdeckung und Datenlücken |
| Städte | 42 freigegebene Stadtseiten | individuelle Stadtanalysen, keine austauschbaren Listen |
| Fressnapf-Feed | 96 aktuelle Produkte | Sortimentsbeispiele und Produktmerkmale, keine Bestenlisten |
| Redaktionelle Produkte | 26 geprüfte Datensätze | belegte Eigenschaften und Auswahlhilfen |
| Reale Futterprodukte | 7 Deklarationen | Etiketten lesen, Einheiten und Fütterungsangaben erklären |
| Ergänzungsfuttermittel | 6 Datensätze | Einordnung und Kosten je festgelegter Tagesmenge |
| Versicherungen | 5 HanseMerkur-Produkte | neutrale Produktarten und Prüffragen, keine Beratung |
| Pflege | 5 Kategorien | Kaufkriterien, Anwendung und Fehlkäufe |
| Spielzeug | 6 Kategorien | Einsatzart, Tiergröße, Material und Nutzungssituation |
| Reise | 4 Zielländer, Hund und Katze | geprüfte EU-Grundregeln und nationale Besonderheiten |
| Kommunale Daten | Berlin und Hamburg | Hundewiesen und lokale Datenquellen |

Ein einzelner Datensatz ist kein Artikel. GOT-Positionen, Orte oder Produkte werden immer zu einem
Thema zusammengeführt. So entstehen nützliche Ratgeber statt massenhaft ähnlicher Seiten.

## Einmalige technische Einrichtung

Diese Schritte werden zuerst in einer eigenen Codex-Aufgabe mit **Sol, Reasoning hoch** umgesetzt.

1. Eine Content Collection für Ratgeber anlegen, statt neue Artikel direkt in Komponenten zu
   schreiben.
2. Ein Artikelschema mit mindestens diesen Feldern definieren:
   `title`, `description`, `slug`, `publishedAt`, `updatedAt`, `status`, `primaryIntent`,
   `animal`, `topicCluster`, `sourceIds`, `dataFiles`, `reviewLevel`, `indexable`,
   `relatedTools`, `relatedArticles` und `affiliateContext`.
3. Einen zentralen Artikel-Renderer mit Breadcrumbs, Quellenblock, Aktualitätsangabe,
   Inhaltsnavigation und verwandten Inhalten bauen.
4. Für jeden Artikel automatisch eindeutige Metadaten, Canonical, Article- und
   Breadcrumb-Structured-Data erzeugen.
5. Qualitätsprüfungen ergänzen, die fehlende Quellen, doppelte Titel, zu ähnliche Einleitungen,
   veraltete Daten, ungültige interne Links und nicht freigegebene Affiliate-Aussagen verhindern.
6. Die Sitemap-Auswahl so erweitern, dass das Gesamtbudget von 400 bis 500 indexierbaren URLs
   bestehen bleibt. Ein neuer starker Ratgeber ersetzt bei Bedarf eine schwächere GOT-Einzelseite.
7. Einen Entwurfsstatus einführen. Entwürfe erscheinen weder in Sitemap noch Seitensuche und
   erhalten `noindex`.
8. Ein wöchentliches Redaktionsprotokoll unter `content-data/editorial-runs/` definieren. Es
   speichert Kandidaten, verwendete Quellen, Prüfergebnis und Veröffentlichungsentscheidung.
9. Unit-, Build-, SEO-, Link-, Accessibility- und Browsertests für den neuen Seitentyp ergänzen.
10. Drei Pilotartikel aus unterschiedlichen Clustern veröffentlichen und ihre Darstellung auf
    Smartphone, Tablet und Desktop kontrollieren.

Abnahmekriterium: Die drei Pilotartikel bestehen alle bestehenden Produktionsgates, sind in der
Seitensuche auffindbar, haben eindeutige Canonicals und verändern das Indexbudget nicht über 500.

## Wöchentlicher Ablauf

### Schritt 1: Datenänderungen erfassen – Luna, niedrig

Luna vergleicht den aktuellen Stand mit dem letzten Redaktionslauf. Es werden nur Änderungen aus
versionierten Projektdateien verwendet. Das Ergebnis nennt neue, geänderte, veraltete und wegen
fehlender Freigabe gesperrte Datensätze.

### Schritt 2: Zehn Themenkandidaten bilden – Luna, mittel

Jeder Kandidat enthält:

- eine konkrete Nutzerfrage,
- den geplanten Mehrwert,
- benötigte Projektdateien und Quellen-IDs,
- mögliche interne Links,
- Aktualitäts- und Risikostufe,
- Abgrenzung zu vorhandenen Seiten,
- empfohlenes Format, etwa Ablauf, Entscheidungshilfe, Datenauswertung oder Checkliste.

Luna darf keine Suchvolumina, Preise, Diagnosen, Rechtsfolgen oder Produkteigenschaften erfinden.

### Schritt 3: Drei bis fünf Themen auswählen – Sol, mittel

Sol bewertet die Kandidaten nach:

1. belegbarem Nutzwert,
2. eigenständigem Suchzweck,
3. Aktualität und Quellenqualität,
4. Unterschied zu vorhandenen Seiten,
5. passender interner Verlinkung,
6. Risiko medizinischer, rechtlicher oder finanzieller Fehlinterpretation,
7. Auswirkung auf das Indexbudget.

Freigegeben werden grundsätzlich drei Artikel. Kandidat vier und fünf benötigen einen deutlich
anderen Suchzweck und vollständig aktuelle Quellen.

### Schritt 4: Quellenpakete erstellen – Luna, mittel

Luna extrahiert für jedes Thema ausschließlich die benötigten Fakten. Jede Aussage erhält:

- Quelle oder Projektdatei,
- Datenstand,
- zulässige Formulierung,
- bekannte Einschränkung,
- Kennzeichnung, ob eine erneute externe Primärquellenprüfung nötig ist.

Wörtliche Übernahmen aus Händler- oder Fachtexten werden vermieden. Herstellerangaben bleiben
dem Hersteller zugeordnet.

### Schritt 5: Artikel schreiben – Sol, mittel

Sol schreibt aus dem freigegebenen Briefing. Der Aufbau richtet sich nach der Nutzerfrage und darf
nicht jede Woche demselben Schema folgen. Zulässige Formen sind unter anderem:

- Antwort mit anschließendem Rechenbeispiel aus amtlichen Positionen,
- Schritt-für-Schritt-Ablauf,
- Entscheidungsmatrix,
- lokale Datenauswertung,
- Fehleranalyse,
- Checkliste vor Kauf oder Reise,
- Vergleich von Eigenschaften ohne Rangliste.

GOT-Artikel nennen keine scheinbar vollständige Rechnung, wenn Untersuchung, Material,
Arzneimittel, Wegegeld, Notdienst oder weitere Leistungen fehlen können. Versicherungsartikel
geben keine individuelle Empfehlung. Gesundheitsartikel stellen keine Diagnose und ersetzen
keine Tierarztpraxis.

### Schritt 6: Fachliche Risikoprüfung – Sol, hoch

Sol prüft jede Aussage gegen das Quellenpaket. Bei Recht, Reise, Gesundheit, GOT und Versicherung
wird zusätzlich geprüft:

- Ist die Primärquelle für den Veröffentlichungstag aktuell?
- Behauptet der Text mehr als die Quelle?
- Werden variable Kosten als fest dargestellt?
- Könnte eine allgemeine Information wie eine persönliche Empfehlung wirken?
- Fehlt ein wesentlicher Kosten-, Ausnahme- oder Geltungsbestandteil?

Unklare Aussagen werden entfernt oder der Artikel bleibt Entwurf. Es werden keine Lücken durch
plausibel klingende Ergänzungen geschlossen.

### Schritt 7: Technische und sprachliche QA – Luna, niedrig

Luna prüft Rechtschreibung, Überschriftenhierarchie, Linkziele, Metadaten, Alt-Texte,
Quellennachweise, mobile Zeilenumbrüche und wiederholte Formulierungen. Sie führt die vorgesehenen
Tests aus und behebt klar mechanische Fehler.

### Schritt 8: Endabnahme und Veröffentlichung – Sol, mittel

Sol prüft den fertigen Diff, die Testergebnisse, die gerenderte Seite und das Indexbudget. Erst
dann wird gemergt und veröffentlicht. Anschließend werden Canonical, Statuscode, Structured Data,
interne Links und mobile Darstellung auf der Produktionsdomain erneut kontrolliert.

## Zwölf-Wochen-Plan mit 36 Kernartikeln

Die Reihenfolge kann sich ändern, wenn Daten oder Primärquellen aktualisiert werden. Die drei
Kernartikel je Woche bilden die verbindliche Basis. Ein optionaler vierter oder fünfter Artikel
wird aus dem Kandidatenpool der Woche gewählt.

| Woche | Artikel 1 | Artikel 2 | Artikel 3 |
| ---: | --- | --- | --- |
| 1 | Wie setzt sich eine Tierarztrechnung nach GOT zusammen? | GOT-Faktor 1 bis 3: Was verändert sich? | Allgemeine Untersuchung beim Hund: mögliche Rechnungsbestandteile |
| 2 | Beratung ohne Untersuchung: Was steht in der GOT? | Ohrenuntersuchung: Welche Leistungen können zusätzlich anfallen? | Zahnbehandlung: Warum eine einzelne GOT-Position selten die Gesamtrechnung ist |
| 3 | Notdienst beim Tierarzt: Welche Kostenarten können hinzukommen? | Diagnostik mit Röntgen oder Ultraschall: Position, Faktor und Nebenkosten | Blut-, Harn- und Laborleistungen verständlich einordnen |
| 4 | EU-Heimtierausweis: Welche Angaben müssen geprüft werden? | Mikrochip vor der Tollwutimpfung: Warum die Reihenfolge wichtig ist | Tollwutimpfung vor der Reise: Fristen ohne Scheinsicherheit erklären |
| 5 | Mit Hund oder Katze nach Österreich | Mit Hund oder Katze nach Frankreich | Italien und Niederlande: Welche Angaben der Reisecheck abdeckt |
| 6 | Tierärzte und Tierbedarf in Berlin: Was die Ortsdaten zeigen | Hamburger Hundeauslaufzonen aus kommunalen Daten | Wie vollständig sind lokale Tierverzeichnisse wirklich? |
| 7 | Transportbox für Katzen richtig ausmessen und vorbereiten | Wohnungskatzen beschäftigen: Abwechslung ohne Reizüberflutung | Fellpflege bei Katzen: Werkzeug nach Fellstruktur auswählen |
| 8 | Hundespielzeug für starke Kauer: belastbare Merkmale statt Haltbarkeitsversprechen | Beschäftigungsspielzeug: Schwierigkeit und Nutzungssituation abstimmen | Apportier- oder Wasserspielzeug: Auswahl nach Einsatzort |
| 9 | Alleinfuttermittel und Ergänzungsfuttermittel unterscheiden | Futterdeklarationen lesen: Was tatsächlich auf der Packung steht | Packungspreis oder Tageskosten: Futter sinnvoll vergleichen |
| 10 | Ergänzungsfuttermittel richtig einordnen | Kosten je Tagesmenge berechnen, ohne eine Fütterung zu empfehlen | Wann Produktangaben keine tierärztliche Einschätzung ersetzen |
| 11 | Bürste, Kamm oder Pflegehandschuh? | Krallenpflege-Werkzeug auswählen und Grenzen erkennen | Zahnpflegezubehör für Hund und Katze: mechanische Produkte vergleichen |
| 12 | Rampe und Einstiegshilfe: Maße und Höchstlast prüfen | OP- oder Tierkrankenversicherung: Produktarten unterscheiden | Versicherungsbedingungen prüfen, ohne eine Tarifempfehlung vorzutäuschen |

## Qualitäts- und Veröffentlichungsregeln

Ein Artikel wird nur indexiert, wenn alle folgenden Punkte erfüllt sind:

- eigenständige Nutzerfrage und eindeutiger Seitentitel,
- mindestens eine Primärquelle oder ein freigegebener amtlicher Datensatz,
- jede konkrete Zahl lässt sich auf eine Quelle oder Berechnung zurückführen,
- keine erfundenen Preise, Bewertungen, Testergebnisse oder Rechtsaussagen,
- keine Diagnose, Behandlungsempfehlung oder individuelle Versicherungsberatung,
- kein austauschbarer Stadt- oder Produkttext,
- mindestens zwei sinnvolle interne Links und höchstens ein kleiner Werbehinweis pro Seite,
- verständliche Quellen- und Aktualitätsangabe am Seitenende,
- mobile Darstellung ohne Überlauf, Einzelbuchstaben oder unlesbare Karten,
- eindeutiger Canonical, vollständige Metadaten und gültige strukturierte Daten,
- Gesamtzahl indexierbarer URLs bleibt zwischen 400 und 500,
- Typecheck, Lint, Unit-Tests, Build, Linkprüfung, SEO-Gates, Accessibility und Browser-Smoke sind
  erfolgreich.

## Prompt für Luna: Wochenvorbereitung

```text
Arbeite im Repository petatlas für deinhaustierportal.de. Bereite den nächsten
Redaktionslauf vor, veröffentliche aber nichts.

1. Lies den letzten Eintrag unter content-data/editorial-runs/ und ermittle alle
   relevanten Änderungen an GOT-, Orts-, Reise-, Pflege-, Spielzeug-, Futter-,
   Produkt- und Versicherungsdaten.
2. Erzeuge zehn eigenständige Artikelkandidaten. Jeder Kandidat braucht eine
   konkrete Nutzerfrage, einen belegbaren Mehrwert, die benötigten Dateien und
   Quellen-IDs, mögliche interne Links, Risikostufe und Abgrenzung zu bereits
   vorhandenen URLs.
3. Erfinde keine Suchvolumina, Preise, Produkteigenschaften, Diagnosen oder
   Rechtsfolgen. Kennzeichne fehlende oder veraltete Quellen ausdrücklich.
4. Prüfe vorläufig, welche Kandidaten innerhalb des Indexbudgets von 400 bis
   500 URLs liegen könnten.
5. Speichere das Ergebnis als strukturierten Entwurf für die Prüfung durch Sol.

Melde am Ende Datenänderungen, Kandidaten und konkrete Sperrgründe. Ändere
keine öffentlichen Seiten und deploye nicht.
```

## Prompt für Sol: Auswahl, Umsetzung und Veröffentlichung

```text
Arbeite im Repository petatlas für deinhaustierportal.de. Verwende den aktuellen
Luna-Redaktionsentwurf sowie ausschließlich belegte Projekt- und Primärquellen.

1. Prüfe alle Kandidaten auf eigenständigen Suchzweck, Quellenqualität,
   Aktualität, Kannibalisierung, Nutzerwert und Indexbudget.
2. Wähle drei Artikel aus. Nimm einen vierten oder fünften nur auf, wenn er eine
   klar andere Nutzerfrage beantwortet und sämtliche Quellen aktuell sind.
3. Erstelle pro Artikel ein Quellenpaket. Jede konkrete Behauptung, Zahl und
   Einschränkung muss nachvollziehbar belegt sein.
4. Schreibe die Artikel mit jeweils passender, unterschiedlicher Struktur.
   Erfinde keine Preise, Rechtsaussagen, Diagnosen, Testergebnisse oder
   Produktbewertungen. Stelle variable Kosten nicht als vollständige Rechnung
   dar und gib keine individuelle Versicherungs- oder Fütterungsempfehlung.
5. Implementiere die Artikel im vorgesehenen Artikelschema, ergänze sinnvolle
   interne Links und aktualisiere die Indexauswahl, ohne 500 indexierbare URLs
   zu überschreiten.
6. Prüfe medizinisch, rechtlich und finanziell sensible Aussagen erneut gegen
   aktuelle Primärquellen. Bei verbleibender Unsicherheit bleibt der Artikel
   Entwurf und noindex.
7. Führe Typecheck, Lint, Unit-Tests, Build, Linkprüfung, SEO-Prüfung,
   Accessibility, Browser-End-to-End und responsive Visual-QA aus.
8. Veröffentliche nur bei vollständig bestandenen Gates. Prüfe danach den echten
   Produktionsstand auf Statuscode, Canonical, Structured Data, interne Links
   und mobile Darstellung.

Berichte abschließend veröffentlichte URLs, verwendete Quellen, Testergebnisse,
den Produktionscommit und begründete Einschränkungen.
```

## Erfolgsmessung nach zwölf Wochen

Nicht die Zahl veröffentlichter Texte entscheidet über den Erfolg. Nach zwölf Wochen werden diese
Signale ausgewertet:

- Anteil indexierter Artikel und Zeit bis zur Indexierung,
- Impressionen und Klicks je Themencluster,
- Aufrufe der verknüpften Werkzeuge,
- interne Weiterklickrate,
- Artikel mit null Impressionen oder sehr kurzer Nutzung,
- notwendige Quellenkorrekturen,
- Anteil der Kandidaten, die wegen Qualitätsmängeln nicht veröffentlicht wurden.

Artikel ohne erkennbaren Nutzen werden verbessert, zusammengelegt oder deindexiert. Der zweite
Zwölf-Wochen-Plan wird aus diesen Ergebnissen abgeleitet und nicht einfach aus dem ersten kopiert.
