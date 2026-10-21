/**
 * Kostenseiten für häufige Behandlungen (Inhaltsstandard, Seitentyp
 * Tierarztkosten). Jede Seite beruht auf einem Kostenszenario in
 * `content-data/cost-scenarios/`. Solange das Szenario nicht fachlich
 * freigegeben ist, zeigt die Seite nur die Einzelpositionen, keine Summe,
 * und bleibt `noindex` (siehe `mayShowTotalEstimate`).
 *
 * Die Texte beschreiben die Abrechnung nach der GOT, nicht die Behandlung
 * selbst; medizinische Fragen beantwortet die Tierarztpraxis (ADR-012).
 */
export interface Behandlungsfrage {
  readonly frage: string;
  readonly antwort: string;
}

export interface Behandlungsseite {
  readonly slug: string;
  readonly scenarioId: string;
  readonly titel: string;
  readonly metaTitel: string;
  readonly beschreibung: string;
  readonly einleitung: string;
  /** Was die Rechnung über die Positionen hinaus verändert. */
  readonly kostentreiber: readonly string[];
  readonly fragen: readonly Behandlungsfrage[];
}

const FAKTOR = {
  frage: 'Warum kostet dieselbe Behandlung in Praxen unterschiedlich viel?',
  antwort:
    'Die GOT legt für jede Leistung einen einfachen Satz fest. Die Praxis rechnet je nach Aufwand, Schwierigkeit und Zeitpunkt den einfachen bis dreifachen Satz ab, im Notdienst den zwei- bis vierfachen Satz zuzüglich einer Notdienstgebühr von 50 € netto. Dazu kommen Arzneimittel und Material, die nicht in der GOT stehen.',
};

const KOSTENVORANSCHLAG = {
  frage: 'Kann ich vorher nach den Kosten fragen?',
  antwort:
    'Ja. Frag vor einem geplanten Eingriff nach einem Kostenvoranschlag mit den GOT-Positionen und dem vorgesehenen Faktor. So lassen sich Angebote vergleichen und spätere Rechnungen nachvollziehen.',
};

