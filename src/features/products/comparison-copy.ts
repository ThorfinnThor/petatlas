/**
 * Redaktionelle Rahmen der neun Produktvergleiche: Kriterien mit Gewicht,
 * Empfehlung je Einsatz, Tabellenspalten, Hinweise und Fragen. Die Zahlen
 * stehen in `content-data/products/comparison-2026-10.json`.
 */
import {
  deutsch,
  euro,
  ja,
  preisKriterium,
  skala,
  text,
  zahl,
  type Bewertung,
  type Kriterium,
  type Produkt,
} from './comparison.ts';
import type { ProduktVergleichsSeite } from './comparison-pages.ts';

const note = (b: Bewertung) => `${b.gesamt} von 100 Punkten`;
const preis = (p: Produkt) => (p.price ? euro(p.price.priceEur) : 'ohne belegten Preis');
const nachPreis = (a: Bewertung, b: Bewertung) =>
  (a.produkt.price?.priceEur ?? 1e9) - (b.produkt.price?.priceEur ?? 1e9) || b.gesamt - a.gesamt;

/** Ja/Nein-Merkmal: nur eine ausdrückliche Herstellerangabe zählt. */
function merkmalPunkte(
  produkt: Produkt,
  teile: readonly { key: string; anteil: number; ja: string; fehlt: string }[],
): { anteil: number; begruendung: string } {
  let anteil = 0;
  const gruende: string[] = [];
  for (const teil of teile) {
    if (ja(produkt, teil.key) === true) {
      anteil += teil.anteil;
      gruende.push(teil.ja);
    } else gruende.push(teil.fehlt);
  }
  return { anteil, begruendung: gruende.join('; ') };
}

// ---------------------------------------------------------------------------
// Katzentrinkbrunnen

/** Ersatzfilter im Jahr; nur mit Packungspreis, Stückzahl und Wechselintervall. */
export function filterkostenProJahr(p: Produkt): number | null {
  const packung = zahl(p, 'filterPack');
  const stueck = zahl(p, 'filterPackCount');
  const wochen = zahl(p, 'filterChangeWeeks');
  if (packung === null || stueck === null || wochen === null || stueck <= 0 || wochen <= 0) {
    return null;
  }
  return Math.round((packung / stueck) * (52 / wochen) * 100) / 100;
}

const MATERIAL_ANTEIL: Record<string, number> = {
  Edelstahl: 1,
  Keramik: 1,
  'Edelstahl/Kunststoff': 0.6,
  Kunststoff: 0.2,
};

const trinkbrunnenKriterien: readonly Kriterium[] = [
  {
    name: 'Material und Reinigung',
    gewicht: 25,
    regel:
      'Trinkfläche aus Edelstahl oder Keramik 18 Punkte, Edelstahl mit Kunststoffteilen 11, nur Kunststoff 4; spülmaschinenfeste Teile laut Hersteller 7.',
    bewerte: (p) => {
      const material = text(p, 'bowlMaterial');
      const spuel = text(p, 'dishwasherSafe');
      const anteilMaterial = material ? (MATERIAL_ANTEIL[material] ?? 0) : 0;
      return {
        anteil: (anteilMaterial * 18 + (spuel ? 7 : 0)) / 25,
        begruendung: `${material ?? 'Material nicht angegeben'}; ${spuel ? `spülmaschinenfest: ${spuel}` : 'keine Angabe zur Spülmaschine'}`,
      };
    },
  },
  {
    name: 'Betriebssicherheit',
    gewicht: 25,
    regel:
      'Pumpe ohne Kabel im Wasser 10, Abschaltung bei Wassermangel 8, sichtbarer Wasserstand oder Anzeige 7 – jeweils nur bei ausdrücklicher Angabe.',
    bewerte: (p) => {
      const r = merkmalPunkte(p, [
        {
          key: 'cordlessPump',
          anteil: 0.4,
          ja: 'kein Kabel im Wasser',
          fehlt: 'Pumpe mit Kabel oder keine Angabe',
        },
        {
          key: 'dryRunProtection',
          anteil: 0.32,
          ja: 'Trockenlaufschutz',
          fehlt: 'kein Trockenlaufschutz angegeben',
        },
        {
          key: 'waterLevelVisible',
          anteil: 0.28,
          ja: 'Wasserstand sichtbar',
          fehlt: 'keine Wasserstandsanzeige angegeben',
        },
      ]);
      return r;
    },
  },
  {
    name: 'Fassungsvermögen',
    gewicht: 15,
    regel:
      'Linear von 1,5 Litern (0 Punkte) bis 4 Litern (15 Punkte). Mehr Volumen heißt seltener nachfüllen, vor allem bei mehreren Katzen.',
    bewerte: (p) => {
      const l = zahl(p, 'capacityL');
      return l === null
        ? { anteil: 0, begruendung: 'kein Volumen angegeben' }
        : { anteil: skala(l, 1.5, 4), begruendung: `${deutsch(l)} Liter` };
    },
  },
  {
    name: 'Filterkosten im Jahr',
    gewicht: 10,
    regel:
      'Preis eines Ersatzfilters (Packungspreis ÷ Stückzahl) × Wechsel pro Jahr laut Hersteller; linear von 80 € (0) bis 20 € (10 Punkte).',
    bewerte: (p) => {
      const kosten = filterkostenProJahr(p);
      return kosten === null
        ? { anteil: 0, begruendung: 'Filterpreis oder Wechselintervall nicht angegeben' }
        : {
            anteil: skala(kosten, 80, 20),
            begruendung: `rund ${euro(kosten)} im Jahr (Wechsel alle ${deutsch(zahl(p, 'filterChangeWeeks') ?? 0)} Wochen)`,
          };
    },
  },
  preisKriterium(25),
];

