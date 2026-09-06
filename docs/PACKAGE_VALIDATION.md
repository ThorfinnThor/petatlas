# Prüfung des gelieferten Planungspakets

Stand: 6. September 2026.

Dies sind Prüfungen des Planungspakets und des kleinen Statushelfers. Die Haustier-Website,
ihr Datenimport, GitHub Actions und ein Cloudflare-Deployment sind damit noch nicht implementiert
oder getestet. Alle 120 Implementierungsaufgaben starten mit `todo`; es gibt keine erfundenen Testnachweise.

## Tatsächlich ausgeführte Prüfungen

`python3 scripts/project_status.py --validate`

Ergebnis: 120 Aufgaben, 20 Meilensteine, keine Konsistenzfehler. Geprüft werden unter anderem
eindeutige IDs, existierende Abhängigkeiten, Zyklen, Statuswerte, Nachweisfelder und aktuelle Hauptaufgabe.

`python3 scripts/test_project_status.py`

Ergebnis: 10 Tests bestanden. Die Tests verwenden isolierte synthetische Daten, nicht den später
veränderlichen Fortschritt im echten Aufgabenmanifest. Sie prüfen gültige Anfangszustände,
Meilensteinfilter, CLI-JSON-Ausgabe, Nachweispflichten, unbekannte Abhängigkeiten, Zyklen,
Blockerangaben, gültige Abschlüsse und unzulässige parallele Hauptaufgaben.

Weitere Paketkontrollen: Alle Aufgaben-IDs und Titel sind im Gesamtplan vorhanden;
Markdown-Codeblöcke sind geschlossen; das Quellenverzeichnis enthält 36 Primärquellen;
ZIP-Integrität und Ausschluss temporärer Python-Cachedateien wurden geprüft.

## Nicht hier behauptet

Kein existierendes GitHub-Projekt, kein Cloudflare-Projekt, keine gebuchte Domain,
kein genehmigtes Affiliateprogramm und keine erteilte fachliche oder rechtliche Live-Freigabe.
Die entsprechenden Aufgaben besitzen im Plan ausdrückliche Abnahmekriterien.
