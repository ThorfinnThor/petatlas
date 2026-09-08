/**
 * M16-04 — Abhaken der Packliste, je Gerät.
 *
 * Der Zustand gehört zu **einer Reise auf einem Gerät**. Es gibt keinen
 * Abgleich, keine Sicherung und keine Kennung, die sich anderswo wiederfindet:
 * gespeichert werden Zielland, Eintragskennung und ein Häkchen.
 *
 * Ohne JavaScript bleiben die Kästchen anklickbar — sie werden dann nur nicht
 * gespeichert. Das ist ein Unterschied, den die Seite auch sagt.
 */
import { z } from 'zod';

export const PACKING_STORAGE_KEY = 'petatlas.packing.v1';

/** Höchstzahl gespeicherter Ziele. Eine Packliste ist kein Reisetagebuch. */
export const MAX_ZIELE = 10;

export const PackStandSchema = z
  .object({
    version: z.literal(1),
    /** Je Ziel die Kennungen der abgehakten Einträge. */
    ziele: z.record(
      z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
      z.array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)).max(200),
    ),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();
export type PackStand = z.infer<typeof PackStandSchema>;

export function leererStand(jetzt: string): PackStand {
  return { version: 1, ziele: {}, updatedAt: jetzt };
}

/** Liest den Stand. Unbrauchbares wird verworfen, nicht geraten. */
export function lese(roh: string | null, jetzt: string): PackStand {
  if (roh === null) return leererStand(jetzt);
  try {
    const geprueft = PackStandSchema.safeParse(JSON.parse(roh));
    return geprueft.success ? geprueft.data : leererStand(jetzt);
  } catch {
    return leererStand(jetzt);
  }
}

export function schreibe(stand: PackStand): string {
  return JSON.stringify(stand);
}

export function abgehakt(stand: PackStand, ziel: string, eintrag: string): boolean {
  return (stand.ziele[ziel] ?? []).includes(eintrag);
}

/**
 * Setzt ein Häkchen oder nimmt es weg.
 *
 * Ein Ziel ohne Häkchen wird entfernt, statt als leere Liste stehen zu
 * bleiben: was niemand abgehakt hat, muss auch nicht gespeichert werden.
 */
export function setze(
  stand: PackStand,
  ziel: string,
  eintrag: string,
  wert: boolean,
  jetzt: string,
): PackStand {
  const vorhanden = stand.ziele[ziel] ?? [];
  const neu = wert
    ? [...new Set([...vorhanden, eintrag])].sort()
    : vorhanden.filter((vorhandener) => vorhandener !== eintrag);

  const ziele: Record<string, string[]> = { ...stand.ziele };
  if (neu.length === 0) delete ziele[ziel];
  else ziele[ziel] = neu;

  // Ältere Ziele fallen heraus, wenn es zu viele werden.
  const schluessel = Object.keys(ziele);
  if (schluessel.length > MAX_ZIELE) {
    for (const alt of schluessel.slice(0, schluessel.length - MAX_ZIELE)) delete ziele[alt];
  }

  const kandidat = { version: 1 as const, ziele, updatedAt: jetzt };
  const geprueft = PackStandSchema.safeParse(kandidat);
  return geprueft.success ? geprueft.data : stand;
}

/** Löscht den Stand eines Ziels. */
export function leere(stand: PackStand, ziel: string, jetzt: string): PackStand {
  const ziele = { ...stand.ziele };
  delete ziele[ziel];
  return { version: 1, ziele, updatedAt: jetzt };
}

export interface Fortschritt {
  readonly erledigt: number;
  readonly gesamt: number;
  readonly text: string;
}

export function fortschritt(stand: PackStand, ziel: string, gesamt: number): Fortschritt {
  const erledigt = (stand.ziele[ziel] ?? []).length;
  return {
    erledigt,
    gesamt,
    text:
      gesamt === 0
        ? 'Keine Einträge.'
        : `${erledigt} von ${gesamt} erledigt — gespeichert nur auf diesem Gerät.`,
  };
}
