# Wau & Miau – konkreter Implementierungsplan zur öffentlichen Freigabe

**Website:** https://wauandmiau.de  
**Prüfstand:** 14. September 2026  
**Dokumentstatus:** Umsetzungsauftrag; nicht ausgeführt und keine rechtliche oder tierärztliche Freigabe.  
**Empfohlener Ablageort im Projekt:** `docs/IMPLEMENTIERUNG_WAUANDMIAU.md`

## 0. Ziel und Grenzen

Dieses Dokument beschreibt konkrete Änderungen an den öffentlich sichtbaren Inhalten und die noch erforderlichen Nachweise. Es enthält Ersatztexte, Betreiberfragen, technische Anforderungen, Testfälle und Abschlusskriterien.

Die betroffenen öffentlichen Seiten und mehrere Rechts- und Anbieterquellen wurden erneut aufgerufen. Nicht eingesehen wurden Repository, Cloudflare-Konto, Mailkonfiguration, Verträge und interne Prüfberichte. Die Browser-, Rechen- und Barrierefreiheitstests in diesem Dokument sind **Arbeitsaufträge, keine bereits bestandenen Tests**. Die öffentlich behaupteten internen Prüfungen sind nicht unabhängig bestätigt.

**Es wurden keine Änderungen an der Website oder am Repository vorgenommen.** Die unten vorgeschlagenen internen Dateinamen sind Zielartefakte, keine Behauptung über die bestehende Projektstruktur. Vorhandene gleichwertige Dateien sollen weiterverwendet werden.

Die Website ist bereits öffentlich erreichbar. Deshalb sollen belegte Fehler jetzt korrigiert werden; die Erfüllung tatsächlich anwendbarer Pflichten darf nicht bis zu einem späteren Marketing-Launch verschoben werden. Ein Vorschauhinweis ersetzt keine anwendbare Pflicht. Umgekehrt ist nicht jede ausstehende interne Prüfung automatisch eine gesetzliche Sperre für die gesamte Website.

**Umsetzungsregel:** Fehlende Tatsachen niemals erfinden. `OFFEN`, `null` und fehlende Nachweise werden nicht automatisch in eine Freigabe umgewandelt. Platzhalter aus diesem Dokument gehören nicht in veröffentlichte Rechtstexte.

### Prioritäten und Verantwortlichkeit

- **P0:** Belegten falschen oder zu absoluten Text mit dem nächsten Korrekturstand berichtigen.
- **P1:** Nachweis, Entscheidung oder Prüfung für den jeweils betroffenen Betrieb beziehungsweise die reguläre Funktionsfreigabe abschließen. Bei festgestelltem aktuellem Rechtsverstoß nicht auf einen späteren Launch warten.
- **P2:** Laufende Pflege nach Einführung des Prozesses; die konkreten Kontrollintervalle legt der Betreiber fest.

**B** = Betreiber/Betriebsverantwortung. **T** = technische Umsetzung und Qualitätssicherung. **R** = geeignete Rechts-/Datenschutz-/Lizenzkompetenz. **F** = geeignete tierärztliche Fachkompetenz. Mehrere Rollen können bei einer Person liegen, sofern die erforderliche Kompetenz tatsächlich besteht. Neun unterschiedliche Personen oder neun anwaltliche Unterschriften sind nicht das Ziel.

## 1. Arbeitsübersicht

Alle Kästchen bleiben offen, bis die jeweilige Umsetzung und ihr Nachweis vorliegen.

| Erledigt | ID | Priorität | Konkrete Aufgabe | Verantwortung | Abhängigkeit |
|---|---|---|---|---|---|
| [ ] | WM-01 | P0 | Tierzahl-Aussage in allen Reise-Packlisten und im Umfangstext korrigieren | T/F | Keine Betreiberangabe nötig |
| [ ] | WM-02 | P1 | GOT-Ausgabe als Berechnungsübersicht statt Rechnung kennzeichnen | T | Keine Betreiberangabe nötig |
| [ ] | WM-03 | P0 | Aussage über fehlende Serververbindung präzisieren | T | Technischen Nachweis mit WM-09 führen |
| [ ] | WM-04 | P1 | Öffentliches Quellenregister vervollständigen und Methodik angleichen | T/B | Verwendungsinventar |
| [ ] | WM-05 | P1 | Affiliate-Teilnahme und Angebotsfeed getrennt abbilden | B/T | Tatsächlicher Partnerstatus |
| [ ] | WM-06 | P1 | Impressum mit echten Unternehmensdaten abschließen | B/R/T | Betreiberbogen |
| [ ] | WM-07 | P1 | Anbieter, Verarbeitung, Verträge und Datenschutztext abgleichen | B/T/R | Hosting- und Mailnachweise |
| [ ] | WM-08 | P1 | Datenschutz für personenbezogene Verzeichniseinträge umsetzen | B/R/T | Dateninventar und Rechtsbewertung |
| [ ] | WM-09 | P1 | Netzwerk-, Speicher- und Löschtests ausführen | T | Gebauter Prüfstand |
| [ ] | WM-10 | P1 | VSBG-Entscheidung dokumentieren und gegebenenfalls Hinweis ergänzen | B/R/T | Beschäftigtenzahl und Teilnahmeentscheidung |
| [ ] | WM-11 | P1 | BFSG-Anwendbarkeit und gegebenenfalls technische Erfüllung abschließen | B/R/T | Unternehmensdaten und Angebotsumfang |
| [ ] | WM-12 | P1 | GOT-Logik fachlich prüfen und mit Sollwerten testen | F/T | Gebührenfassung und Prüfer |
| [ ] | WM-13 | P1 | Reise-Regelwerk und Grenzfälle fachlich und technisch prüfen | F/R/T | Aktuelle amtliche Regeln |
| [ ] | WM-14 | P1 | Ernährung und Ergänzungsfuttermittel gesondert prüfen | F/T | Ernährungskompetenz |
| [ ] | WM-15 | P1 | Rechte für Daten, Inhalte, Bilder, Schriften und Ausgaben belegen | B/R/T | Vollständiges Verwendungsinventar |
| [ ] | WM-16 | P1 | Aktualität, Fachfreigabe und Funktionsstatus getrennt modellieren | T/B | Bestehende Statuskonfiguration |
| [ ] | WM-17 | P1 | Produktionsdomain und technische Veröffentlichung prüfen | B/T | Domainentscheidung |
| [ ] | WM-18 | P1/P2 | Freigaben dokumentieren, Veröffentlichung testen und Pflege festlegen | B/T/R/F | Vorherige Aufgaben im betroffenen Umfang |

**Praktischer Start:** WM-01 bis WM-04 als erste Inhaltsänderung bearbeiten. Parallel sammelt der Betreiber die Angaben aus Abschnitt 3. Ein Entwickler soll nicht auf diese Angaben warten müssen, um die eindeutigen Textkorrekturen umzusetzen.

## 2. Vor dem ersten Code-Patch: tatsächliche Fundstellen ermitteln

Im Repository zuerst die Textquellen, Übersetzungsdateien, Templates, Datenkonfiguration und erzeugenden Funktionen finden. Nicht ausschließlich generierte HTML-Dateien bearbeiten: Der nächste Build würde die Korrektur sonst überschreiben.

Beispielsuche mit installiertem `ripgrep` im Projektverzeichnis:

```bash
rg -n --hidden \
  -g '!.git/**' -g '!node_modules/**' -g '!dist/**' -g '!build/**' -g '!vendor/**' \
  -e 'Ab sechs Tieren' \
  -e 'Rechnung drucken' \
  -e 'keine Verbindung zu einem Server' \
  -e 'M13-06' \
  -e 'Registryeintrag' \
  -e 'health.json' \
  .
```

Im ersten Änderungsnachweis die tatsächlichen Quelldateien den IDs WM-01 bis WM-18 zuordnen. Anschließend auch den gebauten Output prüfen. Bereits vorhandene Prüf-, Lizenz- und Freigabedokumente lesen, nicht ungeprüft durch neue Dokumentation ersetzen.

## 3. Betreiberbogen – diese Angaben müssen tatsächlich geliefert werden

Den ausgefüllten Bogen und Vertragsbelege **nicht öffentlich ausliefern**. In öffentlichen Repositories nur sachlich erforderliche, bereinigte Entscheidungen ablegen. Zugangsdaten, Kontonummern, Vertragskopien und Nachweise zu Umsätzen gehören in einen geschützten Ablageort.

