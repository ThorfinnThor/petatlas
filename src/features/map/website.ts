/**
 * M18-02 — Wie eine fremde Website dargestellt wird.
 *
 * OpenStreetMap enthält Adressen mit und ohne TLS. Beides ist eine Tatsache
 * über den fremden Server, keine Angabe über uns:
 *
 * - **https** wird verlinkt.
 * - **http** wird **nicht** verlinkt, sondern als Text gezeigt. Die Adresse
 *   still auf https zu heben wäre geraten — viele dieser Server können kein
 *   TLS, und der Link liefe ins Leere. Sie zu verlinken wäre auch nicht
 *   besser: unsere Seiten schicken `upgrade-insecure-requests`, der Aufruf
 *   würde also ohnehin auf https gehoben und scheitern.
 * - Alles andere (kein `http`/`https`, unlesbar) wird weggelassen. Eine
 *   Adresse mit einem anderen Schema gehört nicht in ein `href`.
 */
export type WebsiteDarstellung =
  | { readonly art: 'link'; readonly url: string }
  | { readonly art: 'text'; readonly adresse: string; readonly hinweis: string }
  | { readonly art: 'nichts' };

export const HTTP_HINWEIS = 'nur unverschlüsselt erreichbar, deshalb nicht verlinkt';

export function darstellung(website: string | null): WebsiteDarstellung {
  if (website === null || website.trim() === '') return { art: 'nichts' };
  let adresse: URL;
  try {
    adresse = new URL(website.trim());
  } catch {
    return { art: 'nichts' };
  }
  if (adresse.protocol === 'https:') return { art: 'link', url: adresse.toString() };
  if (adresse.protocol === 'http:') {
    return { art: 'text', adresse: adresse.toString(), hinweis: HTTP_HINWEIS };
  }
  return { art: 'nichts' };
}
