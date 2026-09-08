# Ausbau auf weitere Märkte

Diese Datei beantwortet eine einzige Frage: **was müsste am deutschen Kern geändert werden, um einen zweiten Markt zu bedienen?** Die gemessene Antwort lautet: nichts. `tests/expansion-proof.test.ts` zieht einen Testmarkt vollständig über Konfiguration und Adapter auf — andere Währung, anderes Maßsystem, fehlende Kostenquelle — und prüft, dass der deutsche Markt davon nichts merkt.

Der Testmarkt bleibt dabei **abgeschaltet**. Es entsteht keine einzige internationale Seite, und der Test prüft auch das.

## Was ein neuer Markt braucht

| Baustein | Wo | Ohne ihn |
|---|---|---|
| Marktkonfiguration | `config/markets/<ID>.json` | gibt es den Markt nicht |
| Slugs und Texte | `config/locales/<locale>.json` | fehlt jeder Pfad und jede Beschriftung |
| Fachliche Adapter | `providerIds` je Domäne, Registrierung in der `ProviderRegistry` | bleibt die Domäne ohne Daten |
| Freigaben | `config/launch.json`, Quellenregister | wird nichts veröffentlicht |

Was **nicht** dazugehört: eine Änderung an Route Registry, Domänenmodellen, Schemas, Komponenten oder Prüfungen. Alle vier lesen den Markt als Parameter.

## Die vier Grenzen, die dabei halten müssen

### 1. Kein Rückfall auf einen anderen Markt

Fehlt einem Markt ein Adapter, kommt **keine** Antwort — nicht die eines anderen Marktes. Der Fehlertext sagt das ausdrücklich: „Kein Rückfall auf einen anderen Markt.“ Ein Adapter, der zu einem anderen Markt gehört, wird ebenfalls abgelehnt, selbst wenn seine Kennung passt.

Das ist der wichtigste Punkt des ganzen Ausbaus. Eine amerikanische Kostenseite, die stillschweigend deutsche Gebührensätze zeigt, wäre schlimmer als gar keine Kostenseite.

### 2. Eine fehlende Quelle schaltet keine Funktion ein

Der Testmarkt hat keinen Kostenanbieter. Folge: das Feature bleibt aus, die Route existiert nicht, und es gibt keine leere Seite, die so tut, als käme gleich etwas.

### 3. Währung und Maßsystem folgen dem Markt, nicht dem Betrachter

Beträge werden je Markt in ihrer eigenen Währung ausgegeben. **Es gibt keinen Wechselkurs im System**, und das ist Absicht: ein umgerechneter Preis wäre eine erfundene Zahl. Ein USD-Betrag bleibt ein USD-Betrag, auch wenn ihn jemand mit deutschem Locale ansieht.

Gewichte werden je Maßsystem anders dargestellt — 12 kg metrisch, Pfund im US-Format —, ohne den gespeicherten Wert zu ändern. Gespeichert wird in Gramm.

### 4. Nichts wird versehentlich veröffentlicht

In der versionierten Konfiguration steht der Testmarkt auf `enabled: false`, alle seine Funktionsflags sind aus, und keine Domäne hat einen Adapter. `buildablePaths` erzeugt ausschließlich `/de-de/`-Pfade. Der Test prüft alle vier Aussagen einzeln.

## Was ein echter Marktstart zusätzlich verlangt

Der Beweis oben zeigt, dass die **Technik** trägt. Er ersetzt keinen der folgenden Punkte:

- **Eigene Quellen mit eigenen Rechten.** Die GOT gilt in Deutschland. Ein anderer Markt braucht eine eigene Gebührenquelle, eine eigene Rechteprüfung und eine eigene fachliche Freigabe.
- **Eigene Reiseregeln.** Die Delegierte Verordnung (EU) 2026/131 gilt für Verbringungen innerhalb der EU; ein Markt außerhalb braucht eine andere Rechtsgrundlage.
- **Eigene rechtliche Pflichten.** Impressumspflicht, Datenschutz, Werbekennzeichnung und Barrierefreiheit richten sich nach dem Recht des Zielmarktes, nicht nach dem deutschen.
- **Eine Entscheidung.** Ein zweiter Markt ist ein Betriebsaufwand, kein Konfigurationseintrag: Aktualisierung, Überwachung und Prüfungen verdoppeln sich.

Bis dahin bleibt es bei einem aktiven Markt — und bei einem Testmarkt, der beweist, dass der zweite keinen Umbau kostet.