| Feld | Was der Betreiber eintragen oder bestätigen muss | Benötigt für |
|---|---|---|
| Betreiberidentität | Vollständiger Name; Geschäftsbezeichnung; tatsächlich verwendete Rechtsform | WM-06 |
| Zustellanschrift | Bestätigung, dass die veröffentlichte Anschrift zutrifft und Zustellungen möglich sind | WM-06 |
| Kontakt | Überwachtes E-Mail-Postfach; tatsächlicher zusätzlicher Kontaktweg oder geprüfte alternative Kontaktlösung | WM-06/07 |
| Register | Eingetragen: ja/nein; gegebenenfalls Register, Registergericht und Nummer | WM-06 |
| Identifikationsnummern | USt-IdNr. vorhanden: ja/nein; W-IdNr. vorhanden: ja/nein; zutreffende Nummern für die rechtliche Zuordnung | WM-06 |
| Besondere Tätigkeit | Behördlich erlaubnispflichtige oder reglementierte Berufsausübung über dieses Angebot: ja/nein | WM-06 |
| VSBG-Beschäftigtenzahl | Zahl der beschäftigten Personen am **31.12.2025**; Zählweise dokumentieren | WM-10 |
| Streitbeilegung | Teilnahmeverpflichtung, verbindliche Zusage oder freiwillige Bereitschaft: jeweils ja/nein | WM-10 |
| BFSG-Unternehmensdaten | Beschäftigtenzahl nach einschlägiger Definition, Jahresumsatz oder Jahresbilanzsumme; gegebenenfalls verbundene Unternehmen berücksichtigen lassen | WM-11 |
| Geschäftsmodell | Nur Information/Affiliate oder zusätzlich eigene Bestellung, Buchung, Vermittlung, Bezahlfunktion oder andere Verbraucherverträge? | WM-10/11 |
| Cloudflare | Tatsächliche Vertragspartei, Produkte, Zusatzdienste, Protokoll-/Sicherheitseinstellungen und einschlägiger DPA/AVV | WM-07 |
| E-Mail | Tatsächlicher eigener Anbieter, Vertragspartei, Auftragsverarbeitung, Speicher-/Löschkonzept und Drittlandbezüge | WM-07 |
| Partnerprogramm | Berechtigung zur gegenwärtigen Teilnahme, zugeordnete Website und zulässige Linkformate; separate Freigabe für einen Daten-/Preisfeed | WM-05 |
| Fachprüfer | Wer prüft GOT, Reisen und Ernährung? Je Bereich Kompetenz, Umfang und tatsächlich geprüftes Versionspaket nennen | WM-12/13/14 |
| Domain | Ist `https://wauandmiau.de` die gewählte Hauptadresse? Welche weiteren Hosts werden betrieben? | WM-17 |

**Nicht veröffentlichen:** normale Steuernummer, persönliche Steuer-ID, Kontozugänge oder wirtschaftliche Nachweise. Aus einer fehlenden öffentlichen USt-IdNr. folgt ohne Kenntnis der tatsächlichen Zuteilung noch kein feststehender Fehler. Maßgeblich ist die konkrete Pflicht nach § 5 DDG. [R01]

## 4. Konkrete Änderungen

### WM-01 – Tierzahl: Toolgrenze nicht als absolutes Verbot darstellen

**Befund:** In den Länder-Packlisten steht eine pauschale Aussage, wonach sechs Tiere keine private Verbringung mehr seien. Für nichtkommerzielle Verbringungen können Ausnahmen von der Fünfergrenze bestehen. Die Anwendung darf diese Fälle ausschließen, aber nicht allein wegen der Tierzahl für unzulässig erklären. [W06] [W07] [W08] [W09] [R15]

**Betroffene URLs:**

```text
/de-de/reisecheck/
/de-de/reisecheck/frankreich/
/de-de/reisecheck/oesterreich/
/de-de/reisecheck/italien/
/de-de/reisecheck/niederlande/
```

**Umsetzen:**

- [ ] Den folgenden alten Satz in sämtlichen gemeinsamen Textbausteinen und Ausgaben entfernen:

```text
Ab sechs Tieren ist es keine private Verbringung mehr.
```

- [ ] Den entsprechenden Packlistenpunkt vollständig durch folgenden Text ersetzen:

```text
Anzahl der Tiere prüfen. Dieser Check erfasst höchstens fünf Tiere. Für mehr
als fünf Tiere gelten zusätzliche Voraussetzungen; unter bestimmten Bedingungen
bestehen Ausnahmen, etwa bei Wettbewerben oder Ausstellungen. Solche Fälle
werden hier nicht geprüft.
```

- [ ] Auch den Ausschlussgrund auf der Reisecheck-Hauptseite auf eine **Umfangsgrenze dieser Anwendung** umformulieren. Nicht nur die Packlisten korrigieren.
- [ ] Bei Eingabe von mehr als fünf Tieren `nicht im Prüfumfang` ausgeben. Nicht `verboten`, `illegal` oder `nicht privat` allein aus dieser Zahl ableiten.
- [ ] Zählhinweise für private Fahrzeuge und öffentliche Verkehrsmittel erhalten und im Fachreview überprüfen. Keine pauschale Zählung „pro Halter“ neu einführen.
- [ ] Gemeinsame Packlistentexte an einer Stelle pflegen, damit die vier Länder nicht auseinanderlaufen.

**Abnahme:** Alte Aussage fehlt im gesamten öffentlich erzeugten Output. Eingabe `6` führt zu einer Umfangsgrenze ohne positives Ergebnis und ohne pauschale Rechtsverneinung. Druckausgaben enthalten dieselbe korrigierte Aussage.

### WM-02 – GOT-Ausgabe und Ausdruck eindeutig benennen

**Befund:** Der Rechner bezeichnet den Ergebnisbereich und den Druckknopf als Rechnung, obwohl er keine Abrechnung einer behandelnden Praxis erstellt. Die Fachfreigabe ist öffentlich als offen gekennzeichnet. [W05]

**Umsetzen auf `/de-de/tierarztkosten/`:**

| Element | Zieltext |
|---|---|
| Überschrift über den ausgewählten Positionen | `Berechnungsübersicht` |
| Druckknopf | `Berechnungsübersicht drucken` |
| Titel im Ausdruck | `Unverbindliche Berechnungsübersicht zu Tierarztgebühren` |

**Zusatz direkt beim Ergebnis und im Ausdruck:**

```text
Diese Übersicht ist keine Rechnung einer Tierarztpraxis und kein verbindlicher
Kostenvoranschlag. Sie enthält nur die ausgewählten Leistungen. Welche Leistungen
notwendig und gemeinsam abrechenbar sind und welche weiteren Kosten anfallen,
klärt die behandelnde Praxis.
```

- [ ] Nettobeträge, Faktor, Menge, angenommene Umsatzsteuer, gegebenenfalls Notdienstgebühr und Bruttosumme getrennt darstellen.
- [ ] Quellenfassung, Abrufdatum und fachlichen Status auch im Ausdruck ausgeben.
- [ ] Den bestehenden Hinweis zur fehlenden Fachprüfung nicht durch die Umbenennung entfernen.
- [ ] Bei leerer Auswahl keinen scheinbaren Gesamtpreis für eine Behandlung ausgeben.

**Abnahme:** Oberfläche und Ausdruck sind konsistent. Es gibt keine vom Tool erzeugte scheinbare Praxisrechnung. Dieser Schritt ist eine Klarstellung; er beweist noch keine korrekte Rechenlogik.

### WM-03 – Datenschutzaussage auf „Mein Tier“ präzisieren

**Befund:** `/de-de/mein-tier/` behauptet allgemein eine fehlende Serververbindung. Das ist für eine geladene Website zu absolut. Die relevante Zusicherung betrifft die Profilangaben, nicht das Laden der Website. [W04]

**Ersetzung für den betreffenden Einleitungsteil:**

```text
Du brauchst dafür kein Nutzerkonto. Die Profilfunktion ist für eine lokale
Verarbeitung im Browser ausgelegt. Informationen zur Verarbeitung beim Laden
der Website findest du in unserer Datenschutzerklärung.
```

**Nach bestandenem WM-09 zusätzlich verwenden:**

```text
Die eingegebenen Profilangaben werden nicht an unseren Server oder an Händler
übermittelt. Erst mit „Auf diesem Gerät speichern“ legst du sie dauerhaft in
diesem Browser ab. Ungespeicherte Änderungen gehen beim Neuladen verloren.
```

- [ ] Den letzten Absatz erst als bestätigte Zusicherung veröffentlichen, wenn Profiländerung, Speicherung, Übernahme in andere Werkzeuge und Export geprüft wurden.
- [ ] Bei Abweichungen zuerst die Datenübermittlung beseitigen oder die gesamte Verarbeitung rechtlich und textlich neu bewerten. Nicht lediglich eine widersprechende Aussage an anderer Stelle ergänzen.
- [ ] Hinweise auf unverschlüsselten Export und fehlende geräteübergreifende Synchronisierung erhalten, soweit sie technisch zutreffen.

**Abnahme:** Keine pauschale Zusicherung einer serverlosen Website. Jeder konkrete Satz zur lokalen Verarbeitung ist durch einen protokollierten Test gedeckt.

### WM-04 – Quellenregister und Methodik vervollständigen

**Befund:** Das öffentliche Register führt 22 Quellen und besteht vor allem aus strukturierten Geodaten und Gebührenquellen. Reise- und Ernährungsseiten verwenden weitere Referenzen. Für Kartenkacheln ist noch ein späterer Registereintrag angekündigt. Die Methodik beschreibt die Liste umfassender, als diese tatsächlich ist. [W02] [W10] [W11]

**Implementierungsentscheidung:** Die bestehende Registry beibehalten und um die Kategorien `Datensatz`, `redaktionelle Fachquelle` und `externer Dienst` erweitern. Alternativ getrennte Register verwenden, aber alle drei öffentlich verlinken und die Methodik entsprechend einschränken.

**Einträge ergänzen beziehungsweise zuordnen:**

- [ ] OSM-Kacheldienst, getrennt von Geofabrik-/OSM-Datenextrakten, einschließlich Nutzungsbedingungen und Datenschutzreferenz.
- [ ] Tatsächlich verwendete EU-Rechtsakte und EU-Reiseinformationen; jede verwendete amtliche Länderquelle.
- [ ] Tatsächlich verwendete Ernährungsquellen, insbesondere die auf der Ergänzungsfuttermittelseite bereits benannten Organisationen.
- [ ] Tatsächlich genutzte Herstellerquellen mit konkreten Seiten, nicht nur dem Namen des Herstellers.
- [ ] Veraltete Zukunftsaussage zum Kartendienst entfernen und auf den vorhandenen Eintrag verweisen.

