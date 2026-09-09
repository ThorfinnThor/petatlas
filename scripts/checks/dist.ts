/**
 * M18-02 — Was verlässt das Haus?
 *
 * Diese Prüfung sieht sich **nur den Buildoutput** an. Nicht die Absicht,
 * nicht die Konfiguration, nicht den Quelltext: die Dateien, die ein Browser
 * bekäme. Was hier nicht auffällt, fällt draußen auf.
 *
 * Die Regeln sind durchweg Allowlists. Eine Blockliste vergisst immer etwas,
 * und was sie vergisst, wird ausgeliefert.
 *
 * Ausführen: `npm run check:dist`
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

import tiles from '../../config/tiles.json' with { type: 'json' };

export interface Fund {
  readonly datei: string;
  readonly problem: string;
}

/**
 * Dateitypen, die ausgeliefert werden dürfen. Alles andere ist ein Fund —
 * auch das, woran niemand gedacht hat.
 */
export const ERLAUBTE_ENDUNGEN: readonly string[] = [
  '.html',
  '.json',
  '.js',
  '.css',
  '.txt',
  '.xml',
  '.wasm',
  '.pf_fragment',
  '.pf_index',
  '.pf_meta',
  '.pagefind',
  '.woff2',
];

/** Dateien ohne Endung, die dazugehören. */
export const ERLAUBTE_DATEINAMEN: readonly string[] = ['_headers', '_redirects'];

/**
 * Bilder gehen nur mit ausdrücklicher Erlaubnis raus. Es gibt heute keine —
 * weder von OpenStreetMap noch von einem Partnerprogramm —, also darf keins
 * im Output liegen. Diese Liste ist bewusst großzügig: sie soll auch das
 * fangen, was jemand versehentlich hineinlegt.
 */
export const BILDENDUNGEN: readonly string[] = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.gif',
  '.svg',
  '.ico',
  '.bmp',
  '.tiff',
];

/**
 * Bilder, die ausgeliefert werden dürfen, mit Grund.
 *
 * Die Liste ist kurz und soll es bleiben. Jeder Eintrag nennt, woher das
 * Bild stammt und unter welcher Lizenz — sonst ist er kein Eintrag, sondern
 * eine Lücke.
 */
export const ERLAUBTE_BILDER: readonly { readonly muster: RegExp; readonly grund: string }[] = [
  {
    muster:
      /^images\/brand\/(hero-dog-alpine-lake|travel-human-dog-sunset|play-dog-alpine-lake|health-dog-home)-(480|800|1200|1536)\.(avif|webp)$/,
    grund:
      'AI-generated editorial brand photographs; source and prompts in design-assets/README.md. Not product photos.',
  },
  {
    // Leaflet bringt seine Bedienbilder selbst mit; sie stehen unter
    // BSD-2-Clause (node_modules/leaflet/LICENSE) und werden unverändert
    // mitgeliefert. Der Bundler hängt einen Inhalts-Hash an den Namen.
    muster:
      /^_astro\/(layers|layers-2x|marker-icon|marker-icon-2x|marker-shadow)\.[A-Za-z0-9_-]+\.png$/,
    grund: 'Leaflet-Bedienbild, BSD-2-Clause, unverändert aus dem Paket',
  },
];

/** Quelldateien und Schlüsselmaterial, die niemals im Output landen dürfen. */
export const VERBOTENE_ENDUNGEN: readonly string[] = [
  '.ts',
  '.tsx',
  '.astro',
  '.map',
  '.env',
  '.pem',
  '.key',
  '.p12',
  '.pfx',
  '.pbf',
  '.zip',
];

/** Schlüsselnamen, die in einer öffentlichen JSON-Datei nichts zu suchen haben. */
export const PRIVATE_FELDER: readonly string[] = [
  'secret',
  'token',
  'apiKey',
  'api_key',
  'password',
  'passwort',
  'authorization',
  'cookie',
  'internalNote',
  'kommission',
  'commissionRate',
];

/**
 * Hosts, von denen der Browser Unterressourcen laden darf.
 *
 * In `config/tiles.json` stehen vollständige Ursprünge (`https://host`),
 * weil die CSP sie so verlangt. Verglichen wird hier gegen `URL.host` —
 * ohne diese Umwandlung liefe der Vergleich immer ins Leere und meldete
 * jede erlaubte Unterressource als Fund oder, schlimmer, keine.
 */
export function erlaubteSubressourcenHosts(): readonly string[] {
  return (tiles as { hosts: string[] }).hosts.map((eintrag) => {
    try {
      return new URL(eintrag).host;
    } catch {
      return eintrag;
    }
  });
}

