# Domainmigration zu deinhaustierportal.de

Stand: 22.09.2026

## Zielzustand

- Öffentlicher Name: **Dein Haustierportal**
- Kanonische Hauptadresse: `https://deinhaustierportal.de`
- Öffentliche Kontaktadresse: `info@deinhaustierportal.de`
- Bisherige Domain: `wauandmiau.de`
- Hosting: Cloudflare Workers Static Assets, Produktionsdienst `petatlas-de`

Die bisherige Domain wird nicht gelöscht. Nach erfolgreicher Abnahme der neuen Hauptadresse beantwortet sie jede bisherige öffentliche URL mit einer permanenten 301-Weiterleitung auf denselben Pfad und dieselben Query-Parameter unter `deinhaustierportal.de`. Dadurch bleiben alte Links, Lesezeichen und Suchsignale nutzbar. `www` wird jeweils dauerhaft auf die kanonische Apex-Domain umgeleitet.

## Technische Reihenfolge

1. `deinhaustierportal.de` in Cloudflare anlegen und die von Cloudflare vorgegebenen autoritativen Nameserver beim Registrar hinterlegen.
2. Google-Search-Console-Domainproperty per DNS-TXT bestätigen.
3. Neue Hauptdomain am bestehenden Worker anbinden; die bisherige Domain während der Migration ebenfalls am Worker belassen.
4. Den Produktionsbuild mit `PUBLIC_SITE_URL=https://deinhaustierportal.de` veröffentlichen und Canonicals, Sitemap, Robots-Regeln, strukturierte Daten, Rechtstexte und interne Links prüfen.
5. `info@deinhaustierportal.de` über Cloudflare Email Routing an das verifizierte Betreiberpostfach weiterleiten. Die bisherige Adresse bleibt während der Übergangszeit aktiv.
6. Sitemap der neuen Property in der Search Console einreichen. Wenn die bisherige Property verfügbar ist, zusätzlich den Search-Console-Adresswechsel auslösen.
7. Erst nach erfolgreicher Live-Prüfung die bisherige Domain per 301 auf die neue Domain umstellen.

## Abnahmekriterien

- Neue Hauptadresse und `www` funktionieren per HTTPS; `www` leitet genau einmal auf die Apex-Domain.
- Öffentliche Inhaltsseiten liefern 200 und ausschließlich Self-Canonicals unter `deinhaustierportal.de`.
- `robots.txt` erlaubt die vorgesehene Indexierung und verweist auf `https://deinhaustierportal.de/sitemap.xml`.
- Sitemap enthält nur URLs der neuen Hauptdomain.
- Impressum, Datenschutz, Barrierefreiheit, Kopf- und Fußbereich zeigen den neuen Namen und die neue Kontaktadresse.
- Kernfunktionen, Karte, Rechner, Reisecheck und Affiliate-Weiterleitungen funktionieren unverändert.
- Beliebige alte Inhalts-URLs leiten mit HTTP 301 auf denselben Pfad und dieselben Query-Parameter der neuen Domain.
- Nicht vorhandene Pfade bleiben auf der neuen Domain echte 404-Seiten.
- Neue und bisherige Kontaktadresse erreichen während der Übergangszeit dasselbe Betreiberpostfach.

## Rückfall und Betrieb

Vor dem Aktivieren der alten 301-Regel bleiben beide Domains am selben Worker. Falls die neue Domain nach dem Deployment nicht korrekt antwortet, wird die Weiterleitungsregel nicht aktiviert beziehungsweise deaktiviert; der letzte geprüfte Worker-Build bleibt verfügbar. DNS-Zone, alte E-Mail-Route und alte Domain werden für mindestens zwölf Monate nicht entfernt. Affiliate- und Händlerkonten müssen die neue Websiteadresse zusätzlich führen; bestehende Tracking-IDs werden nicht allein wegen des Domainwechsels geändert.