**Mindestfelder je Eintrag:** eindeutige ID, Titel, Herausgeber, Quelladresse, Verwendung, verwendete Fassung, letzte tatsächliche Prüfung, Rechtebasis, erlaubte Ausgabeformen und Prüfnachweis. Bei einem externen Dienst zusätzlich die ausgelöste Verarbeitung und Aktivierungsbedingung zuordnen.

**Textvorschlag für die Methodik nach Umsetzung:**

```text
Unser Quellenverzeichnis unterscheidet übernommene Datensätze, redaktionelle
Fachquellen und externe Dienste. Die Einträge nennen Herkunft, Verwendung und
Prüfstand. Eine Quellenangabe ist weder eine fachliche Freigabe unserer Auswertung
noch automatisch eine Erlaubnis zur Übernahme geschützter Inhalte.
```

**Abnahme:** Jede inhaltlich verwendete Quelle ist zugeordnet. Anzahl und Status werden aus den jeweiligen Registern erzeugt und nicht als unabhängige Zahlen hart codiert. Ein bloßer Link auf eine Quelle bleibt von der Übernahme ihrer Inhalte unterscheidbar.

### WM-05 – Partnerprogramm und Angebotsfeed auseinanderhalten

**Befund:** Die Website kennzeichnet Amazon-Partnerlinks, während die Datenstandsseite einen fehlenden freigegebenen Partnerprogrammstatus ausweist. Das kann eine interne Feed-Freigabe meinen, ist öffentlich aber nicht eindeutig. Es ist kein Beweis für eine unerlaubte tatsächliche Teilnahme. [W03] [W10] [R19]

**Umsetzen:**

- [ ] Betreiber bestätigt den aktuellen Teilnahme-/Vertragsstatus, die zugeordnete Website und die zulässigen Linkformate anhand des Kontos und der Vertragsunterlagen.
- [ ] Zwei getrennte Statuswerte verwenden: `affiliateLinkStatus` und `offerFeedStatus`. Diese Namen sind Vorschläge; vorhandene gleichwertige Felder weiterverwenden.
- [ ] Eine ungeklärte Feed-Nutzung sperrt den Feed, nicht automatisch nachgewiesen zulässige einfache Partnerlinks.
- [ ] Eine ungeklärte Partnerberechtigung nicht im Code als bestätigt setzen. Die betroffenen monetarisierten Links bis zur Klärung deaktivieren oder den Betreiber die zulässige Alternative festlegen lassen.

**Nur wenn Partnerlinks zulässig bestätigt und kein Feed aktiv ist, diesen Datenstandstext verwenden:**

```text
Partnerlinks und Angebotsdaten werden getrennt verwaltet. Die freigegebenen
Partnerlinks sind aktiv. Ein automatischer Feed für Preise, Verfügbarkeit oder
Produktangebote ist nicht aktiviert; entsprechende Angebotsdaten werden hier
nicht ausgeliefert.
```

- [ ] Den vorhandenen Amazon-Partnerstatus-Hinweis erhalten, soweit die Teilnahme besteht; Werbung am betroffenen Link erkennbar halten.
- [ ] Links anhand eines festen Parameterschemas erzeugen. Keine Profilwerte, Rechenergebnisse oder individuellen Nutzerkennungen anhängen.
- [ ] Tatsächliche Produktsuche nicht als bestätigte Verfügbarkeit eines konkreten Produkts darstellen.

**Abnahme:** Footer, Methodik, Datenschutz, Datenstand und technische Linkkonfiguration beschreiben denselben belegten Zustand. Keine Amazon-Anfrage vor Nutzeraktion durch diese Einbindung; siehe WM-09.

### WM-06 – Impressum abschließen, ohne Angaben zu erfinden

**Befund:** Name, Einzelunternehmensbezeichnung, Anschrift, E-Mail und redaktionell Verantwortlicher sind vorhanden. Die tatsächliche Richtigkeit, zusätzliche bedingte Angaben und die Kontaktlösung bleiben zu bestätigen. [W01]

**Umsetzen:**

- [ ] Bestehende Angaben mit dem Betreiberbogen abgleichen; ein Einzelunternehmen nicht in eine erfundene Gesellschaft umbenennen.
- [ ] Vorhandene USt-IdNr. und/oder W-IdNr. nach § 5 Abs. 1 Nr. 6 DDG rechtlich zuordnen und die einschlägige Angabe ergänzen.
- [ ] Registerdaten nur bei tatsächlicher Eintragung ergänzen.
- [ ] Angaben zu Aufsicht oder reglementiertem Beruf nur bei tatsächlicher Anwendbarkeit ergänzen. Ein Informationsportal ist nicht automatisch eine tierärztliche Praxis.
- [ ] Eine praktikable Kontaktlösung festlegen. Die einfache Umsetzungsoption ist eine tatsächlich betreute geschäftliche Telefonnummer zusätzlich zur E-Mail; alternativ die konkrete andere Lösung prüfen lassen. Eine Telefonnummer wird hier nicht als ausnahmslos zwingend behauptet.
- [ ] E-Mail-Erreichbarkeit vom Betreiber durch Empfang und Antwort testen lassen. Eine angezeigte Adresse allein ist kein Zustelltest.
- [ ] Impressum aus allen Seitentypen, einschließlich Fehlerseiten und mobilen Ansichten, erreichbar halten.

**Abnahme:** Jede veröffentlichte Angabe ist bestätigt; jede bedingte Pflicht ist mit `zutreffend und umgesetzt` oder `nicht zutreffend mit Begründung` dokumentiert. Keine Platzhalter und keine private Steuer-ID. Rechtsgrundlage: [R01].

### WM-07 – Datenschutztext aus der tatsächlichen Verarbeitung ableiten

**Befund:** Die Erklärung behandelt bereits Hosting, Karten, Standort, lokale Speicherung und Partnerlinks. Damit ist kein kompletter Austausch erforderlich. Offen ist insbesondere der Abgleich mit den realen Diensten, Verträgen, Speicherbedingungen und der eigenen Mailverarbeitung. [W12]

**Zuerst intern ausfüllen:**

| Verarbeitung | Konkreter Dienst/Vertragspartei | Daten und Zweck | Rechtsgrundlage | Empfänger/Drittlandgrundlage | Frist oder belastbare Löschkriterien | Nachweis |
|---|---|---|---|---|---|---|
| Auslieferung/CDN | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN |
| Sicherheits-/Fehlerprotokolle | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN |
| Sonstige aktivierte Hosting-Funktionen | OFFEN oder nicht eingesetzt | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN |
| Empfang/Versand von E-Mails | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN |
| Externe Kartenbilder | Tatsächlichen Dienst bestätigen | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN |
| Standort und lokale Speicherung | Technische Umsetzung bestätigen | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN |

**Dann umsetzen:**

- [ ] Alle tatsächlich aktivierten Cloudflare-Dienste erfassen, einschließlich etwaiger zusätzlicher Analytics-, Sicherheits- oder Fehlerdienste. Nicht unterstellen, dass sie vorhanden oder abwesend sind.
- [ ] Anwendbarkeit und Einbeziehung des einschlägigen DPA/AVV belegen. Ein öffentlich verlinkter Cloudflare-DPA allein bestätigt das konkrete Vertragsverhältnis nicht. [R05]
- [ ] Drittlandübermittlungen anhand der tatsächlichen Parteien, Dienste und zum Prüfzeitpunkt gültigen Instrumente bewerten; keinen pauschalen Transferbaustein ungeprüft übernehmen.
- [ ] Logs nach Datenarten unterscheiden. Konkrete Fristen nennen, soweit feststellbar; ansonsten tatsächlich anwendbare, verständliche Kriterien. Keine frei erfundene 7-, 14- oder 30-Tage-Frist einsetzen.
- [ ] Den eigenen Mailanbieter intern bestimmen. In der Erklärung die tatsächliche Verarbeitung zutreffend darstellen; Empfängerkategorien können rechtlich genügen, eine namentliche Nennung ist nicht pauschal immer Pflicht.
- [ ] Bestehende Abschnitte gezielt aktualisieren und WM-08 ergänzen. Der Verantwortliche, Betroffenenrechte und Beschwerdeweg müssen konsistent bleiben.
- [ ] Gesondert bewerten, ob die angenommene Vertragsgrundlage für lokale Gratiswerkzeuge tatsächlich trägt. Art. 6 Abs. 1 lit. b DSGVO nicht allein wegen eines Speichern-Knopfs unterstellen.

**Nicht ausreichend:** lediglich das Datum ändern, einen Generator einsetzen oder „keine Cookies“ schreiben. Informationen, Rechtsgrundlage und tatsächliche Verarbeitung müssen zusammenpassen. [R03] [R04] [R06]

**Abnahme:** Vollständige interne Verarbeitungstabelle, zugehörige Nachweise, aktualisierte Erklärung und erfolgreiches WM-09. Nicht benötigte oder nicht begründbare zusätzliche Verarbeitungen deaktivieren, statt sie ungeprüft weiterzuführen.

### WM-08 – Personenbezogene Daten im Tierarztverzeichnis berücksichtigen

