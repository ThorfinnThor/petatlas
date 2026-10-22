/**
 * Alle Spielzeug-Händlerprodukte zum Nachladen. Die Spielzeugseite liefert im
 * HTML nur eine kleine Startauswahl; der Finder lädt diese Datei und baut die
 * übrigen Karten aus einer vorhandenen Karte als Vorlage. Enthalten sind nur
 * Angaben, die auf den Karten ohnehin stehen: Name, Marke und Rubrik,
 * Bildadresse und Partnerlink.
 */
import {
  fressnapfKatalog,
  katalogAuswahl,
  katalogEintraege,
  zooroyalKatalog,
} from '../../../../features/commerce/feed-catalog.ts';

export function GET(): Response {
  const daten = {
    schemaVersion: 1,
    eintraege: [
      ...katalogEintraege(katalogAuswahl(fressnapfKatalog(), 'toy'), 'Fressnapf'),
      ...katalogEintraege(katalogAuswahl(zooroyalKatalog(), 'toy'), 'ZooRoyal'),
    ],
  };
  return new Response(JSON.stringify(daten), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