const trinkbrunnen: ProduktVergleichsSeite = {
  slug: 'katzentrinkbrunnen-vergleich',
  kategorie: 'katzentrinkbrunnen',
  tier: 'cat',
  eyebrow: 'Produktvergleich · Katze',
  titel: 'Katzentrinkbrunnen im Vergleich: welcher passt zu deiner Katze?',
  metaTitel: 'Katzentrinkbrunnen Vergleich 2026: 8 Modelle mit Empfehlung',
  beschreibung:
    'Acht Katzentrinkbrunnen von Catit, PETKIT, PetSafe, PETLIBRO, TRIXIE und Cat Mate nach Material, Pumpe, Volumen, Filter und Preis bewertet – mit Empfehlung je Einsatz.',
  frage: 'Welcher Trinkbrunnen passt zu deiner Katze?',
  einleitung: [
    'Entscheidend sind drei Dinge: eine Trinkfläche, die sich leicht sauber halten lässt, eine Pumpe ohne Kabel im Wasser und ein Volumen, das zur Zahl deiner Katzen passt. Wir haben acht Brunnen nach diesen Punkten und nach Preis bewertet.',
  ],
  kriterien: trinkbrunnenKriterien,
  einsaetze: [
    {
      titel: 'Für eine Wohnungskatze',
      warum: (b) => `Höchste Gesamtnote (${note(b)}) bei ${preis(b.produkt)}.`,
    },
    {
      titel: 'Für mehrere Katzen',
      passt: (p) => (zahl(p, 'capacityL') ?? 0) >= 3,
      warum: (b) =>
        `Beste Note unter den Brunnen ab 3 Litern: ${deutsch(zahl(b.produkt, 'capacityL') ?? 0)} Liter.`,
    },
    {
      titel: 'Beim kleinen Budget',
      passt: (p) => (p.price?.priceEur ?? Infinity) <= 40,
      warum: (b) => `Beste Note bis 40 € (${preis(b.produkt)}, ${note(b)}).`,
    },
    {
      titel: 'Ohne Steckdose in der Nähe',
      passt: (p) => text(p, 'power') === 'Akku',
      warum: (b) => `Läuft mit Akku; beste Note unter den akkubetriebenen Brunnen (${note(b)}).`,
    },
  ],
  merkmale: [
    { key: 'capacityL', label: 'Volumen', einheit: 'l' },
    { key: 'bowlMaterial', label: 'Material' },
    { key: 'power', label: 'Strom' },
    { key: 'cordlessPump', label: 'Pumpe ohne Kabel im Wasser' },
    { key: 'dryRunProtection', label: 'Trockenlaufschutz' },
    { key: 'waterLevelVisible', label: 'Wasserstand sichtbar' },
    { key: 'filterChangeWeeks', label: 'Filterwechsel alle', einheit: 'Wochen' },
    {
      key: 'filterPack',
      label: 'Filterkosten im Jahr',
      zeige: (p) => {
        const kosten = filterkostenProJahr(p);
        return kosten === null ? null : `rund ${euro(kosten)}`;
      },
    },
    { key: 'dishwasherSafe', label: 'Spülmaschinenfest' },
    { key: 'app', label: 'App' },
    { key: 'dimensionsCm', label: 'Maße' },
  ],
  tabelle: ['capacityL', 'bowlMaterial', 'power', 'cordlessPump', 'filterPack'],
  hinweise: [
    '„keine Angabe“ heißt: Hersteller und Händler nennen das Merkmal nicht. Es kann trotzdem vorhanden sein, bekommt bei uns aber keine Punkte.',
    'Wo der Hersteller eine Spanne nennt (etwa „alle 2 bis 4 Wochen“), rechnen wir mit dem kürzeren Intervall.',
    'Ein Brunnen ersetzt nicht den Blick auf die Trinkmenge. Trinkt deine Katze auffällig wenig oder viel, gehört das in die Tierarztpraxis.',
  ],
  fragen: [
    {
      frage: 'Edelstahl, Keramik oder Kunststoff – was ist besser?',
      antwort:
        'Edelstahl und Keramik lassen sich gründlicher reinigen und verkratzen weniger als Kunststoff, in dessen Kratzern sich Beläge halten können. Deshalb geben wir dafür die meisten Materialpunkte.',
    },
    {
      frage: 'Was bringt eine Pumpe ohne Kabel im Wasser?',
      antwort:
        'Bei kabellosen Pumpen wird der Strom durch die Wand übertragen; im Wasser liegt kein Kabel, an dem eine Katze knabbern oder das beim Reinigen stört.',
    },
    {
      frage: 'Wie groß sollte ein Trinkbrunnen sein?',
      antwort:
        'Für eine Katze reichen 1,5 bis 2 Liter, wenn du alle paar Tage nachfüllst. Bei mehreren Katzen sind 3 Liter und mehr praktischer.',
    },
    {
      frage: 'Wie oft muss ich den Brunnen reinigen?',
      antwort:
        'Die Hersteller empfehlen, Wasser regelmäßig zu wechseln, den Brunnen mindestens wöchentlich zu reinigen und den Filter nach dem angegebenen Intervall zu tauschen.',
    },
  ],
  verwandt: [
    { href: '/de-de/ratgeber/katzen-beschaeftigen/', label: 'Wohnungskatzen beschäftigen' },
  ],
};

// ---------------------------------------------------------------------------
// Katzentoiletten

const flaeche = (p: Produkt) => {
  const l = zahl(p, 'lengthCm');
  const b = zahl(p, 'widthCm');
  return l === null || b === null ? null : l * b;
};

const masse = (p: Produkt) => {
  const l = zahl(p, 'lengthCm');
  const b = zahl(p, 'widthCm');
  const h = zahl(p, 'heightCm');
  return l === null || b === null || h === null
    ? null
    : `${deutsch(l)} × ${deutsch(b)} × ${deutsch(h)} cm`;
};

const EINSTIEG: Record<string, string> = {
  offen: 'offene Schale',
  'Haube vorne': 'Haube, Einstieg vorne',
  oben: 'Einstieg von oben',
};

const katzentoilette: ProduktVergleichsSeite = {
  slug: 'katzentoilette-vergleich',
  kategorie: 'katzentoilette',
  tier: 'cat',
  eyebrow: 'Produktvergleich · Katze',
  titel: 'Katzentoiletten im Vergleich: offen, mit Haube oder Einstieg von oben?',
  metaTitel: 'Katzentoilette Vergleich 2026: 10 Modelle mit Empfehlung',
  beschreibung:
    'Zehn Katzentoiletten von Catit, TRIXIE, Savic und Rotho nach Größe, Streuschutz, Geruchsfilter, Reinigung und Preis bewertet – mit Empfehlung für große Katzen und kleines Budget.',
  frage: 'Welche Katzentoilette passt zu deiner Katze?',
  einleitung: [
    'Das wichtigste Maß ist die Fläche: Eine Katze muss sich darin drehen und scharren können. Danach zählen, wie gut die Streu in der Toilette bleibt, ob die Reinigung einfach ist und der Preis. Zehn Modelle, bewertet nach genau diesen Punkten.',
  ],
  kriterien: [
    {
      name: 'Platz für die Katze',
      gewicht: 35,
      regel:
        'Grundfläche (Länge × Breite außen) linear von 1.800 cm² (0 Punkte) bis 3.200 cm² (35 Punkte).',
      bewerte: (p) => {
        const f = flaeche(p);
        return f === null
          ? { anteil: 0, begruendung: 'keine Maße angegeben' }
          : {
              anteil: skala(f, 1800, 3200),
              begruendung: `${deutsch(f, 0)} cm² Grundfläche (${masse(p)})`,
            };
      },
    },
    {
      name: 'Sauberkeit im Raum',
      gewicht: 20,
      regel:
        'Streuschutz durch Haube, hohen Rand oder Einstieg von oben 10 Punkte; Geruchsfilter laut Hersteller 10 Punkte.',
      bewerte: (p) => {
        const schutz =
          ja(p, 'hood') === true ||
          ja(p, 'rimOrLitterGuard') === true ||
          text(p, 'entry') === 'oben';
        const filter = ja(p, 'filter') === true;
        return {
          anteil: ((schutz ? 10 : 0) + (filter ? 10 : 0)) / 20,
          begruendung: `${schutz ? 'Streuschutz' : 'kein Streuschutz angegeben'}; ${filter ? 'mit Geruchsfilter' : 'kein Filter angegeben'}`,
        };
      },
    },
    {
      name: 'Reinigung',
      gewicht: 15,
      regel: 'Eingebautes Siebsystem 10 Punkte, Tragegriff 5 Punkte – jeweils laut Hersteller.',
      bewerte: (p) =>
        merkmalPunkte(p, [
          {
            key: 'sievingSystem',
            anteil: 10 / 15,
            ja: 'Siebsystem',
            fehlt: 'kein Siebsystem',
          },
          { key: 'handle', anteil: 5 / 15, ja: 'Tragegriff', fehlt: 'kein Griff angegeben' },
        ]),
    },
    preisKriterium(30),
  ],
  einsaetze: [
    {
      titel: 'Für die meisten Katzen, auch große',
      warum: (b) => `Höchste Gesamtnote (${note(b)}): ${masse(b.produkt)} für ${preis(b.produkt)}.`,
    },
    {
      titel: 'Mit Haube',
      passt: (p) => ja(p, 'hood') === true && text(p, 'entry') === 'Haube vorne',
      warum: (b) =>
        `Beste Haubentoilette (${note(b)}): ${masse(b.produkt)}${ja(b.produkt, 'filter') ? ', mit Geruchsfilter' : ''}.`,
    },
    {
      titel: 'Wenn Streu herausfliegt',
      passt: (p) => text(p, 'entry') === 'oben',
      warum: (b) =>
        `Einstieg von oben: Streu fällt beim Aussteigen auf den Deckel statt auf den Boden (${note(b)}).`,
    },
    {
      titel: 'Beim kleinen Budget',
      passt: (p) => (p.price?.priceEur ?? Infinity) <= 20,
      warum: (b) => `Beste Note bis 20 € (${preis(b.produkt)}).`,
    },
  ],
  merkmale: [
    { key: 'entry', label: 'Bauform', zeige: (p) => EINSTIEG[text(p, 'entry') ?? ''] ?? null },
    { key: 'lengthCm', label: 'Außenmaß (L × B × H)', zeige: masse },
    { key: 'innerCm', label: 'Innenmaß' },
    { key: 'openingCm', label: 'Einstieg' },
    { key: 'flap', label: 'Schwingtür' },
    { key: 'filter', label: 'Geruchsfilter' },
    { key: 'rimOrLitterGuard', label: 'Hoher Rand / Streuschutz' },
    { key: 'sievingSystem', label: 'Siebsystem' },
    { key: 'handle', label: 'Tragegriff' },
    { key: 'weightKg', label: 'Gewicht', einheit: 'kg' },
  ],
  tabelle: ['entry', 'lengthCm', 'filter', 'sievingSystem'],
  hinweise: [
    'Als Faustregel gilt: Die Toilette sollte etwa anderthalbmal so lang sein wie die Katze ohne Schwanz. Viele Katzen nehmen offene Schalen besser an als Hauben; bei einem Wechsel lohnt es sich, die alte Toilette ein paar Tage stehen zu lassen.',
    'Bei Maßen ohne eindeutige Reihenfolge haben wir die längste Seite als Länge genommen. „keine Angabe“ heißt: Hersteller und Händler nennen das Merkmal nicht; dafür gibt es keine Punkte.',
    'Selbstreinigende Toiletten sind nicht Teil dieses Vergleichs: Sie kosten ein Vielfaches und haben eigene Mindestgewichte für die Katze.',
  ],
  fragen: [
    {
      frage: 'Wie groß muss eine Katzentoilette sein?',
      antwort:
        'Mindestens anderthalbmal so lang wie die Katze ohne Schwanz. Für eine durchschnittliche Hauskatze bedeutet das etwa 50 bis 60 cm, für große Rassen 65 cm und mehr.',
    },
    {
      frage: 'Ist eine Toilette mit Haube besser als eine offene?',
      antwort:
        'Für den Raum ja: Eine Haube hält Streu und Geruch besser zurück. Manche Katzen meiden Hauben aber, weil sich Geruch darin sammelt. Wir bewerten deshalb Streuschutz, nicht die Haube an sich.',
    },
    {
      frage: 'Für wen eignet sich ein Einstieg von oben?',
      antwort:
        'Für gesunde, bewegliche Katzen, die viel Streu verteilen. Für Kitten, ältere Katzen oder Katzen mit Gelenkproblemen ist der Sprung nach oben ungeeignet.',
    },
    {
      frage: 'Wie viele Toiletten brauche ich?',
      antwort:
        'Üblich ist die Regel: eine Toilette pro Katze plus eine weitere, an verschiedenen ruhigen Orten.',
    },
  ],
  verwandt: [],
};