**Befund:** Die Karte zeigt auch berufliche Angaben namentlich benannter Personen. Die Besucherdatenschutzerklärung behandelt diese Veröffentlichung nicht als eigenen Vorgang. Daten über juristische Personen und personenbezogene Daten natürlicher Personen müssen unterschieden werden. [W13] [W12]

**Umsetzen:**

- [ ] Öffentlich ausgelieferte Felder inventarisieren: Namen, Praxisbezeichnung, Geschäftsanschrift, berufliche Kontaktdaten und Quellenkennungen. Festhalten, welche Felder tatsächlich personenbezogen sind.
- [ ] Rechtsgrundlage prüfen. Bei berechtigten Interessen Zweck, Erforderlichkeit und Interessenabwägung dokumentieren; öffentliche Auffindbarkeit oder OSM-Lizenz nicht als alleinige Begründung verwenden.
- [ ] Art.-14-Informationspflicht einschließlich Fristen und einer möglichen Ausnahme konkret bewerten: grundsätzlich innerhalb angemessener Frist, spätestens einen Monat nach Datenerhalt; gegebenenfalls schon bei der ersten Kommunikation oder Offenlegung. Nicht pauschal einen Monat ab Veröffentlichung ansetzen. Eine öffentliche Datenschutzseite ersetzt nicht automatisch die gegebenenfalls erforderliche individuelle Information. [R03] [R04]
- [ ] Abschnitt `Daten zu Praxen und anderen Verzeichniseinträgen` ergänzen: Herkunft, Datenkategorien, Veröffentlichung, Rechtsgrundlage, Empfänger, Speicherkriterien sowie Berichtigung/Widerspruch und sonstige einschlägige Rechte.
- [ ] Bei der Herkunft konkret die tatsächlich verwendete Quelle und deren öffentlichen Charakter nennen. Auch öffentliche JSON-Ausgaben und Suchmaschinenauffindbarkeit in die Bewertung einbeziehen.
- [ ] An jedem Eintrag einen erreichbaren Weg `Eintrag berichtigen oder Datenschutzanfrage stellen` anbieten; Eintrags-ID und Seitenadresse dürfen vorbefüllt werden, keine unnötigen zusätzlichen personenbezogenen Angaben verlangen.
- [ ] Einen internen Berichtigungs-/Sperrmechanismus vor dem Export anwenden. Eine erforderliche Korrektur oder Entfernung muss alle kontrollierten HTML-, JSON-, Suchindex- und Cache-Ausgaben erfassen und darf beim nächsten Import nicht verloren gehen.
- [ ] Beschwerden sachlich prüfen. Weder jede Anfrage blind löschen noch pauschal wegen des öffentlichen Ursprungs ablehnen.

**Abnahme:** Dokumentierte rechtliche Entscheidung, passender Informationsprozess und erfolgreicher Test mit einem synthetischen Eintrag: Korrektur/Entfernung wirkt in allen betroffenen Ausgaben und übersteht einen erneuten Import.

### WM-09 – Technische Datenschutzversprechen testen

**Zweck:** Die Aussagen der Website zur Datenübertragung und lokalen Speicherung unabhängig vom Text überprüfen. Das sind eigene Abnahmekriterien, keine Behauptungen über bereits gefundene technische Fehler.

**Prüfumgebung:** frisches Browserprofil; Erweiterungen deaktiviert; Site-Daten zunächst leer; Netzwerkaufzeichnung über Navigation hinweg erhalten; Ergebnisse mit Build-/Commitkennung protokollieren. Keine echten Tier- oder Halterdaten verwenden.

| Test | Durchführung | Erwartung |
|---|---|---|
| DS-01 | Startseite, Rechner, Reisecheck und Profil ohne Interaktion laden | Sämtliche Zielhosts sind inventarisiert; keine unerklärten Tracker, Händlerabrufe oder Drittressourcen |
| DS-02 | Profil mit dem eindeutigen Testwert `WM_TEST_ONLY_914` ausfüllen, nicht speichern | Testwert erscheint in keinem Request, keiner URL und keinem persistenten Anwendungsspeicher |
| DS-03 | Speichern auslösen und neu laden | Speicherung erfolgt erst durch die dafür vorgesehene Aktion; Profil wird lokal wiederhergestellt |
| DS-04 | Profil in Rechner/Finder übernehmen | Keine Übertragung der Profilwerte an Hosting, Händler oder andere Dritte |
| DS-05 | Gespeicherten Stand löschen und neu laden | Der vom Löschknopf versprochene Datenumfang ist tatsächlich gelöscht; getrennte Speicherbereiche sind verständlich benannt |
| DS-06 | Export und Import mit synthetischer Datei durchführen | Keine Dateiübertragung; Exportwarnung zutreffend; ungültige Importdaten erzeugen einen verständlichen Fehler |
| DS-07 | Karte öffnen, ohne Kartenbilder anzufordern | Keine Kartenkachel-Anfrage; Ortsliste funktioniert weiterhin |
| DS-08 | Kartenanzeige ausdrücklich aktivieren, danach Seite neu laden | Anfragen nur an dokumentierte Hosts; sichtbare Attribution; Aktivierung entspricht der veröffentlichten Sitzungsaussage |
| DS-09 | Standort verweigern, dann optional mit Testposition erlauben | Kein automatischer Berechtigungsdialog; Ablehnung ist benutzbar; keine unerwartete Speicherung/Übertragung der Koordinaten |
| DS-10 | Partnerlink untersuchen und gezielt öffnen | Keine Vorabanfrage durch Skript/Bild/Prefetch; keine individuellen Profilparameter im Link |
| DS-11 | Merkliste und Packlisten speichern/zurücksetzen | Bedienhandlung, Speicherumfang und Löschverhalten entsprechen den Hinweisen |
| DS-12 | Quelltext und Response-Header auf eingebundene Ressourcen prüfen | Keine undokumentierten externen Schriften, Bilder, Beacons, Vorverbindungen oder Skripte |

**Umsetzungshinweise:**

- [ ] Vorverbindungen und Prefetches zu optionalen Drittanbietern ebenfalls prüfen, nicht nur sichtbare Skripte.
- [ ] Jede Endgerätespeicherung getrennt auf Erforderlichkeit prüfen. Kein Cookie-Banner allein deshalb ergänzen, weil `localStorage` verwendet wird; einwilligungspflichtige Zugriffe aber auch nicht als „lokal“ von der Prüfung ausnehmen. [R06]
- [ ] Die rechtliche Einordnung eines Kartenabrufs gesondert prüfen. Ein Klick oder eine Browser-Standortfreigabe ersetzt nicht automatisch sämtliche erforderlichen Informationen und Einwilligungen.
- [ ] OSM-Tile-Policy einhalten: sichtbare Attribution, reguläres Caching, keine Flächen-Vorabdownloads und gültiger Referer bei Webabrufen. Browser-Standard-User-Agent nicht künstlich fälschen. Keine globale `no-referrer`-Einstellung einführen, die dem verwendeten Kacheldienst widerspricht. [R17]
- [ ] Netzwerkprotokolle vor Weitergabe auf Cookies, Tokens und andere sensible Inhalte prüfen und bereinigen.

**Abnahme:** Für jeden Test Datum, Prüfstand, Ist-Ergebnis und Nachweis erfassen. Fehlgeschlagene Datenschutzversprechen sind vor einer bestätigten Freigabe zu beheben.

### WM-10 – Streitbeilegung nach tatsächlichem Fall entscheiden

**Befund:** Im geprüften Impressum ist kein VSBG-Abschnitt enthalten. Das ist ohne Unternehmensdaten nicht automatisch ein Rechtsverstoß. [W01]

**Entscheidungsfolge:**

1. Prüfen, welche einschlägigen Verbraucherverträge beziehungsweise Tätigkeiten tatsächlich vorliegen.
2. Teilnahmeverpflichtung oder verbindliche Teilnahmezusage feststellen.
3. Die Beschäftigtenzahl am **31.12.2025** bestimmen. § 36 Abs. 3 VSBG nimmt Unternehmer mit **zehn oder weniger** Beschäftigten von der Pflicht nach Absatz 1 Nummer 1 aus; das ist keine vollständige Ausnahme von allen Streitbeilegungspflichten. [R07]
4. Anwendbaren Website-Hinweis umsetzen und das Ergebnis intern begründen.

**Nur bei zutreffender, bestätigter Nichtteilnahme verwenden:**

```text
Verbraucherstreitbeilegung

Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer
Verbraucherschlichtungsstelle teilzunehmen.
```

Bei Verpflichtung oder verbindlicher Zusage stattdessen die tatsächlich zuständige Stelle mit Anschrift, Website und zutreffender Teilnahmeerklärung angeben. Keinen negativen Standardtext entgegen einer bestehenden Verpflichtung einsetzen.

- [ ] Einen Prozess für den gesonderten Hinweis nach einer nicht beigelegten Streitigkeit über einen Verbrauchervertrag vorsehen. § 37 VSBG betrifft die Information in Textform und wird nicht allein durch einen Footer erledigt. [R08]
- [ ] Keinen alten Pflichtlink zur eingestellten EU-OS-Plattform ergänzen; die Aufhebung der früheren Verordnung gilt seit 20.07.2025. [R09]

**Abnahme:** Begründete Entscheidung mit tatsächlichen Stichtagsdaten. Gegebenenfalls korrekter Website-Text und separater Beschwerdeprozess. `Nicht anwendbar` ist ein zulässiges Ergebnis, aber kein unbelegter Standardwert.

### WM-11 – BFSG: Anwendbarkeit, Technik und Information zusammen abschließen