export function dateien(wurzel: string): readonly string[] {
  if (!existsSync(wurzel)) return [];
  const gefunden: string[] = [];
  for (const eintrag of readdirSync(wurzel, { withFileTypes: true, recursive: true })) {
    if (eintrag.isFile()) gefunden.push(join(eintrag.parentPath, eintrag.name));
  }
  return gefunden.sort();
}

export function pruefeDateityp(pfad: string): Fund[] {
  const name = pfad.split(sep).at(-1) ?? pfad;
  const endung = extname(name).toLowerCase();

  if (ERLAUBTE_DATEINAMEN.includes(name)) return [];
  if (VERBOTENE_ENDUNGEN.includes(endung)) {
    return [{ datei: pfad, problem: `Quelldatei oder Rohdatei im Output (${endung}).` }];
  }
  if (BILDENDUNGEN.includes(endung)) {
    if (ERLAUBTE_BILDER.some((eintrag) => eintrag.muster.test(pfad))) return [];
    return [
      {
        datei: pfad,
        problem: `Bilddatei im Output (${endung}) ohne Eintrag in der Bilder-Allowlist. Ein Bild braucht eine benannte Herkunft und Lizenz.`,
      },
    ];
  }
  if (!ERLAUBTE_ENDUNGEN.includes(endung)) {
    return [
      {
        datei: pfad,
        problem: `Dateityp ${endung || '(ohne Endung)'} steht nicht auf der Allowlist.`,
      },
    ];
  }
  return [];
}

