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

export interface Weiterleitungsregel {
  readonly quelle: string;
  readonly ziel: string;
  readonly status: number;
}

/**
 * Liest die von Cloudflare unterstützte einfache `_redirects`-Syntax.
 * Ungültige Zeilen bleiben als Regel mit Status 0 sichtbar, damit der Gate
 * sie nicht genauso still ignoriert wie die Plattform.
 */
export function leseWeiterleitungen(inhalt: string): Weiterleitungsregel[] {
  return inhalt
    .split(/\r?\n/)
    .map((zeile) => zeile.trim())
    .filter((zeile) => zeile !== '' && !zeile.startsWith('#'))
    .map((zeile) => {
      const teile = zeile.split(/\s+/);
      return {
        quelle: teile[0] ?? '',
        ziel: teile[1] ?? '',
        status: teile.length === 3 ? Number(teile[2]) : 302,
      };
    });
}

/** Der Root muss ohne JavaScript und ohne Kette auf den einzigen Markt führen. */
export function pruefeWeiterleitungen(
  inhalt: string | null,
  seiten: readonly Seite[],
): Beanstandung[] {
  if (inhalt === null) {
    return [
      { pfad: '/_redirects', problem: 'Fehlt; der Root bliebe eine HTML-Meta-Weiterleitung.' },
    ];
  }

  const regeln = leseWeiterleitungen(inhalt);
  const beanstandungen: Beanstandung[] = [];
  const root = regeln.find((regel) => regel.quelle === '/');
  if (root === undefined) {
    beanstandungen.push({ pfad: '/', problem: 'Kein serverseitiger Root-Redirect.' });
    return beanstandungen;
  }
  if (root.ziel !== '/de-de/') {
    beanstandungen.push({
      pfad: '/',
      problem: `Root-Redirect zeigt auf ${root.ziel} statt /de-de/.`,
    });
  }
  if (root.status !== 301 && root.status !== 308) {
    beanstandungen.push({
      pfad: '/',
      problem: `Root-Redirect ist ${root.status || 'ungültig'} statt dauerhaft (301/308).`,
    });
  }
  if (!seiten.some((seite) => seite.pfad === root.ziel)) {
    beanstandungen.push({ pfad: '/', problem: `Redirect-Ziel ${root.ziel} ist nicht gebaut.` });
  }
  if (regeln.some((regel) => regel.quelle === root.ziel)) {
    beanstandungen.push({ pfad: '/', problem: `Redirect-Kette über ${root.ziel}.` });
  }
  return beanstandungen;
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
  // `data-pagefind-ignore` kennzeichnet eine bewusste Seitenausnahme. Ein
  // Preview-Build trägt dagegen global noindex, soll aber weiterhin so
  // geprüft werden, als würden seine vorgesehenen Landingpages indexiert.
  const bewusstNichtIndexierbar = sollNieIndexiertWerden || kopf.pagefindIgnoriert;
  const wieIndexierbar =
    umgebung.alsIndexierbar === true ? !bewusstNichtIndexierbar : !nichtIndexierbar(kopf);
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
    if (kopf.beschreibung === null || kopf.beschreibung.trim() === '') {
      melde('Indexierbare Seite ohne Meta-Description.');
    }
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

function hauptinhalt(html: string): string {
  const anfang = html.indexOf('<main id="inhalt"');
  const ende = html.indexOf('<footer', anfang);
  if (anfang === -1) return html;
  return html.slice(anfang, ende === -1 ? undefined : ende);
}

/**
 * Zusätzliche Output-Regeln für die Templates, bei denen ein formal sauberes
 * `<head>` allein nicht genügt. Sie prüfen sichtbare Nachweise im gebauten
 * Hauptinhalt und nicht bloß Datenfelder im Quellcode.
 */
export function pruefeSensiblenInhalt(pfad: string, html: string): Beanstandung[] {
  const inhalt = hauptinhalt(html);
  const beanstandungen: Beanstandung[] = [];
  const melde = (problem: string): void => {
    beanstandungen.push({ pfad, problem });
  };
  const hatInternenLink = /<a\b[^>]+href=["']\/de-de\//i.test(inhalt);

  const istKosten = pfad.startsWith('/de-de/tierarztkosten/');
  const istReise = pfad.startsWith('/de-de/reisecheck/');
  const istStadt = /^\/de-de\/tierarzt-karte\/[^/]+\/$/.test(pfad);
  const istRatgeber = /^\/de-de\/ratgeber\/[^/]+\/$/.test(pfad);
  const istSensiblerRatgeber = [
    '/de-de/ratgeber/tierarztrechnung-verstehen/',
    '/de-de/ratgeber/reise-vorbereiten/',
  ].includes(pfad);
  const istErgaenzung = pfad === '/de-de/ergaenzungsfuttermittel/';
  const istProduktOderRatgeber = istRatgeber || /^\/de-de\/(?:futter|pflege)\/[^/]+\/$/.test(pfad);
  const istTransparenz = ['/de-de/methodik/', '/de-de/quellen/'].includes(pfad);

  if (!(
    istKosten ||
    istReise ||
    istStadt ||
    istProduktOderRatgeber ||
    istErgaenzung ||
    istTransparenz
  )) {
    return beanstandungen;
  }

  if (!hatInternenLink) melde('Kein crawlbarer interner Link im Hauptinhalt.');

  if (istKosten || istReise || istSensiblerRatgeber || istErgaenzung) {
    if (!/data-review-status=["'](?:pending|approved)["']/i.test(inhalt)) {
      melde('Kein technisch eindeutiger fachlicher Reviewstatus im Hauptinhalt.');
    }
    if (!/data-last-verified-at=["']\d{4}-\d{2}-\d{2}["']/i.test(inhalt)) {
      melde('Kein Datum der letzten Quellenprüfung am Reviewstatus.');
    }
    if (!/(?:Quelle|Fundstelle|Rechtsgrundlage|Bezogen über)/i.test(inhalt)) {
      melde('Kein sichtbarer Quellen- oder Fundstellenhinweis.');
    }
    const hatTechnischenVerantwortungsnachweis =
      /data-review-(?:approved-by|responsibility)=["'][^"']+["']/i.test(inhalt);
    if (!hatTechnischenVerantwortungsnachweis) {
      melde('Kein fachlicher Verantwortungsnachweis.');
    }
  }

  if (istKosten && !/Datenstand:/i.test(inhalt)) {
    melde('GOT-/Kostenseite ohne sichtbaren Datenstand.');
  }

  if (istStadt) {
    if (!/Datenstand:/i.test(inhalt)) melde('Ortsseite ohne sichtbaren Datenstand.');
    if (!/(?:<h2[^>]*>Quelle|Quelle:)/i.test(inhalt)) melde('Ortsseite ohne Quellenhinweis.');
  }

  if (istRatgeber) {
    if (!/Quellen und Einordnung/i.test(inhalt)) melde('Ratgeber ohne Quellenabschnitt.');
    if (!/\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2}/.test(inhalt)) {
      melde('Ratgeber ohne sichtbaren redaktionellen Stand.');
    }

    // Nur bewusst freigegebene Ratgeber müssen dieses Qualitätsniveau
    // erreichen. Dünne Übergangsseiten bleiben erreichbar, aber mit noindex
    // und außerhalb der internen Suche.
    if (!leseKopf(html).pagefindIgnoriert) {
      const textlaenge = inhalt
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim().length;
      const zwischenueberschriften = [...inhalt.matchAll(/<h2\b/gi)].length;
      const externeQuellen = [...inhalt.matchAll(/<a\b[^>]+href=["']https:\/\/[^"']+["']/gi)]
        .length;
      if (textlaenge < 3_500) melde('Indexierbarer Ratgeber ist inhaltlich zu knapp.');
      if (zwischenueberschriften < 4) melde('Indexierbarer Ratgeber hat zu wenig Substanzblöcke.');
      if (externeQuellen < 2)
        melde('Indexierbarer Ratgeber nennt weniger als zwei externe Quellen.');
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
    beanstandungen.push(...pruefeSensiblenInhalt(seite.pfad, html));
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

  const redirectsPfad = join(wurzel, '_redirects');
  const redirects = existsSync(redirectsPfad) ? readFileSync(redirectsPfad, 'utf8') : null;
  beanstandungen.push(...pruefeWeiterleitungen(redirects, seiten));

  const robotsPfad = join(wurzel, 'robots.txt');
  if (!existsSync(robotsPfad)) {
    beanstandungen.push({ pfad: '/robots.txt', problem: 'Fehlt.' });
  } else if (
    !umgebung.indexierbar &&
    !/^Disallow:\s*\/de-de\/$/m.test(readFileSync(robotsPfad, 'utf8'))
  ) {
    beanstandungen.push({
      pfad: '/robots.txt',
      problem: 'Dieser Build ist nicht indexierbar, aber robots.txt sperrt die Marktseiten nicht.',
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
