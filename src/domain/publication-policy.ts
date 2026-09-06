/**
 * M05-02 — Publikationsklassen.
 *
 * Eine Datenklasse sagt, **wohin** ein Datensatz grundsätzlich darf. Die
 * Rechte einer Quelle sagen, **ob** sie es für diese Ausgabeform erlaubt.
 * Veröffentlicht wird nur, was beides bejaht.
 *
 * Die vier Klassen:
 *
 * - `public_open` — offene Daten, die als Datei weitergegeben werden dürfen.
 * - `public_display` — darf im HTML erscheinen, aber nicht als Datei
 *   weitergegeben werden. Typisch für vertragliche Anzeigefelder.
 * - `restricted_raw` — Rohfeeds. Nur im vertrauenswürdigen Build, niemals im
 *   Repository, in `dist/` oder in einem Log.
 * - `local_user` — Daten des Besuchers. Bleiben im Gerät und verlassen es nie.
 *
 * Der wichtigste Fall: ein kommerziell nutzbarer, aber nicht
 * weiterverteilbarer Feed. `commercialUse: true` erlaubt hier weder das
 * Repository noch eine öffentliche JSON-Datei.
 */
import { OutputChannel, mayPublish, type RightsDecision, type SourceRights } from './rights.ts';

export type PublicationClass = 'public_open' | 'public_display' | 'restricted_raw' | 'local_user';

/** Wohin eine Klasse überhaupt gelangen darf, bevor Rechte geprüft werden. */
const CLASS_ALLOWS: Readonly<Record<PublicationClass, ReadonlySet<OutputChannel>>> = {
  public_open: new Set<OutputChannel>([
    'websiteDisplay',
    'publicJsonDelivery',
    'publicRepository',
    'images',
  ]),
  // Anzeigen ja, als Datei weitergeben nein.
  public_display: new Set<OutputChannel>(['websiteDisplay', 'images']),
  restricted_raw: new Set<OutputChannel>(),
  local_user: new Set<OutputChannel>(),
};

const CLASS_REASON: Readonly<Record<PublicationClass, string>> = {
  public_open: 'offene Daten',
  public_display: 'nur Anzeige erlaubt, keine Weitergabe als Datei',
  restricted_raw:
    'Rohfeed: nur im vertrauenswürdigen Build, nie im Repository, in dist/ oder in Logs',
  local_user: 'Daten des Besuchers: bleiben im Gerät und werden nicht veröffentlicht',
};

export interface PublicationDecision extends RightsDecision {
  readonly publicationClass: PublicationClass;
  readonly channel: OutputChannel;
}

/**
 * Darf dieser Datensatz über diesen Kanal ausgegeben werden?
 *
 * Beide Prüfungen müssen zustimmen. Die Klasse wird zuerst geprüft: ein
 * Rohfeed bleibt gesperrt, selbst wenn ein Rechteeintrag ihn versehentlich
 * freigäbe.
 */
export function mayPublishAs(
  publicationClass: PublicationClass,
  rights: SourceRights,
  channel: OutputChannel,
): PublicationDecision {
  if (!CLASS_ALLOWS[publicationClass].has(channel)) {
    return {
      publicationClass,
      channel,
      allowed: false,
      reason: `Klasse "${publicationClass}" erlaubt "${channel}" nicht: ${CLASS_REASON[publicationClass]}.`,
      attribution: null,
    };
  }

  const entscheidung = mayPublish(rights, channel);
  return { publicationClass, channel, ...entscheidung };
}

/** Alle Kanäle, die für diese Kombination tatsächlich offen sind. */
export function allowedChannels(
  publicationClass: PublicationClass,
  rights: SourceRights,
): readonly OutputChannel[] {
  return OutputChannel.options.filter(
    (channel) => mayPublishAs(publicationClass, rights, channel).allowed,
  );
}

/**
 * Darf der Datensatz überhaupt in ein Verzeichnis geschrieben werden, das
 * ausgeliefert wird? `dist/` und das Repository sind öffentlich, unabhängig
 * davon, ob eine Datei verlinkt ist.
 */
export function mayWriteToPublicOutput(
  publicationClass: PublicationClass,
  rights: SourceRights,
): PublicationDecision {
  return mayPublishAs(publicationClass, rights, 'publicJsonDelivery');
}