// ---------------------------------------------------------------------------
// Katzentransportboxen

const transportbox: ProduktVergleichsSeite = {
  slug: 'katzentransportboxen-vergleich',
  kategorie: 'katzentransportbox',
  tier: 'cat',
  eyebrow: 'Produktvergleich · Katze',
  titel: 'Katzentransportboxen im Vergleich: welche Box für Tierarzt, Auto und Reise?',
  metaTitel: 'Katzentransportbox Vergleich 2026: 8 Modelle mit Empfehlung',
  beschreibung:
    'Acht Transportboxen und Taschen von TRIXIE, Catit, Savic, Kerbl und Sherpa nach Zugang, Sicherung im Auto, Belastbarkeit, Gewicht und Preis bewertet – mit Empfehlung je Einsatz.',
  frage: 'Welche Transportbox passt zu deiner Katze?',
  einleitung: [
    'Am meisten Ärger erspart eine Box, die sich von oben öffnen oder in zwei Hälften teilen lässt: Dann muss niemand die Katze beim Tierarzt herausziehen. Danach zählen Sicherung im Auto, Belastbarkeit, Eigengewicht und Preis.',
  ],
  kriterien: [
    {
      name: 'Zugang',
      gewicht: 30,
      regel:
        'Öffnung von oben 15 Punkte; Oberteil abnehmbar, sodass die Katze in der unteren Hälfte bleiben kann, 15 Punkte.',
      bewerte: (p) =>
        merkmalPunkte(p, [
          { key: 'topOpening', anteil: 0.5, ja: 'von oben zu öffnen', fehlt: 'nur Fronttür' },
          {
            key: 'splitsInHalves',
            anteil: 0.5,
            ja: 'Oberteil abnehmbar',
            fehlt: 'nicht teilbar oder keine Angabe',
          },
        ]),
    },
    {
      name: 'Belastbarkeit',
      gewicht: 20,
      regel: 'Höchstgewicht der Katze laut Hersteller linear von 5 kg (0) bis 10 kg (20 Punkte).',
      bewerte: (p) => {
        const kg = zahl(p, 'maxPetKg');
        return kg === null
          ? { anteil: 0, begruendung: 'kein Höchstgewicht angegeben' }
          : { anteil: skala(kg, 5, 10), begruendung: `für Katzen bis ${deutsch(kg)} kg` };
      },
    },
    {
      name: 'Sicherung im Auto',
      gewicht: 15,
      regel: 'Befestigung mit dem Sicherheitsgurt vom Hersteller beschrieben: 15 Punkte.',
      bewerte: (p) =>
        merkmalPunkte(p, [
          {
            key: 'carSeatbelt',
            anteil: 1,
            ja: 'mit dem Autogurt zu sichern',
            fehlt: 'keine Gurtsicherung beschrieben',
          },
        ]),
    },
    {
      name: 'Eigengewicht',
      gewicht: 10,
      regel: 'Leergewicht linear von 4,5 kg (0) bis 1,2 kg (10 Punkte); ohne Angabe 0.',
      bewerte: (p) => {
        const kg = zahl(p, 'emptyWeightKg');
        return kg === null
          ? { anteil: 0, begruendung: 'kein Leergewicht angegeben' }
          : { anteil: skala(kg, 4.5, 1.2), begruendung: `${deutsch(kg)} kg leer` };
      },
    },
    preisKriterium(25),
  ],
  einsaetze: [
    {
      titel: 'Für den Tierarztbesuch',
      warum: (b) =>
        `Höchste Gesamtnote (${note(b)}); ${ja(b.produkt, 'topOpening') ? 'von oben zu öffnen' : 'Fronttür'} für ${preis(b.produkt)}.`,
    },
    {
      titel: 'Für große Katzen',
      passt: (p) => (zahl(p, 'maxPetKg') ?? 0) >= 10,
      warum: (b) =>
        `Für Katzen bis ${deutsch(zahl(b.produkt, 'maxPetKg') ?? 0)} kg; beste Note in dieser Klasse (${note(b)}).`,
    },
    {
      titel: 'Beim kleinen Budget',
      passt: (p) => (p.price?.priceEur ?? Infinity) <= 20,
      warum: (b) => `Beste Note bis 20 € (${preis(b.produkt)}).`,
    },
    {
      titel: 'Für Bahn und Flug',
      passt: (p) => text(p, 'type') === 'Tasche',
      warum: (b) =>
        `Weiche Tragetasche, leichter zu tragen und unter einem Sitz zu verstauen; beste Note unter den Taschen (${note(b)}).`,
    },
  ],
  merkmale: [
    { key: 'type', label: 'Bauart' },
    { key: 'lengthCm', label: 'Außenmaß (L × B × H)', zeige: masse },
    { key: 'maxPetKg', label: 'Katze bis', einheit: 'kg' },
    { key: 'emptyWeightKg', label: 'Leergewicht', einheit: 'kg' },
    { key: 'topOpening', label: 'Öffnung oben' },
    { key: 'splitsInHalves', label: 'Oberteil abnehmbar' },
    { key: 'frontDoorMaterial', label: 'Tür' },
    { key: 'carSeatbelt', label: 'Autogurt-Sicherung' },
  ],
  tabelle: ['type', 'maxPetKg', 'topOpening', 'splitsInHalves', 'carSeatbelt'],
  hinweise: [
    'Die Kilogrammangabe ist eine Obergrenze. Die Katze muss zusätzlich aufrecht stehen und sich drehen können.',
    'Fluggesellschaften haben eigene Maße und Regeln für die Kabine; prüfe sie vor der Buchung. Kein Hersteller in diesem Vergleich sichert eine bestimmte Airline-Norm zu.',
    '„keine Angabe“ heißt: Hersteller und Händler nennen das Merkmal nicht; dafür gibt es keine Punkte.',
  ],
  fragen: [
    {
      frage: 'Warum ist eine Öffnung von oben so wichtig?',
      antwort:
        'Viele Katzen wollen beim Tierarzt nicht aus der Box. Von oben lässt sich die Katze ruhig herausheben; bei einer teilbaren Box kann sie sogar in der unteren Hälfte bleiben, während sie untersucht wird.',
    },
    {
      frage: 'Box oder Tasche?',
      antwort:
        'Eine Hartschalenbox schützt besser und lässt sich leichter reinigen. Eine Tasche ist leichter und passt eher unter einen Sitz, gibt der Katze aber weniger Schutz.',
    },
    {
      frage: 'Wie sichere ich die Box im Auto?',
      antwort:
        'Am sichersten im Fußraum hinter dem Vordersitz oder quer auf dem Rücksitz mit dem Gurt, wenn der Hersteller das vorsieht. Lose auf dem Sitz kann sie beim Bremsen herumfliegen.',
    },
  ],
  verwandt: [
    {
      href: '/de-de/ratgeber/katze-transportbox/',
      label: 'Transportbox trainieren – Schritt für Schritt',
    },
  ],
};

