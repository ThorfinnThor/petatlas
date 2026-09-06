# Marktkonfiguration

Eine Datei je Markt. `enabled: true` bedeutet: dieser Markt erzeugt statische Routen. Aktuell ist das ausschließlich `DE`.

`US` und `NL` sind **deaktivierte Testkonfigurationen**. Sie existieren, damit die Internationalisierung geprüft werden kann. Sie belegen keinen gestarteten Markt, erzeugen keine Seiten und rechtfertigen keine englischen oder niederländischen Inhalte im Startumfang.

Ein Reiseziel ist kein Markt. Ein deutscher Nutzer mit Reiseziel Italien bleibt in `market=DE`; Italien wird niemals dadurch zu einem aktiven Markt (ADR-001, ADR-010).

`featureFlags` steht auf `false`, bis die jeweilige Funktion technisch **und** fachlich freigegeben ist. `providerIds` ist `null`, solange kein Adapter existiert; ein fehlender Provider führt zu `unsupported`, nicht zu einem deutschen Ersatzwert (M03-05).
