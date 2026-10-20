/**
 * Inhaltsoffensive, Seitentyp Reisecheck (`docs/CONTENT_STANDARD.md`):
 * „Was brauche ich, bis wann?“ als Fristenplan je Zielland.
 *
 * Die rechtlichen Fristen stammen aus dem freigegebenen Regelsatz
 * (`content-data/travel/rules/eu-intra-2026.json`) und werden von dort
 * gelesen, nicht abgeschrieben: Ändert sich der Regelsatz, ändert sich der
 * Plan. Die länderspezifischen Schritte fassen nur zusammen, was in
 * `national.ts` mit amtlicher Quelle steht. Der Vorlauf von sechs Wochen ist
 * unsere Empfehlung für die Terminsuche, keine Rechtsfrist – die Seite sagt
 * das.
 */
import type { TravelRuleSet } from '../../domain/schemas/travel.ts';
import { NATIONAL } from './national.ts';

interface Bedingung {
  readonly op: string;
  readonly from?: string;
  readonly to?: string;
  readonly min?: number | null;
  readonly of?: readonly Bedingung[];
}

/** Sucht in der Bedingung einer Anforderung die Mindestspanne zwischen zwei Feldern. */
function mindestTage(satz: TravelRuleSet, from: string, to: string): number {
  const besuche = (b: Bedingung): number | null => {
    if (b.op === 'daysBetween' && b.from === from && b.to === to) return b.min ?? null;
    for (const kind of b.of ?? []) {
      const wert = besuche(kind);
      if (wert !== null) return wert;
    }
    return null;
  };
  for (const anforderung of satz.requirements) {
    const wert = besuche(anforderung.condition as Bedingung);
    if (wert !== null) return wert;
  }
  throw new Error(`Regelsatz ${satz.ruleSetId} nennt keine Frist ${from} → ${to}.`);
}

export interface Fristen {
  /** Wartezeit nach abgeschlossener Erstimpfung bis zur Einreise. */
  readonly wartezeitTage: number;
  /** Mindestalter beim ersten Impftermin. */
  readonly mindestalterTage: number;
  /** Unsere Empfehlung für den Vorlauf bis zum Tierarzttermin; keine Rechtsfrist. */
  readonly vorlaufTage: number;
}

export const VORLAUF_TAGE = 42;

export function fristenAus(satz: TravelRuleSet): Fristen {
  return {
    wartezeitTage: mindestTage(satz, 'rabiesVaccinationDate', 'travelDate'),
    mindestalterTage: mindestTage(satz, 'birthDate', 'vaccinationStartDate'),
    vorlaufTage: VORLAUF_TAGE,
  };
}

export interface Schritt {
  /** Wann, relativ zur Abreise; für den Datumsrechner. `null` = am Reisetag/unterwegs. */
  readonly tageVorAbreise: number | null;
  readonly wann: string;
  readonly titel: string;
  readonly text: string;
  /** Rechtsfrist aus dem Regelsatz oder unsere Empfehlung. */
  readonly art: 'recht' | 'empfehlung' | 'land';
  readonly quelle?: { readonly label: string; readonly url: string };
  /** Gilt nur für Hunde. */
  readonly nurHund?: boolean;
}

const LANDESSCHRITTE: Readonly<Record<string, readonly Omit<Schritt, 'art'>[]>> = {
  FR: [
    {
      tageVorAbreise: 42,
      wann: 'Vor der Buchung',
      titel: 'Hundekategorie klären',
      text: 'Hunde der französischen Kategorie 1 dürfen nicht nach Frankreich, auch nicht zur Durchreise. Für Kategorie 2 gelten zusätzliche Voraussetzungen. Die Einstufung hängt auch von Abstammungsnachweis und Körpermerkmalen ab; klär sie vor der Buchung, nicht an der Grenze.',
      quelle: {
        label: 'service-public.gouv.fr',
        url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1839',
      },
      nurHund: true,
    },
  ],
  IT: [
    {
      tageVorAbreise: 7,
      wann: 'Beim Packen',
      titel: 'Leine und passenden Maulkorb einpacken',
      text: 'Eine aktuelle landesweite Regel zur Leinenlänge ist für den Reisetag nicht belegt. Nimm Leine und Maulkorb mit und prüf die Regeln der Gemeinde und der örtlichen Gesundheitsbehörde (ASL).',
      quelle: { label: 'Gazzetta Ufficiale', url: NATIONAL.IT.url },
      nurHund: true,
    },
    {
      tageVorAbreise: 14,
      wann: 'Bei der Routenplanung',
      titel: 'Route durch die Schweiz gesondert prüfen',
      text: 'Die Schweiz gehört nicht zur EU. Führt die Route dort hindurch, gelten zusätzlich deren Regeln; dieser Plan deckt das nicht ab.',
    },
  ],
  AT: [
    {
      tageVorAbreise: 7,
      wann: 'Vor der Abfahrt',
      titel: 'Regeln des Bundeslandes und der Gemeinde prüfen',
      text: 'Leinen- und Maulkorbpflichten regeln in Österreich Bundesländer und Gemeinden unterschiedlich. Pack einen passenden Maulkorb ein und prüf die Regeln am Zielort und beim Beförderer.',
      quelle: { label: 'oesterreich.gv.at', url: NATIONAL.AT.url },
      nurHund: true,
    },
  ],
  NL: [
    {
      tageVorAbreise: 7,
      wann: 'Vor der Abfahrt',
      titel: 'Auslaufregeln am Zielort prüfen',
      text: 'Neben den Einreiseregeln gelten örtliche Regeln: Amsterdam etwa verlangt grundsätzlich eine Leine außerhalb ausgewiesener Freilaufflächen. Das gilt nicht automatisch im ganzen Land.',
      quelle: { label: 'NVWA', url: NATIONAL.NL.url },
      nurHund: true,
    },
  ],
};

