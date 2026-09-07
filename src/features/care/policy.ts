/**
 * M14-05 — Inhaltsregeln für Pflege- und Spielzeugtexte.
 *
 * Geprüft wird der **Wortlaut**, nicht die Absicht. Der Prüfer ist deshalb
 * streng und meldet auch gut gemeinte Formulierungen; ein Satz, der eine
 * verbotene Aussage ausdrücklich verneint, zählt nicht — sonst könnte die
 * Seite nicht einmal sagen, was sie nicht tut.
 *
 * Fünf Gruppen sind gesperrt:
 *
 * 1. **Heilversprechen** — eine Wirkung gegen Beschwerden ist eine
 *    Arzneimittelaussage, kein Produktmerkmal.
 * 2. **Dosierung und Anwendung** — gehört in die Praxis, nicht in einen
 *    Katalog.
 * 3. **Haltbarkeitsversprechen** — „unzerstörbar“ ist bei jedem Kauartikel
 *    falsch und bei manchem gefährlich.
 * 4. **Erfundene Bewertungen** — Sterne, Testsiege und Beliebtheitsränge, die
 *    niemand erhoben hat.
 * 5. **Automatische Zusatzempfehlung** — „dazu passt ein Supplement“ ist eine
 *    Empfehlung ohne Anlass.
 */
export interface PolicyRegel {
  readonly id: string;
  readonly muster: RegExp;
  readonly warum: string;
}

export const POLICY_REGELN: readonly PolicyRegel[] = [
  {
    id: 'heilversprechen',
    muster: /\bheilt\b|\blindert\b|\bwirkt gegen\b|hilft (bei|gegen)\b/i,
    warum: 'Heilversprechen',
  },
  {
    id: 'heilversprechen-indikation',
    muster:
      /(entzündungshemmend|schmerzlindernd|beruhigend bei|gegen (arthrose|allergie|juckreiz|würmer|zecken))/i,
    warum: 'Heilversprechen',
  },
  {
    id: 'praevention',
    muster: /\bbeugt\b[^.!?]{0,30}\bvor\b|\bverhindert\b[^.!?]{0,30}(krankheit|befall|entzündung)/i,
    warum: 'Vorbeugeversprechen',
  },
  {
    id: 'dosierung',
    muster:
      /\bdosierung\b|\b\d+\s?(mg|ml)\s?(pro|je|\/)\s?(kg|tag)|(einmal|zweimal|\d+\s?mal)\s+(täglich|am tag)/i,
    warum: 'Dosierungsangabe',
  },
  {
    id: 'anwendungsdauer',
    muster: /(über|für)\s+\d+\s+(tage|wochen)\s+(anwenden|geben|verabreichen)/i,
    warum: 'Anwendungsanweisung',
  },
  {
    id: 'haltbarkeit',
    muster: /unzerstörbar|unkaputtbar|hält (ewig|für immer)|lebenslange garantie|unverwüstlich/i,
    warum: 'Haltbarkeitsversprechen',
  },
  {
    id: 'bewertung',
    muster:
      /\b\d(?:[.,]\d)?\s*(von|\/)\s*5\s*sternen|\btestsieger\b|\bbestseller\b|\bbeliebtestes?\b|\bkundenliebling\b/i,
    warum: 'erfundene Bewertung',
  },
  {
    id: 'supplement',
    muster:
      /(dazu|passend)\s+(empfehlen wir|passt)\s+[^.!?]{0,40}(nahrungsergänzung|supplement|zusatzfutter)|supplement\s+empfohlen/i,
    warum: 'automatische Zusatzempfehlung',
  },
  {
    id: 'rasse-medizin',
    muster:
      /(bei|für)\s+(mops|bulldogge|dackel|schäferhund|perser)[^.!?]{0,40}(empfohlen|geeignet bei|hilft)/i,
    warum: 'Ableitung aus der Rasse',
  },
];

const VERNEINUNGEN =
  /\b(kein|keine|keinen|keiner|keines|keinerlei|keinesfalls|nicht|nie|niemals|niemand|nirgends|ohne|weder|statt)\b/i;

export interface PolicyFund {
  readonly regel: string;
  readonly warum: string;
  readonly stelle: string;
}

/**
 * Fundstellen verbotener Aussagen in einem Text.
 *
 * Ein Satz, der die Aussage ausdrücklich verneint, zählt nicht: „Kein Eintrag
 * behauptet Unzerstörbarkeit“ ist genau der Satz, den diese Seite braucht.
 */
export function pruefeText(text: string): readonly PolicyFund[] {
  const saetze = text.split(/(?<=[.!?:])\s+|\n+/);
  const funde: PolicyFund[] = [];
  for (const satz of saetze) {
    if (VERNEINUNGEN.test(satz)) continue;
    for (const regel of POLICY_REGELN) {
      if (regel.muster.test(satz)) {
        funde.push({ regel: regel.id, warum: regel.warum, stelle: satz.trim().slice(0, 140) });
      }
    }
  }
  return funde;
}

/** Attributnamen, die eine medizinische Eignung behaupten würden. */
export const GESPERRTE_ATTRIBUTE: readonly RegExp[] = [
  /health/i,
  /therap/i,
  /medic/i,
  /joint(support)?/i,
  /allerg/i,
  /dental(health|care)effect/i,
  /calming/i,
  /painrelief/i,
];

/** Darf dieser Attributname überhaupt geführt werden? */
export function attributnameErlaubt(name: string): boolean {
  return !GESPERRTE_ATTRIBUTE.some((muster) => muster.test(name));
}
