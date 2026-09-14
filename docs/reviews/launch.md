# Launchfreigaben

Stand **2026-09-14**. Der Betreiber hat die öffentliche Veröffentlichung des geprüften
Wau-&-Miau-Umfangs freigegeben. Der datierte Nachweis und die genaue Abgrenzung stehen in
`docs/reviews/public-release-2026-09-14.md`.

## Produktionsrelevante Gates

| Gate | Stand | Nachweis |
|---|---|---|
| `operatorImprint` | freigegeben | `docs/reviews/public-release-2026-09-14.md` |
| `domain` | freigegeben | `docs/reviews/public-release-2026-09-14.md` |
| `dataRights` | freigegeben | `docs/reviews/asset-rights-inventory-2026-09-14.md` |
| `costsRules` | freigegeben | `docs/reviews/costs.md` |
| `travelRules` | freigegeben | `docs/reviews/travel.md` und signierter Inhaltsstand |

`insuranceAffiliate`, `commerceAffiliate` und `adsTracking` bleiben deaktiviert, weil
diese Funktionen nicht zum aktuellen Produktionsumfang gehören. Die ausdrücklich
autorisierten Amazon-Textlinks sind davon getrennt dokumentiert und enthalten weder
Produktbilder noch Preis- oder Angebotsfeeds.

Die Rechtsprüfungen für Anbieterkennzeichnung, Datenschutz und Barrierefreiheit sind als
erfüllt eingetragen. Für Verbraucherstreitbeilegung ist für den veröffentlichten Umfang
keine zusätzliche Erklärung aufzunehmen. `npm run check:release` prüft den
maschinenlesbaren Stand vor jedem Produktionsbuild.
