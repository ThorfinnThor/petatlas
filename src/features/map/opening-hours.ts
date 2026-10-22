/**
 * Auswertung der OpenStreetMap-Öffnungszeiten für die Stadtseiten:
 * Wer hat samstags, sonntags oder abends Sprechstunde?
 *
 * Bewusst nur die einfache, häufige Form (`Mo-Fr 09:00-12:00, 15:00-19:00;
 * Sa 10:00-12:00`). Alles, was darüber hinausgeht – Monatsangaben,
 * Wochennummern, Ausnahmen in Worten –, gilt als nicht auswertbar und wird
 * nicht geraten. Kommentare in Anführungszeichen („nach Vereinbarung“) werden
 * übergangen; steht nur ein Kommentar da, gibt es keine Zeiten.
 *
 * Eine erfasste Öffnungszeit ist eine Angabe aus OpenStreetMap, keine
 * Zusage der Praxis. Die Seite sagt das.
 */

export const TAGE = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const;
export type Tag = (typeof TAGE)[number];

/** Minuten seit Mitternacht, Ende exklusiv; 24:00 ist 1440. */
export type Intervall = readonly [number, number];
export type Wochenplan = Readonly<Record<Tag, readonly Intervall[]>>;

const TAG = '(?:Mo|Tu|We|Th|Fr|Sa|Su|PH)';
const TAGBEREICH = `${TAG}(?:\\s*-\\s*${TAG})?`;
const ZEIT = '\\d{1,2}:\\d{2}\\s*-\\s*\\d{1,2}:\\d{2}';
const GRUPPE = new RegExp(
  `(${TAGBEREICH}(?:\\s*,\\s*${TAGBEREICH})*)\\s*:?\\s+(off|closed|${ZEIT}(?:\\s*,\\s*${ZEIT})*)`,
  'g',
);

function minuten(text: string): number {
  const [h, m] = text.split(':').map(Number);
  return h! * 60 + m!;
}

/** `Mo-We,Fr` → [Mo, Tu, We, Fr]; Feiertage (`PH`) zählen nicht als Wochentag. */
function tageAus(auswahl: string): Tag[] {
  const tage: Tag[] = [];
  for (const teil of auswahl.split(',').map((t) => t.trim())) {
    const [von, bis] = teil.split('-').map((t) => t.trim()) as [string, string | undefined];
    if (von === 'PH') continue;
    const start = TAGE.indexOf(von as Tag);
    const ende = bis === undefined ? start : TAGE.indexOf(bis as Tag);
    if (start < 0 || ende < 0) continue;
    // Mo-Su ebenso wie Fr-Mo (über das Wochenende hinweg)
    for (let i = start; ; i = (i + 1) % 7) {
      tage.push(TAGE[i]!);
      if (i === ende) break;
    }
  }
  return tage;
}

function leererPlan(): Record<Tag, Intervall[]> {
  return { Mo: [], Tu: [], We: [], Th: [], Fr: [], Sa: [], Su: [] };
}

/** Wochenplan aus einer OSM-Angabe, oder `null`, wenn sie nicht sicher lesbar ist. */
export function wochenplan(angabe: string | null): Wochenplan | null {
  if (angabe === null) return null;
  const text = angabe.trim();
  if (text === '24/7') {
    const plan = leererPlan();
    for (const tag of TAGE) plan[tag] = [[0, 1440]];
    return plan;
  }
  const ohneKommentar = text.replace(/"[^"]*"/g, ' ').trim();
  if (ohneKommentar.replace(/[;,\s]/g, '') === '') return null;

  const plan = leererPlan();
  for (const regel of ohneKommentar.split(';')) {
    if (regel.trim() === '') continue;
    const gruppen = [...regel.matchAll(GRUPPE)];
    // Bleibt nach den erkannten Gruppen etwas übrig, ist die Regel komplexer
    // als diese Auswertung: dann lieber gar keine Aussage.
    if (regel.replace(GRUPPE, '').replace(/[,\s]/g, '') !== '') return null;
    if (gruppen.length === 0) return null;
    // Eine neue Regel ersetzt die Zeiten der Tage, die sie nennt (OSM-Semantik);
    // Gruppen innerhalb einer Regel ergänzen sich.
    const genannt = new Set<Tag>();
    for (const gruppe of gruppen) {
      const tage = tageAus(gruppe[1]!);
      const zeiten: Intervall[] = [];
      if (gruppe[2] !== 'off' && gruppe[2] !== 'closed') {
        for (const spanne of gruppe[2]!.split(',')) {
          const [von, bis] = spanne.split('-').map((t) => minuten(t.trim())) as [number, number];
          if (bis > von) zeiten.push([von, bis]);
          // 00:00 als Ende heißt Mitternacht; über Nacht (19:00-06:00) zählt bis 24 Uhr.
          else if (bis === 0 || (von >= 12 * 60 && bis <= 12 * 60)) zeiten.push([von, 1440]);
          // 14:00-13:00 ist ein Erfassungsfehler, kein Nachtdienst.
          else return null;
        }
      }
      for (const tag of tage) {
        if (!genannt.has(tag)) {
          plan[tag] = [];
          genannt.add(tag);
        }
        plan[tag].push(...zeiten);
      }
    }
  }
  return plan;
}

