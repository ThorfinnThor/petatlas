# Domainmigration zu deinhaustierportal.de

Stand: 23.09.2026

## Zielzustand

- Öffentlicher Name: **Dein Haustierportal**
- Kanonische Hauptadresse: `https://deinhaustierportal.de`
- Öffentliche Kontaktadresse: `info@deinhaustierportal.de`
- Bisherige Domain: `wauandmiau.de`
- Hosting: Cloudflare Workers Static Assets, Produktionsdienst `petatlas-de`

Die bisherige Domain wurde für die technische Migration vorübergehend pfaderhaltend weitergeleitet. Nach erfolgreicher Abnahme der neuen Hauptadresse hat der Betreiber aus markenrechtlichen Gründen die vollständige Trennung beauftragt. Die alte Domain wird deshalb nicht mehr am Worker betrieben, nicht weitergeleitet und nicht für E-Mail-Zustellung genutzt. `www.deinhaustierportal.de` wird dauerhaft auf die kanonische Apex-Domain umgeleitet.

## Technische Reihenfolge

1. `deinhaustierportal.de` in Cloudflare anlegen und die von Cloudflare vorgegebenen autoritativen Nameserver beim Registrar hinterlegen.
2. Google-Search-Console-Domainproperty per DNS-TXT bestätigen.
3. Neue Hauptdomain am bestehenden Worker anbinden; die bisherige Domain während der Migration ebenfalls am Worker belassen.
4. Den Produktionsbuild mit `PUBLIC_SITE_URL=https://deinhaustierportal.de` veröffentlichen und Canonicals, Sitemap, Robots-Regeln, strukturierte Daten, Rechtstexte und interne Links prüfen.
5. `info@deinhaustierportal.de` über Cloudflare Email Routing an das verifizierte Betreiberpostfach weiterleiten.
6. Sitemap der neuen Property in der Search Console einreichen. Wenn die bisherige Property verfügbar ist, zusätzlich den Search-Console-Adresswechsel auslösen.
7. Die bisherige Domain für die technische Abnahme vorübergehend per 301 auf die neue Domain umstellen.
8. Amazon PartnerNet und Awin auf die neue Domain umstellen und eine neue Amazon-Tracking-ID verwenden.
9. Nach erfolgreicher Live-Prüfung die bisherige Domain aus Amazon, Cloudflare Worker, Redirect Rules und Email Routing entfernen.

## Abnahmekriterien

- Neue Hauptadresse und `www` funktionieren per HTTPS; `www` leitet genau einmal auf die Apex-Domain.
- Öffentliche Inhaltsseiten liefern 200 und ausschließlich Self-Canonicals unter `deinhaustierportal.de`.
- `robots.txt` erlaubt die vorgesehene Indexierung und verweist auf `https://deinhaustierportal.de/sitemap.xml`.
- Sitemap enthält nur URLs der neuen Hauptdomain.
- Impressum, Datenschutz, Barrierefreiheit, Kopf- und Fußbereich zeigen den neuen Namen und die neue Kontaktadresse.
- Kernfunktionen, Karte, Rechner, Reisecheck und Affiliate-Weiterleitungen funktionieren unverändert.
- Nicht vorhandene Pfade bleiben auf der neuen Domain echte 404-Seiten.
- Die neue Kontaktadresse erreicht das verifizierte Betreiberpostfach.
- Die bisherige Domain liefert weder Websiteinhalte noch Weiterleitungen oder E-Mail-Zustellung aus.

## Rückfall und Betrieb

Der geprüfte Produktionsbuild bleibt ausschließlich unter `deinhaustierportal.de` verfügbar. Die alte Domain wird nach der Abnahme vom Worker getrennt, ihre Redirect Rule und E-Mail-Route werden entfernt. Amazon PartnerNet führt die neue Websiteadresse und verwendet `deinhaustierportal-21`; Awin führt `deinhaustierportal.de` als bestehende Werbefläche in „Pets & Pet Care“. Die Registrierung der alten Domain kann beim Registrar bis zur Kündigung oder zum Ablauf bestehen bleiben, ohne dass die Website sie nutzt.