/** Inline-Skripte, Event-Attribute und gefährliche Schemata im HTML. */
export function pruefeHtml(pfad: string, html: string, erlaubteHosts: readonly string[]): Fund[] {
  const funde: Fund[] = [];
  const melde = (problem: string): void => {
    funde.push({ datei: pfad, problem });
  };

  // `script-src 'self'` verbietet Inline-Skripte. Eins im HTML wäre nicht
  // nur ein Sicherheitsrisiko, es liefe schlicht nicht.
  for (const treffer of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attribute = treffer[1] ?? '';
    const inhalt = (treffer[2] ?? '').trim();
    const typ = /type=["']([^"']*)["']/i.exec(attribute)?.[1]?.toLowerCase() ?? '';
    // Strukturierte Daten sind kein ausführbarer Code.
    if (typ === 'application/ld+json') continue;
    if (inhalt !== '' && !/\ssrc=/i.test(attribute)) {
      melde(`Inline-Skript (${inhalt.length} Zeichen). Die CSP erlaubt nur eigene Skriptdateien.`);
    }
  }

  for (const treffer of html.matchAll(/\s(on[a-z]+)=["']/gi)) {
    melde(`Event-Attribut ${treffer[1]} im HTML. Auch das verbietet die CSP.`);
  }

  for (const treffer of html.matchAll(/(?:href|src|action)=["']\s*javascript:/gi)) {
    melde(`javascript:-Adresse im Markup (${treffer[0]}).`);
  }

  if (/\ssrcdoc=/i.test(html)) melde('srcdoc-Attribut im Markup.');

  // Unterressourcen dürfen nur von der eigenen Herkunft oder von erklärten
  // Hosts kommen. Ein normaler Link auf eine fremde Seite ist etwas anderes
  // und bleibt erlaubt.
  for (const treffer of html.matchAll(
    /<(script|link|img|iframe|source|video|audio|embed)\b[^>]*\s(?:src|href)=["']([^"']+)["']/gi,
  )) {
    const tag = (treffer[1] ?? '').toLowerCase();
    const adresse = treffer[2] ?? '';
    if (
      tag === 'link' &&
      !/rel=["'](stylesheet|preload|modulepreload|icon)["']/i.test(treffer[0])
    ) {
      continue;
    }
    if (adresse.startsWith('/') || adresse.startsWith('#') || adresse.startsWith('data:')) continue;
    let host: string;
    try {
      host = new URL(adresse).host;
    } catch {
      continue;
    }
    if (!erlaubteHosts.includes(host)) {
      melde(`Unterressource von ${host} (${tag}). Nur erklärte Hosts sind zulässig.`);
    }
  }

  for (const treffer of html.matchAll(/href=["'](http:\/\/[^"']+)["']/gi)) {
    melde(`Unverschlüsselter Link: ${treffer[1]}`);
  }

  return funde;
}

/**
 * M22-02 — Spuren einer Schemabibliothek im ausgelieferten JavaScript.
 *
 * Die Laufzeitprüfungen im Browser stehen in `src/domain/runtime-guards.ts`
 * und kommen ohne Bibliothek aus. Landet `zod` trotzdem wieder im Bundle,
 * heißt das: irgendwo importiert Browsercode eine Schemadatei — und 87 KiB
 * wandern still zurück in jede Seite. Diese Prüfung fängt genau das.
 *
 * Gesucht wird nach Zeichenketten, die die Minifizierung überstehen: Namen
 * von Fehlerklassen und Meldungstexte, keine Variablennamen.
 */
export const SCHEMA_SPUREN: readonly string[] = [
  'ZodError',
  '$ZodType',
  'invalid_union',
  'Invalid input: expected',
];

export function pruefeJavaScript(pfad: string, inhalt: string): Fund[] {
  const gefunden = SCHEMA_SPUREN.filter((spur) => inhalt.includes(spur));
  if (gefunden.length === 0) return [];
  return [
    {
      datei: pfad,
      problem:
        `Schemabibliothek im Browser-JavaScript (${gefunden.join(', ')}). ` +
        'Laufzeitprüfungen gehören in src/domain/runtime-guards.ts (M22-02).',
    },
  ];
}

export function pruefeJson(pfad: string, inhalt: string): Fund[] {
  const funde: Fund[] = [];
  let daten: unknown;
  try {
    daten = JSON.parse(inhalt);
  } catch {
    return [{ datei: pfad, problem: 'Kein lesbares JSON im Output.' }];
  }

  const gesehen = new Set<string>();
  const gehe = (wert: unknown): void => {
    if (Array.isArray(wert)) {
      for (const eintrag of wert) gehe(eintrag);
      return;
    }
    if (wert === null || typeof wert !== 'object') return;
    for (const [schluessel, unterwert] of Object.entries(wert)) {
      const klein = schluessel.toLowerCase();
      if (
        schluessel.startsWith('_') ||
        PRIVATE_FELDER.some((feld) => klein === feld.toLowerCase())
      ) {
        gesehen.add(schluessel);
      }
      gehe(unterwert);
    }
  };
  gehe(daten);

  for (const schluessel of gesehen) {
    funde.push({
      datei: pfad,
      problem: `Feld „${schluessel}“ in einer öffentlichen Datei. Öffentlich ist, was ausgeliefert wird.`,
    });
  }
  return funde;
}

export function pruefeHeader(inhalt: string | null): Fund[] {
  if (inhalt === null) return [{ datei: '_headers', problem: 'Fehlt im Output.' }];
  const funde: Fund[] = [];
  const verlangt = [
    'Content-Security-Policy:',
    "default-src 'self'",
    "script-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    'X-Content-Type-Options: nosniff',
  ];
  for (const teil of verlangt) {
    if (!inhalt.includes(teil)) {
      funde.push({ datei: '_headers', problem: `Fehlender Bestandteil: ${teil}` });
    }
  }
  if (/script-src[^;\n]*unsafe-(inline|eval)/.test(inhalt)) {
    funde.push({
      datei: '_headers',
      problem: 'script-src erlaubt unsafe-inline oder unsafe-eval.',
    });
  }
  return funde;
}

export function pruefeVerzeichnis(wurzel: string): Fund[] {
  const funde: Fund[] = [];
  const hosts = erlaubteSubressourcenHosts();

  for (const datei of dateien(wurzel)) {
    const relativ = relative(wurzel, datei).split(sep).join('/');
    funde.push(...pruefeDateityp(relativ));

    const endung = extname(datei).toLowerCase();
    if (endung === '.html') {
      funde.push(...pruefeHtml(relativ, readFileSync(datei, 'utf8'), hosts));
    }
    if (endung === '.json' && relativ.startsWith('data/')) {
      funde.push(...pruefeJson(relativ, readFileSync(datei, 'utf8')));
    }
    if (endung === '.js') {
      funde.push(...pruefeJavaScript(relativ, readFileSync(datei, 'utf8')));
    }
  }

  const headerPfad = join(wurzel, '_headers');
  funde.push(...pruefeHeader(existsSync(headerPfad) ? readFileSync(headerPfad, 'utf8') : null));
  return funde;
}

function main(): number {
  const wurzel = 'dist';
  if (dateien(wurzel).length === 0) {
    console.error('Kein Build vorhanden: erst `npm run build:site`, dann diese Prüfung.');
    return 1;
  }
  const funde = pruefeVerzeichnis(wurzel);
  if (funde.length > 0) {
    console.error(`Output-Audit: ${funde.length} Fund(e).`);
    for (const fund of funde) console.error(`  ${fund.datei}: ${fund.problem}`);
    return 1;
  }
  console.log(
    `Output-Audit: ${dateien(wurzel).length} Dateien geprüft, keine Beanstandung. ` +
      `Erlaubte Unterressourcen-Hosts: ${erlaubteSubressourcenHosts().join(', ') || 'keine'}.`,
  );
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
