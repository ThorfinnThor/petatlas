import type { AmazonSelection } from './amazon.ts';

export interface PurchaseGuideProduct {
  readonly name: string;
  readonly brand: string;
  readonly model: string;
  readonly amazonSelection: AmazonSelection;
  readonly sourceUrl: string;
  readonly sourceLabel: string;
  readonly checkedAt: string;
  readonly comparison: readonly string[];
  readonly summary: readonly string[];
  readonly facts: readonly string[];
  readonly note?: string;
}

export interface PurchaseGuide {
  readonly slug: string;
  readonly metaTitle: string;
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly intro: readonly string[];
  readonly tableHeaders: readonly string[];
  readonly products: readonly PurchaseGuideProduct[];
  readonly criteriaTitle: string;
  readonly criteria: readonly { title: string; text: string }[];
  readonly conclusion: readonly string[];
  readonly faqs: readonly { question: string; answer: string }[];
  readonly relatedLinks: readonly { href: string; label: string }[];
}

const checkedAt = '2026-09-19';

export const PURCHASE_GUIDES: readonly PurchaseGuide[] = [
  {
    slug: 'katzentransportboxen-vergleich',
    metaTitle: 'Katzentransportbox kaufen: 3 Bauformen im Vergleich',
    title: 'Katzentransportbox kaufen: Welche Bauform passt zu deinem Alltag?',
    description:
      'Drei Katzentransportboxen sachlich vergleichen: Maße, Gewicht, maximale Belastung, Öffnungen und Auto-Befestigung bei TRIXIE Capri und Catit Cabrio.',
    eyebrow: 'Kaufhilfe · Katze',
    intro: [
      'Eine Katzentransportbox muss nicht möglichst viele Funktionen haben. Entscheidend ist, ob Größe, Öffnung, Eigengewicht und Transportart zu deiner Katze und zu den typischen Wegen passen.',
      'Wir vergleichen deshalb dokumentierte Produkteigenschaften statt Sternebewertungen oder pauschale Testsieger. Preise und Verfügbarkeit werden nicht auf Wau & Miau gespeichert; der Händlerlink öffnet eine konkrete Amazon-Suche.',
    ],
    tableHeaders: ['Modell', 'Maße', 'Belastung', 'Eigengewicht', 'Zugang'],
    products: [
      {
        name: 'TRIXIE Capri 1',
        brand: 'TRIXIE',
        model: 'Art.-Nr. 39811',
        amazonSelection: 'trixie-capri-1-39811',
        sourceUrl:
          'https://www.trixie.de/cat/transport-travel/transport-boxes/transport-box-capri-1-2-1001435865-1001442997',
        sourceLabel: 'TRIXIE · Hersteller',
        checkedAt,
        comparison: ['TRIXIE Capri 1', '32 × 31 × 48 cm', 'bis 6 kg', '1,2 kg', 'vorne'],
        summary: [
          'Die Capri 1 ist die kompakteste Box in diesem Vergleich. TRIXIE nennt für die Variante 39811 32 × 31 × 48 cm, eine Belastbarkeit bis 6 kg und 1,2 kg Eigengewicht.',
          'Sie besteht aus Kunststoff, hat einen Tragegriff, seitliche Lüftungsschlitze und eine Gittertür. Damit ist sie vor allem dann nachvollziehbar interessant, wenn eine kleine, leichte Box mit klassischem Frontzugang gesucht wird.',
        ],
        facts: ['32 × 31 × 48 cm', 'bis 6 kg', '1,2 kg', 'Kunststoff, Tragegriff und Gittertür'],
        note: 'Die Gewichtsgrenze ersetzt keine Größenprüfung: Die Katze muss in der Box ausreichend Platz zum Stehen und Drehen haben.',
      },
      {
        name: 'TRIXIE Capri 3 Open Top',
        brand: 'TRIXIE',
        model: 'Art.-Nr. 39861',
        amazonSelection: 'trixie-capri-3-open-top-39861',
        sourceUrl:
          'https://www.trixie.de/katze/transport-reisen/transportboxen/transportbox-capri-3-open-top-1001435865-1001443009',
        sourceLabel: 'TRIXIE · Hersteller',
        checkedAt,
        comparison: [
          'TRIXIE Capri 3 Open Top',
          '40 × 38 × 61 cm',
          'bis 12 kg',
          '2,5 kg',
          'vorne + oben',
        ],
        summary: [
          'Der zentrale Unterschied der Capri 3 Open Top ist der zusätzliche Zugang von oben. TRIXIE nennt für die Variante 39861 40 × 38 × 61 cm, bis 12 kg Belastbarkeit und 2,5 kg Eigengewicht.',
          'Oben sitzt ein Metallgitter, vorne eine Metalltür. Wer gezielt eine Oberöffnung möchte, kann dieses Merkmal deshalb direkt gegen das größere Außenmaß und das höhere Eigengewicht abwägen.',
        ],
        facts: ['40 × 38 × 61 cm', 'bis 12 kg', '2,5 kg', 'von vorne und oben zu öffnen'],
      },
      {
        name: 'Catit Cabrio',
        brand: 'Catit',
        model: 'Blaugrau · Art.-Nr. 41372',
        amazonSelection: 'catit-cabrio-41372',
        sourceUrl: 'https://www.catit.com/de/produkte/transportboxen/cabrio-transportbox/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: ['Catit Cabrio', '51 × 33 × 35 cm', 'bis 11,3 kg', '—', 'Rundumzugang'],
        summary: [
          'Die Catit Cabrio verfolgt eine andere Konstruktion. Catit gibt 51 × 33 × 35 cm und ein maximales Katzengewicht von 11,3 kg an. Die Box ist laut Hersteller rundum zugänglich und besitzt ein Einhand-Verriegelungssystem.',
          'Zur Ausstattung gehören Tragegurt, Belüftung vorne, oben und unten sowie herausziehbare Futter- und Wassernäpfe. Catit beschreibt außerdem ausdrücklich eine Sicherung im Auto mit einem üblichen Sicherheitsgurt.',
        ],
        facts: [
          '51 × 33 × 35 cm',
          'max. 11,3 kg',
          'Rundumzugang mit Einhand-Verriegelung',
          'Tragegurt und vom Hersteller beschriebene Autogurt-Sicherung',
        ],
      },
    ],
    criteriaTitle: 'Was du vor dem Kauf messen solltest',
    criteria: [
      {
        title: 'Katze: Gewicht und Körpergröße',
        text: 'Die Belastbarkeit ist nur eine Obergrenze. Prüfe zusätzlich, ob deine Katze in der Box ausreichend Platz hat.',
      },
      {
        title: 'Platz im Auto',
        text: 'Miss den vorgesehenen Stellplatz im Fahrzeug. Außenmaße können in Kofferraum oder Fußraum kaufentscheidend sein.',
      },
      {
        title: 'Gewünschte Öffnung',
        text: 'Frontzugang, zusätzliche Oberöffnung oder Rundumzugang sind unterschiedliche Konstruktionsmerkmale. Wähle nach deinem tatsächlichen Ablauf.',
      },
      {
        title: 'Gesamtgewicht beim Tragen',
        text: 'Zum Eigengewicht der Box kommt das Gewicht der Katze. Das ist besonders bei längeren Wegen relevant.',
      },
    ],
    conclusion: [
      'Capri 1: kompakt und leicht mit klassischem Frontzugang.',
      'Capri 3 Open Top: größer und schwerer, dafür zusätzlich von oben zu öffnen.',
      'Catit Cabrio: andere Bauform mit Rundumzugang, Tragegurt und vom Hersteller beschriebener Autogurt-Sicherung.',
      'Das ist keine Rangliste. Die passende Konstruktion hängt davon ab, welche dieser Eigenschaften du tatsächlich brauchst.',
    ],
    faqs: [
      {
        question: 'Reicht das Katzengewicht zur Auswahl der Box?',
        answer:
          'Nein. Die Herstellergrenze sagt nichts darüber aus, ob die Innen- und Außenmaße für deine Katze und den vorgesehenen Transportplatz passen.',
      },
      {
        question: 'Ist eine Öffnung von oben grundsätzlich besser?',
        answer:
          'Nein. Sie ist ein zusätzliches Ausstattungsmerkmal. Ob sie hilfreich ist, hängt davon ab, wie du die Box im Alltag nutzt.',
      },
      {
        question: 'Kann jede Katzentransportbox mit dem Autogurt befestigt werden?',
        answer:
          'Das sollte nicht pauschal angenommen werden. Beim Catit Cabrio beschreibt der Hersteller diese Sicherung ausdrücklich; bei anderen Modellen ist die jeweilige Anleitung maßgeblich.',
      },
    ],
    relatedLinks: [
      {
        href: '/de-de/ratgeber/katze-transportbox/',
        label: 'Transportbox trainieren – Schritt für Schritt',
      },
      { href: '/de-de/pflege/', label: 'Pflege und Zubehör' },
    ],
  },
  {
    slug: 'hunderampe-auto-vergleich',
    metaTitle: 'Hunderampe fürs Auto: 3 Modelle im Vergleich',
    title: 'Hunderampe fürs Auto: feste oder teleskopierbare Rampe?',
    description:
      'Drei Hunderampen fürs Auto im Faktenvergleich: Länge, Breite, Eigengewicht, Traglast und Verstellung bei TRIXIE Petwalk und PetSafe Happy Ride.',
    eyebrow: 'Kaufhilfe · Hund',
    intro: [
      'Bei einer Hunderampe fürs Auto sind messbare Eigenschaften wichtiger als Werbeversprechen: Wie hoch ist die Ladekante? Wie lang kann die Rampe sein? Wie breit ist die Lauffläche? Wie viel wiegt die Rampe selbst?',
      'Der Vergleich stellt eine feste Rampe zwei Teleskopmodellen gegenüber. Er trifft keine medizinische Aussage darüber, ob eine Rampe für einen bestimmten Hund notwendig oder geeignet ist.',
    ],
    tableHeaders: ['Modell', 'Länge × Breite', 'Traglast', 'Eigengewicht', 'Konstruktion'],
    products: [
      {
        name: 'TRIXIE Petwalk 3942',
        brand: 'TRIXIE',
        model: 'Art.-Nr. 3942',
        amazonSelection: 'trixie-petwalk-3942',
        sourceUrl:
          'https://www.trixie.de/fr/chien/hygiene-sante-et-proprete/rampes-et-escaliers-pour-chiens/rampe-en-plastique-1001435625-1001443444',
        sourceLabel: 'TRIXIE · Hersteller',
        checkedAt,
        comparison: ['TRIXIE Petwalk 3942', '100 × 38 cm', 'bis 50 kg', '2,8 kg', 'feste Rampe'],
        summary: [
          'Die TRIXIE Petwalk 3942 misst laut Hersteller 38 × 100 cm, wiegt 2,8 kg und ist für bis zu 50 kg angegeben. TRIXIE nennt eine rutschfeste Lauffläche und die Nutzung innen wie außen.',
          'Der entscheidende Unterschied zu den anderen beiden Modellen ist die feste Länge. Dafür ist die Rampe deutlich leichter als die Teleskopvarianten.',
        ],
        facts: [
          '38 × 100 cm',
          'bis 50 kg',
          '2,8 kg',
          'feste Kunststofframpe mit rutschfester Lauffläche',
        ],
      },
      {
        name: 'TRIXIE Teleskop-Rampe Petwalk 3940',
        brand: 'TRIXIE',
        model: 'Art.-Nr. 3940',
        amazonSelection: 'trixie-petwalk-teleskop-3940',
        sourceUrl:
          'https://www.trixie.de/en/productworld/dog/transport-travel/dog-ramps-steps/2-step-telescope-ramp-aluminium-sandpaper-1001435625-1001443424?itemNo=3940',
        sourceLabel: 'TRIXIE · Hersteller',
        checkedAt,
        comparison: [
          'TRIXIE Petwalk 3940',
          '100–180 × 43 cm',
          'bis 120 kg',
          '5,8 kg',
          'Teleskoprampe',
        ],
        summary: [
          'Die TRIXIE 3940 ist stufenlos teleskopierbar. TRIXIE nennt 100 bis 180 cm Länge, 43 cm Breite, 5,8 kg Eigengewicht und bis zu 120 kg Belastbarkeit.',
          'Damit lässt sich die Länge stärker an verschiedene Fahrzeuge anpassen als bei der festen 3942. Das höhere Eigengewicht ist die direkte Gegenleistung für diese verstellbare Konstruktion.',
        ],
        facts: ['43 × 100–180 cm', 'bis 120 kg', '5,8 kg', 'stufenlos verstellbare Teleskoprampe'],
      },
      {
        name: 'PetSafe Happy Ride Teleskop-Hunderampe',
        brand: 'PetSafe',
        model: 'PTV17-16898',
        amazonSelection: 'petsafe-happy-ride-ptv17-16898',
        sourceUrl: 'https://www.petsafe.com/de/p/happy-ride-teleskop-hunderampe/PTV17-16898/',
        sourceLabel: 'PetSafe · Hersteller',
        checkedAt,
        comparison: ['PetSafe Happy Ride', '99–183 × 43 cm', 'bis 181 kg', '6 kg', 'Teleskoprampe'],
        summary: [
          'PetSafe gibt für die Happy Ride Teleskop-Hunderampe 99 bis 183 cm Länge, 43 cm Breite, etwa 6 kg Eigengewicht und eine Traglast bis 181 kg an.',
          'Der Hersteller nennt außerdem eine rutschfeste Oberfläche, seitliche Führungen und eine Verschlusslasche für den zusammengeschobenen Transportzustand.',
        ],
        facts: [
          '99–183 × 43 cm',
          'bis 181 kg',
          '6 kg',
          'Aluminium-Teleskoprampe mit Verschlusslasche',
        ],
        note: 'Die hohe Traglast ist ein einzelnes technisches Merkmal und kein pauschales Qualitätsurteil.',
      },
    ],
    criteriaTitle: 'Welche Maße solltest du am Auto prüfen?',
    criteria: [
      {
        title: 'Höhe der Ladekante',
        text: 'Miss vom Boden bis zu dem stabilen Punkt, an dem die Rampe tatsächlich aufliegen soll.',
      },
      {
        title: 'Platz für die ausgelegte Rampe',
        text: 'Eine längere Rampe braucht mehr Stellfläche hinter oder neben dem Auto. Das kann auf engen Parkplätzen entscheidend sein.',
      },
      {
        title: 'Breite',
        text: 'Die verglichenen Modelle liegen zwischen 38 und 43 cm Breite. Diese Differenz solltest du bewusst gegen Platz und Handhabung abwägen.',
      },
      {
        title: 'Eigengewicht und Verstaumaß',
        text: '2,8 kg gegenüber rund 6 kg machen beim Ein- und Ausladen einen Unterschied. Bei Teleskoprampen ist zusätzlich das Maß im zusammengeschobenen Zustand relevant.',
      },
    ],
    conclusion: [
      'TRIXIE 3942: feste 100-cm-Rampe und das geringste Eigengewicht im Vergleich.',
      'TRIXIE 3940: verstellbare Länge bis 180 cm bei 43 cm Breite.',
      'PetSafe Happy Ride: ähnlich lange Teleskopkonstruktion mit höherer vom Hersteller angegebener Traglast.',
      'Vor dem Kauf ist Messen sinnvoller als eine Rangliste: Fahrzeughöhe, verfügbarer Platz und Handhabung müssen zusammenpassen.',
    ],
    faqs: [
      {
        question: 'Ist eine längere Rampe automatisch besser?',
        answer:
          'Nein. Sie benötigt mehr Platz. Der praktische Vorteil einer Teleskoprampe besteht vor allem darin, die Länge innerhalb des vorgesehenen Bereichs anpassen zu können.',
      },
      {
        question: 'Reicht die maximale Traglast als Kaufkriterium?',
        answer:
          'Nein. Breite, Länge, Eigengewicht, Auflagepunkt und Verstaumöglichkeit sind ebenfalls relevante technische Eigenschaften.',
      },
      {
        question: 'Sind Außenmaß und Verstaumaß identisch?',
        answer:
          'Bei einer festen Rampe weitgehend ja; bei Teleskoprampen verändert sich die Länge. Prüfe die konkrete Anleitung für den Transportzustand.',
      },
    ],
    relatedLinks: [{ href: '/de-de/pflege/', label: 'Pflege und Zubehör für Hunde und Katzen' }],
  },
  {
    slug: 'kong-hundespielzeug-vergleich',
    metaTitle: 'KONG Classic, Extreme oder Wobbler? Unterschiede',
    title: 'KONG Classic, Extreme oder Wobbler: Was unterscheidet die Modelle?',
    description:
      'KONG Classic, Extreme und Wobbler sachlich vergleichen: Material, Befüllung, Spielprinzip, Größenwahl und Sicherheitshinweise des Herstellers.',
    eyebrow: 'Kaufhilfe · Hundespielzeug',
    intro: [
      'Unter dem Namen KONG werden Spielzeuge mit unterschiedlichen Funktionen verkauft. Classic und Extreme sind befüllbare Naturkautschuk-Spielzeuge; der Wobbler ist dagegen ein beweglicher Futterspender.',
      'Wer nur nach „KONG Hundespielzeug“ sucht, vergleicht deshalb schnell Produkte, die nicht dasselbe Spielprinzip haben. Diese Kaufhilfe trennt die drei Modelle anhand dokumentierter Herstellerangaben.',
    ],
    tableHeaders: [
      'Modell',
      'Grundprinzip',
      'Material / Bauart',
      'Befüllbar',
      'Wichtiger Unterschied',
    ],
    products: [
      {
        name: 'KONG Classic',
        brand: 'KONG',
        model: 'Produktfamilie in mehreren Größen',
        amazonSelection: 'kong-classic',
        sourceUrl: 'https://www.kongcompany.com/kong-classic/',
        sourceLabel: 'KONG · Hersteller',
        checkedAt,
        comparison: [
          'KONG Classic',
          'Kauen, Werfen, Befüllen',
          'Naturkautschuk',
          'ja',
          'rote Gummimischung',
        ],
        summary: [
          'Der KONG Classic besteht laut Hersteller aus Naturkautschuk, kann mit Futter oder Snacks befüllt werden und springt durch seine Form nicht immer in dieselbe Richtung.',
          'KONG bietet ihn in mehreren Größen an und weist darauf hin, dass kräftige Kauer gegebenenfalls eine größere Größe oder die Extreme-Linie benötigen. Deshalb sollte der Amazon-Link erst nach Auswahl der passenden Variante als konkrete Kaufoption verstanden werden.',
        ],
        facts: [
          '100 % Naturkautschuk laut Hersteller',
          'befüllbar',
          'mehrere Größen',
          'unregelmäßiges Sprungverhalten',
        ],
      },
      {
        name: 'KONG Extreme',
        brand: 'KONG',
        model: 'Produktfamilie in mehreren Größen',
        amazonSelection: 'kong-extreme',
        sourceUrl: 'https://www.kongcompany.com/kong-extreme/',
        sourceLabel: 'KONG · Hersteller',
        checkedAt,
        comparison: [
          'KONG Extreme',
          'Kauen, Werfen, Befüllen',
          'Naturkautschuk',
          'ja',
          'schwarze Gummimischung',
        ],
        summary: [
          'Der KONG Extreme folgt demselben Grundkonzept wie der Classic: befüllbarer Naturkautschuk und unregelmäßiges Sprungverhalten. KONG positioniert die schwarze Gummimischung ausdrücklich für kräftige Kauer.',
          'Das ist keine Unzerstörbarkeitsgarantie. Der Hersteller verlangt weiterhin beaufsichtigte Nutzung und das Entfernen des Spielzeugs bei Beschädigung.',
        ],
        facts: [
          '100 % Naturkautschuk laut Hersteller',
          'für kräftige Kauer positioniert',
          'befüllbar',
          'mehrere Größen',
        ],
        note: 'Nicht als „unkaputtbar“ beschreiben: KONG nennt ausdrücklich Sicherheits- und Austauschinweise bei Schäden.',
      },
      {
        name: 'KONG Wobbler',
        brand: 'KONG',
        model: 'Small / Large',
        amazonSelection: 'kong-wobbler',
        sourceUrl: 'https://www.kongcompany.com/wobbler/',
        sourceLabel: 'KONG · Hersteller',
        checkedAt,
        comparison: [
          'KONG Wobbler',
          'Futterspender zum Anstoßen',
          'harter, aufschraubbarer Körper',
          'ja',
          'kein Kauspielzeug',
        ],
        summary: [
          'Beim KONG Wobbler ändert sich das Spielprinzip vollständig. Das Spielzeug steht aufrecht und gibt nach dem Anstoßen mit Pfote oder Nase Futter beziehungsweise Snacks ab, während es wackelt, dreht und rollt.',
          'Der obere Teil lässt sich zum Befüllen und Reinigen abschrauben. KONG kennzeichnet den Wobbler ausdrücklich als kein Kauspielzeug und empfiehlt beaufsichtigte Nutzung.',
        ],
        facts: [
          'Futterspender',
          'aufschraubbar',
          'oberer Korb der Spülmaschine laut Hersteller',
          'kein Kauspielzeug',
        ],
      },
    ],
    criteriaTitle: 'Welche KONG-Art suchst du eigentlich?',
    criteria: [
      {
        title: 'Befüllbares Gummispielzeug',
        text: 'Dann vergleichst du vor allem Classic und Extreme. Größe und die vom Hersteller vorgesehene Gummimischung sind zentrale Unterschiede.',
      },
      {
        title: 'Beweglicher Futterspender',
        text: 'Dann ist der Wobbler die andere Produktkategorie: Er gibt Futter durch Anstoßen und Wackeln aus und ist laut Hersteller kein Kauspielzeug.',
      },
      {
        title: 'Größe',
        text: 'Classic und Extreme werden in mehreren Größen angeboten. Kontrolliere die konkrete Größenempfehlung auf der Hersteller- und Händlerseite.',
      },
      {
        title: 'Verschleiß',
        text: 'Kontrolliere Hundespielzeug regelmäßig auf Schäden und entferne beschädigte Produkte. Diese Herstellerhinweise gelten auch bei robust positionierten Varianten.',
      },
    ],
    conclusion: [
      'Classic und Extreme teilen dasselbe Grundprinzip; die Herstellerpositionierung der Gummimischung unterscheidet sich.',
      'Der Wobbler ist funktional etwas anderes: ein beweglicher Futterspender statt eines Gummikörpers zum Kauen.',
      'Die sinnvolle Auswahl beginnt deshalb mit dem gewünschten Spielprinzip und erst danach mit Größe oder Variante.',
    ],
    faqs: [
      {
        question: 'Ist KONG Extreme unzerstörbar?',
        answer:
          'Nein. KONG beschreibt die Extreme-Gummimischung für kräftige Kauer, verlangt aber weiterhin beaufsichtigte Nutzung und das Entfernen beschädigter Spielzeuge.',
      },
      {
        question: 'Kann ich Wobbler und Classic gleich verwenden?',
        answer:
          'Nein. Der Classic ist ein befüllbares Gummispielzeug. Der Wobbler ist ein beweglicher Futterspender und laut Hersteller kein Kauspielzeug.',
      },
      {
        question: 'Warum führt der Amazon-Link bei Classic und Extreme zu einer Suche?',
        answer:
          'Weil beide Produktfamilien mehrere Größen und Varianten haben. Die Suche hält die Auswahl offen, statt eine möglicherweise unpassende Größe als allgemeine Empfehlung festzuschreiben.',
      },
    ],
    relatedLinks: [
      { href: '/de-de/spielzeug/', label: 'Spielzeug nach belegten Eigenschaften finden' },
    ],
  },
  {
    slug: 'catit-senses-2-vergleich',
    metaTitle: 'Catit Senses 2.0: Play, Wave oder Super Circuit?',
    title: 'Catit Senses 2.0: Play, Wave oder Super Circuit?',
    description:
      'Catit Senses 2.0 Play, Wave und Super Circuit vergleichen: Streckenteile, Höhenwechsel, Erweiterbarkeit und dokumentierte Herstellermerkmale.',
    eyebrow: 'Kaufhilfe · Katzenspielzeug',
    intro: [
      'Die Catit-Senses-Circuits sehen ähnlich aus, unterscheiden sich aber vor allem im Streckenaufbau und in der Zahl der enthaltenen Teile.',
      'Play ist vollständig flach, Wave ergänzt erhöhte Kurven und Super liefert deutlich mehr Streckenteile. Alle drei Sets sind laut Catit modular erweiterbar.',
    ],
    tableHeaders: ['Modell', 'Artikelnummer', 'Streckenteile', 'Aufbau', 'Gemeinsamkeiten'],
    products: [
      {
        name: 'Catit Senses Play Circuit',
        brand: 'Catit',
        model: 'Art.-Nr. 43154',
        amazonSelection: 'catit-senses-play-circuit',
        sourceUrl: 'https://www.catit.com/de/produkte/spielzeuge/senses-spielschienen/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'Play Circuit',
          '43154',
          '7 + Ball',
          'vollständig flach',
          'Easy-Click, erweiterbar',
        ],
        summary: [
          'Der Play Circuit liegt vollständig flach auf dem Boden. Catit beschreibt einen Aufbau aus einem geraden Teil, vier flachen Kurven, zwei Endteilen und einem Ball.',
          'Damit ist der Play Circuit die konstruktiv einfachste der drei Varianten in diesem Vergleich.',
        ],
        facts: ['1 gerades Teil', '4 flache Kurven', '2 Endteile', '1 Ball'],
      },
      {
        name: 'Catit Senses Wave Circuit',
        brand: 'Catit',
        model: 'Art.-Nr. 43155',
        amazonSelection: 'catit-senses-wave-circuit-43155',
        sourceUrl: 'https://www.catit.com/de/produkte/spielzeuge/senses-spielschienen/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'Wave Circuit',
          '43155',
          '7 + Ball',
          'flache + erhöhte Kurven',
          'Easy-Click, erweiterbar',
        ],
        summary: [
          'Beim Wave Circuit kommen erhöhte, geschwungene Elemente hinzu. Catit nennt ein gerades Element, zwei erhöhte Kurven, zwei flache Kurven, zwei Endstücke und einen Ball.',
          'Die Zahl der Streckenteile entspricht dem Play Circuit, der Verlauf ist jedoch nicht vollständig eben.',
        ],
        facts: ['1 gerades Teil', '2 erhöhte Kurven', '2 flache Kurven', '2 Endteile + 1 Ball'],
      },
      {
        name: 'Catit Senses Super Circuit',
        brand: 'Catit',
        model: 'Art.-Nr. 43156',
        amazonSelection: 'catit-senses-super-circuit-43156',
        sourceUrl: 'https://www.catit.com/de/produkte/spielzeuge/senses-spielschienen/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'Super Circuit',
          '43156',
          '12 + Ball',
          'Geraden + flache/erhöhte Kurven',
          'Easy-Click, erweiterbar',
        ],
        summary: [
          'Der Super Circuit ist das größte Set im Vergleich. Catit nennt zwölf Streckenteile: zwei Geraden, zwei erhöhte Kurven, sechs flache Kurven und zwei Endteile, dazu einen Ball.',
          'Catit bewirbt das Set auch für mehrere Katzen. Messbar ist vor allem der größere Lieferumfang; ob mehrere Katzen gleichzeitig damit spielen, ist keine garantierbare Produkteigenschaft.',
        ],
        facts: ['2 gerade Teile', '2 erhöhte Kurven', '6 flache Kurven', '2 Endteile + 1 Ball'],
      },
    ],
    criteriaTitle: 'Welche Unterschiede sind vor dem Kauf relevant?',
    criteria: [
      {
        title: 'Flach oder mit Höhenwechsel',
        text: 'Play bleibt flach; Wave und Super enthalten erhöhte Kurven. Das ist der wichtigste konstruktive Unterschied.',
      },
      {
        title: 'Umfang des Startsets',
        text: 'Play und Wave enthalten je sieben Streckenteile plus Ball, Super zwölf Streckenteile plus Ball.',
      },
      {
        title: 'Erweiterbarkeit',
        text: 'Catit beschreibt die Senses-Circuits als modular. Die grünen Teile sind laut Hersteller auch mit den älteren blauen Senses-Circuits kompatibel.',
      },
      {
        title: 'Platz zu Hause',
        text: 'Mehr Streckenteile ermöglichen größere Aufbauten, benötigen aber entsprechend mehr Bodenfläche.',
      },
    ],
    conclusion: [
      'Play Circuit: der flache Aufbau.',
      'Wave Circuit: gleich viele Streckenteile wie Play, aber mit Höhenwechseln.',
      'Super Circuit: deutlich mehr Streckenteile für einen größeren und variableren Aufbau.',
      'Auch hier ist das keine Rangliste: Der sinnvolle Unterschied liegt im gewünschten Streckenmaterial.',
    ],
    faqs: [
      {
        question: 'Kann ich Play und Wave später kombinieren?',
        answer:
          'Ja. Catit beschreibt die Senses-Circuits als modular und miteinander kombinierbar.',
      },
      {
        question: 'Hat das Super Circuit nur mehr Teile?',
        answer:
          'Es enthält mehr Teile und kombiniert gerade, flache und erhöhte Abschnitte. Dadurch sind größere und variablere Layouts möglich.',
      },
      {
        question: 'Sind die älteren blauen Catit-Senses-Teile kompatibel?',
        answer:
          'Ja. Catit nennt ausdrücklich die Rückwärtskompatibilität mit den älteren blauen Senses-Circuits.',
      },
    ],
    relatedLinks: [
      {
        href: '/de-de/ratgeber/katzen-beschaeftigen/',
        label: 'Wohnungskatzen abwechslungsreich beschäftigen',
      },
      { href: '/de-de/spielzeug/', label: 'Spielzeug nach belegten Eigenschaften finden' },
    ],
  },
] as const;

export function purchaseGuideBySlug(slug: string): PurchaseGuide | null {
  return PURCHASE_GUIDES.find((guide) => guide.slug === slug) ?? null;
}
