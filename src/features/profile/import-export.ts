/**
 * M16-05 — Import und Export der lokalen Daten.
 *
 * Export ist eine Datei, die der Nutzer bekommt. Import ist eine Datei, die
 * er auswählt. **Beides verlässt das Gerät nicht** — es gibt keinen Upload,
 * keinen Abgleich und keine Adresse, an die etwas ginge.
 *
 * Eine Importdatei ist eine **fremde Eingabe**, auch wenn sie vom eigenen
 * Export stammt: sie kann bearbeitet worden sein, aus einer anderen Fassung
 * kommen oder von jemand anderem geschickt worden sein. Deshalb gilt:
 *
 * - **Größenlimit vor dem Lesen.** Eine 200-MB-Datei wird nicht geparst.
 * - **Schemaprüfung vor der Übernahme.** Was nicht passt, wird abgelehnt —
 *   nicht repariert.
 * - **Kein Code, keine Adressen, keine Verweise.** Übernommen werden nur die
 *   bekannten Felder mit bekannten Werten. Ein Feld mit HTML bleibt Text und
 *   wird nirgends als HTML eingesetzt.
 * - **Nichts wird nachgeladen.** Der Import löst keinen Abruf aus.
 */
import { z } from 'zod';

import { PetProfileSchema } from '../../domain/schemas/profile.ts';
import { MerklisteSchema, type Merkliste } from './favorites.ts';
import { PackStandSchema, type PackStand } from './packing-state.ts';
import { bereinigeInteressen } from './state.ts';
import type { PetProfile } from '../../domain/schemas/profile.ts';

/** Größenlimit einer Importdatei: 256 KiB sind für lokale Daten reichlich. */
export const MAX_IMPORT_BYTES = 256 * 1024;

export const EXPORT_FORMAT = 'petatlas-lokal';
export const EXPORT_VERSION = 1;

export const ExportSchema = z
  .object({
    format: z.literal(EXPORT_FORMAT),
    version: z.literal(EXPORT_VERSION),
    exportedAt: z.iso.datetime({ offset: true }),
    profile: PetProfileSchema.nullable(),
    interests: z.array(z.string()),
    favorites: MerklisteSchema.nullable(),
    packing: PackStandSchema.nullable(),
  })
  .strict();
export type ExportDatei = z.infer<typeof ExportSchema>;

export interface ExportEingabe {
  readonly profile: PetProfile | null;
  readonly interests: readonly string[];
  readonly favorites: Merkliste | null;
  readonly packing: PackStand | null;
  readonly exportedAt: string;
}

/** Baut die Exportdatei. Sie enthält genau das, was lokal gespeichert ist. */
export function baueExport(eingabe: ExportEingabe): ExportDatei {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: eingabe.exportedAt,
    profile: eingabe.profile,
    interests: [...bereinigeInteressen(eingabe.interests)],
    favorites: eingabe.favorites,
    packing: eingabe.packing,
  };
}

export type ImportFehler =
  'zu_gross' | 'unlesbar' | 'fremdes_format' | 'fremde_fassung' | 'ungueltig';

export interface ImportErgebnis {
  readonly ok: boolean;
  readonly daten: ExportDatei | null;
  readonly fehler: ImportFehler | null;
  /** Klartext für die Oberfläche. Immer gefüllt. */
  readonly meldung: string;
}

function fehlschlag(fehler: ImportFehler, meldung: string): ImportErgebnis {
  return { ok: false, daten: null, fehler, meldung };
}

/**
 * Prüft und übernimmt eine Importdatei.
 *
 * Der Text kommt aus einer lokalen Datei; er wird **nie** an einen Server
 * geschickt und **nie** als HTML oder Code behandelt.
 */
export function pruefeImport(text: string, maxBytes = MAX_IMPORT_BYTES): ImportErgebnis {
  const groesse = new TextEncoder().encode(text).byteLength;
  if (groesse > maxBytes) {
    return fehlschlag(
      'zu_gross',
      `Die Datei ist ${Math.round(groesse / 1024)} KiB groß; erlaubt sind ${Math.round(
        maxBytes / 1024,
      )} KiB. Sie wurde nicht gelesen.`,
    );
  }

  let gelesen: unknown;
  try {
    gelesen = JSON.parse(text);
  } catch {
    return fehlschlag('unlesbar', 'Die Datei ist kein lesbares JSON. Es wurde nichts übernommen.');
  }

  if (typeof gelesen !== 'object' || gelesen === null || Array.isArray(gelesen)) {
    return fehlschlag('ungueltig', 'Die Datei enthält keine Sicherung dieser Website.');
  }

  const roh = gelesen as Record<string, unknown>;
  if (roh.format !== EXPORT_FORMAT) {
    return fehlschlag(
      'fremdes_format',
      'Diese Datei stammt nicht aus dieser Website. Es wurde nichts übernommen.',
    );
  }
  if (roh.version !== EXPORT_VERSION) {
    return fehlschlag(
      'fremde_fassung',
      `Die Datei stammt aus Fassung ${String(roh.version)}; diese Fassung wird nicht gelesen.`,
    );
  }

  const geprueft = ExportSchema.safeParse(roh);
  if (!geprueft.success) {
    return fehlschlag(
      'ungueltig',
      'Die Datei passt nicht zum Format. Es wurde nichts übernommen — auch nicht teilweise.',
    );
  }

  // Interessen werden auch hier auf die bekannte Liste beschränkt.
  const daten: ExportDatei = {
    ...geprueft.data,
    interests: [...bereinigeInteressen(geprueft.data.interests)],
  };

  return {
    ok: true,
    daten,
    fehler: null,
    meldung: 'Datei geprüft. Die Daten ersetzen den lokalen Stand auf diesem Gerät.',
  };
}

/**
 * Der Warnhinweis, der beim Export danebenstehen muss.
 *
 * Eine Exportdatei ist unverschlüsselt und enthält alles, was lokal
 * gespeichert ist. Wer sie verschickt, verschickt genau das.
 */
export const EXPORT_WARNUNG =
  'Die Datei ist unverschlüsselt und enthält Ihre lokal gespeicherten Angaben: Profil, ' +
  'Merkliste und abgehakte Packlisten. Sie wird nirgends hochgeladen — was Sie damit tun, ' +
  'entscheiden Sie. Wer sie weitergibt, gibt diese Angaben weiter.';
