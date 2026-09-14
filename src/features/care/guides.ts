export interface CareChoice {
  readonly title: string;
  readonly suitableFor: string;
  readonly check: string;
  readonly avoid: string;
}

export interface CareStep {
  readonly title: string;
  readonly text: string;
}

export interface CareShopLink {
  readonly id: string;
  readonly species: 'Hund' | 'Katze';
  readonly label: string;
  readonly description: string;
  readonly destinationUrl: string;
}

export interface CareSource {
  readonly label: string;
  readonly url: string;
}

export interface CareGuide {
  readonly categoryId: string;
  readonly kicker: string;
  readonly intro: string;
  readonly description: string;
  readonly quickAnswer: string;
  readonly imageStem: string;
  readonly imageAlt: string;
  readonly selectionTitle: string;
  readonly selectionIntro: string;
  readonly choices: readonly CareChoice[];
  readonly measureTitle: string;
  readonly measureIntro: string;
  readonly measures: readonly string[];
  readonly routineTitle: string;
  readonly routineIntro: string;
  readonly steps: readonly CareStep[];
  readonly mistakesTitle: string;
  readonly mistakes: readonly string[];
  readonly stopTitle: string;
  readonly stopText: string;
  readonly faqs: readonly { readonly question: string; readonly answer: string }[];
  readonly shopLinks: readonly CareShopLink[];
  readonly sources: readonly CareSource[];
}

