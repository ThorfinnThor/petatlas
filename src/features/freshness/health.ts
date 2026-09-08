/**
 * M17-04 — Der öffentliche Gesundheitsstand.
 *
 * Eine kleine JSON-Datei unter einer festen Adresse, die sagt, wie alt die
 * ausgelieferten Daten sind. Sie enthält ausschließlich Angaben, die ohnehin
 * öffentlich sind: Datensatz, Quelle, Lizenz, Stand, Alter, Bewertung.
 * **Keine** Abrufadressen, keine Secretnamen, keine Laufprotokolle.
 *
 * Der Zeitpunkt des Builds steht darin, weil ein statisches Deployment
 * stehen bleiben kann: wer die Datei ansieht, soll sehen, wann sie entstand,
 * und nicht raten müssen.
 */
import { bewerteDatensaetze, datensaetze, gesamtstand, type Datensatz } from './datasets.ts';
import type { Frische } from './policy.ts';

export const HEALTH_PFAD = '/data/v1/health.json';
export const HEALTH_VERSION = 1;

export interface HealthEintrag {
  readonly id: string;
  readonly titel: string;
  readonly quelle: string;
  readonly lizenz: string | null;
  readonly stand: string | null;
  readonly alterTage: number | null;
  readonly frische: Frische;
  readonly wirkung: 'warnt' | 'sperrt';
  readonly sperrt: boolean;
  readonly ausgeliefert: boolean;
  readonly umfang: string;
  readonly politik: { readonly warnAbTagen: number; readonly sperreAbTagen: number };
  readonly begruendung: string;
  readonly hinweis: string | null;
}

export interface HealthBericht {
  readonly healthVersion: number;
  readonly builtAt: string;
  readonly stichtag: string;
  readonly gesamt: {
    readonly frische: Frische;
    readonly gesperrt: readonly string[];
    readonly begruendung: string;
  };
  readonly datensaetze: readonly HealthEintrag[];
}

export function baueHealthBericht(
  stichtag: string,
  builtAt: string,
  eintraege: readonly Datensatz[] = datensaetze(),
): HealthBericht {
  const bewertet = bewerteDatensaetze(stichtag, eintraege);
  return {
    healthVersion: HEALTH_VERSION,
    builtAt,
    stichtag,
    gesamt: gesamtstand(bewertet),
    datensaetze: bewertet.map((eintrag) => ({
      id: eintrag.id,
      titel: eintrag.titel,
      quelle: eintrag.quelle,
      lizenz: eintrag.lizenz,
      stand: eintrag.stand,
      alterTage: eintrag.bewertung.alterTage,
      frische: eintrag.bewertung.frische,
      wirkung: eintrag.wirkung,
      sperrt: eintrag.sperrt,
      ausgeliefert: eintrag.ausgeliefert,
      umfang: eintrag.umfang,
      politik: eintrag.politik,
      begruendung: `${eintrag.bewertung.begruendung} ${eintrag.begruendungPolitik}`.trim(),
      hinweis: eintrag.hinweis,
    })),
  };
}