/** Abendsprechstunde: an einem Werktag (Mo–Fr) mindestens bis 19 Uhr. */
export const ABEND_AB = 19 * 60;

export interface Sprechzeiten {
  readonly samstag: boolean;
  readonly sonntag: boolean;
  readonly abends: boolean;
  readonly rundUmDieUhr: boolean;
}

export function sprechzeiten(plan: Wochenplan): Sprechzeiten {
  const werktage: Tag[] = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
  return {
    samstag: plan.Sa.length > 0,
    sonntag: plan.Su.length > 0,
    abends: werktage.some((tag) => plan[tag].some(([, bis]) => bis >= ABEND_AB)),
    rundUmDieUhr: TAGE.every((tag) => plan[tag].some(([von, bis]) => von === 0 && bis === 1440)),
  };
}

const ZEIT_LABEL = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** „Sa 10:00–12:00“; mehrere Spannen mit Komma. Leer, wenn der Tag geschlossen ist. */
export function zeitenAm(plan: Wochenplan, tag: Tag): string {
  return plan[tag].map(([von, bis]) => `${ZEIT_LABEL(von)}–${ZEIT_LABEL(bis)}`).join(', ');
}

/** Späteste Schließzeit an einem Werktag, für die Abendliste. */
export function spaetesteWerktagszeit(plan: Wochenplan): number {
  return Math.max(
    0,
    ...(['Mo', 'Tu', 'We', 'Th', 'Fr'] as const).flatMap((tag) => plan[tag].map(([, bis]) => bis)),
  );
}

const ANZEIGE_WOERTER: Readonly<Record<string, string>> = {
  Mo: 'Mo',
  Tu: 'Di',
  We: 'Mi',
  Th: 'Do',
  Fr: 'Fr',
  Sa: 'Sa',
  Su: 'So',
  PH: 'Feiertage',
  SH: 'Schulferien',
  off: 'geschlossen',
  closed: 'geschlossen',
  open: 'geöffnet',
  week: 'Woche',
  sunrise: 'Sonnenaufgang',
  sunset: 'Sonnenuntergang',
  easter: 'Ostern',
  days: 'Tage',
  Jan: 'Jan.',
  Feb: 'Feb.',
  Mar: 'März',
  Apr: 'Apr.',
  May: 'Mai',
  Jun: 'Juni',
  Jul: 'Juli',
  Aug: 'Aug.',
  Sep: 'Sept.',
  Oct: 'Okt.',
  Nov: 'Nov.',
  Dec: 'Dez.',
};

function anzeigeTeil(teil: string): string {
  return teil
    .replace(/24\/7/g, 'rund um die Uhr')
    .replace(/\b[A-Za-z]+\b/g, (wort) => ANZEIGE_WOERTER[wort] ?? wort)
    .replace(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g, '$1–$2')
    .replace(/\b(Mo|Di|Mi|Do|Fr|Sa|So)\s*-\s*(Mo|Di|Mi|Do|Fr|Sa|So)\b/g, '$1–$2')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*;\s*/g, ' · ')
    .replace(/\s{2,}/g, ' ');
}

/**
 * Eine OSM-Öffnungszeit lesbar auf Deutsch, ohne etwas wegzulassen oder zu
 * deuten: `Mo-Fr 09:00-18:00; Sa,PH off` → `Mo–Fr 09:00–18:00 · Sa, Feiertage
 * geschlossen`. Übersetzt werden nur Kürzel und Schlüsselwörter; Kommentare in
 * Anführungszeichen bleiben wörtlich stehen, nur ohne die Zeichen.
 */
export function oeffnungszeitenLesbar(angabe: string): string {
  return angabe
    .split(/("[^"]*")/)
    .map((teil) =>
      teil.startsWith('"') && teil.endsWith('"') ? teil.slice(1, -1) : anzeigeTeil(teil),
    )
    .join('')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+·\s*$/, '')
    .trim();
}
