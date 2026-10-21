/**
 * Eigens geschriebene Texte der vier Futtervergleiche. Produktnamen stehen
 * hier bewusst nicht: Welche Produkte empfohlen werden, folgt aus Daten und
 * Bewertungsschema und kann sich mit jeder Datenprüfung ändern.
 */
import type { FutterVergleichsSeite } from './comparison-pages.ts';

const GEMEINSAME_FRAGEN = {
  trockenmasse: {
    frage: 'Warum rechnet ihr auf Trockenmasse um?',
    antwort:
      'Auf dem Etikett stehen die Nährwerte in der Frischmasse, also mit Wasser. Ein Nassfutter mit 80 % Feuchte und 10 % Protein enthält in der Trockenmasse 50 % Protein, ein Trockenfutter mit 10 % Feuchte und 32 % Protein dagegen 35,6 %. Erst ohne Wasser werden die Werte vergleichbar.',
  },
  kohlenhydrate: {
    frage: 'Warum stehen keine Kohlenhydrate auf dem Etikett?',
    antwort:
      'Die Futtermittelkennzeichnung verlangt Rohprotein, Fettgehalt, Rohfaser und Rohasche, aber keine Kohlenhydrate. Wir rechnen sie als Rest: 100 % minus diese vier Werte und die Feuchte. Das ist die übliche Schätzung (stickstofffreie Extraktstoffe) und auf wenige Prozent genau.',
  },
  wechsel: {
    frage: 'Wie stelle ich auf ein anderes Futter um?',
    antwort:
      'Schrittweise über etwa sieben bis zehn Tage: anfangs ein Viertel neues Futter, dann die Hälfte, dann drei Viertel. Bei Durchfall, Erbrechen oder Futterverweigerung langsamer umstellen und bei anhaltenden Beschwerden die Tierarztpraxis fragen.',
  },
  preis: {
    frage: 'Warum vergleicht ihr den Preis pro Tag statt pro Kilo?',
    antwort:
      'Weil Futter unterschiedlich energiereich ist. Von einem Futter mit viel Energie braucht ein Tier weniger Gramm am Tag. Wir nehmen die Menge aus der Fütterungstabelle des Herstellers und multiplizieren sie mit dem Preis pro Gramm. Preise ändern sich; maßgeblich ist das Prüfdatum am Produkt.',
  },
} as const;