// ---------------------------------------------------------------------------
// Katzen-Futterautomaten

const futterautomat: ProduktVergleichsSeite = {
  slug: 'katzen-futterautomat-vergleich',
  kategorie: 'katzen-futterautomat',
  tier: 'cat',
  eyebrow: 'Produktvergleich · Katze',
  titel: 'Futterautomaten für Katzen im Vergleich: für Trocken- oder Nassfutter?',
  metaTitel: 'Futterautomat Katze Vergleich 2026: 7 Modelle mit Empfehlung',
  beschreibung:
    'Sieben Futterautomaten von Catit, PETLIBRO, PETKIT, TRIXIE und Cat Mate nach Futterart, Mahlzeiten, Stromausfall, Hygiene und Preis bewertet – mit Empfehlung für Nassfutter und kleines Budget.',
  frage: 'Welcher Futterautomat passt zu deiner Katze?',
  einleitung: [
    'Die erste Frage ist die Futterart: Vorratsautomaten geben nur Trockenfutter aus, Automaten mit Fächern und Kühlakku auch Nassfutter. Danach zählen, wie viele Mahlzeiten sich planen lassen, was bei Stromausfall passiert, wie hygienisch der Napf ist und der Preis.',
  ],
  kriterien: [
    {
      name: 'Futterart',
      gewicht: 20,
      regel: 'Trocken- und Nassfutter 20 Punkte, nur Trockenfutter 10 Punkte.',
      bewerte: (p) => {
        const art = text(p, 'foodType');
        return art === null
          ? { anteil: 0, begruendung: 'Futterart nicht angegeben' }
          : {
              anteil: art === 'Trocken und Nass' ? 1 : 0.5,
              begruendung:
                art === 'Trocken und Nass' ? 'Trocken- und Nassfutter' : 'nur Trockenfutter',
            };
      },
    },
    {
      name: 'Mahlzeiten pro Tag',
      gewicht: 15,
      regel: 'Höchstzahl planbarer Mahlzeiten linear von 2 (0 Punkte) bis 10 (15 Punkte).',
      bewerte: (p) => {
        const n = zahl(p, 'mealsPerDay');
        return n === null
          ? { anteil: 0, begruendung: 'keine Angabe' }
          : { anteil: skala(n, 2, 10), begruendung: `bis zu ${n} Mahlzeiten` };
      },
    },
    {
      name: 'Bei Stromausfall',
      gewicht: 15,
      regel:
        'Läuft mit Batterien oder hat eine Notstrom-Batterie laut Hersteller: 15 Punkte. Sonst bleibt der Napf bei Stromausfall leer.',
      bewerte: (p) => {
        const sicher = ja(p, 'batteryBackup') === true || ja(p, 'batteryOnly') === true;
        return {
          anteil: sicher ? 1 : 0,
          begruendung:
            ja(p, 'batteryOnly') === true
              ? 'läuft komplett mit Batterien'
              : sicher
                ? 'Notstrom über Batterien'
                : 'keine Notstromversorgung angegeben',
        };
      },
    },
    {
      name: 'Hygiene',
      gewicht: 15,
      regel: 'Napf aus Edelstahl 10 Punkte; spülmaschinenfeste Teile laut Hersteller 5 Punkte.',
      bewerte: (p) => {
        const edelstahl = text(p, 'bowlMaterial') === 'Edelstahl';
        const spuel = text(p, 'dishwasherSafe');
        return {
          anteil: ((edelstahl ? 10 : 0) + (spuel ? 5 : 0)) / 15,
          begruendung: `${edelstahl ? 'Edelstahlnapf' : 'kein Edelstahlnapf angegeben'}; ${spuel ? `spülmaschinenfest: ${spuel}` : 'keine Angabe zur Spülmaschine'}`,
        };
      },
    },
    preisKriterium(35),
  ],
  einsaetze: [
    {
      titel: 'Für Trockenfutter',
      passt: (p) => text(p, 'foodType') === 'Trocken',
      warum: (b) =>
        `Beste Note unter den Vorratsautomaten (${note(b)}): ${zahl(b.produkt, 'mealsPerDay') ?? '–'} Mahlzeiten am Tag, ${preis(b.produkt)}.`,
    },
    {
      titel: 'Für Nassfutter',
      passt: (p) => text(p, 'foodType') === 'Trocken und Nass',
      warum: (b) => `Fächer mit Kühlung für Nassfutter; beste Note dieser Bauart (${note(b)}).`,
    },
    {
      titel: 'Beim kleinen Budget',
      passt: (p) => (p.price?.priceEur ?? Infinity) <= 50,
      warum: (b) => `Beste Note bis 50 € (${preis(b.produkt)}), ohne App und WLAN.`,
    },
    {
      titel: 'Mit Kamera',
      passt: (p) => ja(p, 'camera') === true,
      warum: (b) => `Zeigt per App, ob die Katze gefressen hat; ${preis(b.produkt)}.`,
    },
  ],
  merkmale: [
    { key: 'foodType', label: 'Futter' },
    { key: 'capacity', label: 'Fassungsvermögen' },
    { key: 'mealsPerDay', label: 'Mahlzeiten pro Tag (max.)' },
    { key: 'control', label: 'Bedienung' },
    { key: 'wifi', label: 'WLAN' },
    { key: 'batteryBackup', label: 'Notstrom-Batterie' },
    { key: 'cooling', label: 'Kühlakku' },
    { key: 'bowlMaterial', label: 'Napf' },
    { key: 'dishwasherSafe', label: 'Spülmaschinenfest' },
    { key: 'camera', label: 'Kamera' },
    { key: 'maxKibbleMm', label: 'Kroketten bis', einheit: 'mm' },
  ],
  tabelle: ['foodType', 'capacity', 'mealsPerDay', 'control'],
  hinweise: [
    'Ein Automat ersetzt keine Betreuung: Wasser, Toilette und ein Blick auf die Katze braucht es spätestens nach einem Tag.',
    'Nassfutter verdirbt bei Zimmertemperatur schnell. Auch mit Kühlakku sollte es nur wenige Stunden im Automaten liegen.',
    '„keine Angabe“ heißt: Hersteller und Händler nennen das Merkmal nicht; dafür gibt es keine Punkte.',
  ],
  fragen: [
    {
      frage: 'Kann ich meine Katze mit einem Futterautomaten übers Wochenende allein lassen?',
      antwort:
        'Für einen Tag mit Trockenfutter ja, wenn Wasser und Toilette reichen. Länger sollte jemand nach der Katze sehen; ein Automat merkt nicht, wenn sie krank ist oder er klemmt.',
    },
    {
      frage: 'Brauche ich WLAN und App?',
      antwort:
        'Nein. Mit App siehst du, ob gefüttert wurde, und kannst Zeiten unterwegs ändern. Einfache Automaten mit Timer reichen für feste Zeiten.',
    },
    {
      frage: 'Hilft ein Futterautomat beim Abnehmen?',
      antwort:
        'Er hilft, die Tagesmenge auf mehrere kleine Portionen zu verteilen. Wie viel deine Katze fressen soll, besprichst du bei Übergewicht mit der Tierarztpraxis.',
    },
  ],
  verwandt: [{ href: '/de-de/futter/', label: 'Katzenfutter vergleichen' }],
};