/**
 * Der Plan für ein Zielland, in zeitlicher Reihenfolge: früheste Schritte
 * zuerst, Reisetag und Rückreise am Ende.
 */
export function fristenplan(satz: TravelRuleSet, land: string): readonly Schritt[] {
  const f = fristenAus(satz);
  const quelle = (requirementId: string) => {
    const a = satz.requirements.find((r) => r.requirementId === requirementId)!;
    return { label: a.citation, url: a.officialSourceUrl };
  };
  const allgemein: Schritt[] = [
    {
      tageVorAbreise: f.vorlaufTage,
      wann: `Etwa ${f.vorlaufTage / 7} Wochen vorher`,
      titel: 'Heimtierausweis prüfen und Tierarzttermin machen',
      text: `Prüf im Ausweis: Chipnummer eingetragen und gleich der im Tier, Tollwutimpfung eingetragen und gültig bis nach der Rückreise. Fehlt etwas oder läuft die Impfung vorher ab, jetzt einen Termin machen. Der Vorlauf ist unsere Empfehlung für die Terminsuche, keine gesetzliche Frist.`,
      art: 'empfehlung',
    },
    {
      tageVorAbreise: f.wartezeitTage,
      wann: `Spätestens ${f.wartezeitTage} Tage vor der Abreise`,
      titel: 'Erstimpfung gegen Tollwut abgeschlossen',
      text: `Wird das Tier erstmals oder nach abgelaufenem Impfschutz neu geimpft, darf es frühestens ${f.wartezeitTage} Tage nach Abschluss der Erstimpfung einreisen. Der Chip muss vor der Impfung gesetzt oder abgelesen sein, und das Tier muss beim ersten Impftermin mindestens ${f.mindestalterTage / 7} Wochen alt sein. Eine rechtzeitige Auffrischung innerhalb der Gültigkeit löst keine neue Wartezeit aus.`,
      art: 'recht',
      quelle: quelle('rabies-vaccination'),
    },
  ];
  const land_: Schritt[] = (LANDESSCHRITTE[land] ?? []).map((s) => ({ ...s, art: 'land' }));
  const reise: Schritt[] = [
    {
      tageVorAbreise: null,
      wann: 'Am Reisetag',
      titel: 'Heimtierausweis mitnehmen, Tier begleitet dich',
      text: 'Der Ausweis muss vollständig ausgefüllt und unterschrieben sein. Das Tier reist mit dir als Halterin oder Halter; höchstens fünf Hunde und Katzen zusammen im Auto.',
      art: 'recht',
      quelle: quelle('identification-document'),
    },
    {
      tageVorAbreise: null,
      wann: 'Bei der Rückreise',
      titel: 'Impfschutz muss noch gelten',
      text: 'Für die Rückkehr nach Deutschland gelten dieselben Anforderungen. Die im Ausweis eingetragene Gültigkeit der Tollwutimpfung muss auch am Tag der Rückreise noch laufen.',
      art: 'recht',
      quelle: quelle('rabies-vaccination'),
    },
  ];
  const vorher = [...allgemein, ...land_].sort(
    (a, b) => (b.tageVorAbreise ?? -1) - (a.tageVorAbreise ?? -1),
  );
  return [...vorher, ...reise];
}

/** Datum `tage` Tage vor `iso` (YYYY-MM-DD), ohne Zeitzonenverschiebung. */
export function tageVor(iso: string, tage: number): string {
  const zeit = Date.parse(`${iso}T00:00:00Z`) - tage * 86_400_000;
  return new Date(zeit).toISOString().slice(0, 10);
}
