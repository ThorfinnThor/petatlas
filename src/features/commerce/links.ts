/**
 * M09-02/M09-03 — Zieladressen von Partnerlinks.
 *
 * Die Adresse wird **nicht zusammengebaut**, sondern aus dem Vertrag genommen
 * und geprüft. Erlaubt ist genau eine Ergänzung: eine statische
 * Kampagnenkennung aus der Konfiguration. Alles andere — Eingaben des
 * Nutzers, berechnete Kosten, Profilwerte, Sitzungskennungen, Rückverweise —
 * kommt nicht hinein. Kann eine Adresse nicht geprüft werden, gibt es keinen
 * Link statt eines ungeprüften.
 */
import type { PartnerProgram } from '../../domain/schemas/partner.ts';

/** Name des Parameters, unter dem die Kampagnenkennung übergeben wird. */
const KAMPAGNEN_PARAMETER = 'campaign';

/**
 * Die auslieferbare Zieladresse eines Programms, oder `null`.
 *
 * `null` heißt: dieser Link wird nicht angezeigt. Das ist der Normalfall,
 * solange kein Vertrag besteht.
 */
export function partnerZiel(programm: PartnerProgram | null): string | null {
  if (programm === null || programm.landingUrl === null) return null;

  let ziel: URL;
  try {
    ziel = new URL(programm.landingUrl);
  } catch {
    return null;
  }

  if (ziel.protocol !== 'https:') return null;
  if (!programm.allowedLinkHosts.includes(ziel.host)) return null;

  const kennung = programm.campaignIds[0];
  if (kennung !== undefined) {
    // Genau eine statische Kennung, aus der Konfiguration. Vorhandene
    // Parameter der Vertragsadresse bleiben unangetastet.
    ziel.searchParams.set(KAMPAGNEN_PARAMETER, kennung);
  }

  return ziel.toString();
}