// ---------------------------------------------------------------------------
// Katzenspielzeug: Kugelbahnen und Spieltürme

const kugelbahn: ProduktVergleichsSeite = {
  slug: 'katzenspielzeug-kugelbahn-vergleich',
  kategorie: 'katzenspielzeug-kugelbahn',
  tier: 'cat',
  eyebrow: 'Produktvergleich · Katzenspielzeug',
  titel: 'Kugelbahnen für Katzen im Vergleich: Spielschiene oder Spielturm?',
  metaTitel: 'Kugelbahn Katze Vergleich 2026: 8 Modelle mit Empfehlung',
  beschreibung:
    'Acht Kugelbahnen und Spieltürme für Katzen von Catit, TRIXIE, Ferplast, TIAKI und Designed by Lotte nach Umfang, Ausbaubarkeit, Reiz und Preis bewertet – mit Empfehlung je Einsatz.',
  frage: 'Welche Kugelbahn beschäftigt deine Katze am längsten?',
  einleitung: [
    'Kugelbahnen sind Spielzeug, mit dem sich eine Wohnungskatze auch allein beschäftigt. Spielschienen lassen sich zu langen Strecken erweitern, Spieltürme stapeln mehrere Ebenen übereinander. Wir haben acht Modelle nach Umfang, Ausbaubarkeit, Reiz und Preis bewertet.',
  ],
  kriterien: [
    {
      name: 'Umfang',
      gewicht: 30,
      regel:
        'Streckenteile linear von 4 (0) bis 12 (30 Punkte); ein Turm mit drei und mehr Ebenen zählt wie 8 Teile.',
      bewerte: (p) => {
        const teile = zahl(p, 'trackPieces');
        const ebenen = zahl(p, 'levels');
        if (teile !== null) {
          return { anteil: skala(teile, 4, 12), begruendung: `${teile} Streckenteile` };
        }
        if (ebenen !== null && ebenen >= 3) {
          return { anteil: skala(8, 4, 12), begruendung: `${ebenen} Ebenen` };
        }
        return { anteil: 0, begruendung: 'Umfang nicht angegeben' };
      },
    },
    {
      name: 'Ausbaubar',
      gewicht: 20,
      regel: 'Laut Hersteller mit weiteren Teilen erweiterbar: 20 Punkte.',
      bewerte: (p) =>
        merkmalPunkte(p, [
          {
            key: 'expandable',
            anteil: 1,
            ja: 'erweiterbar',
            fehlt: 'nicht erweiterbar oder keine Angabe',
          },
        ]),
    },
    {
      name: 'Reiz für die Katze',
      gewicht: 20,
      regel:
        'Ball mit Glöckchen, Licht oder hörbarem Klappern 12 Punkte; mehr als ein Ball oder mehrere Ebenen 8 Punkte.',
      bewerte: (p) => {
        const reiz = ja(p, 'lightOrSoundBall') === true;
        const mehr = (zahl(p, 'balls') ?? 0) >= 2 || (zahl(p, 'levels') ?? 0) >= 2;
        return {
          anteil: ((reiz ? 12 : 0) + (mehr ? 8 : 0)) / 20,
          begruendung: `${reiz ? 'Ball mit Licht oder Geräusch' : 'kein Licht/Geräusch angegeben'}; ${mehr ? 'mehrere Bälle oder Ebenen' : 'ein Ball, eine Ebene'}`,
        };
      },
    },
    preisKriterium(30),
  ],
  einsaetze: [
    {
      titel: 'Für Wohnungskatzen',
      warum: (b) => `Höchste Gesamtnote (${note(b)}) für ${preis(b.produkt)}.`,
    },
    {
      titel: 'Für mehrere Katzen',
      passt: (p) => (zahl(p, 'levels') ?? 0) >= 3,
      warum: (b) =>
        `${zahl(b.produkt, 'levels')} Ebenen übereinander: Mehrere Katzen können gleichzeitig angeln (${note(b)}).`,
    },
    {
      titel: 'Zum Ausprobieren',
      passt: (p) => (p.price?.priceEur ?? Infinity) <= 10,
      warum: (b) => `Unter 10 € (${preis(b.produkt)}) – gut, um zu sehen, ob deine Katze anbeißt.`,
    },
  ],
  merkmale: [
    { key: 'trackPieces', label: 'Streckenteile' },
    { key: 'levels', label: 'Ebenen' },
    { key: 'balls', label: 'Bälle' },
    { key: 'expandable', label: 'Erweiterbar' },
    { key: 'lightOrSoundBall', label: 'Licht oder Geräusch' },
    { key: 'dimensionsCm', label: 'Maße' },
    { key: 'material', label: 'Material' },
    { key: 'extras', label: 'Extras' },
  ],
  tabelle: ['trackPieces', 'levels', 'expandable', 'lightOrSoundBall'],
  hinweise: [
    'Kugelbahnen ersetzen nicht das gemeinsame Spiel mit Angel oder Ball; sie füllen die Zeit dazwischen.',
    'Kleine Bälle und Batterieknöpfe gehören nicht zwischen die Zähne: Kontrolliere Spielzeug regelmäßig und entferne beschädigte Teile.',
    '„keine Angabe“ heißt: Hersteller und Händler nennen das Merkmal nicht; dafür gibt es keine Punkte.',
  ],
  fragen: [
    {
      frage: 'Spielschiene oder Spielturm?',
      antwort:
        'Eine Spielschiene liegt flach und lässt sich zu langen Strecken erweitern; sie braucht mehr Bodenfläche. Ein Turm ist kompakt, hat mehrere Ebenen und lässt mehrere Katzen gleichzeitig spielen.',
    },
    {
      frage: 'Passen Teile verschiedener Hersteller zusammen?',
      antwort:
        'In der Regel nicht. Erweitern lässt sich nur innerhalb einer Serie, etwa Catit Senses 2.0 untereinander.',
    },
    {
      frage: 'Meine Katze ignoriert die Kugelbahn. Was tun?',
      antwort:
        'Den Ball selbst anstoßen, ein Leckerli in die Bahn legen oder sie an einen Ort stellen, an dem die Katze ohnehin gern ist. Manche Katzen brauchen ein paar Tage.',
    },
  ],
  verwandt: [
    { href: '/de-de/ratgeber/katzen-beschaeftigen/', label: 'Wohnungskatzen beschäftigen' },
    { href: '/de-de/spielzeug/', label: 'Spielzeug nach Eigenschaften finden' },
  ],
};

