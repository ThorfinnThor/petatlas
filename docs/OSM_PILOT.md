# OSM-Pilot: Bremen

Durchgeführt am 2026-09-06 (M10-01). Ein echter Lauf über ein echtes Extrakt, damit der Import nicht nur gegen Fixtures funktioniert.

## Was geladen wurde

| | |
|---|---|
| Distribution | `https://download.geofabrik.de/europe/germany/bremen-latest.osm.pbf` |
| Nach Weiterleitung | `bremen-260905.osm.pbf` |
| Größe | 21.162.890 Byte |
| sha256 | `25df4aeeec5180be68b57b5d979cb1b9450ff7e822df732e3d1540c309532455` |
| `Last-Modified` | Sun, 06 Sep 2026 07:08:34 GMT |
| Lizenz | ODbL 1.0, geprüft (`docs/SOURCE_REVIEWS.md`) |

Abgerufen über den regulären Fetcher: nur `https`, nur ein Host aus der Registry, Weiterleitung einzeln geprüft. Es wurde eine Datei geladen, nichts gecrawlt.

## Ergebnis

| | |
|---|---|
| Gelesene OSM-Objekte | 1.997.647 |
| Treffer einer konfigurierten Kategorie | 74 |
| Als Ort übernommen (Nodes) | 47 |
| Ohne Namen, deshalb nicht übernommen | 8 |
| Ways und Relations, Punkt noch offen (M10-02) | 19 |
| Vom Fachschema abgelehnt | 0 |
| Laufzeit | 0,9 Sekunden |
| Speicher (Heap) | 117 MiB |

Nach Kategorie, nur Nodes: 26 Tierarztpraxen, 21 Zoofachhandel.

Gelesen wird streamend. Die 21 MB werden nicht in ein Array geladen; das ist die Voraussetzung dafür, dass derselbe Code später bundesweit läuft (M10-04).

## Was der Lauf über die Datenlage sagt

**Kein einziger Ort trägt `emergency=yes`.** Alle 47 haben `emergency: null` — unbekannt. Das ist das erwartete und richtige Ergebnis: OSM erfasst Notdienste kaum, und aus „kein Tag“ wird hier nicht „kein Notdienst“ und erst recht nicht „Notdienst vorhanden“.

Ein Viertel der Treffer hat keinen Namen. Diese Objekte werden nicht übernommen, weil ein Ort ohne Namen für Besucher nichts wert ist.

19 der 74 Treffer sind Flächen statt Punkte — vor allem Hundewiesen. Sie fehlen deshalb noch vollständig; ihre Auflösung ist M10-02.

## Was daraus **nicht** folgt

- **Keine Vollständigkeit.** 26 erfasste Tierarztpraxen in Bremen heißen nicht, dass es 26 gibt. OSM ist eine Freiwilligendatenbank.
- **Keine Aktualität.** Der Stand ist der des Extrakts, nicht der der Wirklichkeit. Öffnungszeiten und Telefonnummern können veraltet sein.
- **Keine Notdienstauskunft.** Siehe oben.

Diese drei Punkte gehören in die Oberfläche, nicht nur in dieses Dokument (M10-06, M11).

## Wiederholen

```bash
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
node --input-type=module -e "
  const f = await import('./scripts/ingest/fetch.ts');
  const r = await f.fetchSource('osm-geofabrik-bremen-pbf', { maxBytes: 80*1024*1024 });
  require('node:fs').writeFileSync('.work/bremen-latest.osm.pbf', r.resource.body);
"
```

Danach `importiereExtrakt('.work/bremen-latest.osm.pbf', 'osm-geofabrik-bremen-pbf')`. Die Zahlen ändern sich mit jedem neuen Extrakt; der sha256 oben benennt den geprüften Stand.

Die reproduzierbaren Tests laufen ohne Netz gegen `tests/fixtures/osm/objekte.json`.
