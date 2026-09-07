# Hinweistexte zur Versicherung

Redaktionelle Texte, die **unsere** Aussagen sind, nicht die eines Anbieters. Sie liegen getrennt von `config/publishers/insurance/`, weil sie auch ohne Partner gelten: was diese Website nicht leistet, hängt nicht daran, ob gerade jemand dafür zahlt.

Jeder Text trägt `appliesWithoutPartner`. Steht dort `false`, erscheint der Hinweis nur mit Partner — dann ist er Teil der Werbung und kein Verbraucherhinweis. Zurzeit steht bei allen Texten `true`.

`tests/content-policy.test.ts` prüft diese Dateien und den Quelltext der Oberfläche auf Aussagen, die hier nicht vorkommen dürfen: garantierte Erstattung, zugesicherte Versicherbarkeit bestehender Beschwerden, „bester Tarif“, Testsieger, erfundene Beiträge. Der Test prüft den Wortlaut, nicht die Absicht — er ist deshalb streng und meldet auch gut gemeinte Formulierungen.
