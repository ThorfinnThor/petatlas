/**
 * M18-01 — SEO-Gates.
 *
 * Geprüft wird der **gebaute Output**, nicht die Absicht. Die Fragen sind
 * bewusst eng und beantwortbar:
 *
 * - Hat jede Seite genau eine H1, einen eigenen Titel und ein canonical,
 *   das auf sie selbst zeigt?
 * - Sagt jede Seite ausdrücklich, ob sie indexiert werden darf?
 * - Landen Probe- und Fixtureseiten im Index? (Sie dürfen nicht.)
 * - Gibt es hreflang-Angaben ohne zweite Sprache? (Ein Paar mit sich selbst
 *   ist keins.)
 * - Steht irgendwo ein **Bewertungs-Markup**, für das es keine Bewertungen
 *   gibt? Genau das ist die Sorte SEO-Schmuck, die hier nicht entstehen soll.
 * - Passt die Sitemap zu dem, was tatsächlich indexierbar ist?
 *
 * Ausführen: `npm run check:seo`
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { resolveBuildConfig } from '../../config/build.ts';
import { enabledMarkets } from '../../src/domain/market.ts';
import { leseKopf, nichtIndexierbar, type Kopfangaben } from '../../src/lib/html-head.ts';
import { sammleSeiten, type Seite } from '../publish/sitemap.ts';

export interface Beanstandung {
  readonly pfad: string;
  readonly problem: string;
}

/** Pfade, die nie in einen Index gehören, egal was im Kopf steht. */
export const NIE_INDEXIEREN: readonly string[] = ['/entwicklung/', '/404'];

/** Markup, das Bewertungen behauptet. Es gibt keine, also darf es keins geben. */
export const VERBOTENE_SCHEMA_TYPEN: readonly string[] = [
  'aggregateRating',
  'AggregateRating',
  'ratingValue',
  '"Review"',
  'reviewRating',
];

export interface Umgebung {
  readonly baseUrl: string;
  /** Ist dieser Build überhaupt zur Indexierung bestimmt? */
  readonly indexierbar: boolean;
  /**
   * Probelauf: jede Seite außer den nie zu indexierenden wird geprüft, als
   * wäre sie indexierbar.
   *
   * Ohne das wäre der Gate heute wirkungslos. Solange die Launch-Gates offen
   * sind, trägt **jede** Seite `noindex`, und die Regeln für indexierbare
   * Seiten — canonical, fremde Märkte — griffen nie. Die Frage lautet
   * deshalb: „bestünde dieser Build die Prüfung, wenn er veröffentlicht
   * würde?“ Sie jetzt zu stellen ist billiger, als sie am Starttag zu stellen.
   */
  readonly alsIndexierbar?: boolean;
  /** Pfadpräfixe aktiver Märkte, etwa `/de-de`. */
  readonly aktivePrefixe: readonly string[];
  /** Sprachen aktiver Märkte. Eine einzige heißt: keine hreflang-Paare. */
  readonly sprachen: readonly string[];
}