export const BEHANDLUNGEN: readonly Behandlungsseite[] = [
  {
    slug: 'impfung-hund',
    scenarioId: 'impfung-hund',
    titel: 'Was kostet eine Impfung beim Hund?',
    metaTitel: 'Impfung Hund Kosten: GOT-Positionen und Faktoren',
    beschreibung:
      'Welche GOT-Positionen bei einer Hundeimpfung anfallen, was sie im einfachen bis dreifachen Satz kosten und was zusätzlich berechnet wird.',
    einleitung:
      'Eine Impfung wird nach der Gebührenordnung für Tierärzte (GOT) aus mehreren Positionen abgerechnet: die Untersuchung vor der Impfung und die Injektion. Der Impfstoff selbst kommt als Arzneimittel dazu.',
    kostentreiber: [
      'der Impfstoff (Arzneimittel, nicht in der GOT)',
      'mehrere Impfstoffe in einem Termin',
      'der Faktor, den die Praxis ansetzt',
      'eine Impfbescheinigung, falls gesondert ausgestellt',
    ],
    fragen: [FAKTOR, KOSTENVORANSCHLAG],
  },
  {
    slug: 'impfung-katze',
    scenarioId: 'impfung-katze',
    titel: 'Was kostet eine Impfung bei der Katze?',
    metaTitel: 'Impfung Katze Kosten: GOT-Positionen und Faktoren',
    beschreibung:
      'Welche GOT-Positionen bei einer Katzenimpfung anfallen, was sie im einfachen bis dreifachen Satz kosten und was zusätzlich berechnet wird.',
    einleitung:
      'Eine Impfung wird nach der Gebührenordnung für Tierärzte (GOT) aus mehreren Positionen abgerechnet: die Untersuchung vor der Impfung und die Injektion. Der Impfstoff selbst kommt als Arzneimittel dazu.',
    kostentreiber: [
      'der Impfstoff (Arzneimittel, nicht in der GOT)',
      'mehrere Impfstoffe in einem Termin',
      'der Faktor, den die Praxis ansetzt',
      'eine Impfbescheinigung, falls gesondert ausgestellt',
    ],
    fragen: [FAKTOR, KOSTENVORANSCHLAG],
  },
  {
    slug: 'kastration-kater',
    scenarioId: 'kastration-kater',
    titel: 'Was kostet die Kastration eines Katers?',
    metaTitel: 'Kastration Kater Kosten: GOT-Positionen und Faktoren',
    beschreibung:
      'Die GOT-Positionen einer Katerkastration (Untersuchung, Narkose, Eingriff), ihre Beträge im einfachen bis dreifachen Satz und was zusätzlich anfällt.',
    einleitung:
      'Die Kastration eines Katers wird nach der Gebührenordnung für Tierärzte (GOT) aus der Untersuchung, der Narkose und dem Eingriff selbst abgerechnet. Arzneimittel und Material kommen dazu.',
    kostentreiber: [
      'die Art der Narkose, die die Praxis wählt',
      'Arzneimittel, etwa gegen Schmerzen',
      'eine Blutuntersuchung vor dem Eingriff, falls gewünscht',
      'der Faktor, den die Praxis ansetzt',
    ],
    fragen: [FAKTOR, KOSTENVORANSCHLAG],
  },
  {
    slug: 'kastration-katze',
    scenarioId: 'kastration-katze',
    titel: 'Was kostet die Kastration einer Katze?',
    metaTitel: 'Kastration Katze Kosten: GOT-Positionen und Faktoren',
    beschreibung:
      'Die GOT-Positionen einer Kastration bei der Kätzin (Untersuchung, Narkose, Eingriff), ihre Beträge im einfachen bis dreifachen Satz und was zusätzlich anfällt.',
    einleitung:
      'Die Kastration einer Kätzin ist ein Eingriff in die Bauchhöhle und wird nach der Gebührenordnung für Tierärzte (GOT) aus der Untersuchung, der Narkose und der Operation abgerechnet. Ob die Eierstöcke allein oder zusammen mit der Gebärmutter entfernt werden, entscheidet die Praxis; dafür gibt es zwei Positionen.',
    kostentreiber: [
      'Ovarektomie (Nr. 601) oder Ovariohysterektomie (Nr. 605)',
      'die Art der Narkose und eine Überwachung während des Eingriffs',
      'Arzneimittel, Nahtmaterial und ein Body oder Halskragen',
      'der Faktor, den die Praxis ansetzt',
    ],
    fragen: [FAKTOR, KOSTENVORANSCHLAG],
  },
  {
    slug: 'kastration-ruede',
    scenarioId: 'kastration-ruede',
    titel: 'Was kostet die Kastration eines Rüden?',
    metaTitel: 'Kastration Rüde Kosten: GOT-Positionen und Faktoren',
    beschreibung:
      'Die GOT-Positionen einer Rüdenkastration (Untersuchung, Narkose, Eingriff), ihre Beträge im einfachen bis dreifachen Satz und was zusätzlich anfällt.',
    einleitung:
      'Die Kastration eines Rüden wird nach der Gebührenordnung für Tierärzte (GOT) aus der Untersuchung, der Narkose und dem Eingriff abgerechnet. Setzt die Praxis eine Inhalationsnarkose mit Intubation und Überwachung ein, kommen dafür eigene Positionen dazu.',
    kostentreiber: [
      'die Art der Narkose und eine Überwachung während des Eingriffs',
      'Arzneimittel, Nahtmaterial und ein Body oder Halskragen',
      'eine Blutuntersuchung vor dem Eingriff, falls gewünscht',
      'der Faktor, den die Praxis ansetzt',
    ],
    fragen: [FAKTOR, KOSTENVORANSCHLAG],
  },
  {
    slug: 'kastration-huendin',
    scenarioId: 'kastration-huendin',
    titel: 'Was kostet die Kastration einer Hündin?',
    metaTitel: 'Kastration Hündin Kosten: GOT-Positionen und Faktoren',
    beschreibung:
      'Die GOT-Positionen einer Kastration bei der Hündin (Untersuchung, Narkose, Überwachung, Eingriff), ihre Beträge im einfachen bis dreifachen Satz und was zusätzlich anfällt.',
    einleitung:
      'Die Kastration einer Hündin ist ein Eingriff in die Bauchhöhle unter Vollnarkose. Nach der Gebührenordnung für Tierärzte (GOT) kommen Untersuchung, Narkose, Intubation, Überwachung und die Operation selbst zusammen. Ob die Eierstöcke allein oder zusammen mit der Gebärmutter entfernt werden, entscheidet die Praxis; dafür gibt es zwei Positionen.',
    kostentreiber: [
      'Ovarektomie (Nr. 600) oder Ovariohysterektomie (Nr. 604)',
      'Venenkatheter und Infusion während der Operation',
      'ein endoskopischer Eingriff (Zuschlag Nr. 607)',
      'Arzneimittel, Nahtmaterial, Body oder Halskragen und der Faktor',
    ],
    fragen: [FAKTOR, KOSTENVORANSCHLAG],
  },
  {
    slug: 'zahnsteinentfernung-hund',
    scenarioId: 'zahnsteinentfernung-hund',
    titel: 'Was kostet eine Zahnsteinentfernung beim Hund?',
    metaTitel: 'Zahnsteinentfernung Hund Kosten: GOT-Positionen',
    beschreibung:
      'Die GOT-Positionen einer Zahnsteinentfernung beim Hund (Untersuchung, Narkose, Scaling und Politur), ihre Beträge im einfachen bis dreifachen Satz und was zusätzlich anfällt.',
    einleitung:
      'Eine Zahnsteinentfernung mit Scaling und Politur wird beim Hund üblicherweise in Narkose gemacht. Nach der Gebührenordnung für Tierärzte (GOT) kommen Untersuchung, Narkose und die Zahnbehandlung zusammen. Müssen Zähne gezogen werden, steigt die Rechnung deutlich.',
    kostentreiber: [
      'gezogene Zähne (Nr. 951, kompliziert Nr. 955, je Zahn)',
      'Röntgenaufnahmen der Zähne',
      'eine aufwendigere Reinigung (Nr. 933)',
      'die Art der Narkose und der Faktor',
    ],
    fragen: [FAKTOR, KOSTENVORANSCHLAG],
  },
  {
    slug: 'blutbild-katze',
    scenarioId: 'blutbild-katze',
    titel: 'Was kostet ein Blutbild bei der Katze?',
    metaTitel: 'Blutbild Katze Kosten: GOT-Positionen und Faktoren',
    beschreibung:
      'Die GOT-Positionen eines großen Blutbilds bei der Katze (Untersuchung, Blutentnahme, Auswertung), ihre Beträge im einfachen bis dreifachen Satz und was zusätzlich anfällt.',
    einleitung:
      'Für ein großes Blutbild in der Praxis kommen nach der Gebührenordnung für Tierärzte (GOT) die Untersuchung, die Blutentnahme und die maschinelle Auswertung zusammen. Organwerte (Blutchemie) werden je Parameter zusätzlich berechnet oder an ein Fremdlabor gegeben.',
    kostentreiber: [
      'Organwerte, je Parameter berechnet (Nr. 610/611)',
      'ein Fremdlabor statt der Auswertung in der Praxis',
      'der Faktor, den die Praxis ansetzt',
    ],
    fragen: [FAKTOR, KOSTENVORANSCHLAG],
  },
];