// ---------------------------------------------------------------------------
// Hunderampen fürs Auto

const KONSTRUKTION: Record<string, string> = {
  fest: 'feste Länge',
  teleskop: 'Teleskop',
  klappbar: 'klappbar',
};

const hunderampe: ProduktVergleichsSeite = {
  slug: 'hunderampe-auto-vergleich',
  kategorie: 'hunderampe-auto',
  tier: 'dog',
  eyebrow: 'Produktvergleich · Hund',
  titel: 'Hunderampen fürs Auto im Vergleich: welche Rampe für deinen Hund?',
  metaTitel: 'Hunderampe Auto Vergleich 2026: 7 Modelle mit Empfehlung',
  beschreibung:
    'Sieben Hunderampen fürs Auto von TRIXIE, PetSafe und Kerbl nach Länge, Traglast, Breite, Gewicht und Preis bewertet – mit Empfehlung für große Hunde, hohe Ladekanten und kleines Budget.',
  frage: 'Welche Rampe passt zu deinem Hund und deinem Auto?',
  einleitung: [
    'Je höher die Ladekante, desto länger muss die Rampe sein, damit sie nicht zu steil wird. Dazu muss sie das Gewicht deines Hundes tragen, breit genug für sichere Schritte sein und sich von dir noch heben lassen. Sieben Rampen, bewertet nach genau diesen Punkten.',
  ],
  kriterien: [
    {
      name: 'Länge',
      gewicht: 25,
      regel:
        'Ausgezogene Länge linear von 100 cm (0) bis 180 cm (25 Punkte). Längere Rampen sind bei gleicher Ladekante flacher.',
      bewerte: (p) => {
        const l = zahl(p, 'lengthCm');
        return l === null
          ? { anteil: 0, begruendung: 'keine Länge angegeben' }
          : { anteil: skala(l, 100, 180), begruendung: `${l} cm lang` };
      },
    },
    {
      name: 'Traglast',
      gewicht: 20,
      regel: 'Maximale Belastung laut Hersteller linear von 40 kg (0) bis 120 kg (20 Punkte).',
      bewerte: (p) => {
        const kg = zahl(p, 'maxLoadKg');
        return kg === null
          ? { anteil: 0, begruendung: 'keine Traglast angegeben' }
          : { anteil: skala(kg, 40, 120), begruendung: `bis ${kg} kg` };
      },
    },
    {
      name: 'Breite und Führung',
      gewicht: 15,
      regel:
        'Breite linear von 36 cm (0) bis 44 cm (10 Punkte); seitliche Führung laut Hersteller 5 Punkte.',
      bewerte: (p) => {
        const b = zahl(p, 'widthCm');
        const fuehrung = ja(p, 'sideRails') === true;
        return {
          anteil: ((b === null ? 0 : skala(b, 36, 44) * 10) + (fuehrung ? 5 : 0)) / 15,
          begruendung: `${b === null ? 'Breite nicht angegeben' : `${deutsch(b)} cm breit`}; ${fuehrung ? 'seitliche Führung' : 'keine seitliche Führung angegeben'}`,
        };
      },
    },
    {
      name: 'Handhabung',
      gewicht: 15,
      regel: 'Eigengewicht linear von 7 kg (0) bis 2,5 kg (15 Punkte); ohne Angabe 0.',
      bewerte: (p) => {
        const kg = zahl(p, 'weightKg');
        return kg === null
          ? { anteil: 0, begruendung: 'Gewicht nicht angegeben' }
          : { anteil: skala(kg, 7, 2.5), begruendung: `${deutsch(kg)} kg schwer` };
      },
    },
    preisKriterium(25),
  ],
  einsaetze: [
    {
      titel: 'Für Kombi und SUV',
      passt: (p) => (zahl(p, 'lengthCm') ?? 0) >= 170,
      warum: (b) =>
        `${zahl(b.produkt, 'lengthCm')} cm lang und damit flach genug für hohe Ladekanten; beste Note dieser Länge (${note(b)}).`,
    },
    {
      titel: 'Für große Hunde',
      passt: (p) => (zahl(p, 'maxLoadKg') ?? 0) >= 100 && (zahl(p, 'widthCm') ?? 0) >= 43,
      warum: (b) =>
        `Trägt bis ${zahl(b.produkt, 'maxLoadKg')} kg bei ${deutsch(zahl(b.produkt, 'widthCm') ?? 0)} cm Breite (${note(b)}).`,
    },
    {
      titel: 'Für wenig Stauraum',
      passt: (p) => (zahl(p, 'lengthMinCm') ?? Infinity) <= 80,
      vergleiche: (a, b) =>
        (zahl(a.produkt, 'lengthMinCm') ?? 1e9) - (zahl(b.produkt, 'lengthMinCm') ?? 1e9) ||
        b.gesamt - a.gesamt,
      warum: (b) =>
        `Zusammengeschoben nur ${zahl(b.produkt, 'lengthMinCm')} cm lang, passt auch in kleinere Kofferräume.`,
    },
    {
      titel: 'Beim kleinen Budget',
      passt: (p) => (p.price?.priceEur ?? Infinity) <= 60,
      warum: (b) => `Beste Note bis 60 € (${preis(b.produkt)}).`,
    },
  ],
  merkmale: [
    {
      key: 'construction',
      label: 'Bauart',
      zeige: (p) => KONSTRUKTION[text(p, 'construction') ?? ''] ?? null,
    },
    {
      key: 'lengthCm',
      label: 'Länge',
      zeige: (p) => {
        const l = zahl(p, 'lengthCm');
        const min = zahl(p, 'lengthMinCm');
        if (l === null) return null;
        return min === null ? `${l} cm` : `${min}–${l} cm`;
      },
    },
    { key: 'widthCm', label: 'Breite', einheit: 'cm' },
    { key: 'maxLoadKg', label: 'Traglast', einheit: 'kg' },
    { key: 'weightKg', label: 'Eigengewicht', einheit: 'kg' },
    { key: 'sideRails', label: 'Seitliche Führung' },
    { key: 'surface', label: 'Lauffläche' },
    { key: 'material', label: 'Material' },
  ],
  tabelle: ['construction', 'lengthCm', 'maxLoadKg', 'weightKg'],
  hinweise: [
    'Miss vor dem Kauf die Höhe deiner Ladekante und den Platz hinter dem Auto: Je höher die Kante, desto länger sollte die Rampe sein, damit sie flach genug bleibt.',
    'Bei Längenspannen (Teleskop) steht die längste Einstellung in der Bewertung, die kürzeste in der Tabelle. „keine Angabe“ heißt: Der Hersteller nennt den Wert nicht; dafür gibt es keine Punkte.',
    'Ob eine Rampe medizinisch nötig ist, etwa bei Arthrose oder nach einer Operation, klärst du mit der Tierarztpraxis. Übe die Rampe zuerst am Boden.',
  ],
  fragen: [
    {
      frage: 'Wie lang muss eine Hunderampe sein?',
      antwort:
        'Das hängt von der Ladekante ab. Bei einem Kombi mit etwa 70 cm sind 180 cm und mehr angenehm; eine kurze Rampe wird dort so steil, dass viele Hunde sie meiden.',
    },
    {
      frage: 'Teleskop oder klappbar?',
      antwort:
        'Eine Teleskoprampe lässt sich auf die passende Länge ausziehen und ist zusammengeschoben kurz. Eine Klapprampe ist oft günstiger, aber zusammengeklappt dicker.',
    },
    {
      frage: 'Wie gewöhne ich meinen Hund an die Rampe?',
      antwort:
        'Zuerst flach auf dem Boden, mit Leckerli Schritt für Schritt darüber führen, dann leicht erhöht, erst danach ans Auto. Die Rampe muss fest aufliegen und darf nicht wackeln.',
    },
  ],
  verwandt: [
    {
      href: '/de-de/produkte/hundetransportbox-auto-vergleich/',
      label: 'Hundetransportboxen fürs Auto',
    },
  ],
};