export function pruefeSeite(pfad: string, html: string, umgebung: Umgebung): Beanstandung[] {
  const kopf: Kopfangaben = leseKopf(html);
  const sollNieIndexiertWerden = NIE_INDEXIEREN.some((teil) => pfad.startsWith(teil));
  const wieIndexierbar =
    umgebung.alsIndexierbar === true ? !sollNieIndexiertWerden : !nichtIndexierbar(kopf);
  const beanstandungen: Beanstandung[] = [];
  const melde = (problem: string): void => {
    beanstandungen.push({ pfad, problem });
  };

  if (kopf.weiterleitungZu !== null) {
    // Eine Weiterleitungsseite hat bewusst keinen Inhalt. Von ihr wird nur
    // verlangt, dass sie nicht im Index landet und ein Ziel nennt.
    //
    // „Kein robots-Tag“ genügt hier ausdrücklich nicht: die Zwischenseite
    // existiert wirklich und ist ohne Angabe indexierbar. Verlangt wird ein
    // ausdrückliches noindex.
    if (kopf.robots === null || !/noindex/i.test(kopf.robots)) {
      melde('Weiterleitungsseite ohne ausdrückliches noindex.');
    }
    if (kopf.weiterleitungZu === '') melde('Weiterleitung ohne Ziel.');
    return beanstandungen;
  }

  if (kopf.titel === null || kopf.titel === '') melde('Kein Titel.');
  if (kopf.h1.length === 0) melde('Keine H1.');
  if (kopf.h1.length > 1) melde(`${kopf.h1.length} H1-Überschriften; genau eine ist richtig.`);
  if (kopf.lang === null || kopf.lang === '') melde('Kein lang-Attribut am html-Element.');
  if (kopf.robots === null) {
    melde('Keine robots-Angabe. Ob eine Seite in den Index darf, ist keine Auslassung.');
  }

  if (sollNieIndexiertWerden && !nichtIndexierbar(kopf)) {
    melde('Probe- oder Fehlerseite ohne noindex.');
  }
  if (nichtIndexierbar(kopf) && !kopf.pagefindIgnoriert && sollNieIndexiertWerden) {
    melde('noindex, aber ohne data-pagefind-ignore: die eigene Suche nähme sie trotzdem auf.');
  }

  if (wieIndexierbar) {
    if (kopf.canonical === null) {
      melde('Indexierbare Seite ohne canonical.');
    } else {
      const erwartet = new URL(pfad, umgebung.baseUrl).toString();
      if (kopf.canonical !== erwartet) {
        melde(`canonical zeigt auf ${kopf.canonical}, erwartet war ${erwartet}.`);
      }
    }
    const fremd =
      umgebung.aktivePrefixe.length > 0 &&
      !umgebung.aktivePrefixe.some((prefix) => pfad.startsWith(prefix)) &&
      pfad !== '/';
    if (fremd) {
      melde(
        `Indexierbare Seite außerhalb der aktiven Märkte (${umgebung.aktivePrefixe.join(', ')}).`,
      );
    }
  }

  if (kopf.hreflangs.length > 0 && umgebung.sprachen.length < 2) {
    melde(
      `hreflang-Angaben (${kopf.hreflangs.map((eintrag) => eintrag.lang).join(', ')}), ` +
        'obwohl nur eine Sprache aktiv ist. Ein Paar mit sich selbst ist keins.',
    );
  }

  for (const block of kopf.jsonLd) {
    for (const verboten of VERBOTENE_SCHEMA_TYPEN) {
      if (block.includes(verboten)) {
        melde(`Strukturierte Daten enthalten „${verboten}“, aber es gibt keine Bewertungen.`);
      }
    }
  }

  return beanstandungen;
}

export function pruefeTitelEindeutig(
  seiten: readonly { readonly pfad: string; readonly titel: string | null }[],
): Beanstandung[] {
  const nachTitel = new Map<string, string[]>();
  for (const seite of seiten) {
    if (seite.titel === null) continue;
    nachTitel.set(seite.titel, [...(nachTitel.get(seite.titel) ?? []), seite.pfad]);
  }
  return [...nachTitel.entries()]
    .filter(([, pfade]) => pfade.length > 1)
    .map(([titel, pfade]) => ({
      pfad: pfade.join(', '),
      problem: `Mehrere Seiten tragen denselben Titel „${titel}“.`,
    }));
}

export function pruefeSitemap(
  sitemap: string | null,
  seiten: readonly Seite[],
  umgebung: Umgebung,
): Beanstandung[] {
  const indexierbare = seiten.filter((seite) => seite.indexierbar);

  if (!umgebung.indexierbar) {
    // Ein nicht indexierbarer Build darf keine Sitemap ausliefern: sie wäre
    // eine Einladung, ihn doch zu indexieren.
    return sitemap === null
      ? []
      : [
          {
            pfad: '/sitemap.xml',
            problem: 'Sitemap in einem Build, der nicht indexiert werden soll.',
          },
        ];
  }

  if (sitemap === null) {
    return [{ pfad: '/sitemap.xml', problem: 'Fehlt, obwohl der Build indexierbar ist.' }];
  }

  const enthalten = new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((treffer) => treffer[1] ?? ''),
  );
  const beanstandungen: Beanstandung[] = [];

  for (const seite of indexierbare) {
    const url = new URL(seite.pfad, umgebung.baseUrl).toString();
    if (!enthalten.has(url)) {
      beanstandungen.push({
        pfad: seite.pfad,
        problem: 'Indexierbar, steht aber nicht in der Sitemap.',
      });
    }
  }
  const bekannt = new Set(
    indexierbare.map((seite) => new URL(seite.pfad, umgebung.baseUrl).toString()),
  );
  for (const url of enthalten) {
    if (!bekannt.has(url)) {
      beanstandungen.push({
        pfad: url,
        problem: 'Steht in der Sitemap, ist aber nicht indexierbar oder existiert nicht.',
      });
    }
  }
  return beanstandungen;
}

