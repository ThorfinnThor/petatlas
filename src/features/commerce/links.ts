/**
 * M09-03 — Zieladressen von Partnerlinks prüfen.
 *
 * Die Adresse wird **nicht zusammengebaut**, sondern aus dem Vertrag genommen
 * und geprüft. Erlaubt ist genau eine Ergänzung: eine statische
 * Kampagnenkennung aus der Konfiguration. Alles andere — Eingaben des
 * Nutzers, berechnete Kosten, Profilwerte, Sitzungskennungen, Rückverweise —
 * kommt nicht hinein.
 *
 * Geprüft wird **offline**. Es wird nie eine Anfrage an den Anbieter gestellt,
 * um einen Link zu „verifizieren“: das wäre ein Tracking-Request, der beim
 * Anbieter als Aufruf gezählt werden kann — im Build wie im Test.
 *
 * Fällt eine Prüfung durch, gibt es keinen Link. Nicht einen ungeprüften,
 * nicht einen abgeschwächten, keinen.
 */
import type { PartnerProgram } from '../../domain/schemas/partner.ts';

/** Name des Parameters, unter dem die Kampagnenkennung übergeben wird. */
export const KAMPAGNEN_PARAMETER = 'campaign';
export const AWIN_TRACKING_HOST = 'www.awin1.com';

/**
 * `rel` und `target` eines Partnerlinks. Stehen an einer Stelle, damit kein
 * zweiter Baustein sie halb richtig wiederholt.
 */
export const PARTNER_LINK_ATTRIBUTE = {
  rel: 'sponsored nofollow noopener',
  target: '_blank',
} as const;

/**
 * Parameternamen, die typischerweise eine Weiterleitung verstecken. Ein Ziel
 * mit so einem Parameter wird abgelehnt: wohin es tatsächlich führt, steht
 * dann nicht mehr im Vertrag.
 */
const WEITERLEITUNGS_PARAMETER: readonly string[] = [
  'url',
  'redirect',
  'redirect_uri',
  'redir',
  'goto',
  'next',
  'target',
  'dest',
  'destination',
  'return',
  'returnurl',
  'continue',
  'r',
  'u',
];

export interface LinkPruefung {
  readonly gueltig: boolean;
  /** Klartextbegründung, auch im gültigen Fall. */
  readonly grund: string;
}

export interface PartnerLinkKontext {
  /** Statische, redaktionell vergebene Werte; niemals Besucherdaten. */
  readonly verticalRef: string;
  readonly placementRef: string;
  readonly contentRef: string;
  readonly pageSlug: string;
  /** Optionaler Deeplink auf einen ebenfalls freigegebenen Händlerhost. */
  readonly destinationUrl?: string;
}

const AWIN_REF = /^[a-z0-9][a-z0-9_-]{0,49}$/i;

function sichereAwinReferenz(wert: string): string | null {
  return AWIN_REF.test(wert) ? wert.toLowerCase() : null;
}

/**
 * Prüft die Vertragsadresse eines Programms — ohne sie abzurufen.
 */
export function pruefeZiel(programm: PartnerProgram): LinkPruefung {
  if (programm.landingUrl === null) {
    return { gueltig: false, grund: 'Das Programm nennt keine Zieladresse.' };
  }

  let ziel: URL;
  try {
    ziel = new URL(programm.landingUrl);
  } catch {
    return { gueltig: false, grund: 'Die Zieladresse ist nicht parsebar.' };
  }

  if (ziel.protocol !== 'https:') {
    return { gueltig: false, grund: `Nur https ist zulässig, nicht "${ziel.protocol}".` };
  }
  if (ziel.username !== '' || ziel.password !== '') {
    return { gueltig: false, grund: 'Zugangsdaten in der Adresse sind nicht zulässig.' };
  }
  if (ziel.port !== '') {
    return { gueltig: false, grund: `Abweichender Port "${ziel.port}" ist nicht zulässig.` };
  }
  if (!programm.allowedLinkHosts.includes(ziel.host)) {
    // Bewusst exakter Vergleich: „beispiel.invalid.fremd.example“ endet zwar
    // auf einen erlaubten Namen, ist aber ein anderer Host.
    return {
      gueltig: false,
      grund: `Host ${ziel.host} steht nicht in allowedLinkHosts.`,
    };
  }

  for (const [name, wert] of ziel.searchParams) {
    if (WEITERLEITUNGS_PARAMETER.includes(name.toLowerCase())) {
      return { gueltig: false, grund: `Parameter "${name}" verbirgt eine Weiterleitung.` };
    }
    if (/^https?:\/\//i.test(wert) || wert.startsWith('//')) {
      return { gueltig: false, grund: `Parameter "${name}" enthält eine fremde Adresse.` };
    }
    if (name.toLowerCase() === KAMPAGNEN_PARAMETER && !programm.campaignIds.includes(wert)) {
      return { gueltig: false, grund: `Kampagnenkennung "${wert}" ist nicht konfiguriert.` };
    }
  }

  return { gueltig: true, grund: `Ziel ${ziel.host} ist vertraglich zugelassen.` };
}

/**
 * Die auslieferbare Zieladresse eines Programms, oder `null`.
 *
 * `null` heißt: dieser Link wird nicht angezeigt. Das ist der Normalfall,
 * solange kein Vertrag besteht.
 */
export function partnerZiel(
  programm: PartnerProgram | null,
  kontext?: PartnerLinkKontext,
): string | null {
  if (programm === null) return null;
  if (programm.status !== 'approved') return null;
  if (!pruefeZiel(programm).gueltig) return null;

  // `landingUrl` ist nach der Prüfung gesetzt und parsebar. Ein Deeplink muss
  // denselben strengen Hosttest bestehen wie die Vertragsadresse.
  const ziel = new URL(kontext?.destinationUrl ?? (programm.landingUrl as string));
  if (
    ziel.protocol !== 'https:' ||
    ziel.username !== '' ||
    ziel.password !== '' ||
    ziel.port !== '' ||
    !programm.allowedLinkHosts.includes(ziel.host)
  ) {
    return null;
  }

  if (programm.tracking?.provider === 'awin') {
    if (kontext === undefined) return null;
    const referenzen = [
      kontext.verticalRef,
      kontext.placementRef,
      kontext.contentRef,
      kontext.pageSlug,
    ].map(sichereAwinReferenz);
    if (referenzen.some((wert) => wert === null)) return null;

    const tracking = new URL(`https://${AWIN_TRACKING_HOST}/cread.php`);
    tracking.searchParams.set('awinmid', programm.tracking.advertiserId);
    tracking.searchParams.set('awinaffid', programm.tracking.publisherId);
    tracking.searchParams.set('clickref', referenzen[0] as string);
    tracking.searchParams.set('clickref2', referenzen[1] as string);
    tracking.searchParams.set('clickref3', referenzen[2] as string);
    tracking.searchParams.set('clickref4', referenzen[3] as string);
    tracking.searchParams.set('ued', ziel.toString());
    return tracking.toString();
  }

  const kennung = programm.campaignIds[0];
  if (kennung !== undefined) {
    // Genau eine statische Kennung, aus der Konfiguration. Vorhandene
    // Parameter der Vertragsadresse bleiben unangetastet.
    ziel.searchParams.set(KAMPAGNEN_PARAMETER, kennung);
  }
  return ziel.toString();
}