**Befund:** Die Barrierefreiheitsseite hält die rechtliche Einordnung offen und benennt fehlende Screenreader- und Nutzertests. Vorhandene eigene Prüfangaben sind keine von außen bestätigte Gesamtkonformität. [W14]

**Schritt A – Entscheidung dokumentieren:**

- [ ] Prüfen, ob der tatsächliche Dienst in den BFSG-Anwendungsbereich fällt. „Kein eigener Warenverkauf“ allein erledigt insbesondere die Prüfung einer Dienstleistung im elektronischen Geschäftsverkehr nicht. [R02]
- [ ] Kleinstunternehmensausnahme prüfen: weniger als zehn Beschäftigte und entweder höchstens zwei Millionen Euro Jahresumsatz oder höchstens zwei Millionen Euro Jahresbilanzsumme; die Ausnahme für Dienstleistungen nach § 3 Abs. 3 BFSG beachten. Die Rechtsform Einzelunternehmen allein genügt nicht. [R10] [R11]
- [ ] Ergebnis als `nicht im Anwendungsbereich`, `Dienstleistung ausgenommen` oder `anwendbar` festhalten, jeweils mit Tatsachengrundlage und Datum.

**Schritt B – danach die richtige öffentliche Seite bereitstellen:**

| Entscheidung | Umsetzung |
|---|---|
| Nicht im Anwendungsbereich / ausgenommen | Freiwillige Barrierefreiheitsinformation mit tatsächlich durchgeführten Prüfungen und Kontakt; keine erfundene gesetzliche Konformitätserklärung |
| Anwendbar | Tatsächliche Anforderungen umsetzen; Informationen nach § 14 und Anlage 3 BFSG bereitstellen: Dienstleistungsbeschreibung, verständliche Nutzungserläuterung, Erfüllung der Anforderungen und zuständige Marktüberwachungsbehörde |

Für die technische Prüfung die aktuelle BFSGV heranziehen. WCAG 2.2 AA kann als Entwicklungs- und Prüfziel dienen, ist aber nicht für sich allein ein vollständiger BFSG-Nachweis. [R12] [R13] [R23] [R24]

**Schritt C – konkrete Bedienprüfungen:**

- [ ] Tastaturbedienung sämtlicher Hauptabläufe, sichtbarer Fokus, Skip-Link und keine Fokusfallen.
- [ ] Formulare mit eindeutigen Beschriftungen, verständlicher Validierung und korrekt zugeordneten Fehlermeldungen.
- [ ] Dynamische Ergebnisse, Statusänderungen und Schrittwechsel sind mit assistiver Technik wahrnehmbar.
- [ ] Vergrößerung, schmale Darstellung, Kontrast und Informationen unabhängig von reiner Farbe prüfen.
- [ ] Reale Screenreader-Läufe mit dokumentiertem Browser/Screenreader durchführen. Eine WebKit-Emulation ist nicht automatisch ein Test mit VoiceOver.
- [ ] Tests mit betroffenen Nutzern als eigene Qualitätsmaßnahme organisieren; sie nicht als bereits durchgeführt ausweisen.

**Zuständige Stelle nach dem zum Prüfstand öffentlich angegebenen Stand:**

```text
Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten
und Dienstleistungen – Anstalt öffentlichen Rechts (MLBF AöR)
Carl-Miller-Straße 6
39112 Magdeburg
E-Mail: kontakt@mlbf-barrierefrei.de
Website: https://www.mlbf-barrierefrei.de/
```

Kontaktdaten vor Veröffentlichung erneut mit der Behördenseite abgleichen. Sie sind kein Ersatz für die übrigen Informationen. [R14]

**Abnahme:** Entscheidung liegt vor. Falls anwendbar, sind Anforderungen und Pflichtinformationen tatsächlich umgesetzt. Keine Behauptung „vollständig barrierefrei“ auf Grundlage eines einzigen automatischen Tests.

### WM-12 – GOT-Rechner fachlich und rechnerisch abnehmen

**Arbeitsumfang:** Gebührenimport, Rechenlogik und Erläuterungen prüfen. Die vorhandenen regulären Faktorgrenzen 1 bis 3 und Notdienstgrenzen 2 bis 4 sind grundsätzlich belegt; daraus folgt keine Bestätigung aller Positionen und Sonderfälle. [R20] [R21]

**Umsetzen beziehungsweise nachweisen:**

- [ ] Normalisierte Gebührenpositionen gegen die amtliche Anlage vergleichen: Nummer, vollständiger Leistungstext, Betrag, Einheit, Tierartzuordnung und Sonderhinweise.
- [ ] Die derzeitige Anzahl von Positionen nicht als alleinigen Vollständigkeitsbeweis verwenden. Fehlende, doppelte und falsch zugeordnete Positionen gezielt erkennen.
- [ ] Notdienstgebühr als separate Gebühr modellieren. Sie darf in derselben Angelegenheit bei mehreren Tieren desselben Halters nicht automatisch vervielfacht werden. Entweder mehrere Angelegenheiten ausdrücklich unterstützen oder pro Berechnung klar nur eine Angelegenheit abbilden. [R21]
- [ ] Kontext nicht allein aus Uhrzeit oder Wochentag ableiten. Angaben zu regulären Sprechstunden und bestätigten Sonderfällen erhalten.
- [ ] Fachlich prüfen: Leistungskombinationen, enthaltene Teilleistungen, mengen-/zeitbezogene Einheiten, Sonderfälle und Gebührenvereinbarungen. Falls Kombinationen nicht automatisch geprüft werden, dies in Ergebnis und Ausdruck deutlich sagen. [R22] [R25]
- [ ] Umsatzsteuer und deren Anwendungsumfang separat prüfen. Die folgenden 19-Prozent-Testfälle sind Standardannahmen, keine Aussage über jede tierärztliche Abrechnung.
- [ ] Mit dezimalgenauer oder geeigneter Ganzzahl-/Bruchrechnung rechnen. Rundungsreihenfolge ausdrücklich festlegen und fachlich bestätigen; nicht zufällig vom Darstellungsformat bestimmen lassen.

**Text unmittelbar an der Notdienstgebühr:**

```text
Die Notdienstgebühr beträgt grundsätzlich 50,00 Euro netto. In derselben
Angelegenheit wird sie nur einmal angesetzt, auch wenn mehrere Tiere desselben
Halters behandelt werden. Diese Berechnung bildet eine Angelegenheit ab.
Bestätigte Abweichungen sind gesondert zu berücksichtigen.
```

Die Aussage zur einen Angelegenheit nur verwenden, wenn die Implementierung tatsächlich so begrenzt ist.

**Konkrete Solltests – jeweils GOT-Position 16 mit 23,62 Euro einfachem Nettobetrag:** [R26]

| ID | Eingabe / Annahme | Erwartetes Ergebnis |
|---|---|---|
| GOT-01 | Regulär; Menge 1; Faktor 1; 19 % USt. | 23,62 € netto; 4,49 € USt.; 28,11 € brutto |
| GOT-02 | Regulär; Menge 1; Faktor 3; 19 % USt. | 70,86 € netto; 13,46 € USt.; 84,32 € brutto |
| GOT-03 | Notdienst; Menge 1; Faktor 2; einmal 50 € netto; 19 % USt. | 97,24 € netto; 18,48 € USt.; 115,72 € brutto |
| GOT-04 | Zwei entsprechende Leistungen für zwei Tiere desselben Halters in derselben Angelegenheit; Faktor 2; einmal 50 € netto; 19 % USt. | 144,48 € netto; 27,45 € USt.; 171,93 € brutto |
| GOT-05 | Regulärer Standardfall; Faktor 0,99 oder 3,01 | Ohne ausdrücklich bestätigten Sonderfall ablehnen |
| GOT-06 | Notdienst-Standardfall; Faktor 1,99 oder 4,01 | Ohne ausdrücklich bestätigten Sonderfall ablehnen |
| GOT-07 | Menge 0, negativ, leer oder ungültige Dezimalmenge bei ganzzahliger Einheit | Verständlicher Fehler; keine irreführende Summe |
| GOT-08 | Weitere Position hinzufügen und wieder entfernen | Notdienstgebühr nicht mit der Zahl der Positionen vervielfachen |
| GOT-09 | Wechsel zwischen regulär und Notdienst | Faktorbereich und Gebühr konsistent neu validieren |
| GOT-10 | Bestätigter Sonderfall / andere Steuerannahme | Nur bewusst aktivierter Modus; Abweichung in Ergebnis und Ausdruck benannt |
| GOT-11 | Keine Position ausgewählt | Keine scheinbare vollständige Behandlungskosten-Auskunft |
| GOT-12 | Rundungs-Grenzfälle mit Nachkommastellen im Faktor | Fachlich freigegebene Referenzwerte reproduzierbar; Oberfläche und Ausdruck identisch |

**Abnahme:** Benannte fachkundige Person bestätigt den konkreten Prüfungsumfang und die geprüfte Version; technische Tests bestehen. Offene Teilgebiete bleiben ausdrücklich ausgeschlossen. Die bloße Kennzeichnung als Vorschau ist keine Abnahme.

### WM-13 – Reisecheck als begrenztes Regelwerk absichern

**Befund:** Der aktuelle Umfang ist auf bestimmte EU-Ziele, eigene erwachsene Hunde/Katzen sowie Hin- und Rückreise begrenzt. Die offene fachliche Prüfung verhindert laut Website ein positives Gesamtergebnis. Diese Grenzen nicht versehentlich durch einen Text- oder Datenpatch aufheben. [W15]