export function umgebungAusBuild(): Umgebung {
  const build = resolveBuildConfig();
  const maerkte = enabledMarkets();
  return {
    baseUrl: build.baseUrl,
    indexierbar: build.indexable,
    aktivePrefixe: maerkte.map((markt) => markt.pathPrefix),
    sprachen: [...new Set(maerkte.map((markt) => markt.locale))],
  };
}

function main(): number {
  const wurzel = 'dist';
  const alsIndexierbar = process.argv.includes('--als-indexierbar');
  const seiten = sammleSeiten(wurzel);
  if (seiten.length === 0) {
    console.error('Kein Build vorhanden: erst `npm run build:site`, dann diese Prüfung.');
    return 1;
  }
  const umgebung: Umgebung = { ...umgebungAusBuild(), alsIndexierbar };

  const beanstandungen: Beanstandung[] = [];
  const titel: { pfad: string; titel: string | null }[] = [];

  for (const seite of seiten) {
    const html = readFileSync(seite.datei, 'utf8');
    beanstandungen.push(...pruefeSeite(seite.pfad, html, umgebung));
    titel.push({ pfad: seite.pfad, titel: leseKopf(html).titel });
  }
  beanstandungen.push(...pruefeTitelEindeutig(titel));

  // Im Probelauf geht es um die Seiten, nicht um Sitemap und robots.txt:
  // die richten sich nach dem tatsächlichen Buildmodus.
  if (alsIndexierbar) {
    if (beanstandungen.length > 0) {
      console.error(
        `SEO-Probelauf: ${beanstandungen.length} Beanstandung(en), wenn dieser Build veröffentlicht würde.`,
      );
      for (const eintrag of beanstandungen) {
        console.error(`  ${eintrag.pfad}: ${eintrag.problem}`);
      }
      return 1;
    }
    console.log(
      `SEO-Probelauf: ${seiten.length} Seiten würden die Prüfung auch als indexierbarer Build bestehen.`,
    );
    return 0;
  }

  const sitemapPfad = join(wurzel, 'sitemap.xml');
  const sitemap = existsSync(sitemapPfad) ? readFileSync(sitemapPfad, 'utf8') : null;
  beanstandungen.push(...pruefeSitemap(sitemap, seiten, umgebung));

  const robotsPfad = join(wurzel, 'robots.txt');
  if (!existsSync(robotsPfad)) {
    beanstandungen.push({ pfad: '/robots.txt', problem: 'Fehlt.' });
  } else if (!umgebung.indexierbar && !/^Disallow:\s*\/$/m.test(readFileSync(robotsPfad, 'utf8'))) {
    beanstandungen.push({
      pfad: '/robots.txt',
      problem: 'Dieser Build ist nicht indexierbar, aber robots.txt verbietet nicht alles.',
    });
  }

  if (beanstandungen.length > 0) {
    console.error(`SEO-Prüfung: ${beanstandungen.length} Beanstandung(en).`);
    for (const eintrag of beanstandungen) {
      console.error(`  ${eintrag.pfad}: ${eintrag.problem}`);
    }
    return 1;
  }

  const indexierbare = seiten.filter((seite) => seite.indexierbar).length;
  console.log(
    `SEO-Prüfung: ${seiten.length} Seiten geprüft, ${indexierbare} indexierbar, keine Beanstandung. ` +
      `Build ${umgebung.indexierbar ? 'indexierbar' : 'nicht indexierbar'}.`,
  );
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