export const SEITEN: readonly FutterVergleichsSeite[] = [
  {
    slug: 'katze-trockenfutter',
    species: 'cat',
    format: 'dry',
    referenz: 'cat 4 kg adult',
    titel: 'Trockenfutter für Katzen im Vergleich',
    metaTitel: 'Katzen-Trockenfutter Vergleich 2026: 12 Sorten nachgerechnet',
    beschreibung:
      'Zwölf Trockenfutter für erwachsene Katzen: Protein und Kohlenhydrate in der Trockenmasse, Zusammensetzung und Kosten pro Tag. Mit begründeter Empfehlung.',
    referenzLabel: 'eine erwachsene Katze mit 4 kg',
    einleitung: [
      'Welches Trockenfutter für eine erwachsene Katze? Wir haben die Deklarationen von zwölf verbreiteten Sorten vom Discounter- bis zum Premiumsegment nachgerechnet und geben eine klare Empfehlung.',
      'Entscheidend sind drei Fragen: Wie viel Protein steckt ohne Wasser im Futter, wie viel rechnerische Kohlenhydrate, und was kostet eine Tagesration. Trockenfutter liefert kaum Wasser; viele Halter kombinieren es deshalb mit Nassfutter.',
    ],
    kriterienHinweis:
      'Bis zu 100 Punkte, verteilt auf fünf Kriterien. Jede Teilnote steht am Produkt und lässt sich aus den angezeigten Zahlen nachrechnen.',
    fragen: [
      {
        frage: 'Reicht Trockenfutter allein für eine Katze?',
        antwort:
          'Ein Alleinfuttermittel deckt den Nährstoffbedarf, auch als Trockenfutter. Katzen trinken aber von Natur aus wenig. Wer nur trocken füttert, sollte frisches Wasser an mehreren Stellen anbieten; viele Halter füttern zusätzlich Nassfutter.',
      },
      {
        frage: 'Wie viel Protein sollte Katzentrockenfutter haben?',
        antwort:
          'Die europäische Branchenrichtlinie (FEDIAF) nennt für erwachsene Katzen mindestens 25 bis 33 g Protein je 100 g Trockenmasse, je nach Energiebedarf. Die Produkte in diesem Vergleich liegen alle darüber; mehr Punkte gibt es bei uns ab 40 % in der Trockenmasse.',
      },
      GEMEINSAME_FRAGEN.trockenmasse,
      GEMEINSAME_FRAGEN.kohlenhydrate,
      GEMEINSAME_FRAGEN.preis,
      GEMEINSAME_FRAGEN.wechsel,
    ],
  },
  {
    slug: 'katze-nassfutter',
    species: 'cat',
    format: 'wet',
    referenz: 'cat 4 kg adult',
    titel: 'Nassfutter für Katzen im Vergleich',
    metaTitel: 'Katzen-Nassfutter Vergleich 2026: 12 Sorten nachgerechnet',
    beschreibung:
      'Zwölf Nassfutter für erwachsene Katzen: Zusammensetzung, Protein und Kohlenhydrate in der Trockenmasse, Zucker und Kosten pro Tag. Mit begründeter Empfehlung.',
    referenzLabel: 'eine erwachsene Katze mit 4 kg',
    einleitung: [
      'Welches Nassfutter für eine erwachsene Katze? Wir haben zwölf verbreitete Sorten von günstig bis Premium nachgerechnet und sagen klar, welche wir nehmen würden und warum.',
      'Bei Nassfutter unterscheiden sich vor allem die Zusammensetzung (konkrete Fleischsorten mit Prozentangabe oder Sammelbegriffe), der Zuckerzusatz und der Preis pro Tag, der wegen der kleinen Portionen schnell steigt.',
    ],
    kriterienHinweis:
      'Bis zu 100 Punkte, verteilt auf fünf Kriterien. Jede Teilnote steht am Produkt und lässt sich aus den angezeigten Zahlen nachrechnen.',
    fragen: [
      {
        frage: 'Woran erkenne ich ein gutes Katzennassfutter?',
        antwort:
          'Am Wort „Alleinfuttermittel“ auf dem Etikett, an einer offenen Deklaration mit konkreten Fleischsorten und Prozentangaben, an einem hohen Proteinanteil in der Trockenmasse und daran, dass kein Zucker oder Karamell zugesetzt ist.',
      },
      {
        frage: 'Was bedeutet „Fleisch und tierische Nebenerzeugnisse“?',
        antwort:
          'Das ist ein gesetzlich erlaubter Sammelbegriff. Er sagt nicht, welche Tierarten und welche Teile enthalten sind und in welchem Verhältnis. Schlecht ist das nicht automatisch, aber es lässt sich nicht prüfen. Deshalb gibt es bei uns Abzug.',
      },
      GEMEINSAME_FRAGEN.trockenmasse,
      GEMEINSAME_FRAGEN.kohlenhydrate,
      GEMEINSAME_FRAGEN.preis,
      GEMEINSAME_FRAGEN.wechsel,
    ],
  },
  {
    slug: 'hund-trockenfutter',
    species: 'dog',
    format: 'dry',
    referenz: 'dog 25 kg adult',
    zweiteReferenz: 'dog 10 kg adult',
    titel: 'Trockenfutter für Hunde im Vergleich',
    metaTitel: 'Hunde-Trockenfutter Vergleich 2026: 12 Sorten nachgerechnet',
    beschreibung:
      'Zwölf Trockenfutter für erwachsene Hunde: Protein und Fett in der Trockenmasse, Zusammensetzung und Kosten pro Tag für 10- und 25-kg-Hunde. Mit begründeter Empfehlung.',
    referenzLabel: 'einen erwachsenen Hund mit 25 kg',
    einleitung: [
      'Welches Trockenfutter für einen erwachsenen Hund? Wir haben zwölf verbreitete Sorten von günstig bis Premium nachgerechnet und geben eine begründete Empfehlung.',
      'Verglichen werden Zusammensetzung, Protein und Fett in der Trockenmasse und die Kosten pro Tag, einmal für einen 25-kg-Hund und einmal für einen 10-kg-Hund. Bei großen Hunden fällt der Preisunterschied über ein Jahr deutlich ins Gewicht.',
    ],
    kriterienHinweis:
      'Bis zu 100 Punkte, verteilt auf fünf Kriterien. Bewertet wird mit den Kosten für einen 25-kg-Hund; die Spalte für 10 kg dient zur Orientierung.',
    fragen: [
      {
        frage: 'Wie viel Protein braucht ein erwachsener Hund?',
        antwort:
          'Die europäische Branchenrichtlinie (FEDIAF) nennt für erwachsene Hunde mindestens 18 bis 21 g Protein je 100 g Trockenmasse, je nach Energiebedarf. Mehr ist für gesunde Hunde unproblematisch; wir geben ab 24 % in der Trockenmasse die volle Punktzahl.',
      },
      {
        frage: 'Ist getreidefreies Hundefutter besser?',
        antwort:
          'Nicht grundsätzlich. Getreide ist für die meisten Hunde gut verdaulich. Getreidefrei kann bei einer nachgewiesenen Unverträglichkeit sinnvoll sein. Wir bewerten deshalb nicht, ob Getreide enthalten ist, sondern ob die Zutaten konkret benannt sind.',
      },
      GEMEINSAME_FRAGEN.trockenmasse,
      GEMEINSAME_FRAGEN.preis,
      GEMEINSAME_FRAGEN.wechsel,
    ],
  },
  {
    slug: 'hund-nassfutter',
    species: 'dog',
    format: 'wet',
    referenz: 'dog 10 kg adult',
    zweiteReferenz: 'dog 25 kg adult',
    titel: 'Nassfutter für Hunde im Vergleich',
    metaTitel: 'Hunde-Nassfutter Vergleich 2026: 12 Sorten nachgerechnet',
    beschreibung:
      'Zwölf Nassfutter für erwachsene Hunde: Zusammensetzung, Protein und Fett in der Trockenmasse, Zucker und Kosten pro Tag. Mit begründeter Empfehlung.',
    referenzLabel: 'einen erwachsenen Hund mit 10 kg',
    einleitung: [
      'Welches Nassfutter für einen erwachsenen Hund? Wir haben zwölf verbreitete Sorten nachgerechnet und sagen klar, welche wir nehmen würden und warum.',
      'Nassfutter wird vor allem bei kleinen und mittelgroßen Hunden als Hauptfutter gegeben; bei großen Hunden wird es schnell teuer. Bewertet wird deshalb mit einem 10-kg-Hund, die Kosten für 25 kg stehen zur Orientierung daneben.',
    ],
    kriterienHinweis:
      'Bis zu 100 Punkte, verteilt auf fünf Kriterien. Bewertet wird mit den Kosten für einen 10-kg-Hund; die Spalte für 25 kg dient zur Orientierung.',
    fragen: [
      {
        frage: 'Kann ich meinen Hund nur mit Nassfutter füttern?',
        antwort:
          'Ja, wenn auf der Dose „Alleinfuttermittel“ steht. Reine Fleischdosen sind oft Ergänzungsfuttermittel und brauchen Zusätze wie Gemüse, Öl und Mineralstoffe. Diese Produkte zeigen wir im Vergleich, empfehlen sie aber nicht als alleiniges Futter.',
      },
      {
        frage: 'Was bedeutet „Fleisch und tierische Nebenerzeugnisse“?',
        antwort:
          'Das ist ein gesetzlich erlaubter Sammelbegriff. Er sagt nicht, welche Tierarten und welche Teile enthalten sind und in welchem Verhältnis. Schlecht ist das nicht automatisch, aber es lässt sich nicht prüfen. Deshalb gibt es bei uns Abzug.',
      },
      GEMEINSAME_FRAGEN.trockenmasse,
      GEMEINSAME_FRAGEN.preis,
      GEMEINSAME_FRAGEN.wechsel,
    ],
  },
];