**Umsetzen beziehungsweise fachlich bestätigen:**

- [ ] Aktuell einschlägige EU-Regeln, Ausweismodelle und Übergangsregeln anhand amtlicher Fassungen prüfen. Die 2026er Rechtsakte nicht pauschal durch alte 2013er Regeln ersetzen. [R15] [R16]
- [ ] Für jede Regel Zweck, Fundstelle, Geltungszeitraum, Länderbezug, Eingaben, Ausnahmen und Ausschlussfälle dokumentieren.
- [ ] Kennzeichnung/Chipablesen und Impfchronologie, Abschluss einer mehrteiligen Erstimpfung, Wartefrist, lückenlose/verspätete Auffrischung und Gültigkeit am Reisetag abbilden.
- [ ] Gleiches Chip- und Impfdatum nicht automatisch ablehnen; die dokumentierte tatsächliche Reihenfolge muss fachlich korrekt berücksichtigt werden.
- [ ] Ausweisgültigkeit und Übergangsfälle nicht allein am Alter des Dokuments entscheiden.
- [ ] Eigentümerbegleitung, andere ermächtigte Begleitperson, Tierzahl, Transportkontext und nichtkommerzielle Zweckbestimmung auseinanderhalten.
- [ ] Zielland, Transit und Rückreise getrennt auswerten. Nationale Hunde-/Einfuhrbeschränkungen mit eigener amtlicher Referenz und Gültigkeit versehen.
- [ ] Unbekannte Werte, abgelaufene Regeln und Fälle außerhalb des Umfangs dürfen keine Freigabe erzeugen.

**Konkrete Tests:**

| ID | Fall | Erwartung |
|---|---|---|
| TR-01 | Vollständige Erstimpfung am 01.09.2026; Reise am 21.09.2026 | 21-Tage-Bedingung noch nicht erfüllt |
| TR-02 | Gleiche Impfung; Reise am 22.09.2026 | 21-Tage-Bedingung rechnerisch erfüllt; übrige Bedingungen bleiben gesondert zu prüfen |
| TR-03 | Fachlich bestätigte lückenlose Auffrischung innerhalb der vorherigen Gültigkeit | Keine neue Wartefrist allein durch diese Auffrischung |
| TR-04 | Auffrischung erst nach Ablauf der vorherigen Gültigkeit | Nicht als lückenlose Auffrischung behandeln; Erstimpfungs-/Wartefristfall prüfen |
| TR-05 | Impfdatum vor dokumentierter Kennzeichnung/zulässigem Chipablesen | Nicht pauschal als gültig bestätigen |
| TR-06 | Kennzeichnung und Impfung am selben Datum | Dokumentierte Reihenfolge berücksichtigen; nicht allein wegen Datengleichheit ablehnen |
| TR-07 | Geburts-/Impf-/Reisedatum fehlt oder ist unmöglich | Fehler oder unbekannter Zustand, kein positives Gesamtergebnis |
| TR-08 | Impfgültigkeit endet vor dem Reisetag | Relevante Impfbedingung nicht erfüllt |
| TR-09 | Tier unter der eigenen 12-Monats-Umfangsgrenze | Außerhalb des Toolumfangs, nicht pauschal gesetzlich verboten |
| TR-10 | Sechs Tiere | Außerhalb des Toolumfangs; kein pauschales Verbot, siehe WM-01 |
| TR-11 | Begleitung durch eine andere Person, sofern nicht implementiert | Außerhalb des Umfangs; keine stillschweigende Gleichsetzung mit Halterbegleitung |
| TR-12 | Nicht unterstütztes Ziel oder Nicht-EU-Transit | Außerhalb des Umfangs, auch wenn das eigentliche Zielland unterstützt wird |
| TR-13 | Rückreise | Regeln für den Rückweg prüfen, nicht das Hinreiseergebnis kopieren |
| TR-14 | Nationale Regel/Einordnung unbekannt | Betroffene Bedingung unbekannt; keine positive Gesamtwertung |
| TR-15 | Fachfreigabe fehlt, ist abgelaufen oder passt nicht zur Regelversion | Positives Gesamtergebnis gesperrt |
| TR-16 | Fachlich relevante Quelle/Regel ändert sich | Vorherige Freigabe gilt nicht ungeprüft für den neuen Inhalt |
| TR-17 | Monatswechsel, Schaltjahr und Sommer-/Winterzeitwechsel | Kalendertage korrekt zählen; keine Fristverkürzung durch Uhrzeit-/Zeitzonenrechnung |
| TR-18 | Packliste und Ausdruck | Gleiche Regeln, Grenzen, Quellenstände und Warnhinweise wie auf der Seite |

**Wichtig:** TR-01 und TR-02 sind Rechenfixtures für eine einzelne Bedingung, keine vollständigen Reisegenehmigungen. Die Fachprüfung muss auch die Ausnahmen und die amtlich maßgebliche Frist-/Gültigkeitslogik bestätigen.

**Abnahme:** Länder-/Regelmatrix und Tests liegen für den tatsächlich angebotenen Umfang vor. Ein eventuelles positives Ergebnis bedeutet nur, dass die geprüften Bedingungen anhand der Eingaben erfüllt erscheinen; keine behördliche Genehmigung behaupten.

### WM-14 – Ernährung und Ergänzungsfuttermittel als eigene Fachfreigabe aufnehmen

**Befund:** Die Ergänzungsfuttermittelseite benennt ausdrücklich eine ausstehende gesundheitliche Fachprüfung und keine zugeordnete Prüfperson. Diese Freigabe fehlt in der ursprünglichen Neun-Punkte-Liste. [W11]

**Umsetzen:**

- [ ] Eigene Freigabe `nutrition` anlegen; GOT-Kompetenz nicht automatisch als Ernährungskompetenz behandeln.
- [ ] Aussagen zu Allein-/Ergänzungsfuttermitteln, Nährstoffen, Sicherheit, Aussagegrenzen und besonderen Tiergruppen fachlich prüfen lassen.
- [ ] Herstellerangaben, Verbandsinformationen und unabhängige Belege sichtbar unterscheiden. Aus einem Herstellertext keine unabhängige Wirksamkeitsbestätigung machen.
- [ ] Den Kostenvergleich von einer Dosierungsempfehlung trennen: vom Nutzer eingegebene oder anderweitig festgelegte Tagesmenge nicht automatisch als medizinisch geeignet bestätigen.
- [ ] Produktzuordnung, Werbekennzeichnung und Quellenbeleg je gesundheitsbezogener Aussage prüfen.
- [ ] Keine geprüfte Eignung, Sicherheit oder Wirksamkeit aus unbekannten Produktwerten ableiten.

**Abnahme:** Benannte ernährungskundige Fachperson, genaue Version, nachvollziehbare Änderungen und offengelegte Grenzen. Solange die Prüfung fehlt, keine Anzeige einer erfolgten Fachfreigabe. Das bedeutet nicht, dass sämtliche bestehenden Aussagen als falsch nachgewiesen wären.

### WM-15 – Rechteprüfung für sämtliche tatsächlich verwendeten Inhalte

**Zweck:** Nicht nur die HTML-Seite, sondern auch Datendateien, Bilddateien und andere Ausgabewege berücksichtigen. Ein Quellenlink und eine Nutzungserlaubnis sind getrennte Fragen.

**Umsetzen:**

- [ ] Vollständiges Inventar erzeugen: Datensätze, eigene/fremde Texte, Fotos, Grafiken, Icons, Schriften, Bibliotheken, Herstellerinhalte und gegebenenfalls Affiliate-Programminhalte.
- [ ] Pro Position Rechtebasis oder Lizenz, konkrete Version, Nachweis, erlaubte Nutzung, Attribution und gegebenenfalls Weitergabepflichten dokumentieren.
- [ ] Bei amtlichen Werken die konkrete Rechtsgrundlage nennen; nicht automatisch fremde Kommentierungen, Fotos oder redaktionelle Aufbereitungen mitfreigeben.
- [ ] OSM-Datenlizenz und OSM-Kacheldienst getrennt prüfen. Bei Datenweitergabe die tatsächliche ODbL-Einordnung und Ausgabeform berücksichtigen; ein allgemeiner Footer allein erledigt nicht jede Datenausgabe. [R17] [R18]
- [ ] Öffentliche JSON-Dateien, Suchindizes, Exporte, Druckansichten und noch abrufbare ältere Builds einbeziehen.
- [ ] Ungeklärte Inhalte nicht veröffentlichen; betroffene Ausgaben gezielt entfernen oder deaktivieren. Ein Quellenregister darf trotzdem transparent benennen, welche Quelle noch nicht verwendet wird.

**Technische Sperre:** Den Build für eine betroffene Inhaltsübernahme fehlschlagen lassen, wenn die dazu notwendige Rechteentscheidung fehlt. Nicht jede bloße externe Quellenverlinkung mit einer urheberrechtlichen Inhaltsübernahme gleichsetzen.

**Abnahme:** Jede tatsächlich ausgelieferte Ressource ist nachvollziehbar zugeordnet. Keine pauschale Lizenzannahme für alle Datentypen. Erforderliche Hinweise befinden sich an den jeweiligen Ausgabeorten.

### WM-16 – Quellenalter und Fachfreigabe technisch auseinanderhalten

