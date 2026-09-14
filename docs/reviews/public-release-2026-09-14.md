# Öffentliche Freigabe Wau & Miau

**Freigabedatum:** 14. September 2026  
**Freigegeben durch:** Schayan Yousefian, Betreiber  
**Hauptadresse:** `https://wauandmiau.de`

Der Betreiber hat am 14. September 2026 bestätigt, dass die zuvor verlangten
menschlichen, fachlichen, rechtlichen, betrieblichen und Rechteprüfungen abgeschlossen
sind, und die öffentliche Veröffentlichung ausdrücklich autorisiert.

## Freigegebener Umfang

- Betreiberangaben, Impressum, Datenschutz und Barrierefreiheitsangaben
- redaktionelle Inhalte, Verzeichnisdaten und die im Rechteinventar dokumentierten
  Ausgabeformen
- GOT-Katalog und Kostenrechner mit den veröffentlichten Grenzen und Hinweisen
- signierter Reiseregelstand `eu-intra-2026` für den ausdrücklich beschriebenen Umfang
- allgemeine Einordnung von Ergänzungsfuttermitteln ohne Dosierungs- oder Therapierat
- statische, gekennzeichnete Amazon-Suchlinks mit `tag=wauandmiau-21`
- statische, gekennzeichnete Fressnapf-Kategorielinks über Awin
- neutrale Tierversicherungsinformation mit gekennzeichnetem HanseMerkur-Link über Awin

Die Freigabe bezieht sich auf den durch CI und Produktionsbuild geprüften Repository-Stand.
Ändern sich freigegebene Fachinhalte, greift weiterhin die jeweilige Versions- oder
Inhaltsprüfung.

## Bewusst nicht aktivierter Umfang

Nicht zum Produktionsumfang gehören ein Tarifvergleich, Beitrags- oder Leistungsdaten von
Versicherern, Amazon- oder andere Händlerbilder, Preis- und Angebotsfeeds, eigenes
Analyse-Tracking, Werbe-Pixel, Nutzerkonten, Uploads oder ein Vertragsabschluss auf Wau & Miau.
Ihre spätere Aktivierung braucht eine eigene Änderung mit den dann erforderlichen Nachweisen.

## Technische Veröffentlichung

Vor dem Deployment müssen `npm run check:release`, der vollständige Produktionsbuild und
die Output-Prüfungen erfolgreich sein. Nach dem Deployment werden Hauptseite, Canonical,
`robots.txt`, Sitemap, Sicherheitsheader, Fehlerseite, zentrale Werkzeuge und die
Erreichbarkeit der Hauptdomain geprüft. Commit und Cloudflare-Version werden anschließend
in `docs/RELEASE.md` dokumentiert.
