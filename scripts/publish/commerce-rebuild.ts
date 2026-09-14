/**
 * M17-03 — Braucht der Warenkatalog überhaupt einen neuen Build?
 *
 * Der Feedabruf kostet Vertragsdaten, Zeit und fremde Bandbreite. Er ist nur
 * gerechtfertigt, wenn der Angebotsfeed ausdrücklich freigegeben ist und es
 * mindestens ein zugelassenes Warenprogramm für einen aktiven Markt gibt.
 * Statische Partnerlinks allein lösen keinen Feedabruf aus.
 *
 * Das ist kein Fehlschlag. Ein täglicher Lauf, der jeden Tag „nichts zu tun“
 * meldet, tut genau das, wofür er da ist.
 *
 * Die Zulassungsprüfung wird **nicht** nachgebaut: sie steht in
 * `zulassungGilt()` und muss an einer Stelle bleiben.
 */
import { appendFileSync } from 'node:fs';

import { enabledMarkets } from '../../src/domain/market.ts';
import { commerceProgramme, zulassungGilt } from '../../src/features/commerce/partner.ts';
import { commerceStatus, type OfferFeedStatus } from '../../src/features/commerce/status.ts';

export interface RebuildEntscheidung {
  readonly noetig: boolean;
  readonly begruendung: string;
  readonly programme: readonly string[];
}

export function entscheide(
  stichtag: string = new Date().toISOString().slice(0, 10),
  programme = commerceProgramme(),
  maerkte = enabledMarkets().map((markt) => markt.id),
  feedStatus: OfferFeedStatus = commerceStatus().offerFeedStatus.status,
): RebuildEntscheidung {
  if (feedStatus !== 'approved') {
    return {
      noetig: false,
      begruendung: `Der Angebotsfeed ist ${feedStatus}; statische Partnerlinks benötigen keinen Feedabruf.`,
      programme: [],
    };
  }

  const gueltig = programme.filter(
    (programm) =>
      programm.markets.some((markt) => maerkte.includes(markt)) &&
      zulassungGilt(programm, stichtag),
  );

  if (gueltig.length === 0) {
    return {
      noetig: false,
      begruendung: `Kein zugelassenes Warenprogramm für ${maerkte.join(', ') || 'keinen aktiven Markt'} am ${stichtag}. Ohne Vertrag kein Feedabruf und kein Rebuild (M13-06).`,
      programme: [],
    };
  }
  return {
    noetig: true,
    begruendung: `${gueltig.length} zugelassene(s) Warenprogramm(e) für ${maerkte.join(', ')}.`,
    programme: gueltig.map((programm) => programm.programId),
  };
}

function main(): number {
  const entscheidung = entscheide();
  console.log(`${entscheidung.noetig ? 'rebuild' : 'kein rebuild'}: ${entscheidung.begruendung}`);
  const ausgabe = process.env.GITHUB_OUTPUT;
  if (ausgabe !== undefined && ausgabe !== '') {
    // Der Workflow liest daraus, ob der folgende Schritt überhaupt läuft.
    appendFileSync(ausgabe, `noetig=${entscheidung.noetig ? 'true' : 'false'}\n`);
  }
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