const GUIDES: readonly CareGuide[] = [
  {
    categoryId: 'grooming-brush',
    kicker: 'FELLWERKZEUG AUSWÄHLEN',
    intro:
      'Die passende Bürste hängt nicht allein von „kurz“ oder „lang“ ab. Entscheidend sind Deckhaar, Unterwolle, Dichte, empfindliche Stellen und die Frage, ob du lose Haare aufnehmen oder Knoten kontrollieren willst. Diese Auswahlhilfe beginnt deshalb beim Fell und nicht bei einer Produktbezeichnung.',
    description:
      'Bürsten und Kämme für Hund und Katze auswählen: Werkzeugtypen vergleichen, Fell prüfen, Fehlkäufe vermeiden und eine ruhige Pflegeroutine aufbauen.',
    quickAnswer:
      'Für glattes Kurzhaar genügt häufig ein weicher Gummi- oder Pflegehandschuh. Langes oder dichtes Fell braucht meist mindestens zwei Werkzeuge: eines zum Lösen loser Haare und einen Metallkamm zur Kontrolle bis zur Haut. Ein Kamm, der an einer Stelle nicht ohne Zug durchgleitet, zeigt einen Knoten; er ist kein Werkzeug, um daran kräftig zu reißen.',
    imageStem: 'fellpflege',
    imageAlt: 'Bürste, Metallkamm und Pflegehandschuh zwischen einer Katze und einem Hund',
    selectionTitle: 'Welches Werkzeug löst welche Aufgabe?',
    selectionIntro:
      'Produktnamen wie „Profi“, „Universal“ oder „für alle Felltypen“ helfen bei der Auswahl wenig. Vergleiche stattdessen Kontaktfläche, Zinkenabstand, Arbeitsbreite und das konkrete Ziel der Pflege.',
    choices: [
      {
        title: 'Gummi- oder Pflegehandschuh',
        suitableFor:
          'Glattes Kurzhaar und Tiere, die eine klassische Bürste noch nicht akzeptieren.',
        check:
          'Noppen müssen weich nachgeben; der Handschuh soll sicher sitzen und sich vollständig reinigen lassen.',
        avoid: 'Kein Werkzeug für fest sitzende Knoten oder dichte Unterwolle.',
      },
      {
        title: 'Weiche Bürste oder Pin-Bürste',
        suitableFor:
          'Oberfläche ordnen, lose Haare aufnehmen und längeres Fell abschnittsweise pflegen.',
        check:
          'Abgerundete Spitzen, nachgiebiges Kissen und eine Arbeitsbreite, die zu kleinen wie großen Körperzonen passt.',
        avoid: 'Starre, scharfkantige Pins und starkes Drücken auf dünn behaarten Stellen.',
      },
      {
        title: 'Zupfbürste oder Unterwollwerkzeug',
        suitableFor:
          'Dichtes Fell mit Unterwolle, sofern das Werkzeug tatsächlich für den Fellaufbau vorgesehen ist.',
        check:
          'Kurze, kontrollierte Züge; Hautkontakt und Zug zuerst an einer kleinen Stelle prüfen.',
        avoid:
          'Nicht wiederholt über dieselbe Hautstelle arbeiten und nicht auf gereizter Haut einsetzen.',
      },
      {
        title: 'Metallkamm mit zwei Zahnweiten',
        suitableFor:
          'Kontrollgang bei längerem Fell, besonders hinter Ohren, an Achseln und Hosen.',
        check:
          'Zinkenenden müssen glatt sein. Grobe Seite zum Vorarbeiten, feinere Seite erst danach.',
        avoid:
          'Ein festsitzender Kamm ist ein Stoppsignal; Zug überträgt sich direkt auf die Haut.',
      },
    ],
    measureTitle: 'Der 3-Minuten-Fellcheck vor dem Kauf',
    measureIntro:
      'Mach den Check an mehreren Körperstellen. Rückenfell kann sich ganz anders verhalten als Achseln, Halskrause oder der Bereich hinter den Ohren.',
    measures: [
      'Scheitle das Fell mit den Fingern: Siehst du eine zweite, weichere Haarschicht, ist Unterwolle vorhanden.',
      'Führe die Finger ohne Zug vom Ansatz zur Spitze. Notiere, wo sie hängen bleiben und wie nah ein Knoten an der Haut sitzt.',
      'Miss eine vorhandene Bürste, die gut in der Hand liegt. Eine sehr breite Arbeitsfläche ist an Beinen, Bauch und Katzenkörpern oft unpraktisch.',
      'Prüfe, ob lose Haare ohne Kontakt mit scharfen Kanten aus dem Werkzeug entfernt werden können.',
      'Plane bei langem Fell einen Kontrollkamm ein; eine Bürste allein zeigt nicht zuverlässig, ob sie bis in die Tiefe gelangt.',
    ],
    routineTitle: 'Eine Pflegerunde ohne Festhalten',
    routineIntro:
      'Eine kurze, freiwillige Runde liefert mehr Information als ein langer Kampf. Pflege zunächst dort, wo Berührung ohnehin gern angenommen wird, und beobachte die Reaktion auf Werkzeug und Druck.',
    steps: [
      {
        title: 'Werkzeug zeigen',
        text: 'Ablegen, beschnuppern lassen und ruhiges Annähern belohnen. Noch nicht über das Fell fahren.',
      },
      {
        title: 'Ein Zug',
        text: 'An Schulter oder Seite einen leichten Zug in Wuchsrichtung machen und sofort wieder absetzen.',
      },
      {
        title: 'In Schichten arbeiten',
        text: 'Längeres Fell mit der Hand teilen und von den Spitzen in kleinen Abschnitten zum Ansatz vorgehen.',
      },
      {
        title: 'Mit dem Kamm prüfen',
        text: 'Nur bereits gelöste Abschnitte kontrollieren. Bei Widerstand zurück zur gröberen Arbeit wechseln.',
      },
      {
        title: 'Früh beenden',
        text: 'Nach wenigen gelungenen Wiederholungen aufhören, bevor Ausweichen oder Abwehr entsteht.',
      },
    ],
    mistakesTitle: 'Vier häufige Fehlkäufe',
    mistakes: [
      'Nur nach der Felllänge wählen und Dichte oder Unterwolle übersehen.',
      'Eine große Arbeitsbreite kaufen, obwohl vor allem kleine, empfindliche Zonen gepflegt werden müssen.',
      'Entfilzungswerkzeug als tägliche Universalbürste verwenden.',
      'Ein Werkzeug ohne glatte Zinkenenden, sicheren Griff oder einfache Reinigungsmöglichkeit wählen.',
    ],
    stopTitle: 'Wann Bürsten nicht die nächste Handlung ist',
    stopText:
      'Stoppe bei Schmerzreaktion, geröteter oder nässender Haut, kahlen Stellen, plötzlich starkem Schuppen, Parasitenverdacht oder einer Filzplatte direkt an der Haut. Solche Bereiche gehören abgeklärt oder fachgerecht entfernt; Schere und kräftiges Ziehen können die eng anliegende Haut verletzen.',
    faqs: [
      {
        question: 'Brauche ich für Hund und Katze verschiedene Bürsten?',
        answer:
          'Nicht zwingend. Fellaufbau, Größe der Arbeitsfläche und Akzeptanz sind entscheidender als die Tierart auf der Verpackung. Prüfe trotzdem jede Herstellerangabe und nutze Werkzeuge hygienisch getrennt, wenn Hautprobleme bestehen.',
      },
      {
        question: 'Wie erkenne ich zu viel Druck?',
        answer:
          'Die Haut soll nicht mitgezogen oder gerötet werden. Ausweichen, Hautzucken, Schwanzschlagen, Ohrenanlegen oder der Blick zur Hand sind Gründe, Druck und Dauer sofort zu reduzieren.',
      },
      {
        question: 'Reicht eine Unterwollbürste?',
        answer:
          'Sie ersetzt den Kontrollkamm nicht. Ein zweites, schlichtes Werkzeug kann zeigen, ob ein Abschnitt wirklich frei durchkämmbar ist.',
      },
    ],
    shopLinks: [
      {
        id: 'fellpflege-hund',
        species: 'Hund',
        label: 'Fellpflege für Hunde ansehen',
        description: 'Bürsten, Kämme, Striegel und Unterwollwerkzeuge im Fressnapf-Sortiment.',
        destinationUrl: 'https://www.fressnapf.de/c/hund/pflege-hygiene/fellpflege/',
      },
      {
        id: 'fellpflege-katze',
        species: 'Katze',
        label: 'Fellpflege für Katzen ansehen',
        description: 'Bürsten, Kämme und weiteres Fellpflegezubehör im Fressnapf-Sortiment.',
        destinationUrl: 'https://www.fressnapf.de/c/katze/hygiene-pflege/fell-koerperpflege/',
      },
    ],
    sources: [
      {
        label: 'Cats Protection: Grooming',
        url: 'https://www.cats.org.uk/help-and-advice/cat-behaviour/grooming',
      },
      {
        label: 'ASPCA: Dog Grooming Tips',
        url: 'https://www.aspca.org/pet-care/dog-care/dog-grooming-tips',
      },
      {
        label: 'Fressnapf: Fellpflege-Sortiment Hund',
        url: 'https://www.fressnapf.de/c/hund/pflege-hygiene/fellpflege/',
      },
    ],
  },
  {
    categoryId: 'grooming-claw',
    kicker: 'KRALLENWERKZEUG VERGLEICHEN',
    intro:
      'Bei Krallenschere und Krallenzange zählt kontrollierbares Arbeiten mehr als möglichst viel Hebel. Größe, Sicht auf die Kralle, scharfe und sauber schließende Schneiden sowie eine ruhige Handhabung entscheiden darüber, ob du überhaupt sicher kürzen kannst.',
    description:
      'Krallenschere oder Krallenzange für Hund und Katze auswählen: Größencheck, sichere Vorbereitung, kleinschrittige Gewöhnung und klare Stoppsignale.',
    quickAnswer:
      'Kleine Scheren geben bei schmalen Katzen- und kleinen Hundekrallen oft die bessere Sicht. Zangen bieten bei kräftigeren Hundekrallen mehr Hebel. Das Werkzeug muss zur Kralle und zu deiner Hand passen: Du solltest die Schneiden sehen, ohne die Pfote zu verdrehen. Bei dunklen Krallen oder Unsicherheit lässt du dir die passende Schnittstelle einmal in der Praxis oder im fachkundigen Salon zeigen.',
    imageStem: 'krallenpflege',
    imageAlt:
      'Zwei manuelle Krallenzangen und eine Feile neben entspannten Hunde- und Katzenpfoten',
    selectionTitle: 'Schere, Zange oder Feile?',
    selectionIntro:
      'Die Bauform löst unterschiedliche Handhabungsprobleme. Kein Werkzeug macht die Blutgefäße in einer dunklen Kralle sichtbar oder ersetzt das Wissen, wo gekürzt werden darf.',
    choices: [
      {
        title: 'Kleine Krallenschere',
        suitableFor: 'Schmale Krallen und kleine Hände; häufig gut kontrollierbar bei Katzen.',
        check:
          'Schnittstelle bleibt sichtbar, Gelenk läuft ohne Spiel und die Schneiden schließen bündig.',
        avoid: 'Zu kleine Öffnung nicht mit Kraft über eine kräftige Kralle drücken.',
      },
      {
        title: 'Krallenzange',
        suitableFor: 'Mittlere bis kräftige Hundekrallen, wenn mehr Hebel nötig ist.',
        check:
          'Rutschfester Griff, saubere Rückstellung und eine Öffnung, in der die Kralle nicht verkantet.',
        avoid: 'Ein Abstandhalter ist keine Garantie für die richtige Schnittlänge.',
      },
      {
        title: 'Manuelle Feile',
        suitableFor:
          'Scharfe Kanten nach einem kleinen Schnitt glätten oder minimale Länge abtragen.',
        check: 'Feine Oberfläche, die nicht rupft, und gut kontrollierbarer Griff.',
        avoid: 'Nicht lange an einer Stelle reiben; Reibung erzeugt Wärme.',
      },
      {
        title: 'Elektrischer Schleifer',
        suitableFor:
          'Nur wenn Geräusch, Vibration und Wärmekontrolle bereits ruhig trainiert wurden.',
        check: 'Der Pflegekatalog führt ihn derzeit nicht; diese Seite bewertet keine Modelle.',
        avoid: 'Nicht spontan an einem geräuschempfindlichen Tier ausprobieren.',
      },
    ],
    measureTitle: 'Passform prüfen, bevor du schneidest',
    measureIntro:
      'Öffne das Werkzeug ohne Tier und simuliere die Handbewegung. Deine Sicht und Griffkontrolle sind ebenso wichtig wie die nominelle Größenangabe.',
    measures: [
      'Vergleiche den Durchmesser der kräftigsten Kralle mit der vollständig geöffneten Schneide.',
      'Halte das Werkzeug in der Hand, die später schneidet: Finger müssen entspannt schließen können.',
      'Prüfe bei gutem Licht jede Kralle einzeln; Länge und sichtbarer durchbluteter Bereich können variieren.',
      'Lege rutschfeste Unterlage, saubere Kompresse und gutes Licht bereit, bevor das Tier dazukommt.',
      'Bei dunklen Krallen planst du besonders kleine Schritte oder lässt die Handlung zeigen, statt eine Länge zu erraten.',
    ],
    routineTitle: 'Vom Pfotenkontakt zum einzelnen Schnitt',
    routineIntro:
      'Gewöhnung und Kürzen dürfen an verschiedenen Tagen stattfinden. Das Ziel der ersten Einheiten ist eine ruhig abgelegte Pfote, nicht eine vollständige Maniküre.',
    steps: [
      {
        title: 'Pfote kurz berühren',
        text: 'Eine Sekunde berühren, lösen und ruhiges Verhalten belohnen.',
      },
      {
        title: 'Zehe einzeln halten',
        text: 'Nur so fest, dass die Kralle sichtbar wird. Sofort lösen, wenn das Tier zieht.',
      },
      {
        title: 'Werkzeug annähern',
        text: 'Geschlossenes Werkzeug kurz an die Pfote führen und wieder entfernen.',
      },
      {
        title: 'Eine Spitze kürzen',
        text: 'Nur einen kleinen, sicher beurteilbaren Anteil einer Kralle schneiden.',
      },
      {
        title: 'Bilanz ziehen',
        text: 'Werkzeug reinigen, Schneiden prüfen und die nächste Kralle erst angehen, wenn beide ruhig bleiben.',
      },
    ],
    mistakesTitle: 'Was bei der Auswahl oft schiefgeht',
    mistakes: [
      'Die größte Zange kaufen, obwohl dadurch Sicht und Feinkontrolle schlechter werden.',
      'Stumpfe oder gegeneinander versetzte Schneiden weiterverwenden.',
      'Alle Krallen in einer Sitzung schaffen wollen, obwohl das Tier schon ausweicht.',
      'Bei dunklen Krallen eine pauschale Millimeterangabe als sichere Schnittgrenze behandeln.',
    ],
    stopTitle: 'Abbrechen und fachliche Hilfe holen',
    stopText:
      'Brich ab, wenn die Kralle gespalten, eingerissen, entzündet oder in den Ballen eingewachsen ist, wenn das Tier deutlich lahmt oder starke Schmerzen zeigt. Kommt es zu einer Blutung, übe mit einer sauberen Kompresse gleichmäßigen Druck aus. Hört sie nicht zeitnah auf oder ist die Verletzung größer, kontaktiere eine Tierarztpraxis.',
    faqs: [
      {
        question: 'Wie oft müssen Krallen gekürzt werden?',
        answer:
          'Dafür gibt es keinen verlässlichen Kalender. Untergrund, Aktivität und einzelne Krallen unterscheiden sich. Kontrolliere regelmäßig Form, Bodenkontakt und Veränderungen, ohne daraus automatisch einen Schnitt abzuleiten.',
      },
      {
        question: 'Ist ein Abstandhalter sicher?',
        answer:
          'Er begrenzt nur die Mechanik des Werkzeugs. Die individuelle Lage des durchbluteten Bereichs erkennt er nicht.',
      },
      {
        question: 'Kann ich einen Nagelknipser für Menschen nehmen?',
        answer:
          'Dessen Schnittführung ist nicht für Tierkrallen ausgelegt. Verwende ein passendes, scharfes Tierkrallenwerkzeug.',
      },
    ],
    shopLinks: [
      {
        id: 'krallenpflege-hund',
        species: 'Hund',
        label: 'Krallenwerkzeug für Hunde ansehen',
        description: 'Manuelle Scheren und Zangen im gefilterten Fressnapf-Sortiment.',
        destinationUrl:
          'https://www.fressnapf.de/c/hund/pflege-hygiene/pfotenpflege/?q=%3A%3Aclsf-enum-type%3AKrallenschere',
      },
      {
        id: 'krallenpflege-katze',
        species: 'Katze',
        label: 'Krallenwerkzeug für Katzen ansehen',
        description: 'Kleine Krallenscheren und ergänzendes Pflegezubehör im Fressnapf-Sortiment.',
        destinationUrl:
          'https://www.fressnapf.de/c/katze/hygiene-pflege/fell-koerperpflege/?q=%3A%3Aclsf-enum-type%3AKrallenschere',
      },
    ],
    sources: [
      {
        label: 'Cats Protection: Trimming your cat’s claws',
        url: 'https://www.cats.org.uk/help-and-advice/health/how-to-trim-cat-claws',
      },
      {
        label: 'ASPCA: Dog Grooming Tips',
        url: 'https://www.aspca.org/pet-care/dog-care/dog-grooming-tips',
      },
      {
        label: 'Fressnapf: Krallenscheren für Hunde',
        url: 'https://www.fressnapf.de/c/hund/pflege-hygiene/pfotenpflege/?q=%3A%3Aclsf-enum-type%3AKrallenschere',
      },
    ],
  },
  {
    categoryId: 'dental-care',
    kicker: 'MECHANISCHE ZAHNPFLEGE',
    intro:
      'Diese Seite vergleicht ausschließlich Zubehör zur mechanischen Reinigung: Zahnbürsten und Fingerlinge. Pasten, Pulver, Wirkstoffe und Gesundheitsversprechen gehören nicht in diesen Produktvergleich. Die beste Bürste ist die, deren Kopf an die Zahnflächen gelangt und die dein Tier in kleinen Schritten akzeptieren kann.',
    description:
      'Zahnbürste und Fingerling für Hund oder Katze auswählen: Kopfgröße, Borsten, Handhabung, Gewöhnung, Reinigung und tierärztliche Warnzeichen.',
    quickAnswer:
      'Wähle den kleinsten Bürstenkopf, mit dem du die äußeren Zahnflächen kontrolliert erreichst, ohne Wange oder Zahnfleisch stark zu verdrängen. Ein langer Griff schafft Abstand und Sicht; ein Fingerling gibt direkte Rückmeldung, benötigt aber ausreichend Platz im Maul und schützt den Finger nicht vor einem Biss. Nutze niemals Zahnpasta für Menschen.',
    imageStem: 'zahnpflege',
    imageAlt: 'Kleine Tierzahnbürste und Silikonfingerling auf einem Tablett vor Hund und Katze',
    selectionTitle: 'Werkzeug nach Zugang auswählen',
    selectionIntro:
      'Entscheide nicht nach Werbeversprechen, sondern nach Kopfgröße, Borstengefühl, Reichweite und Reinigung des Zubehörs.',
    choices: [
      {
        title: 'Kleine Langgriff-Zahnbürste',
        suitableFor:
          'Kontrollierter Zugang zu den äußeren Zahnflächen bei kleinem Maul oder engem Lefzenraum.',
        check:
          'Kleiner abgerundeter Kopf, weiche Borsten und ein Griff, der auch feucht sicher bleibt.',
        avoid: 'Ein zu großer Kopf drückt die Lefze weg und verschlechtert die Sicht.',
      },
      {
        title: 'Doppelkopf-Bürste',
        suitableFor:
          'Haushalte mit unterschiedlich großen Tieren oder wechselnden schwer erreichbaren Bereichen.',
        check: 'Beide Köpfe müssen sich hygienisch lagern lassen, ohne auf der Ablage zu liegen.',
        avoid: 'Die große Seite nicht allein deshalb verwenden, weil sie schneller wirkt.',
      },
      {
        title: 'Silikon-Fingerling',
        suitableFor: 'Sehr kurze Gewöhnungsschritte mit direktem Gefühl für Kontakt und Druck.',
        check: 'Fester Sitz auf dem Finger, weiche intakte Noppen und genügend Platz im Maul.',
        avoid: 'Nicht bei Schnappen, Abwehr oder zu wenig Abstand zwischen Finger und Zähnen.',
      },
      {
        title: 'Textiler Fingerling',
        suitableFor: 'Oberflächliches Wischen während der frühen Gewöhnung.',
        check: 'Wasch- oder Einmalhinweis, saubere Naht und eindeutige Materialangabe.',
        avoid: 'Er ersetzt keine Diagnose und erreicht enge Zahnzwischenräume nicht automatisch.',
      },
    ],
    measureTitle: 'Was du vor dem Kauf wirklich prüfen kannst',
    measureIntro:
      'Eine Packungsangabe „S/M/L“ ist zwischen Herstellern nicht vergleichbar. Nutze vorhandene Gegenstände nur zum Abschätzen und führe nichts Probeweise ins Maul ein.',
    measures: [
      'Beobachte beim entspannten Tier, wie weit sich die Lefze seitlich anheben lässt, ohne den Kopf festzuhalten.',
      'Vergleiche die Bürstenkopflänge mit dem sichtbaren Bereich der äußeren Backenzähne.',
      'Prüfe, ob der Griff auch mit nassen Händen drehbar und dosierbar bleibt.',
      'Kläre, wie der Kopf nach jeder Nutzung gespült, getrocknet und getrennt gelagert wird.',
      'Plane für jedes Tier eine eigene Bürste oder einen klar getrennten Aufsatz ein.',
    ],
    routineTitle: 'Gewöhnung in fünf Stationen',
    routineIntro:
      'Erst wenn eine Station ruhig gelingt, kommt die nächste hinzu. Eine kurze Wiederholung ist sinnvoller als das Öffnen des Mauls gegen Widerstand.',
    steps: [
      {
        title: 'Berührung außen',
        text: 'Wange und Lefze kurz berühren, dann lösen. Maul bleibt geschlossen.',
      },
      {
        title: 'Lefze anheben',
        text: 'Eine äußere Zahnfläche für einen Moment sichtbar machen, ohne den Kiefer aufzuhebeln.',
      },
      {
        title: 'Werkzeug zeigen',
        text: 'Bürste beschnuppern lassen und eine einzelne Berührung außen an der Lefze üben.',
      },
      {
        title: 'Eine Zahnfläche',
        text: 'Mit sehr wenig Druck kurz über eine gut erreichbare äußere Fläche führen.',
      },
      {
        title: 'Bereich erweitern',
        text: 'Dauer und Zahl der Flächen langsam steigern; bei Abwehr zur vorherigen Station zurückkehren.',
      },
    ],
    mistakesTitle: 'Woran Zubehörkäufe scheitern',
    mistakes: [
      'Ein großer Bürstenkopf wird gewählt, weil er mehr Fläche verspricht.',
      'Harte Borsten oder hoher Druck sollen fehlende Gewöhnung ausgleichen.',
      'Ein Fingerling wird verwendet, obwohl das Tier nach der Hand schnappt.',
      'Zubehör wird als Ersatz für die Untersuchung bereits vorhandener Maulprobleme verstanden.',
    ],
    stopTitle: 'Diese Zeichen gehören in die Tierarztpraxis',
    stopText:
      'Maulgeruch, sichtbarer Zahnstein, gerötetes oder blutendes Zahnfleisch, lockere oder beschädigte Zähne, Speicheln, einseitiges Kauen, fallengelassenes Futter und Schmerzreaktionen beim Berühren sollten tierärztlich abgeklärt werden. Beginne bei Schmerzen keine Putzgewöhnung auf eigene Faust.',
    faqs: [
      {
        question: 'Kann ich eine Kinderzahnbürste verwenden?',
        answer:
          'Ein kleiner Kopf kann praktisch wirken, doch Form, Griff und Borsten müssen für den Zugang beim Tier passen. Tierzahnbürsten bieten dafür häufig passendere Winkel. Entscheidend bleibt die konkrete Passform.',
      },
      {
        question: 'Braucht jedes Tier eine eigene Bürste?',
        answer:
          'Ja. Getrennte Bürsten oder Aufsätze erleichtern hygienische Lagerung und verhindern Verwechslungen.',
      },
      {
        question: 'Ist ein Fingerling sanfter?',
        answer:
          'Nicht automatisch. Der ausgeübte Druck und die Akzeptanz des Tieres entscheiden. Außerdem liegt der Finger näher an den Zähnen.',
      },
    ],
    shopLinks: [
      {
        id: 'zahnpflege-hund',
        species: 'Hund',
        label: 'Zahnpflegezubehör für Hunde ansehen',
        description:
          'Zahnbürsten und weiteres Zubehör im Fressnapf-Sortiment; Inhaltsstoffe separat prüfen.',
        destinationUrl: 'https://www.fressnapf.de/c/hund/pflege-hygiene/zahnpflege/',
      },
      {
        id: 'zahnpflege-katze',
        species: 'Katze',
        label: 'Zahnpflegezubehör für Katzen ansehen',
        description:
          'Kleine Zahnbürsten und Fingerlinge im Fressnapf-Sortiment; Inhaltsstoffe separat prüfen.',
        destinationUrl: 'https://www.fressnapf.de/c/katze/hygiene-pflege/zahnpflege/',
      },
    ],
    sources: [
      {
        label: 'American Veterinary Medical Association: Pet dental care',
        url: 'https://www.avma.org/resources-tools/pet-owners/petcare/pet-dental-care',
      },
      {
        label: 'Veterinary Oral Health Council: Accepted Products',
        url: 'https://vohc.org/accepted-products/',
      },
      {
        label: 'Fressnapf: Zahnpflegezubehör für Hunde',
        url: 'https://www.fressnapf.de/c/hund/pflege-hygiene/zahnpflege/',
      },
    ],
  },
  {
    categoryId: 'mobility-aid',
    kicker: 'RAMPE UND EINSTIEGSHILFE',
    intro:
      'Eine Rampe passt nur, wenn Hund, Zielhöhe und verfügbarer Raum gemeinsam betrachtet werden. Die Höchstlast allein reicht nicht: Nutzlänge, Breite, Oberfläche, seitliche Orientierung, Standfläche und das sichere Befestigen am Fahrzeug oder Möbel bestimmen, ob der Aufbau im Alltag verwendbar ist.',
    description:
      'Hunderampe und Einstiegshilfe auswählen: Fahrzeug und Hund vermessen, Steigung vergleichen, Traglast und Rutschschutz prüfen und die Nutzung sicher trainieren.',
    quickAnswer:
      'Miss zuerst die Höhe der Ladekante und den freien Platz hinter dem Auto. Eine längere Rampe ergibt bei gleicher Höhe eine flachere Steigung, braucht aber mehr Aufstellfläche. Das Produkt muss über dem tatsächlichen Hundegewicht belastbar sein, vollständig aufliegen, seitlich stabil bleiben und eine Oberfläche bieten, auf der dein Hund auch bei Feuchtigkeit sicheren Tritt findet.',
    imageStem: 'mobilitaet',
    imageAlt:
      'Gefaltete rutschfeste Hunderampe neben einem offenen Kofferraum und einem wartenden älteren Hund',
    selectionTitle: 'Bauform nach Einsatzort wählen',
    selectionIntro:
      'Eine gute Lösung für das Sofa kann am Kofferraum zu kurz sein. Notiere deshalb den konkreten Einsatzort und vergleiche nur Produkte, deren Maße vollständig angegeben sind.',
    choices: [
      {
        title: 'Klappbare Rampe',
        suitableFor:
          'Regelmäßiger Transport im Auto, wenn gefaltete Länge und Gewicht zum Stauraum passen.',
        check:
          'Scharniere verriegeln, Auflage greift sicher, gefaltete Rampe lässt sich kontrolliert tragen.',
        avoid:
          'Nicht aufstellen, wenn sie seitlich wackelt oder die Auflage nur auf einer schmalen Kante sitzt.',
      },
      {
        title: 'Teleskoprampe',
        suitableFor: 'Unterschiedliche Zielhöhen, wenn die Auszugslänge eindeutig arretierbar ist.',
        check: 'Arretierung, Fingerklemmschutz, Eigengewicht und Griffflächen prüfen.',
        avoid: 'Ein nicht vollständig verriegelter Auszug kann sich unter Last bewegen.',
      },
      {
        title: 'Hundetreppe',
        suitableFor: 'Niedrige Möbel und Hunde, die Stufen sicher und ruhig nutzen können.',
        check: 'Stufentiefe, Gesamthöhe, Standfläche und rutschfeste Unterseite messen.',
        avoid:
          'Für einen unsicheren Gang oder sehr hohe Ladekanten ist eine steile Treppe oft ungeeignet.',
      },
      {
        title: 'Tragehilfe oder Hebegurt',
        suitableFor:
          'Gezielte Unterstützung nach fachlicher Anleitung und mit passender Körperführung.',
        check: 'Größe, Kontaktflächen, Verschlüsse und freier Toilettengang müssen passen.',
        avoid: 'Nicht ohne Einweisung bei Schmerzen oder nach einer Operation einsetzen.',
      },
    ],
    measureTitle: 'Fünf Maße für einen realistischen Vergleich',
    measureIntro:
      'Schreibe die Werte auf und vergleiche sie mit den vollständigen Herstellerangaben. Fehlt ein entscheidendes Maß, lässt sich die Passform nicht zuverlässig beurteilen.',
    measures: [
      'Höhe: senkrecht vom Boden bis zur belastbaren Auflagekante messen.',
      'Freier Raum: waagerecht von der Kante bis zum frühesten Hindernis hinter dem Fahrzeug messen.',
      'Nutzbreite: Schulterbreite des Hundes plus Raum für gerade Schritte berücksichtigen.',
      'Gewicht: aktuelles Hundegewicht mit Hersteller-Höchstlast vergleichen; die Grenze nicht ausreizen.',
      'Transportmaß: Kofferraum, Türöffnung und den Weg vom Lagerort zum Einsatzplatz ausmessen.',
    ],
    routineTitle: 'Die Rampe zuerst am Boden erklären',
    routineIntro:
      'Trainiere die Oberfläche ohne Höhe und ohne Zeitdruck. Ziehen an Leine oder Geschirr macht einen unsicheren Schritt nicht sicherer.',
    steps: [
      {
        title: 'Flach auslegen',
        text: 'Rampe rutschfest auf den Boden legen und freiwilliges Anschauen oder Annähern bestätigen.',
      },
      {
        title: 'Einzelne Pfoten',
        text: 'Einen ruhigen Schritt auf die Fläche ermöglichen und seitliches Abspringen nicht blockieren.',
      },
      {
        title: 'Gerade überqueren',
        text: 'Erst wenn vier Pfoten sicher aufsetzen, die ganze flache Strecke üben.',
      },
      {
        title: 'Minimal erhöhen',
        text: 'Eine sehr niedrige, stabil gesicherte Höhe wählen und in beide Richtungen trainieren.',
      },
      {
        title: 'Am Zielort sichern',
        text: 'Auflage, Arretierung und Stand vor jedem Durchgang kontrollieren; Hund langsam und gerade führen.',
      },
    ],
    mistakesTitle: 'Die häufigsten Planungsfehler',
    mistakes: [
      'Nur die Höchstlast vergleichen und Länge, Breite oder Eigengewicht übersehen.',
      'Die theoretische Gesamtlänge mit der tatsächlich begehbaren Fläche verwechseln.',
      'Erst am Reisetag trainieren und den Hund unter Zeitdruck auf die Rampe führen.',
      'Eine rutschfeste Oberfläche annehmen, ohne sie bei nassen Pfoten praktisch zu prüfen.',
    ],
    stopTitle: 'Mobilitätsveränderungen abklären',
    stopText:
      'Eine Einstiegshilfe erklärt keine neue Lahmheit, Schwäche, Koordinationsstörung oder Schmerzreaktion. Tritt eine Veränderung plötzlich auf, verschlechtert sie sich oder kann dein Hund nicht sicher stehen, lass ihn tierärztlich untersuchen. Nach Eingriffen oder bei bekannten Erkrankungen sollte die konkrete Hilfe mit der behandelnden Praxis abgestimmt werden.',
    faqs: [
      {
        question: 'Wie steil darf eine Hunderampe sein?',
        answer:
          'Eine pauschale Gradzahl passt nicht zu jedem Hund. Vergleiche Höhe und Nutzlänge, wähle möglichst flach und beobachte den Gang. Bei Unsicherheit oder eingeschränkter Mobilität sollte die behandelnde Praxis die konkrete Situation beurteilen.',
      },
      {
        question: 'Reicht die angegebene Höchstlast?',
        answer:
          'Nein. Sie ist ein notwendiger Filter, sagt aber nichts über Breite, Stand, Auflage, Oberfläche oder die sichere Nutzung durch deinen Hund aus.',
      },
      {
        question: 'Rampe oder Treppe?',
        answer:
          'Das hängt von Zielhöhe, verfügbarem Raum und dem Bewegungsmuster des Hundes ab. Eine flache Rampe vermeidet Stufen, benötigt aber mehr Länge.',
      },
    ],
    shopLinks: [
      {
        id: 'hunderampen',
        species: 'Hund',
        label: 'Hunderampen und Einstiegshilfen ansehen',
        description:
          'Rampen und Treppen im Fressnapf-Sortiment; Maße und Höchstlast am Zielprodukt prüfen.',
        destinationUrl:
          'https://www.fressnapf.de/c/hund/transport-sicherheit/autozubehoer/?q=%3A%3Aclsf-enum-type%3ARampe',
      },
    ],
    sources: [
      {
        label: 'RSPCA: Ältere Hunde und Mobilitätshilfen',
        url: 'https://www.rspca.org.uk/adviceandwelfare/pets/dogs/health/seniordogs',
      },
      {
        label: 'PDSA: Mobilitätshilfen für ältere Hunde',
        url: 'https://www.pdsa.org.uk/pet-help-and-advice/looking-after-your-pet/puppies-dogs/exercising-your-senior-dog',
      },
      {
        label: 'Fressnapf: Hunderampen fürs Auto',
        url: 'https://www.fressnapf.de/c/hund/transport-sicherheit/autozubehoer/?q=%3A%3Aclsf-enum-type%3ARampe',
      },
    ],
  },
  {
    categoryId: 'coat-care-textile',
    kicker: 'TROCKNEN, OHNE ZU SCHEUERN',
    intro:
      'Pflegetextilien unterscheiden sich vor allem darin, wie viel Wasser sie aufnehmen, welche Körperfläche sie erreichen und ob das Tier sie während des Trocknens trägt. Ein Handtuch ist flexibel und schnell gewechselt; ein Bademantel bleibt am Tier, muss dafür aber in Länge, Hals und Brust passen.',
    description:
      'Handtuch, Hundebademantel und Pflegetextilien auswählen: Material, Größe, Verschlüsse, Waschbarkeit und eine ruhige Trocknungsroutine vergleichen.',
    quickAnswer:
      'Für Pfoten und kleine nasse Stellen ist ein griffiges, waschbares Handtuch meist am praktischsten. Bei einem vollständig nassen Hund kann ein gut sitzender Bademantel Feuchtigkeit aufnehmen, während er sich bewegt. Er darf Hals, Brust, Achseln oder Rute nicht einengen. Für Katzen ist ein weiches Handtuch in der Regel leichter kontrollierbar als Kleidung.',
    imageStem: 'pflegetextilien',
    imageAlt:
      'Gefaltete saugfähige Tücher und ein Hundebademantel neben einem nassen Hund und einer langhaarigen Katze',
    selectionTitle: 'Textil nach Situation auswählen',
    selectionIntro:
      'Materialnamen allein sagen wenig. Vergleiche Nutzfläche, Gewicht im nassen Zustand, Nähte, Verschlüsse, Pflegeetikett und die Frage, wie schnell ein zweites trockenes Textil verfügbar ist.',
    choices: [
      {
        title: 'Frottee-Handtuch',
        suitableFor: 'Abtupfen, Pfoten, Bauch und große nasse Flächen bei Hund oder Katze.',
        check:
          'Dichte Schlingen, gut eingefasste Kanten und Maschinenwäsche bei klar angegebener Temperatur.',
        avoid: 'Lose Fäden können an Krallen hängen bleiben.',
      },
      {
        title: 'Mikrofaser-Handtuch',
        suitableFor: 'Leichtes, platzsparendes Tuch für Auto, Reise oder häufige Wechsel.',
        check: 'Griffigkeit mit nassen Händen, Waschhinweise und Oberfläche ohne harte Kanten.',
        avoid: 'Keinen Weichspüler verwenden, wenn das Pflegeetikett davon abrät.',
      },
      {
        title: 'Hundebademantel',
        suitableFor:
          'Hunde, die nach dem Abtupfen weiter Feuchtigkeit im Fell tragen und Kleidung tolerieren.',
        check: 'Rückenlänge, Hals- und Brustumfang, freie Achseln, sichere flache Verschlüsse.',
        avoid: 'Nicht unbeaufsichtigt anlassen und nicht als Wärmemantel für draußen verstehen.',
      },
      {
        title: 'Saugmatte',
        suitableFor: 'Fester Trockenplatz im Eingangsbereich unter Aufsicht.',
        check:
          'Rutschfeste Unterseite, waschbare Gesamtgröße und flache Kanten ohne Stolperstelle.',
        avoid: 'Keine Matte verwenden, die sich auf glattem Boden zusammenschiebt.',
      },
    ],
    measureTitle: 'Größe und Alltagstauglichkeit prüfen',
    measureIntro:
      'Bei Handtüchern zählt die nutzbare Fläche. Bei tragbaren Textilien müssen zusätzlich Körpermaße und Bewegungsfreiheit stimmen.',
    measures: [
      'Rückenlänge vom Schulterbereich bis vor den Rutenansatz messen, während der Hund gerade steht.',
      'Brustumfang an der breitesten Stelle messen und Platz für Bewegung nach Herstelleranleitung einplanen.',
      'Halsöffnung und Verschlusslage mit Achseln, Geschirr und empfindlichen Stellen abgleichen.',
      'Waschtemperatur, Trocknerfreigabe und Trocknungszeit auf dem Pflegeetikett prüfen.',
      'Das nasse Textil anheben: Es muss sich noch kontrolliert wechseln lassen und darf nicht am Tier ziehen.',
    ],
    routineTitle: 'Vom nassen Fell zum trockenen Ruheplatz',
    routineIntro:
      'Rubbeln kann Knoten verstärken und empfindliche Haut reizen. Arbeite mit Druck und Wechseln statt mit hektischer Reibung.',
    steps: [
      {
        title: 'Wasser ausstreichen',
        text: 'Mit den Händen in Fellrichtung überschüssiges Wasser sanft abstreichen.',
      },
      {
        title: 'Abtupfen',
        text: 'Handtuch auflegen, leicht andrücken und anheben. Nicht über verknotetes langes Fell rubbeln.',
      },
      {
        title: 'Textil wechseln',
        text: 'Ein vollgesogenes Tuch durch ein trockenes ersetzen, statt weiter Feuchtigkeit zu verteilen.',
      },
      {
        title: 'Passform kontrollieren',
        text: 'Beim Bademantel nach wenigen Schritten Hals, Achseln, Brustverschluss und Verrutschen prüfen.',
      },
      {
        title: 'Vollständig trocknen lassen',
        text: 'Einen warmen, zugfreien Ruheplatz anbieten und feuchte Textilien rechtzeitig abnehmen.',
      },
    ],
    mistakesTitle: 'Was im Alltag unnötig stört',
    mistakes: [
      'Nur nach Rückenlänge kaufen und Brust- oder Halsumfang nicht prüfen.',
      'Ein schweres, nasses Textil lange am Tier lassen.',
      'Verschlüsse wählen, die im Fell hängen oder unter dem Bauch drücken.',
      'Ein Handtuch mit losen Schlingen für Tiere verwenden, deren Krallen darin hängen bleiben.',
    ],
    stopTitle: 'Wenn Nässe nicht das einzige Problem ist',
    stopText:
      'Anhaltendes Zittern, Teilnahmslosigkeit, Atemprobleme, auffällig kalte Körperoberfläche, Schmerzen beim Berühren oder Hautveränderungen benötigen mehr als ein Textil. Bring das Tier in eine geeignete Umgebung und hole bei deutlichen oder anhaltenden Auffälligkeiten tierärztlichen Rat.',
    faqs: [
      {
        question: 'Ist Mikrofaser besser als Baumwolle?',
        answer:
          'Nicht allgemein. Mikrofaser ist oft leicht und trocknet schnell, Frottee kann sich griffiger anfühlen. Verarbeitung, Waschbarkeit, Hautkontakt und Akzeptanz sind wichtiger als ein einzelner Materialname.',
      },
      {
        question: 'Braucht eine Katze einen Bademantel?',
        answer:
          'Meist ist ein weiches, gut kontrollierbares Handtuch einfacher. Kleidung kann Bewegung und Rückzug stören und sollte einer Katze nicht gegen Widerstand angezogen werden.',
      },
      {
        question: 'Wie muss ein Hundebademantel sitzen?',
        answer:
          'Er soll den Rumpf abdecken, ohne Hals, Brust, Achseln, Beine oder Rute einzuschränken. Verschlüsse dürfen nicht drücken und das Textil darf sich beim Gehen nicht verdrehen.',
      },
    ],
    shopLinks: [
      {
        id: 'bademantel-hund',
        species: 'Hund',
        label: 'Hundebademäntel ansehen',
        description:
          'Bademäntel und Hundehandtücher im Fressnapf-Sortiment; Größen am Zielprodukt prüfen.',
        destinationUrl: 'https://www.fressnapf.de/c/hund/hundebekleidung/hundebademaentel/',
      },
      {
        id: 'pflegetextilien-katze',
        species: 'Katze',
        label: 'Katzen-Pflegezubehör ansehen',
        description: 'Tücher und weiteres Körperpflegezubehör im Fressnapf-Sortiment.',
        destinationUrl: 'https://www.fressnapf.de/c/katze/hygiene-pflege/fell-koerperpflege/',
      },
    ],
    sources: [
      {
        label: 'Cats Protection: Grooming',
        url: 'https://www.cats.org.uk/help-and-advice/cat-behaviour/grooming',
      },
      {
        label: 'RSPCA: Grooming your dog',
        url: 'https://www.rspca.org.uk/adviceandwelfare/pets/dogs/health/grooming',
      },
      {
        label: 'Fressnapf: Hundebademäntel',
        url: 'https://www.fressnapf.de/c/hund/hundebekleidung/hundebademaentel/',
      },
    ],
  },
];

export function careGuide(categoryId: string): CareGuide | undefined {
  return GUIDES.find((guide) => guide.categoryId === categoryId);
}

export function allCareGuides(): readonly CareGuide[] {
  return GUIDES;
}
