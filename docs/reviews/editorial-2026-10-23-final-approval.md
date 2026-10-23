# Betreiberfreigabe der Redaktionsrunde vom 23.10.2026

## Entscheidung

Der Betreiber hat am 23.10.2026 nach Durchsicht der PDF-Vorschauen geschrieben: „die vier
Artikel sind freigegeben“. Wie bei der Runde vom 16.10.2026 reichen die amtlichen
Primärquellen, die aus dem GOT-Datensatz berechneten Beträge und die klar benannten Grenzen für
die Veröffentlichung dieser begrenzten, nicht individuell beratenden Inhalte. Eine zusätzliche
externe Fachprüfung wird dafür nicht verlangt.

Freigegeben sind:

1. „Tierarztkosten für Hund und Katze: Tabelle häufiger Leistungen nach GOT“
2. „Hund oder Katze einschläfern lassen: Welche Kosten nach GOT?“
3. „Kater mit Kryptorchismus: Was kostet die Kastration nach GOT?“
4. „Magendrehung beim Hund: Was kostet die Notoperation nach GOT?“

Die Artikel erscheinen unter `/de-de/blog/`, tragen `status: "published"` und
`indexable: true` und dürfen in Sitemap und Seitensuche aufgenommen werden.

## Grundlage

- Kandidaten aus der Google Search Console (Domain-Property, 22.09.–20.10.2026), eingeschränkt
  auf Hund und Katze; Redaktionsrunde `content-data/editorial-runs/2026-10-23-kosten-nachfrage.json`.
- Quellen: `got-2022-official`, `btk-got-guidance`.
- Alle Beträge per Skript aus `data-snapshots/got/got-2022.json` mit 19 Prozent Umsatzsteuer.

## Inhaltliche Grenzen

- GOT-Beträge sind Sätze einzelner Positionen, kein Endpreis eines Praxisbesuchs.
- Positionen stehen als „kann auf der Rechnung stehen“, nicht als typische oder empfohlene
  Behandlung. Medikamente, Material, Laborleistungen, Einäscherung und Klinikaufenthalt sind als
  nicht enthalten bzw. gesondert ausgewiesen.
- Ein MRT-Artikel wurde bewusst nicht geschrieben (Entscheidung `blocked`).

## Indexbudget

Mit den vier Artikeln sind 125 Seiten indexierbar (Korridor 100–160; höchstens zehn neue Seiten
pro Woche nach `docs/CONTENT_STANDARD.md`).