// ---------------------------------------------------------------------------
// Hundetransportboxen fürs Auto

const MATERIAL_BOX = (material: string | null): { anteil: number; text: string } => {
  if (material === null) return { anteil: 0, text: 'Material nicht angegeben' };
  if (/polyester|\bstoff/i.test(material)) return { anteil: 0.2, text: material };
  if (/alu|metall|stahl/i.test(material)) return { anteil: 1, text: material };
  return { anteil: 0.5, text: material };
};

const hundebox: ProduktVergleichsSeite = {
  slug: 'hundetransportbox-auto-vergleich',
  kategorie: 'hundetransportbox-auto',
  tier: 'dog',
  eyebrow: 'Produktvergleich · Hund',
  titel: 'Hundeboxen fürs Auto im Vergleich: crashgetestet, Alu oder Kunststoff?',
  metaTitel: 'Hundebox Auto Vergleich 2026: 7 Modelle mit Empfehlung',
  beschreibung:
    'Sieben Hundeboxen fürs Auto von TRIXIE, Kleinmetall, 4pets, Ferplast und Kerbl nach Crashtest, Material, Notausstieg, Größenauswahl und Preis bewertet – mit Empfehlung je Einsatz.',
  frage: 'Welche Hundebox schützt deinen Hund im Auto?',
  einleitung: [
    'Bei einem Unfall zählt vor allem eines: ob die Box dafür gebaut und geprüft ist. Nur zwei Hersteller in diesem Vergleich nennen einen Crashtest. Danach folgen Material, Notausstieg, die Auswahl passender Größen und der Preis.',
  ],
  kriterien: [
    {
      name: 'Crashtest',
      gewicht: 35,
      regel: 'Der Hersteller gibt ausdrücklich einen bestandenen Crashtest an: 35 Punkte.',
      bewerte: (p) =>
        ja(p, 'crashTested') === true
          ? { anteil: 1, begruendung: text(p, 'crashTestDetail') ?? 'Crashtest angegeben' }
          : { anteil: 0, begruendung: 'kein Crashtest angegeben' },
    },
    {
      name: 'Material',
      gewicht: 20,
      regel: 'Aluminium oder Metall 20 Punkte, Kunststoff 10, Stoff 4.',
      bewerte: (p) => {
        const m = MATERIAL_BOX(text(p, 'material'));
        return { anteil: m.anteil, begruendung: m.text };
      },
    },
    {
      name: 'Notausstieg',
      gewicht: 10,
      regel: 'Zweiter Ausgang, falls die Tür nach einem Unfall klemmt, laut Hersteller: 10 Punkte.',
      bewerte: (p) =>
        merkmalPunkte(p, [
          {
            key: 'emergencyExit',
            anteil: 1,
            ja: 'Notausstieg',
            fehlt: 'kein Notausstieg angegeben',
          },
        ]),
    },
    {
      name: 'Größenauswahl',
      gewicht: 10,
      regel:
        'Angebotene Größen linear von 1 (0) bis 4 (10 Punkte), damit die Box zu Hund und Auto passt.',
      bewerte: (p) => {
        const n = zahl(p, 'sizesAvailable');
        return n === null
          ? { anteil: 0, begruendung: 'Größen nicht angegeben' }
          : { anteil: skala(n, 1, 4), begruendung: `${n} Größen` };
      },
    },
    preisKriterium(25),
  ],
  einsaetze: [
    {
      titel: 'Für große Hunde im Kofferraum',
      passt: (p) => ja(p, 'crashTested') === true && (zahl(p, 'maxDogKg') ?? Infinity) > 15,
      warum: (b) =>
        `Einzige crashgetestete Box für große Hunde (${text(b.produkt, 'crashTestDetail') ?? 'Crashtest'}${ja(b.produkt, 'emergencyExit') ? ', mit Notausstieg' : ''}); teuer, aber nach unseren Kriterien die sicherste Wahl (${preis(b.produkt)}).`,
    },
    {
      titel: 'Für kleine Hunde auf dem Rücksitz',
      passt: (p) => ja(p, 'crashTested') === true && (zahl(p, 'maxDogKg') ?? Infinity) <= 15,
      warum: (b) =>
        `Laut Hersteller crashgetestet für Hunde bis ${zahl(b.produkt, 'maxDogKg')} kg (${preis(b.produkt)}).`,
    },
    {
      titel: 'Beim kleinen Budget',
      passt: (p) => (p.price?.priceEur ?? Infinity) <= 100,
      warum: (b) =>
        `Beste Note bis 100 € (${preis(b.produkt)}); ohne Crashtest, also gut gegen Verrutschen sichern.`,
    },
    {
      titel: 'Für Urlaub und Ferienwohnung',
      passt: (p) => /polyester|\bstoff/i.test(text(p, 'material') ?? ''),
      warum: (b) =>
        `Faltbar und leicht (${deutsch(zahl(b.produkt, 'weightKg') ?? 0)} kg) – als Rückzugsort am Ziel, nicht als Unfallschutz.`,
    },
  ],
  merkmale: [
    {
      key: 'lengthCm',
      label: 'Maße laut Hersteller',
      zeige: (p) => p.specs['lengthCm']?.verbatim ?? null,
    },
    { key: 'material', label: 'Material' },
    { key: 'weightKg', label: 'Gewicht', einheit: 'kg' },
    { key: 'crashTested', label: 'Crashtest angegeben' },
    { key: 'emergencyExit', label: 'Notausstieg' },
    { key: 'maxDogKg', label: 'Hund bis', einheit: 'kg' },
    { key: 'sizesAvailable', label: 'Größen' },
    { key: 'doors', label: 'Tür' },
  ],
  tabelle: ['material', 'crashTested', 'emergencyExit', 'sizesAvailable'],
  hinweise: [
    'Ohne Crashtest heißt nicht unsicher im Alltag, aber niemand hat gezeigt, wie die Box einen Aufprall übersteht. Sichere jede Box so, dass sie nicht verrutschen kann – am besten quer hinter der Rückbank.',
    'Maße geben die Hersteller in unterschiedlicher Reihenfolge an; wir zeigen sie wörtlich. Miss Kofferraumöffnung, Höhe und Schräge der Heckklappe vorher aus.',
    'Der Hund sollte in der Box aufrecht stehen, sich drehen und ausgestreckt liegen können. „keine Angabe“ heißt: Der Hersteller nennt den Wert nicht; dafür gibt es keine Punkte.',
  ],
  fragen: [
    {
      frage: 'Muss eine Hundebox im Auto crashgetestet sein?',
      antwort:
        'Gesetzlich nicht; die Straßenverkehrsordnung verlangt nur, dass Ladung – und damit auch der Hund – gesichert ist. Eine crashgetestete Box schützt bei einem Unfall aber Hund und Insassen deutlich besser.',
    },
    {
      frage: 'Wo steht die Box am sichersten?',
      antwort:
        'Im Kofferraum direkt an der Rückbank, möglichst quer zur Fahrtrichtung, oder kleine Boxen im Fußraum hinter dem Vordersitz. Lose Boxen können bei einer Vollbremsung nach vorne geschleudert werden.',
    },
    {
      frage: 'Wie groß muss die Hundebox sein?',
      antwort:
        'Der Hund misst man stehend vom Boden bis zum Scheitel und von der Nase bis zum Schwanzansatz. Die Box sollte in Höhe und Länge jeweils etwa 10 cm mehr bieten.',
    },
  ],
  verwandt: [
    { href: '/de-de/produkte/hunderampe-auto-vergleich/', label: 'Hunderampen fürs Auto' },
    { href: '/de-de/reisecheck/', label: 'Reisecheck für Hund und Katze' },
  ],
};

