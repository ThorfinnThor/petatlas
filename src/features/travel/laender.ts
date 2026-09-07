/**
 * M12-05 — Anzeigenamen und Pfadstücke der unterstützten Ziele.
 *
 * Eigene Datei, weil `getStaticPaths` in Astro in einem eigenen Modulkontext
 * ausgeführt wird und Werte aus dem Frontmatter der Seite dort nicht sichtbar
 * sind. Ein importierter Wert ist es.
 *
 * Nur unterstützte Ziele stehen hier. Ein Land ohne Eintrag bekommt keine
 * Seite — und das ist die Absicht, nicht eine Lücke.
 */
export interface Zielland {
  readonly name: string;
  /** Pfadstück der Zielseite, ohne Umlaute. */
  readonly slug: string;
}

export const ZIELLAENDER: Readonly<Record<string, Zielland>> = {
  AT: { name: 'Österreich', slug: 'oesterreich' },
  FR: { name: 'Frankreich', slug: 'frankreich' },
  IT: { name: 'Italien', slug: 'italien' },
  NL: { name: 'Niederlande', slug: 'niederlande' },
};

export function zielland(code: string): Zielland | undefined {
  return ZIELLAENDER[code];
}
