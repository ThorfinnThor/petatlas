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
  },,
  {
    slug: 'katzentrinkbrunnen-vergleich',
    metaTitle: 'Katzentrinkbrunnen: Catit PIXI, Smart oder UV-C?',
    title: 'Katzentrinkbrunnen vergleichen: PIXI, Smart oder UV-C-Edelstahl?',
    description:
      'Drei Catit-Katzentrinkbrunnen im Faktenvergleich: Reservoir, Filterung, Stromversorgung, App-Funktionen und Betriebsmodi.',
    eyebrow: 'Kaufhilfe · Katzentrinkbrunnen',
    intro: [
      'Bei einem Katzentrinkbrunnen unterscheiden sich Modelle nicht nur im Design. Reservoirgröße, Stromversorgung, Filtertechnik und Bedienung können im Alltag deutlich relevanter sein.',
      'Dieser Vergleich stellt drei aktuelle Catit-PIXI-Modelle anhand dokumentierter Herstellerangaben gegenüber. Aussagen darüber, wie viel eine bestimmte Katze dadurch tatsächlich trinkt, werden daraus nicht abgeleitet.',
    ],
    tableHeaders: ['Modell', 'Reservoir', 'Strom / Verbindung', 'Wasseraufbereitung', 'Besonderheit'],
    products: [
      {
        name: 'Catit PIXI Trinkbrunnen',
        brand: 'Catit',
        model: 'Weiß · Art.-Nr. 43715',
        amazonSelection: 'catit-pixi-fountain-43715',
        sourceUrl: 'https://www.catit.com/de/produkte/trinkbrunnen/pixi-trinkbrunnen/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'PIXI Trinkbrunnen',
          '2 l',
          'USB · 5 V / 1 A',
          'dreifach wirksamer Filter',
          'LED-Wasserstand',
        ],
        summary: [
          'Der normale PIXI Trinkbrunnen hat laut Catit ein 2-Liter-Reservoir und misst 20,5 × 20,5 × 17 cm. Für die weiße Variante nennt der Hersteller die Artikelnummer 43715 und ein Gewicht von 678 g.',
          'Zur Ausstattung gehören ein dreifach wirksamer Filter, eine LED-Anzeige für niedrigen beziehungsweise leeren Wasserstand und eine automatische Abschaltung bei leerem Reservoir. Die Stromversorgung erfolgt über USB mit 5 V / 1 A.',
        ],
        facts: [
          '2 l Reservoir',
          '20,5 × 20,5 × 17 cm',
          '678 g',
          'dreifach wirksamer Filter und automatische Abschaltung',
        ],
      },
      {
        name: 'Catit PIXI Smart-Trinkbrunnen',
        brand: 'Catit',
        model: 'Art.-Nr. 43751',
        amazonSelection: 'catit-pixi-smart-fountain-43751',
        sourceUrl: 'https://www.catit.com/de/produkte/trinkbrunnen/pixi-smart-trinkbrunnen/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'PIXI Smart-Trinkbrunnen',
          '2 l',
          'WiFi 2,4 GHz',
          'Dreifachfilter + UVC',
          'App + Edelstahleinsatz',
        ],
        summary: [
          'Der PIXI Smart-Trinkbrunnen hat ebenfalls 2 Liter Fassungsvermögen und die Außenmaße 20,5 × 20,5 × 17 cm, wiegt laut Hersteller jedoch 800 g.',
          'Der zentrale Unterschied ist die Smart-Ausstattung: Catit nennt integriertes 2,4-GHz-WiFi, App-Steuerung, Benachrichtigungen, Zeitschaltuhr und UVC-Reinigung. Ein Edelstahleinsatz gehört bei dieser Variante ebenfalls zur Ausstattung.',
        ],
        facts: [
          '2 l Reservoir',
          '20,5 × 20,5 × 17 cm · 800 g',
          'WiFi 2,4 GHz und PIXI App',
          'UVC-Reinigung, Dreifachfilter und Edelstahleinsatz',
        ],
      },
      {
        name: 'Catit PIXI UV-C Edelstahl-Trinkbrunnen',
        brand: 'Catit',
        model: 'Art.-Nr. 43761',
        amazonSelection: 'catit-pixi-uvc-stainless-fountain-43761',
        sourceUrl: 'https://www.catit.com/de/produkte/catit-pixi-uv-c-edelstahl-trinkbrunnen/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'PIXI UV-C Edelstahl',
          '5 l',
          'Akku + USB-Ladekabel',
          'UV-C während des Wasserflusses',
          'Sensor-, Timer- und Dauerbetrieb',
        ],
        summary: [
          'Der PIXI UV-C Edelstahl-Trinkbrunnen setzt auf ein deutlich größeres 5-Liter-Reservoir. Catit nennt eine Höhe von 19 cm und eine Breite von 25,5 cm sowie eine Edelstahl-Oberplatte.',
          'Anders als die beiden 2-Liter-Modelle kann diese Variante mit einem wiederaufladbaren Akku betrieben werden. Zur Auswahl stehen Sensor-, Timer- und kontinuierlicher Modus; der kontinuierliche Modus ist laut Hersteller nur bei Netzanschluss verfügbar. UV-C-Wasserklärung ist während des Wasserflusses aktiv.',
        ],
        facts: [
          '5 l Reservoir',
          'wiederaufladbarer Akku',
          'Sensor-, Timer- und kontinuierlicher Modus',
          'HD-LCD und UV-C-Wasserklärung während des Wasserflusses',
        ],
        note:
          'Die verschiedenen Filter- und UV-C-Funktionen sind technische Merkmale. Aus ihnen wird auf Wau & Miau keine medizinische Wirkung für eine Katze abgeleitet.',
      },
    ],
    criteriaTitle: 'Welche Unterschiede sind im Alltag relevant?',
    criteria: [
      {
        title: 'Reservoirgröße',
        text: 'Die beiden kleineren PIXI-Modelle fassen 2 Liter, das UV-C-Edelstahl-Modell 5 Liter. Mehr Volumen bedeutet zugleich einen größeren Brunnen.',
      },
      {
        title: 'App oder Bedienung am Gerät',
        text: 'Der Smart-Trinkbrunnen bietet WiFi und App-Steuerung. Beim UV-C-Edelstahl-Modell stehen Betriebsmodi am Gerät im Vordergrund.',
      },
      {
        title: 'Stromversorgung',
        text: 'Der normale PIXI wird über USB versorgt. Das 5-Liter-Modell besitzt zusätzlich einen wiederaufladbaren Akku und kann dadurch kabellos betrieben werden.',
      },
      {
        title: 'Reinigung und Verbrauchsteile',
        text: 'Filter, Pumpe und Trinkoberfläche müssen regelmäßig nach Herstelleranleitung gereinigt beziehungsweise ersetzt werden. Prüfe die Ersatzteilkosten getrennt vom Kaufpreis.',
      },
    ],
    conclusion: [
      'PIXI: kompakte 2-Liter-Basisvariante mit Filter, LED-Wasserstand und automatischer Abschaltung.',
      'PIXI Smart: ebenfalls 2 Liter, zusätzlich App, WiFi, UVC-Reinigung und Edelstahleinsatz.',
      'PIXI UV-C Edelstahl: 5 Liter, Akku und mehrere Betriebsmodi statt Fokus auf App-Steuerung.',
      'Die Auswahl hängt damit vor allem von Reservoirgröße, Stromversorgung und gewünschter Bedienung ab.',
    ],
    faqs: [
      {
        question: 'Brauche ich für den normalen PIXI Trinkbrunnen eine App?',
        answer:
          'Nein. Die App-Funktionen gehören zum PIXI Smart-Trinkbrunnen. Der normale PIXI arbeitet mit LED-Wasserstandsanzeige und USB-Stromversorgung.',
      },
      {
        question: 'Welches Modell hat das größte Reservoir?',
        answer:
          'Der PIXI UV-C Edelstahl-Trinkbrunnen ist mit 5 Litern deutlich größer als die beiden verglichenen 2-Liter-Modelle.',
      },
      {
        question: 'Kann der 5-Liter-Brunnen ohne Steckdose laufen?',
        answer:
          'Er besitzt einen wiederaufladbaren Akku. Der kontinuierliche Modus ist laut Catit allerdings nur bei Netzanschluss verfügbar.',
      },
    ],
    relatedLinks: [
      { href: '/de-de/futter/', label: 'Futterdeklarationen vergleichen' },
      { href: '/de-de/pflege/', label: 'Pflege und Zubehör' },
    ],
  },
  {
    slug: 'katzen-futterautomat-vergleich',
    metaTitle: 'Katzen-Futterautomat: Catit PIXI Smart im Vergleich',
    title: 'Catit PIXI Futterautomaten: Standard, 6 Mahlzeiten oder Vision?',
    description:
      'Drei Catit PIXI Futterautomaten sachlich vergleichen: Trocken- oder Nassfutter, Kapazität, Mahlzeiten, WiFi, Kamera und Notstrom.',
    eyebrow: 'Kaufhilfe · Katzen-Futterautomat',
    intro: [
      'Bei automatischen Futterspendern ist zuerst die Futterart entscheidend: Ein Vorratsbehälter für Trockenfutter funktioniert anders als eine drehende Futterschale für Nass- und Trockenfutter.',
      'Die drei Catit-PIXI-Modelle werden deshalb nach Futterart, Kapazität, Steuerung und Zusatzfunktionen verglichen – nicht danach, welches Gerät pauschal das „beste“ ist.',
    ],
    tableHeaders: ['Modell', 'Futterart', 'Kapazität', 'Steuerung', 'Besonderheit'],
    products: [
      {
        name: 'Catit PIXI Smart Futterautomat',
        brand: 'Catit',
        model: 'Art.-Nr. 43752',
        amazonSelection: 'catit-pixi-smart-feeder-43752',
        sourceUrl: 'https://www.catit.com/de/produkte/catit-pixi-smart-futterautomat/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'PIXI Smart Futterautomat',
          'Trockenfutter bis 9 mm',
          'ca. 2,9 l / 1,2 kg',
          'App · WiFi 2,4 GHz',
          'bis 12 Mahlzeiten/Tag',
        ],
        summary: [
          'Der PIXI Smart Futterautomat 43752 ist ein Vorratsspender für Trockenfutter beziehungsweise Leckereien bis 9 mm. Catit nennt etwa 2,9 Liter beziehungsweise 1,2 kg Fassungsvermögen.',
          'Über die PIXI App lassen sich bis zu zwölf Mahlzeiten pro Tag planen. Das Gerät unterstützt 2,4-GHz-WiFi und hat ein Batteriefach für vier C/LR14-Batterien als Notstromversorgung.',
        ],
        facts: [
          'ca. 2,9 l / 1,2 kg Futterbehälter',
          'bis zu 12 Mahlzeiten pro Tag',
          'Trockenfutter beziehungsweise Leckereien bis 9 mm',
          'WiFi 2,4 GHz und Edelstahl-Futterschale',
        ],
      },
      {
        name: 'Catit PIXI Smart-Futterautomat mit 6 Mahlzeiten',
        brand: 'Catit',
        model: 'Art.-Nr. 43754',
        amazonSelection: 'catit-pixi-smart-feeder-6-43754',
        sourceUrl:
          'https://www.catit.com/de/produkte/catit-pixi-smart-futterautomat-mit-6-mahlzeiten/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'PIXI Smart 6 Mahlzeiten',
          'Trocken- und Nassfutter',
          'Futterschale 170 ml',
          'App + LCD · WiFi 2,4 GHz',
          '6 Fächer + 2 Kühlakkus',
        ],
        summary: [
          'Der 6-Mahlzeiten-Automat arbeitet nicht mit einem großen Trockenfutterreservoir, sondern mit einer drehenden Futterschale. Catit nennt ein Fassungsvermögen der Futterschale von 170 ml und die Eignung für Trockenfutter, Nassfutter und Leckerlis.',
          'Bis zu sechs Mahlzeiten können programmiert oder manuell serviert werden. Gesteuert wird über die PIXI App oder das LCD-Touch-Display; zwei Kühlakkus gehören zum Lieferumfang.',
        ],
        facts: [
          'bis zu 6 Mahlzeiten pro Tag',
          'für Trockenfutter, Nassfutter und Leckerlis',
          'App und LCD-Touch-Display',
          '2 Kühlakkus und Notstromfach für vier C/LR14-Batterien',
        ],
      },
      {
        name: 'Catit PIXI Smart-Futterautomat Vision',
        brand: 'Catit',
        model: 'Art.-Nr. 43753',
        amazonSelection: 'catit-pixi-smart-feeder-vision-43753',
        sourceUrl: 'https://www.catit.com/de/produkte/catit-pixi-smart-futterautomat-vision/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'PIXI Smart Vision',
          'Trockenfutter bis 9 mm',
          'ca. 2,9 l / 1,2 kg',
          'App · WiFi 2,4 + 5 GHz',
          'HD-Kamera + Zwei-Wege-Audio',
        ],
        summary: [
          'Der PIXI Smart-Futterautomat Vision nutzt wie das Basismodell ein Reservoir von etwa 2,9 Litern beziehungsweise 1,2 kg und ist für Trockenfutter oder Leckereien bis 9 mm vorgesehen.',
          'Zusätzlich integriert Catit eine HD-Kamera mit automatischer Nachtsicht, Bewegungserkennung und Zwei-Wege-Audio. Die App unterstützt laut Hersteller 2,4- und 5-GHz-WiFi und bis zu zwölf Mahlzeiten pro Tag.',
        ],
        facts: [
          'ca. 2,9 l / 1,2 kg Reservoir',
          'bis zu 12 Mahlzeiten pro Tag',
          'HD-Kamera, Nachtsicht und Zwei-Wege-Audio',
          'WiFi 2,4 und 5 GHz',
        ],
        note:
          'Kamera- und Audiofunktionen sind Komfort- und Überwachungsfunktionen. Sie ersetzen keine persönliche Betreuung des Tieres.',
      },
    ],
    criteriaTitle: 'Welcher Gerätetyp passt zur gewünschten Fütterung?',
    criteria: [
      {
        title: 'Trockenfutter oder auch Nassfutter',
        text: 'Das Standard- und Vision-Modell sind Vorratsspender für Trockenfutter. Das 6-Mahlzeiten-Modell kann laut Catit auch mit Nassfutter verwendet werden.',
      },
      {
        title: 'Vorrat oder vorbereitete Fächer',
        text: 'Ein großer Futterbehälter eignet sich für wiederholte Trockenfutterausgabe. Die 6-Mahlzeiten-Schale erfordert dagegen das vorherige Befüllen der einzelnen Fächer.',
      },
      {
        title: 'Kamera wirklich nötig?',
        text: 'Nur das Vision-Modell bringt Kamera, Bewegungserkennung und Zwei-Wege-Audio mit. Wenn diese Funktionen nicht gebraucht werden, sind sie kein Kaufargument.',
      },
      {
        title: 'Notstrom',
        text: 'Alle drei Geräte haben laut Hersteller Möglichkeiten für Batteriebetrieb bei einem Stromausfall. Laufzeiten und Einschränkungen unterscheiden sich.',
      },
    ],
    conclusion: [
      'PIXI Smart 43752: Trockenfutter-Vorratsspender mit bis zu zwölf Mahlzeiten pro Tag.',
      'PIXI Smart 6 Mahlzeiten 43754: sechs vorbereitete Fächer für Trocken- oder Nassfutter, inklusive Kühlakkus.',
      'PIXI Smart Vision 43753: Trockenfutter-Vorratsspender mit zusätzlicher Kamera- und Audioausstattung.',
      'Die wichtigste Entscheidung ist daher Futterart und Ausgabeprinzip – erst danach kommen App- und Kamerafunktionen.',
    ],
    faqs: [
      {
        question: 'Welcher der drei Automaten kann Nassfutter ausgeben?',
        answer:
          'Catit nennt dafür ausdrücklich den PIXI Smart-Futterautomaten mit 6 Mahlzeiten. Standard und Vision sind für Trockenfutter beziehungsweise passende Leckereien vorgesehen.',
      },
      {
        question: 'Benötigen die Geräte WiFi?',
        answer:
          'Für die App-Funktionen ja. Das 6-Mahlzeiten-Modell besitzt zusätzlich ein LCD-Touch-Display; bei den Vorratsspendern gibt es außerdem einen Knopf für eine direkte Futterausgabe.',
      },
      {
        question: 'Ist die Kamera des Vision-Modells zwingend nötig?',
        answer:
          'Nein. Sie ist ein zusätzliches Ausstattungsmerkmal. Ob sie den Mehrwert liefert, hängt davon ab, ob du Bild-, Bewegungs- und Audiofunktionen tatsächlich nutzen möchtest.',
      },
    ],
    relatedLinks: [
      { href: '/de-de/futter/', label: 'Futter für Hund und Katze vergleichen' },
      { href: '/de-de/methodik/', label: 'So arbeitet Wau & Miau mit Produktangaben' },
    ],
  },
  {
    slug: 'katzentoilette-vergleich',
    metaTitle: 'Katzentoilette: Catit Airsift, PIXI oder Smartsift?',
    title: 'Katzentoilette vergleichen: Frontzugang, Top-Entry oder Siebhebel?',
    description:
      'Catit Airsift Standard, PIXI und Smartsift vergleichen: Zugang, Maße, Reinigung, Filter und Gewicht – ohne pauschale Rangliste.',
    eyebrow: 'Kaufhilfe · Katzentoilette',
    intro: [
      'Katzentoiletten unterscheiden sich vor allem durch Zugang und Reinigungsprinzip. Eine klassische Haubentoilette, ein Top-Entry-Modell und ein mechanisches Siebsystem lösen dieselbe Grundaufgabe konstruktiv sehr unterschiedlich.',
      'Für diesen Vergleich schauen wir deshalb auf Außenmaße, Einstieg, Reinigung und Herstellerfunktionen. Ob eine einzelne Katze eine bestimmte Bauform akzeptiert, lässt sich daraus nicht garantieren.',
    ],
    tableHeaders: ['Modell', 'Zugang', 'Maße', 'Reinigung', 'Besonderheit'],
    products: [
      {
        name: 'Catit Katzentoilette Airsift Standard',
        brand: 'Catit',
        model: 'Art.-Nr. 50702',
        amazonSelection: 'catit-airsift-litter-box-50702',
        sourceUrl:
          'https://www.catit.com/de/produkte/katzentoiletten-zubehoer/katzentoiletten-mit-airsift-filtersystem/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'Airsift Standard',
          'Vordertür',
          '57 × 46 × 39 cm',
          'manuell ausschaufeln',
          'Airsift-Filter + Beutelhalterung',
        ],
        summary: [
          'Die Airsift Standard ist eine klassische Katzentoilette mit Abdeckung und Vordertür. Catit gibt 57 × 46 × 39 cm in der Reihenfolge Länge × Höhe × Breite an; die Türöffnung misst 26,5 × 24,5 cm.',
          'Die Front kann für einen breiten Reinigungszugang hochgeklappt werden. Zusätzlich sind eine integrierte Beutelhalterung und ein Airsift-Geruchsfilterpad vorgesehen.',
        ],
        facts: [
          '57 × 46 × 39 cm laut Hersteller',
          'Türöffnung 26,5 × 24,5 cm',
          'Vordertür und breite Reinigungsöffnung',
          'Airsift-Filterpad und integrierte Beutelhalterung',
        ],
      },
      {
        name: 'Catit PIXI Katzentoilette',
        brand: 'Catit',
        model: 'Art.-Nr. 44081',
        amazonSelection: 'catit-pixi-litter-box-44081',
        sourceUrl:
          'https://www.catit.com/de/produkte/katzentoiletten-zubehoer/pixi-katzentoilette/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'PIXI Katzentoilette',
          'von oben',
          '41 × 52 × 47,5 cm',
          'Deckel aufklappen + ausschaufeln',
          'strukturierte Oberseite',
        ],
        summary: [
          'Die PIXI Katzentoilette ist ein Top-Entry-Modell. Catit nennt 41 × 52 × 47,5 cm in der Reihenfolge Breite × Tiefe × Höhe, eine runde Öffnung mit 23 cm Durchmesser und 2,3 kg Eigengewicht.',
          'Die strukturierte Oberseite soll Streu von den Pfoten auffangen. Für die Reinigung lässt sich die Abdeckung aufschwenken; abgerundete Ecken erleichtern den Zugang zum Innenraum.',
        ],
        facts: [
          '41 × 52 × 47,5 cm · 2,3 kg',
          'Top-Entry mit Öffnung Ø 23 cm',
          'strukturierte Abdeckung',
          'schwenkbarer Deckel für den Reinigungszugang',
        ],
      },
      {
        name: 'Catit Smartsift Katzentoilette',
        brand: 'Catit',
        model: 'Art.-Nr. 50685',
        amazonSelection: 'catit-smartsift-litter-box-50685',
        sourceUrl:
          'https://www.catit.com/de/produkte/katzentoiletten-zubehoer/smartsift-katzentoilette/',
        sourceLabel: 'Catit · Hersteller',
        checkedAt,
        comparison: [
          'Catit Smartsift',
          'Vordertür',
          '66 × 48 × 64 cm',
          'mechanischer Siebhebel',
          'Abfallwanne + Airsift',
        ],
        summary: [
          'Die Catit Smartsift ist mit 66 × 48 × 64 cm und 8,5 kg die deutlich größere und schwerere Konstruktion in diesem Vergleich.',
          'Statt ausschließlich auszuschaufeln wird die Streu über einen nicht motorisierten Hebel gesiebt. Klumpen landen in einer herausziehbaren Abfallwanne; zusätzlich ist ein Airsift-Filterpad enthalten.',
        ],
        facts: [
          '66 × 48 × 64 cm · 8,5 kg',
          'nicht motorisierter Reinigungshebel',
          'herausziehbare Abfallwanne',
          'Airsift-Filterpad und Sichtfenster für den Streustand',
        ],
      },
    ],
    criteriaTitle: 'Was solltest du vor dem Kauf prüfen?',
    criteria: [
      {
        title: 'Einstiegsart',
        text: 'Airsift Standard und Smartsift werden vorne betreten. Die PIXI ist ein Top-Entry-Modell mit einer 23-cm-Öffnung.',
      },
      {
        title: 'Stellfläche und Höhe',
        text: 'Die Smartsift ist erheblich größer als die beiden anderen Modelle. Miss Stellfläche und verfügbare Höhe am vorgesehenen Standort.',
      },
      {
        title: 'Reinigungsprinzip',
        text: 'Airsift Standard und PIXI werden klassisch ausgeschaufelt. Die Smartsift ergänzt einen mechanischen Siebhebel mit separater Abfallwanne.',
      },
      {
        title: 'Verbrauchsteile',
        text: 'Airsift Standard und Smartsift nutzen Filterpads. Berücksichtige Ersatzfilter und gegebenenfalls passende Folien getrennt vom Anschaffungspreis.',
      },
    ],
    conclusion: [
      'Airsift Standard: klassische Haubentoilette mit Vordertür und Filter.',
      'PIXI: kompakteres Top-Entry-Konzept mit strukturierter Abdeckung.',
      'Smartsift: größeres System mit mechanischem Siebhebel und Abfallwanne.',
      'Welche Bauform im Haushalt funktioniert, hängt von Platz, Reinigungsroutine und der Katze selbst ab.',
    ],
    faqs: [
      {
        question: 'Welche Toilette hat einen Einstieg von oben?',
        answer:
          'Die Catit PIXI Katzentoilette. Airsift Standard und Smartsift haben einen Zugang an der Vorderseite.',
      },
      {
        question: 'Ist die Smartsift elektrisch?',
        answer:
          'Nein. Catit beschreibt den Siebhebel ausdrücklich als nicht motorisiert. Die Reinigung erfolgt mechanisch.',
      },
      {
        question: 'Sind Standard und Smartsift gleich groß?',
        answer:
          'Nein. Die Smartsift ist mit 66 × 48 × 64 cm und 8,5 kg deutlich größer und schwerer als die Airsift Standard.',
      },
    ],
    relatedLinks: [
      { href: '/de-de/pflege/', label: 'Pflege und Zubehör' },
      {
        href: '/de-de/ratgeber/katzen-beschaeftigen/',
        label: 'Wohnungskatzen abwechslungsreich beschäftigen',
      },
    ],
  },
  {
    slug: 'flexi-rollleine-vergleich',
    metaTitle: 'flexi Rollleine: Classic, Comfort Plus, Xtreme oder Giant?',
    title: 'flexi Rollleinen vergleichen: Classic, Comfort Plus, Xtreme oder Giant?',
    description:
      'Vier flexi Gurtleinen anhand von Länge, Hersteller-Gewichtsgrenze, Eigengewicht, Griff und Gurt vergleichen.',
    eyebrow: 'Kaufhilfe · Hundeleine',
    intro: [
      'Bei flexi-Rollleinen stehen unter demselben Markennamen sehr unterschiedliche Längen, Gewichtsgrenzen und Ausstattungen. Ein Vergleich ist deshalb nur sinnvoll, wenn konkrete Varianten gegenübergestellt werden.',
      'Hier vergleichen wir drei L-Gurtleinen mit 5 Metern sowie eine Giant L mit 8 Metern. Die vom Hersteller angegebene maximale Hundegewichtsgrenze ist dabei nur ein technischer Grenzwert und keine individuelle Eignungsempfehlung.',
    ],
    tableHeaders: ['Modell', 'Länge', 'max. Hundegewicht', 'Produktgewicht', 'Auffälliges Merkmal'],
    products: [
      {
        name: 'flexi Classic L Gurt 5 m',
        brand: 'flexi',
        model: 'Classic L · Gurtleine 5 m',
        amazonSelection: 'flexi-classic-l-5m',
        sourceUrl: 'https://flexi.de/de/produkte/classic-l-gurt-5-m/',
        sourceLabel: 'flexi · Hersteller',
        checkedAt,
        comparison: ['Classic L', '5 m', '50 kg', 'ca. 340 g', 'leichteste Variante hier'],
        summary: [
          'Die Classic L ist in der ausgewählten Variante eine 5-m-Gurtleine für Hunde bis maximal 50 kg. flexi nennt ein Produktgewicht von etwa 340 g.',
          'Der Hersteller führt einen Gurtauslauf sowie die Kompatibilität mit Multi Box und LED Lighting System auf. Einen einstellbaren Griff nennt die Classic-L-Produktseite nicht.',
        ],
        facts: [
          '5 m Gurtleine',
          'Herstellergrenze bis 50 kg',
          'ca. 340 g',
          'kompatibel mit Multi Box und LED Lighting System',
        ],
      },
      {
        name: 'flexi Comfort Plus L Gurt 5 m',
        brand: 'flexi',
        model: 'Comfort Plus L · Gurtleine 5 m',
        amazonSelection: 'flexi-comfort-plus-l-5m',
        sourceUrl: 'https://flexi.de/de/produkte/comfort-plus-l-5m-gurt-hundeleine/',
        sourceLabel: 'flexi · Hersteller',
        checkedAt,
        comparison: [
          'Comfort Plus L',
          '5 m',
          '60 kg',
          'ca. 485 g',
          'einstellbarer Griff + Softkomponenten',
        ],
        summary: [
          'Die Comfort Plus L bietet ebenfalls 5 Meter Gurt. flexi nennt eine maximale Hundegewichtsgrenze von 60 kg und etwa 485 g Produktgewicht.',
          'Zu den dokumentierten Unterschieden gehören ein einstellbarer Griff, Softkomponenten und ein besonders robuster Gurt. Multi Box, LED Lighting System und ein Dämpfgurt für Größe L werden als passende Ergänzungen geführt.',
        ],
        facts: [
          '5 m Gurtleine',
          'Herstellergrenze bis 60 kg',
          'ca. 485 g',
          'einstellbarer Griff und Softkomponenten',
        ],
      },
      {
        name: 'flexi Xtreme L Gurt 5 m',
        brand: 'flexi',
        model: 'Xtreme L · Gurtleine 5 m',
        amazonSelection: 'flexi-xtreme-l-5m',
        sourceUrl: 'https://flexi.de/de/produkte/xtreme-l-gurt-5-m/',
        sourceLabel: 'flexi · Hersteller',
        checkedAt,
        comparison: [
          'Xtreme L',
          '5 m',
          '65 kg',
          'ca. 485 g',
          'X11-Gurt + Soft-Stop',
        ],
        summary: [
          'Die Xtreme L ist ebenfalls 5 Meter lang und wiegt laut flexi ungefähr 485 g. Die angegebene Hundegewichtsgrenze liegt bei maximal 65 kg.',
          'Der Hersteller hebt den X11-Gurt, ein elastisches Soft-Stop-Gurtelement, einen einstellbaren Soft-Griff und die Erweiterbarkeit mit Multi Box und LED Lighting System hervor.',
        ],
        facts: [
          '5 m Gurtleine',
          'Herstellergrenze bis 65 kg',
          'ca. 485 g',
          'X11-Gurt, Soft-Stop-Element und einstellbarer Soft-Griff',
        ],
      },
      {
        name: 'flexi Giant L Gurt 8 m',
        brand: 'flexi',
        model: 'Giant L · Gurtleine 8 m',
        amazonSelection: 'flexi-giant-l-8m',
        sourceUrl: 'https://flexi.de/de/produkte/giant-l-8m-gurt-hundeleine/',
        sourceLabel: 'flexi · Hersteller',
        checkedAt,
        comparison: ['Giant L', '8 m', '50 kg', 'ca. 630 g', 'längster Gurt im Vergleich'],
        summary: [
          'Die Giant L unterscheidet sich vor allem durch die Länge: 8 Meter Gurt statt 5 Meter. flexi nennt eine maximale Hundegewichtsgrenze von 50 kg und ungefähr 630 g Produktgewicht.',
          'Zur Ausstattung gehören ein stabiler Soft-Griff sowie ein neonfarbener, besonders robuster Gurt. Das höhere Eigengewicht sollte zusammen mit der zusätzlichen Reichweite betrachtet werden.',
        ],
        facts: [
          '8 m Gurtleine',
          'Herstellergrenze bis 50 kg',
          'ca. 630 g',
          'Soft-Griff und neonfarbener Gurt',
        ],
      },
    ],
    criteriaTitle: 'Welche technischen Unterschiede zählen?',
    criteria: [
      {
        title: '5 oder 8 Meter',
        text: 'Mehr Reichweite bedeutet auch mehr Gurt zwischen Mensch und Hund. Prüfe, ob die zusätzliche Länge zu deinen typischen Wegen und der Umgebung passt.',
      },
      {
        title: 'Eigengewicht in der Hand',
        text: 'Zwischen Classic L und Giant L liegen laut Hersteller rund 290 g Unterschied. Bei langen Spaziergängen kann das praktisch relevant sein.',
      },
      {
        title: 'Griff und Dämpfung',
        text: 'Comfort Plus und Xtreme nennen einen einstellbaren Griff. Die Xtreme bringt zusätzlich ein integriertes Soft-Stop-Gurtelement mit.',
      },
      {
        title: 'Hersteller-Gewichtsgrenze',
        text: 'Die Kilogrammangabe ist eine technische Obergrenze der jeweiligen Variante. Sie ersetzt keine Beurteilung von Handhabung, Training und Einsatzort.',
      },
    ],
    conclusion: [
      'Classic L 5 m: mit ca. 340 g die leichteste der vier konkret verglichenen Varianten.',
      'Comfort Plus L 5 m: einstellbarer Griff und Softkomponenten bei 5 Metern.',
      'Xtreme L 5 m: X11-Gurt und integriertes Soft-Stop-Element.',
      'Giant L 8 m: längere 8-m-Variante, zugleich mit ca. 630 g deutlich schwerer.',
      'Die technischen Unterschiede sind klar; welche Rollleine sinnvoll ist, hängt vom tatsächlichen Einsatz und sicherer Handhabung ab.',
    ],
    faqs: [
      {
        question: 'Ist eine höhere Kilogrammangabe automatisch besser?',
        answer:
          'Nein. Sie ist eine Herstellergrenze für die konkrete Leinenvariante. Länge, Eigengewicht, Griff und Einsatzsituation sind davon unabhängige Kriterien.',
      },
      {
        question: 'Welche der vier Leinen ist am leichtesten?',
        answer:
          'In den hier verglichenen Varianten nennt flexi für die Classic L 5 m etwa 340 g. Comfort Plus und Xtreme liegen bei etwa 485 g, Giant L 8 m bei etwa 630 g.',
      },
      {
        question: 'Welche Variante hat 8 Meter Gurt?',
        answer:
          'Die hier verglichene Giant L. Die drei anderen konkret ausgewählten Varianten haben jeweils 5 Meter.',
      },
    ],
    relatedLinks: [
      { href: '/de-de/tierarzt-karte/', label: 'Hunde-Orte auf der Karte finden' },
      { href: '/de-de/pflege/', label: 'Pflege und Zubehör' },
    ],
  },
  {
    slug: 'hundetransportbox-auto-vergleich',
    metaTitle: 'Hundetransportbox fürs Auto: Kunststoff, Stoff oder Aluminium?',
    title: 'Hundetransportbox fürs Auto: Journey, Vario oder Aluminium?',
    description:
      'Drei TRIXIE-Hundeboxen für unterschiedliche Einsätze vergleichen: Kunststoff, faltbares Polyester und Aluminium mit konkreten Maßen.',
    eyebrow: 'Kaufhilfe · Hundetransportbox',
    intro: [
      'Bei Hundetransportboxen fürs Auto unterscheiden sich starre Kunststoffboxen, faltbare Stoffboxen und Aluminiumkonstruktionen grundlegend in Aufbau und Handhabung.',
      'Für einen nachvollziehbaren Vergleich nehmen wir jeweils eine konkrete Variante aus drei TRIXIE-Produktlinien. Die Box muss zusätzlich zum Hund auch zum verfügbaren Kofferraum und zur vorgesehenen Sicherung im Fahrzeug passen.',
    ],
    tableHeaders: ['Modell / Variante', 'Bauart', 'Maße', 'Zugang', 'Besonderheit'],
    products: [
      {
        name: 'TRIXIE Transportbox Journey M',
        brand: 'TRIXIE',
        model: 'Art.-Nr. 39413',
        amazonSelection: 'trixie-journey-39413',
        sourceUrl:
          'https://www.trixie.de/en/dog/transport-travel/transport-boxes/transport-box-journey-1001435619-1001442920',
        sourceLabel: 'TRIXIE · Hersteller',
        checkedAt,
        comparison: [
          'Journey M · 39413',
          'Kunststoff',
          '88 × 58 × 51 cm',
          'Metalltür',
          'abgeschrägte Seiten',
        ],
        summary: [
          'Die Journey ist eine starre Kunststoffbox mit abgeschrägten Seiten für die Nutzung des Kofferraums. Für die Variante 39413 nennt TRIXIE Größe M und 88 × 58 × 51 cm.',
          'Die Metalltür lässt sich aufklappen. TRIXIE weist für die Nutzung im Auto darauf hin, die Box an die Rücksitze anzulehnen und gegen Verrutschen zu sichern.',
        ],
        facts: [
          '88 × 58 × 51 cm',
          'Kunststoff',
          'Metalltür',
          'abgeschrägte Seiten für den Kofferraum',
        ],
      },
      {
        name: 'TRIXIE Hundebox Vario S–M',
        brand: 'TRIXIE',
        model: 'Art.-Nr. 39722',
        amazonSelection: 'trixie-vario-39722',
        sourceUrl:
          'https://www.trixie.de/en/dog/transport-travel/transport-boxes/dog-crate-vario-1001435619-1001442885',
        sourceLabel: 'TRIXIE · Hersteller',
        checkedAt,
        comparison: [
          'Vario S–M · 39722',
          'Polyester + Metallrahmen',
          '76 × 48 × 51 cm',
          '3 Seiten',
          'faltbar + Tragetasche',
        ],
        summary: [
          'Die Vario S–M ist keine starre Kunststoff- oder Aluminiumbox. Sie besteht aus strapazierfähigem Polyester mit stabilem Metallrahmen und Schnellverschlussmechanismus; TRIXIE nennt 76 × 48 × 51 cm.',
          'Die Box kann auf drei Seiten geöffnet werden und wird mit Tragetasche und Liegematte geliefert. Klettflächen unter der Box sollen ein Verrutschen reduzieren; für den Außeneinsatz nennt TRIXIE zusätzliche Bodenlaschen und Heringe.',
        ],
        facts: [
          '76 × 48 × 51 cm',
          'Polyester mit Metallrahmen',
          'auf 3 Seiten zu öffnen',
          'Schnellverschlussmechanismus und Tragetasche',
        ],
      },
      {
        name: 'TRIXIE Aluminium-Transportbox M–L',
        brand: 'TRIXIE',
        model: 'Art.-Nr. 39342',
        amazonSelection: 'trixie-aluminium-39342',
        sourceUrl:
          'https://www.trixie.de/en/dog/transport-travel/transport-boxes/transport-box-aluminium-1001435619-1001442897',
        sourceLabel: 'TRIXIE · Hersteller',
        checkedAt,
        comparison: [
          'Aluminium M–L · 39342',
          'Aluminium/Hartfaser/Kunststoff',
          '60 × 65 × 86 cm',
          'Tür mit Sicherheitsverschluss',
          'bis 30 kg laut Hersteller',
        ],
        summary: [
          'Die Aluminium-Transportbox 39342 ist die starre Metallrahmenkonstruktion im Vergleich. TRIXIE nennt 60 × 65 × 86 cm, Größe M–L und eine Herstellergrenze bis 30 kg.',
          'Zur Ausstattung gehören eine Tür mit Sicherheitsverschluss, ein geschlossener unterer Türbereich, Gitterbereiche für Luftzirkulation, eine rutschfeste Liegematte und Klettstreifen an der Unterseite. Die Produktlinie wurde laut TRIXIE von einer unabhängigen Stelle im Hinblick auf Tierwohl und Tierschutz geprüft.',
        ],
        facts: [
          '60 × 65 × 86 cm',
          'bis 30 kg laut Hersteller',
          'Aluminium/Hartfaser/Kunststoff',
          'Sicherheitsverschluss, Liegematte und Klettstreifen am Boden',
        ],
        note:
          'Eine Herstellerprüfung der Produktlinie ersetzt nicht die Prüfung, ob Box, Hund, Fahrzeug und tatsächliche Sicherung im konkreten Auto zusammenpassen.',
      },
    ],
    criteriaTitle: 'Was solltest du im Fahrzeug ausmessen?',
    criteria: [
      {
        title: 'Kofferraumöffnung und Innenraum',
        text: 'Nicht nur die Stellfläche zählt. Miss auch Höhe und Breite der Kofferraumöffnung sowie mögliche Schräge von Rücksitz und Heckklappe.',
      },
      {
        title: 'Platz für den Hund',
        text: 'TRIXIE weist bei der Auswahl starrer Boxen darauf hin, dass der Hund bequem aufrecht stehen und sich drehen können soll. Maße sind daher wichtiger als eine reine Gewichtszahl.',
      },
      {
        title: 'Starr oder faltbar',
        text: 'Journey und Aluminium sind starre Konstruktionen. Die Vario lässt sich über ihren Metallrahmen auf- und abbauen und wird mit Tragetasche geliefert.',
      },
      {
        title: 'Sicherung gegen Verrutschen',
        text: 'Befolge die jeweilige Herstelleranleitung zur Positionierung und Sicherung im Fahrzeug. Klettflächen oder abgeschrägte Seiten allein sind keine allgemeine Sicherungsgarantie.',
      },
    ],
    conclusion: [
      'Journey M: starre Kunststoffbox mit abgeschrägten Seiten und Metalltür.',
      'Vario S–M: faltbare Polyesterbox mit Metallrahmen und drei Öffnungsseiten.',
      'Aluminium M–L: starre Aluminiumkonstruktion mit Sicherheitsverschluss und Liegematte.',
      'Die Bauformen sind so unterschiedlich, dass Kofferraum, gewünschte Mobilität der Box und passende Innenmaße die sinnvolleren Entscheidungskriterien sind als eine Rangliste.',
    ],
    faqs: [
      {
        question: 'Sind die drei verglichenen Boxen gleich groß?',
        answer:
          'Nein. Es wurden bewusst konkrete Varianten unterschiedlicher Produktlinien gegenübergestellt. Die Maße müssen einzeln zum Hund und zum Fahrzeug geprüft werden.',
      },
      {
        question: 'Welche Box lässt sich zusammenbauen und wieder verstauen?',
        answer:
          'Die Vario nutzt einen Metallrahmen mit Schnellverschlussmechanismus und wird mit Tragetasche geliefert. Journey und Aluminium sind starre Konstruktionen.',
      },
      {
        question: 'Reicht es, die Box einfach in den Kofferraum zu stellen?',
        answer:
          'Nein. TRIXIE weist bei Autoboxen ausdrücklich darauf hin, sie so zu platzieren beziehungsweise zu sichern, dass sie während der Fahrt nicht verrutschen können.',
      },
    ],
    relatedLinks: [
      { href: '/de-de/reisecheck/', label: 'Reisecheck für Hund und Katze' },
      { href: '/de-de/pflege/', label: 'Pflege und Zubehör' },
    ],
  }
] as const;

export function purchaseGuideBySlug(slug: string): PurchaseGuide | null {
  return PURCHASE_GUIDES.find((guide) => guide.slug === slug) ?? null;
}
