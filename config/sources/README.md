# Source Registry

Eine Datei je **konkreter Distribution**, nicht je Anbieter. „GovData“, „OpenStreetMap“ oder „Awin“ sind keine Registryeinträge: eingetragen wird die einzelne Datei, der einzelne Endpunkt oder der einzelne Feed, den das Projekt tatsächlich liest — mit seiner eigenen URL, seinem Format und seinen eigenen Bedingungen.

Jeder Eintrag startet mit `rights.status: "pending"`. `pending` erlaubt Adapterentwicklung gegen synthetische Fixtures und verbietet jede Veröffentlichung. Der Wechsel auf `verified` setzt Prüfdatum, benannte Lizenz und einen dokumentierten Nachweis in `docs/SOURCE_REVIEWS.md` voraus (M05-04).

Rechte gelten je Ausgabeform. `commercialUse: true` erlaubt für sich genommen weder die Anzeige im HTML noch eine öffentliche JSON-Datei noch die Ablage im öffentlichen Repository.