// ---------------------------------------------------------------------------
// Rollleinen

const rollleine: ProduktVergleichsSeite = {
  slug: 'rollleine-vergleich',
  kategorie: 'rollleine',
  tier: 'dog',
  eyebrow: 'Produktvergleich · Hund',
  titel: 'Rollleinen im Vergleich: welche Flexileine passt zu deinem Hund?',
  metaTitel: 'Rollleine Vergleich 2026: 7 Gurtleinen mit Empfehlung',
  beschreibung:
    'Sieben Roll- und Flexileinen von flexi, KONG und Nomad Tales nach Belastbarkeit, Feststellfunktion, Sichtbarkeit, Gewicht und Preis bewertet – mit Empfehlung für große Hunde und Spaziergänge im Dunkeln.',
  frage: 'Welche Rollleine passt zu deinem Hund?',
  einleitung: [
    'Eine Rollleine muss zum Gewicht deines Hundes passen, sich zuverlässig feststellen lassen und auch nach einer Stunde noch angenehm in der Hand liegen. Wir haben sieben Gurtleinen nach diesen Punkten, nach Sichtbarkeit im Dunkeln und nach Preis bewertet.',
  ],
  kriterien: [
    {
      name: 'Belastbarkeit',
      gewicht: 25,
      regel: 'Höchstgewicht des Hundes laut Hersteller linear von 20 kg (0) bis 60 kg (25 Punkte).',
      bewerte: (p) => {
        const kg = zahl(p, 'maxDogKg');
        return kg === null
          ? { anteil: 0, begruendung: 'kein Höchstgewicht angegeben' }
          : { anteil: skala(kg, 20, 60), begruendung: `für Hunde bis ${kg} kg` };
      },
    },
    {
      name: 'Feststellen',
      gewicht: 20,
      regel: 'Der Hersteller beschreibt eine Feststell- oder Dauerstoppfunktion: 20 Punkte.',
      bewerte: (p) => {
        const f = text(p, 'lockFunction');
        return f === null
          ? { anteil: 0, begruendung: 'keine Feststellfunktion beschrieben' }
          : { anteil: 1, begruendung: f };
      },
    },
    {
      name: 'Gewicht in der Hand',
      gewicht: 15,
      regel: 'Eigengewicht linear von 650 g (0) bis 330 g (15 Punkte).',
      bewerte: (p) => {
        const g = zahl(p, 'weightG');
        return g === null
          ? { anteil: 0, begruendung: 'Gewicht nicht angegeben' }
          : { anteil: skala(g, 650, 330), begruendung: `${g} g` };
      },
    },
    {
      name: 'Sichtbarkeit',
      gewicht: 10,
      regel: 'Reflektierender Gurt oder reflektierende Elemente laut Hersteller: 10 Punkte.',
      bewerte: (p) =>
        merkmalPunkte(p, [
          {
            key: 'reflective',
            anteil: 1,
            ja: 'reflektierend',
            fehlt: 'keine Reflektoren angegeben',
          },
        ]),
    },
    preisKriterium(30),
  ],
  einsaetze: [
    {
      titel: 'Für kleine und mittelgroße Hunde',
      warum: (b) =>
        `Höchste Gesamtnote (${note(b)}): bis ${zahl(b.produkt, 'maxDogKg')} kg, ${zahl(b.produkt, 'weightG')} g, ${preis(b.produkt)}.`,
    },
    {
      titel: 'Für große Hunde',
      passt: (p) => (zahl(p, 'maxDogKg') ?? 0) >= 50,
      warum: (b) =>
        `Für Hunde bis ${zahl(b.produkt, 'maxDogKg')} kg; beste Note in dieser Klasse (${note(b)}).`,
    },
    {
      titel: 'Für Spaziergänge im Dunkeln',
      passt: (p) => ja(p, 'reflective') === true,
      warum: (b) =>
        `Reflektierender Gurt; beste Note unter den reflektierenden Leinen (${note(b)}).`,
    },
    {
      titel: 'Für mehr Freiraum',
      passt: (p) => (zahl(p, 'lengthM') ?? 0) >= 8,
      warum: (b) =>
        `${zahl(b.produkt, 'lengthM')} m Gurt statt 5 m – nur dort, wo dein Hund sicher abrufbar ist.`,
    },
  ],
  merkmale: [
    { key: 'lengthM', label: 'Länge', einheit: 'm' },
    { key: 'maxDogKg', label: 'Hund bis', einheit: 'kg' },
    { key: 'lineType', label: 'Leine' },
    { key: 'weightG', label: 'Gewicht', einheit: 'g' },
    { key: 'lockFunction', label: 'Stopp und Feststellen' },
    { key: 'reflective', label: 'Reflektierend' },
    { key: 'ergonomicGrip', label: 'Griff' },
    { key: 'warrantyYears', label: 'Garantie', einheit: 'Jahre' },
  ],
  tabelle: ['lengthM', 'maxDogKg', 'weightG', 'reflective'],
  hinweise: [
    'Eine Rollleine ist nichts für Straßen mit Verkehr und nicht für Hunde, die plötzlich losstürmen: Der Ruck am Ende des Gurts ist kräftig, und ein dünner Gurt kann Verletzungen verursachen, wenn er sich um Beine oder Finger wickelt.',
    'Wir vergleichen bei jeder Marke die Variante, die zooplus oder der Hersteller mit Preis zeigt; bei KONG ist das Größe M (bis 30 kg). Die Größe L gibt es dort auch.',
    '„keine Angabe“ heißt: Hersteller und Händler nennen das Merkmal nicht; dafür gibt es keine Punkte.',
  ],
  fragen: [
    {
      frage: 'Gurt oder Seil?',
      antwort:
        'Ein Gurt ist breiter, besser zu sehen und schneidet weniger ein, wenn er sich irgendwo verfängt. Alle Leinen in diesem Vergleich haben einen Gurt.',
    },
    {
      frage: 'Welche Größe brauche ich?',
      antwort:
        'Die Größe richtet sich nach dem Höchstgewicht des Hundes, das auf jeder Leine steht. Liegt dein Hund knapp darunter, nimm die nächste Größe.',
    },
    {
      frage: 'Ist eine Rollleine schlecht für die Leinenführigkeit?',
      antwort:
        'Sie belohnt Ziehen, weil der Hund mit leichtem Zug mehr Leine bekommt. Für das Training ist eine feste Leine besser; die Rollleine eignet sich für Freilauf-Ersatz in ruhiger Umgebung.',
    },
  ],
  verwandt: [{ href: '/de-de/tierarzt-karte/', label: 'Hunde-Orte auf der Karte finden' }],
};

export const SEITEN: readonly ProduktVergleichsSeite[] = [
  trinkbrunnen,
  futterautomat,
  katzentoilette,
  kugelbahn,
  transportbox,
  hunderampe,
  rollleine,
  hundebox,
];

/** Frühere Slugs; die Weiterleitungen stehen in `public/_redirects`. */
export const ALTE_SLUGS: Readonly<Record<string, string>> = {
  'catit-senses-2-vergleich': 'katzenspielzeug-kugelbahn-vergleich',
  'kong-hundespielzeug-vergleich': 'kauspielzeug-hund-vergleich',
  'flexi-rollleine-vergleich': 'rollleine-vergleich',
};
