/**
 * Tierärztlicher Notdienst je Stadtseite. OpenStreetMap kennt den Notdienst
 * praktisch nicht (bundesweit neun Praxen mit `emergency=yes`); die Angaben
 * kommen deshalb aus einer eigenen Erhebung mit Quelle und wörtlichem Beleg:
 * `content-data/city-emergency/notdienst-2026-10.json`.
 *
 * Zugelassen sind nur Tierärztekammern, organisierte Notdienstringe und die
 * eigene Website einer Klinik, die ausdrücklich rund um die Uhr Notdienst
 * angibt – keine Verzeichnisse. Was nur schwach belegt war, steht nicht drin.
 */
import { z } from 'zod';

import { IsoDate } from '../../domain/schemas/common.ts';
import datensatz from '../../../content-data/city-emergency/notdienst-2026-10.json' with { type: 'json' };

const DienstSchema = z
  .object({
    kind: z.enum(['notdienstplan', 'notdienstnummer', 'klinik-24h']),
    name: z.string().min(1),
    url: z.url(),
    phone: z.string().nullable(),
    coverage: z.string().min(1),
    /** Wörtlicher Beleg der Quelle, höchstens 200 Zeichen. */
    verbatim: z.string().min(1).max(200),
    note: z.string().nullable(),
  })
  .strict();

const StadtSchema = z
  .object({
    kammer: z
      .object({ name: z.string().min(1), url: z.url(), verbatim: z.string().nullable() })
      .strict(),
    dienste: z.array(DienstSchema),
    notes: z.string().nullable(),
  })
  .strict();

export const NotdienstDatensatzSchema = z
  .object({
    datasetId: z.string(),
    checkedAt: IsoDate,
    cities: z.record(z.string(), StadtSchema),
  })
  .strict();

export type Notdienst = z.infer<typeof DienstSchema>;
export type StadtNotdienst = z.infer<typeof StadtSchema>;

const DATEN = NotdienstDatensatzSchema.parse(datensatz);

export const NOTDIENST_STAND = DATEN.checkedAt;

export const ART_LABEL: Record<Notdienst['kind'], string> = {
  notdienstplan: 'Notdienstplan',
  notdienstnummer: 'Zentrale Notdienstnummer',
  'klinik-24h': 'Klinik mit 24-Stunden-Notdienst',
};

/** Notdienstangaben einer Stadt; `null`, wenn die Stadt nicht erhoben wurde. */
export function notdienstFuer(slug: string): StadtNotdienst | null {
  return DATEN.cities[slug] ?? null;
}

export function erhobeneStaedte(): readonly string[] {
  return Object.keys(DATEN.cities);
}
