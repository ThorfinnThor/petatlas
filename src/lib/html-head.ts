/**
 * M18-01 — Die Kopfangaben einer erzeugten Seite auslesen.
 *
 * Gelesen wird **eigene** Ausgabe, kein fremdes HTML: die Seiten entstehen
 * aus Astro-Vorlagen, und die Kopfangaben stehen dort in einer festen Form.
 * Deshalb genügen Ausdrücke; ein vollständiger Parser wäre eine weitere
 * Abhängigkeit für eine Aufgabe, die keine braucht.
 *
 * Wo etwas fehlt, steht `null` — nicht der Versuch, es zu erraten.
 */

export interface Kopfangaben {
  readonly titel: string | null;
  readonly h1: readonly string[];
  readonly canonical: string | null;
  readonly robots: string | null;
  readonly hreflangs: readonly { readonly lang: string; readonly href: string }[];
  readonly jsonLd: readonly string[];
  /** Trägt `<body>` ein `data-pagefind-ignore`? */
  readonly pagefindIgnoriert: boolean;
  readonly lang: string | null;
  /**
   * Ziel einer `meta refresh`-Weiterleitung, sonst `null`. Solche Seiten
   * erzeugt Astro für konfigurierte Redirects; sie haben bewusst keinen
   * Inhalt und dürfen deshalb nicht an einer H1 gemessen werden.
   */
  readonly weiterleitungZu: string | null;
}

function ersterTreffer(html: string, muster: RegExp): string | null {
  const treffer = muster.exec(html);
  return treffer?.[1]?.trim() ?? null;
}

function alleTreffer(html: string, muster: RegExp): string[] {
  return [...html.matchAll(muster)].map((treffer) => (treffer[1] ?? '').trim());
}

/** Entfernt Tags aus einem Textabschnitt; für Überschriften mit Auszeichnung. */
function nurText(roh: string): string {
  return roh
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function leseKopf(html: string): Kopfangaben {
  const metaRobots =
    ersterTreffer(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ??
    ersterTreffer(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i);

  const hreflangs = [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/gi)]
    .map((treffer) => treffer[0])
    .map((tag) => ({
      lang: ersterTreffer(tag, /hreflang=["']([^"']*)["']/i) ?? '',
      href: ersterTreffer(tag, /href=["']([^"']*)["']/i) ?? '',
    }))
    .filter((eintrag) => eintrag.lang !== '');

  return {
    titel: ersterTreffer(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    h1: alleTreffer(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(nurText),
    canonical: ersterTreffer(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i),
    robots: metaRobots,
    hreflangs,
    jsonLd: alleTreffer(
      html,
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
    pagefindIgnoriert: /<body[^>]*\sdata-pagefind-ignore/i.test(html),
    lang: ersterTreffer(html, /<html[^>]+lang=["']([^"']*)["']/i),
    weiterleitungZu: ersterTreffer(
      html,
      /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"';]+)["']/i,
    ),
  };
}

/** Sagt die Seite selbst, dass sie nicht indexiert werden will? */
export function nichtIndexierbar(kopf: Kopfangaben): boolean {
  return kopf.robots === null || /noindex/i.test(kopf.robots);
}