**Befund:** Die öffentliche Datenstandsseite und `health.json` zeigen Abrufalter, Aktualitätsregeln und Sperren. Ein frischer Abruf ist aber kein Nachweis einer neuen inhaltlichen oder fachlichen Prüfung. Die globale Methodik muss das tatsächliche Verhalten jedes Werkzeugs präzise beschreiben. [W03] [W10] [W16]

**Vorhandene Struktur erweitern, nicht blind ersetzen.** Die öffentlich erkennbaren Felder wie `stand`, `frische`, `sperrt` und `ausgeliefert` zunächst auf bestehende Verbraucher prüfen. Erweiterungen kompatibel einführen; bei notwendiger inkompatibler Änderung API-Version und Migration planen.

**Vorgeschlagene fachliche Trennung:**

```text
sourceVersion         konkrete Quellenfassung
sourcePublishedAt     sachlicher Veröffentlichungs-/Änderungsstand, falls bekannt
fetchedAt             tatsächlicher letzter Abruf
contentCheckedAt      tatsächlicher letzter inhaltlicher Abgleich
rightsStatus          pending | approved | rejected | not_applicable
expertStatus          pending | approved | rejected | expired | not_applicable
reviewedContentHash   Kennung des tatsächlich geprüften fachlichen Inhalts
reviewedAt            tatsächliches Fachprüfdatum
reviewExpiresAt       festgelegtes Ende der Freigabe, falls vorgesehen
legalChangeDetected   fachlich relevante Rechtsänderung bekannt: ja/nein
featureStatus         disabled | preview | released
```

Das ist ein Zielmodell, keine Behauptung über vorhandene Programmnamen. Personenbezogene Prüferdaten und vertrauliche Nachweise nicht automatisch in öffentliche JSON-Dateien übernehmen; intern auf das Freigabedokument verweisen.

**Regeln implementieren:**

- [ ] `fetchedAt` darf `reviewedAt` nicht aktualisieren.
- [ ] Fehlende Datumswerte bleiben unbekannt; das Builddatum ersetzt keine Prüfung.
- [ ] Relevante Änderungen des Regelwerks oder der Rechenlogik machen die bisherige Versionsfreigabe ungültig. Reine gestalterische Änderungen anhand einer dokumentierten Regel behandeln.
- [ ] Bekannte relevante Rechtsänderungen lösen eine erneute Prüfung aus, auch wenn eine Zeitfrist noch nicht abgelaufen ist.
- [ ] Positives Reise-Gesamtergebnis nur bei unterstütztem Fall, bestätigter gültiger Fachfreigabe und hinreichend geprüften einschlägigen Regeln erlauben.
- [ ] Für GOT und Ernährung eigene Freigaben verwenden. Eine bestandene Reiseprüfung schaltet andere Bereiche nicht frei.
- [ ] Die Methodik zwischen Datenzugriff, Vorschauauswertung, Berechnungsbetrag und fachlich freigegebenem Ergebnis unterscheiden lassen. Ein Text „wird erst nach Freigabe ausgewertet“ darf nicht neben tatsächlich möglichen Vorschauauswertungen stehen.
- [ ] Hinweise auf Alter als `Stand zum Builddatum` kennzeichnen oder zuverlässig aktualisieren. Statisch berechnete Tageszahlen nicht unbegrenzt als tagesaktuelle Werte ausgeben.

**Abnahme:** Tests für `pending`, `expired`, Versionsabweichung, unbekannten Stand und bekannte Rechtsänderung bestehen. Kein einzelnes globales `approved=true` hebt alle Grenzen auf.

### WM-17 – Produktionsdomain und technische Veröffentlichung prüfen

**Einordnung:** Die Wahl einer endgültigen Domain ist eine Betreiberentscheidung, keine eigenständige allgemeine gesetzliche Zulassung.

**Umsetzen:**

- [ ] Betreiberentscheidung zur Hauptadresse dokumentieren.
- [ ] HTTP-/HTTPS- und gegebenenfalls WWW-Varianten kontrollieren; Weiterleitungen zur gewählten Hauptadresse testen.
- [ ] Canonical-Angaben, Sitemap, interne Links, strukturierte Daten und Kontaktadressen auf dieselbe Domain ausrichten.
- [ ] Vorschau-/Testdeployments mit vertraulichen oder nicht veröffentlichungsfähigen Inhalten tatsächlich zugangsbeschränken. `noindex` ist kein Zugriffsschutz.
- [ ] Keine Vertragskopien, privaten Prüfnachweise, Zugangsdaten oder internen Rohdaten in das öffentliche Buildverzeichnis kopieren.
- [ ] HTTPS, Inhalts- und Sicherheitsheader sowie Einbindungsregeln anhand der tatsächlichen Ressourcen testen. Keine ungeprüfte Standard-CSP einsetzen, die Formulare oder Karte beschädigt.
- [ ] Fehlerseite, mobile Darstellung, Navigation und Rechtstextlinks prüfen.
- [ ] Aktualisierte Dateien auf dem CDN ausliefern; erforderliche Cachebereinigung gezielt durchführen.

**Abnahme:** Derselbe geprüfte Build ist unter der Produktionsadresse abrufbar. Rechtstexte und Sperren sind nicht nur auf einer internen Vorschau korrekt.

### WM-18 – Freigabe nachvollziehbar abschließen

**Für jeden fachlichen oder rechtlichen Entscheidungsbereich ein kurzes Protokoll führen:**

```text
Bereich:
Status: offen | freigegeben | abgelehnt | nicht anwendbar
Verantwortliche Person / Rolle:
Geprüfter Umfang:
Explizit nicht geprüfter Umfang:
Relevante Tatsachengrundlage:
Code-/Inhaltsversion:
Verwendete Quellenfassungen:
Prüfdatum:
Ergebnis / Änderungen:
Interne Nachweisreferenz:
Anlass oder Termin für erneute Prüfung:
Freigabeentscheidung:
```

**Eine Dateivorlage ist kein Nachweis.** `nicht anwendbar` braucht eine Begründung; `freigegeben` braucht eine tatsächliche Entscheidung zur richtigen Version. Kein Entwickler soll eine fehlende externe Prüfung durch Eintragen seines Namens ersetzen.

**Empfohlene Zielartefakte, vorhandene Entsprechungen bevorzugen:**

| Artefakt | Inhalt | Veröffentlichung |
|---|---|---|
| `docs/launch/STATUS.md` | Bereinigte Aufgaben- und Statusübersicht | Nur ohne vertrauliche Angaben |
| Geschützter Betreiberbogen | Tatsächliche Unternehmensdaten und Nachweise | Nicht öffentlich |
| Geschütztes Verarbeitungsinventar | Dienste, Vertragsbezug, Speicher-/Löschkonzept | Nicht öffentlich |
| `docs/launch/TESTS.md` | Testfälle, Prüfstände und bereinigte Ergebnisse | Nach Inhaltsprüfung |
| Geschützte Freigaben | Juristische/fachliche Entscheidungen und Originalnachweise | Nicht automatisch veröffentlichen |
| Öffentliche Seiten/JSON | Nur erforderliche Angaben, Quellen, Status und Hinweise | Öffentlich |

## 5. Freigabematrix – was sperrt tatsächlich welchen Bereich?

Die Matrix ist eine risikoorientierte Projektregel. Ob ein Rechtsverstoß vorliegt, hängt von den tatsächlichen Voraussetzungen ab; ein offenes Kästchen ist noch kein solcher Nachweis.

| Offener oder fehlerhafter Punkt | Umgang bis zur Klärung |
|---|---|
| Nachgewiesen falsche Betreiberangabe oder fehlende anwendbare Pflichtinformation | Im öffentlichen Betrieb korrigieren; nicht mit Vorschauhinweis überspielen |
| Verarbeitung ohne tragfähige Grundlage oder erforderliche Vereinbarung | Betroffene Verarbeitung berichtigen oder unterbinden; Text allein genügt nicht |
| BFSG/VSBG-Anwendbarkeit unbekannt | Tatsachen ermitteln und entscheiden; weder automatisch ausnehmen noch pauschal Gesamtsperre behaupten |
| Rechte an einem bestimmten Datensatz/Bild ungeklärt | Betroffene Inhalte und Ausgaben bis zur Rechteklärung nicht verwenden |
| Partnerberechtigung ungeklärt | Betroffene monetarisierte Einbindung nicht als freigegeben behandeln |
| Reise-Fachprüfung offen | Keine positive Gesamtwertung; Umfangsgrenzen und Fehlerkorrekturen beibehalten |
| GOT-Fachprüfung offen | Keine reguläre fachliche Freigabe behaupten; Betreiber entscheidet über begrenzte Vorschau oder Deaktivierung anhand des konkreten Risikos |
| Ernährungs-Fachprüfung offen | Keine bestätigte gesundheitliche Eignung oder Wirksamkeit ausgeben; offene Inhalte risikobezogen begrenzen |
| Domain noch nicht als endgültig bestätigt | Organisatorisch entscheiden; tatsächlich verwendete öffentliche Adresse muss dennoch korrekt betrieben werden |

Eine fachliche Prüfung ist keine allgemeine gesetzliche Lizenz zum Betrieb eines Rechners. Die hier verlangten Fachnachweise dienen der inhaltlichen Qualität und eurer eigenen Freigabepolitik. Sie ersetzen keine daneben tatsächlich anwendbaren Pflichten.

## 6. Abschließende Abnahmecheckliste

### Inhalte

