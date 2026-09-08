/**
 * M17-04 — Abgelaufene Preise im Browser ausblenden.
 *
 * Eine statische Seite kann stehen bleiben. Sie wird zu einem Zeitpunkt
 * gebaut und danach vielleicht tagelang ausgeliefert — auch dann, wenn ein
 * Build fehlschlägt und das alte Deployment bestehen bleibt. Ein Preis, der
 * zur Bauzeit gültig war, ist deshalb im Browser nicht automatisch noch
 * gültig.
 *
 * Die Prüfung zur Bauzeit (`abgelaufen()` in `commerce/pricing.ts`) bleibt
 * die erste Verteidigungslinie. Diese hier ist die zweite und sagt im
 * Zweifel **nichts** statt einer Zahl: „Aktuellen Preis beim Anbieter
 * prüfen“ ist eine wahre Aussage, ein alter Preis nicht.
 *
 * Es wird nichts nachgeladen und nichts gemeldet — nur ausgeblendet.
 */

/** Datenattribut mit dem Ablaufzeitpunkt am Kartenelement. */
export const ABLAUF_ATTRIBUT = 'data-preis-gueltig-bis';
export const ABGELAUFEN_KLASSE = 'angebot--abgelaufen';
export const ERSATZTEXT = 'Aktuellen Preis beim Anbieter prüfen.';

export type Ablaufstatus = 'gueltig' | 'abgelaufen' | 'unbekannt';

/**
 * Ist der Preis zum gegebenen Zeitpunkt noch gültig?
 *
 * Ohne Ablaufangabe lautet die Antwort `unbekannt` — und unbekannt wird wie
 * abgelaufen behandelt. Ein Preis ohne Haltbarkeitsangabe ist kein Preis mit
 * unbegrenzter Haltbarkeit.
 */
export function ablaufstatus(gueltigBis: string | null, jetzt: string): Ablaufstatus {
  if (gueltigBis === null || gueltigBis === '') return 'unbekannt';
  const ende = Date.parse(gueltigBis);
  const zeitpunkt = Date.parse(jetzt);
  if (Number.isNaN(ende) || Number.isNaN(zeitpunkt)) return 'unbekannt';
  return ende > zeitpunkt ? 'gueltig' : 'abgelaufen';
}

export function darfPreisZeigen(gueltigBis: string | null, jetzt: string): boolean {
  return ablaufstatus(gueltigBis, jetzt) === 'gueltig';
}

/**
 * Blendet abgelaufene Preise in einem Dokument aus. Gibt zurück, wie viele
 * Karten betroffen waren — für den Test, nicht für eine Meldung.
 */
export function verbergeAbgelaufenePreise(wurzel: ParentNode, jetzt: string): number {
  const karten = wurzel.querySelectorAll(`[${ABLAUF_ATTRIBUT}]`);
  let betroffen = 0;

  for (const karte of karten) {
    const bis = karte.getAttribute(ABLAUF_ATTRIBUT);
    if (darfPreisZeigen(bis, jetzt)) continue;

    betroffen += 1;
    karte.classList.add(ABGELAUFEN_KLASSE);
    for (const element of karte.querySelectorAll('[data-preis]')) {
      element.setAttribute('hidden', '');
    }
    const ersatz = karte.querySelector('[data-preis-ersatz]');
    if (ersatz !== null) {
      ersatz.removeAttribute('hidden');
      ersatz.textContent = ERSATZTEXT;
    }
  }
  return betroffen;
}
