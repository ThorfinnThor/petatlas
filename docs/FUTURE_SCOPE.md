# Ausbau nach dem geprüften Deutschland-Start

Nicht heimlich während M00–M19 ergänzen. Jeder Ausbau bekommt eigene IDs, Scope, Rechteprüfung, Tests und Betriebsbudget.

## E01 — DWD-Wetterhinweise

Eigener kleiner Daten-/Asset-Build, damit häufigere Wetteraktualisierungen nicht die komplette Website neu bauen. Wetterhinweise und Datenstand, keine medizinische Sicherheitsampel allein aus Temperatur. Lokale Frischeprüfung und Ausfallzustand erforderlich. Zusätzliche Cloudflare-Projekte oder alternative Scheduler erst nach Freigabe.

## E02 — Rückruf- und Sicherheitsinformationen

Zunächst tatsächliche API, Lizenz, Aktualität, Marken-/Chargen-/EAN-Abdeckung und Quellenlage klären. „Keine Meldung in den erfassten Quellen“ statt „sicher“. Rückrufe nicht als Angstverkaufsfläche missbrauchen. Für Warnmeldungen keine Echtzeit- oder Vollständigkeitsgarantie auf Basis eines GitHub-Cronjobs abgeben.

## E03 — Budgetrechner

Nutzer gibt Verbrauch/Mengen und frei gewählte Kostenannahmen ein; geprüfte Preise ergänzen. Keinen monatlichen Tierarztbedarf oder eine nötige Versicherung erfinden. Steuer nur für konkret verifizierte Kommune. Erstmal lokal rechnen, ohne Profilserver.

## E04 — Preisverlauf und Preisalarme

Historien nur mit erlaubter Datenspeicherung. Persistente öffentliche Historie kann zunächst ein eng budgetierter Snapshot sein; geschützte Rohfeeds bleiben unzulässig. Persönlicher E-Mail-Preisalarm benötigt einen bewusst ausgewählten zusätzlichen Dienst/Backend und Einwilligungsprozess. Nicht als bereits durch Static JSON erledigt behaupten.

## E05 — Gesundheitsergänzungen

Supplements, Tests und Tierarzneimittel nur nach produkt-/claimbezogener Prüfung von Evidenz, Einordnung, Werberegeln und Partnerrechten. Kein klinisches Matching allein aus Rasse, Alter oder Symptomen. EMA/ESCCAP/FEDIAF nicht automatisch durch ein Webscraping-Modul ersetzen.

## E06 — Weitere Märkte

Vor jedem Marktstart echte Händler, Produkte, Regeln, Sprache, Datenrechte, Währung/Einheiten, Datenschutz und Betrieb prüfen. Ein Sprachmodell darf DE-Texte nicht pauschal übersetzen und als lokal validierte Information veröffentlichen.

## E07 — Ads und Messung

Zuerst reale Affiliate-Konversionen über die zugelassenen Partnerberichte und erlaubte statische Kampagnenkennungen auswerten. Keine personenbezogenen Sub-IDs. Display Ads benötigen gesonderte Netzwerk-/Datenschutz-/Consent-Konfiguration und Performance-Abnahme; Gesundheits-/Reise-Toolbedienung nicht mit Anzeigen überdecken.

## E08 — Nutzerbewertungen und eigenes Testprogramm

Ein echter Bewertungsdienst braucht Moderation, Missbrauchsschutz, Speicher-/Datenschutzkonzept und tatsächliche Beiträge. Kein statisch generiertes Bewertungsvolumen. Für eigene Produkttests Stichprobe, Methode, Messgrößen und Interessenkonflikte offenlegen. Erst nach eigener Datenerhebung echte Haltbarkeits- oder Nutzungsstatistiken veröffentlichen.