- [ ] Fehlerhafte Tierzahl-Aussage ist aus allen Varianten und Druckausgaben entfernt.
- [ ] GOT-Ausgabe ist als Berechnungsübersicht gekennzeichnet.
- [ ] Aussagen zu Server-/Datenverbindungen sind präzise und technisch belegt.
- [ ] Quellenverzeichnis, Methodik, Datenstand und Affiliate-Hinweise widersprechen sich nicht.
- [ ] Kein offener Fachbereich wird als geprüft dargestellt.

### Betreiber und Recht

- [ ] Impressumsangaben und bedingte Pflichtfelder sind entschieden.
- [ ] Tatsächliche Datenverarbeitung, Vertragslage und Datenschutztext passen zusammen.
- [ ] Personenbezogene Verzeichniseinträge und Informationsprozesse sind berücksichtigt.
- [ ] BFSG und VSBG wurden auf Grundlage realer Tatsachen bewertet.
- [ ] Rechtebelege decken die tatsächlich verwendeten Inhalte und Ausgabeformen ab.

### Fachlichkeit und Technik

- [ ] GOT-, Reise- und Ernährungsprüfung sind je nach freizugebendem Umfang abgeschlossen oder die betroffenen Bereiche bleiben passend eingeschränkt.
- [ ] Sämtliche erforderlichen Solltests bestehen für die freizugebende Version.
- [ ] Netzwerk-/Speichertests und einschlägige Barrierefreiheitstests sind dokumentiert.
- [ ] Freigabe-, Aktualitäts- und Änderungssperren funktionieren.
- [ ] Derselbe geprüfte Stand ist auf der Produktionsdomain getestet.

**Abschlussdefinition:** Ein Arbeitspaket gilt erst als erledigt, wenn Änderung oder begründete Nichtanwendbarkeit, überprüfbares Ergebnis und erforderlicher Nachweis vorliegen. „Text eingebaut“, „Quelle verlinkt“ oder „Anwalt später fragen“ reichen nicht als Abschluss.

## 7. Laufende Pflege nach Umsetzung

Als betriebliche Startregel: verantwortliche Person je Bereich festlegen; Hosting-/Drittanbieteränderungen vor Aktivierung prüfen; relevante Rechts- und Quellenänderungen bei Bekanntwerden bewerten; Beschwerden und Korrekturen zeitnah bearbeiten. Prüfintervalle risikobezogen festlegen und dokumentieren, statt pauschal jeden Inhalt ein Jahr lang als aktuell anzusehen.

Bei neuem Shop, Buchungssystem, Nutzerkonten, Newsletter, Tracking, neuen Ländern oder zusätzlichen Datenausgaben vor Aktivierung eine neue Prüfung der betroffenen Pflichten und Texte auslösen. Nicht vorsorglich unpassende Shop-AGB, Widerrufstexte oder Consent-Banner auf eine reine Informationsfunktion kopieren.

## 8. Quellen und Prüfbezug

Die W-Referenzen belegen den öffentlich sichtbaren Websitezustand zum Prüfzeitpunkt. Die R-Referenzen sind Rechts-, Behörden- oder Anbietergrundlagen für die beschriebenen Entscheidungen. Einzelne EU-/Behördenseiten waren beim direkten Volltextabruf technisch eingeschränkt; verlinkte Normen sind deshalb keine Behauptung, dass hier sämtliche Vorschriften und Übergangsfälle abschließend geprüft wurden. Bei der Umsetzung die dann gültige Fassung heranziehen und die konkrete Entscheidung dokumentieren.

### Website-Fundstellen

| Referenz | Inhalt |
|---|---|
| [W01] | Impressum |
| [W02] | Öffentliches Quellenregister |
| [W03] | Datenstand und veröffentlichte Aktualitätsregeln |
| [W04] | Mein Tier und lokale Profilverarbeitung |
| [W05] | GOT-Rechner und Druckbezeichnung |
| [W06] | Reisecheck Frankreich |
| [W07] | Reisecheck Österreich |
| [W08] | Reisecheck Italien |
| [W09] | Reisecheck Niederlande |
| [W10] | Methodik und Finanzierungsdarstellung |
| [W11] | Ergänzungsfuttermittel und offener Fachstatus |
| [W12] | Datenschutzerklärung |
| [W13] | Tierarztkarte und Verzeichniseinträge |
| [W14] | Barrierefreiheitsinformation |
| [W15] | Reisecheck, Eingaben und Funktionsumfang |
| [W16] | Maschinenlesbarer Datenstatus |

### Rechts-, Behörden- und Anbieterreferenzen

| Referenz | Grundlage |
|---|---|
| [R01] | § 5 DDG – Anbieterinformationen |
| [R02] | § 1 BFSG – Anwendungsbereich |
| [R03] | DSGVO, insbesondere Art. 5, 6, 13, 14, 21 und 28 sowie Kapitel V |
| [R04] | BfDI – Informationspflichten |
| [R05] | Cloudflare Data Processing Addendum |
| [R06] | § 25 TDDDG – Endgerätespeicherung und Zugriff |
| [R07] | § 36 VSBG – allgemeine Informationspflicht |
| [R08] | § 37 VSBG – Information nach nicht beigelegter Streitigkeit |
| [R09] | Verordnung (EU) 2024/3228 – Einstellung der OS-Plattform |
| [R10] | § 2 BFSG – Definitionen, darunter Kleinstunternehmen und elektronischer Geschäftsverkehr |
| [R11] | § 3 BFSG – Anforderungen und Dienstleistungsausnahme |
| [R12] | § 14 BFSG – Pflichten der Dienstleistungserbringer |
| [R13] | Anlage 3 BFSG – Informationen über Dienstleistungen |
| [R14] | MLBF – zuständige Marktüberwachungsstelle und Kontakt |
| [R15] | Europäische Kommission – Heimtierreisen innerhalb der EU |
| [R16] | Delegierte Verordnung (EU) 2026/131 – aktuelle veterinärrechtliche Prüfreferenz |
| [R17] | OSMF – Tile Usage Policy |
| [R18] | OpenStreetMap – Copyright and License |
| [R19] | Amazon – Vereinbarung zur Teilnahme am Partnerprogramm |
| [R20] | § 2 GOT – reguläre Gebührenbemessung |
| [R21] | § 4 GOT – Notdienst |
| [R22] | § 5 GOT – abweichende Gebührenvereinbarungen |
| [R23] | Aktuelle BFSGV – technische Anforderungen |
| [R24] | W3C – WCAG 2.2 |
| [R25] | § 6 GOT – enthaltene Leistungen |
| [R26] | Amtliche GOT-Anlage, insbesondere Position 16 |

[W01]: https://wauandmiau.de/de-de/impressum/
[W02]: https://wauandmiau.de/de-de/quellen/
[W03]: https://wauandmiau.de/de-de/datenstand/
[W04]: https://wauandmiau.de/de-de/mein-tier/
[W05]: https://wauandmiau.de/de-de/tierarztkosten/
[W06]: https://wauandmiau.de/de-de/reisecheck/frankreich/
[W07]: https://wauandmiau.de/de-de/reisecheck/oesterreich/
[W08]: https://wauandmiau.de/de-de/reisecheck/italien/
[W09]: https://wauandmiau.de/de-de/reisecheck/niederlande/
[W10]: https://wauandmiau.de/de-de/methodik/
[W11]: https://wauandmiau.de/de-de/ergaenzungsfuttermittel/
[W12]: https://wauandmiau.de/de-de/datenschutz/
[W13]: https://wauandmiau.de/de-de/tierarzt-karte/
[W14]: https://wauandmiau.de/de-de/barrierefreiheit/
[W15]: https://wauandmiau.de/de-de/reisecheck/
[W16]: https://wauandmiau.de/data/v1/health.json
[R01]: https://www.gesetze-im-internet.de/ddg/__5.html
[R02]: https://www.gesetze-im-internet.de/bfsg/__1.html
[R03]: https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu
[R04]: https://www.bfdi.bund.de/DE/Buerger/Inhalte/Allgemein/Datenschutz/Informationspflichten.html
[R05]: https://www.cloudflare.com/cloudflare-customer-dpa/
[R06]: https://www.gesetze-im-internet.de/ttdsg/__25.html
[R07]: https://www.gesetze-im-internet.de/vsbg/__36.html
[R08]: https://www.gesetze-im-internet.de/vsbg/__37.html
[R09]: https://eur-lex.europa.eu/eli/reg/2024/3228/oj
[R10]: https://www.gesetze-im-internet.de/bfsg/__2.html
[R11]: https://www.gesetze-im-internet.de/bfsg/__3.html
[R12]: https://www.gesetze-im-internet.de/bfsg/__14.html
[R13]: https://www.gesetze-im-internet.de/bfsg/anlage_3.html
[R14]: https://www.mlbf-barrierefrei.de/
[R15]: https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/travelling-pet-within-eu_en
[R16]: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32026R0131
[R17]: https://operations.osmfoundation.org/policies/tiles/
[R18]: https://www.openstreetmap.org/copyright
[R19]: https://partnernet.amazon.de/help/operating/agreement
[R20]: https://www.gesetze-im-internet.de/got_2022/__2.html
[R21]: https://www.gesetze-im-internet.de/got_2022/__4.html
[R22]: https://www.gesetze-im-internet.de/got_2022/__5.html
[R23]: https://www.gesetze-im-internet.de/bfsgv/BJNR092800022.html
[R24]: https://www.w3.org/TR/WCAG22/
[R25]: https://www.gesetze-im-internet.de/got_2022/__6.html
[R26]: https://www.gesetze-im-internet.de/got_2022/anlage.html
