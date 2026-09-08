/**
 * M17-03 — Beobachtete Regelquellen.
 *
 * Die Source Registry beschreibt Quellen, die **abgerufen und übernommen**
 * werden. Reise- und Regelquellen werden nicht übernommen: aus ihnen entsteht
 * keine Datei im Build, sondern eine Regel, die ein Mensch fachlich prüft.
 * Beobachtet werden sie trotzdem, denn die Frage aus der Quellenprüfung
 * (docs/reviews/travel-sources.md, offener Punkt 5) lautet: wie wird ein
 * erneuter Wechsel der Rechtsgrundlage bemerkt?
 *
 * Deshalb ein eigenes, schmales Verzeichnis. Es trägt keine Rechteangaben,
 * weil nichts weitergegeben wird: gespeichert werden Validatoren und ein
 * Hash, nicht der Inhalt.
 */
import { z } from 'zod';

import { IsoDate } from './common.ts';

export const WatchEntrySchema = z
  .object({
    /** Stabiler Schlüssel; steht in Bericht und Issue-Titel. */
    watchId: z
      .string()
      .regex(/^[a-z0-9][a-z0-9-]{2,63}$/, 'Erwartet wird ein Schlüssel wie eur-lex-2026-131.'),
    title: z.string().min(1),
    url: z.url().refine((wert) => wert.startsWith('https://'), 'Nur https ist zulässig.'),
    /** Wozu diese Seite gehört: Regelsatz, Gebühren, Länderhinweis. */
    belongsTo: z.string().min(1),
    /**
     * Zeichenfolge, die auf der geprueften Seite vorkommt. Fehlt sie, ist die
     * abgerufene Seite nicht die geprüfte Seite (Fehlerseite, Einwilligung,
     * Bot-Prüfung), und der Befund lautet `nicht_pruefbar` statt
     * `unveraendert`. Nur ASCII, weil byteweise gesucht wird.
     */
    expectedMarker: z
      .string()
      .min(4)
      .regex(/^[\x20-\x7e]+$/, 'Der Marker darf nur ASCII-Zeichen enthalten.'),
    /**
     * Was ein Wechsel bedeutet. Steht im Bericht, damit die Meldung ohne
     * Rückfrage einzuordnen ist.
     */
    meaning: z.string().min(1),
    /** Datum der letzten menschlichen Sichtung dieser Seite. */
    reviewedAt: IsoDate,
  })
  .strict();

export const WatchlistSchema = z
  .object({
    watchlistId: z.string().min(1),
    entries: z.array(WatchEntrySchema).min(1),
  })
  .strict();

export type WatchEntry = z.infer<typeof WatchEntrySchema>;
export type Watchlist = z.infer<typeof WatchlistSchema>;

/**
 * Der Vergleichsstand einer beobachteten Seite.
 *
 * Bewusst **ohne Zeitstempel**: die Datei liegt im Repository und soll sich
 * nur ändern, wenn sich die Quelle geändert hat. Ein Prüfzeitpunkt im
 * Vergleichsstand hätte jeden täglichen Lauf zu einer Änderung gemacht — und
 * damit entweder zu einem Bot-Commit pro Tag oder zu einem Diff, den niemand
 * mehr liest. Wann geprüft wurde, steht im Bericht des Laufs.
 */
export const WatchStateSchema = z
  .object({
    watchId: z.string(),
    /** `null`, solange noch kein Lauf die Seite gelesen hat. */
    contentHash: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
    etag: z.string().nullable(),
    lastModified: z.string().nullable(),
  })
  .strict();

export const WatchStateFileSchema = z
  .object({
    watchlistId: z.string().min(1),
    states: z.array(WatchStateSchema),
  })
  .strict();

export type WatchState = z.infer<typeof WatchStateSchema>;
export type WatchStateFile = z.infer<typeof WatchStateFileSchema>;
