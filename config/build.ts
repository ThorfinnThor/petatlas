/**
 * M01-05 — Explizite Build-Modi.
 *
 * Leitsatz: Eine **fehlende** Umgebungsvariable darf niemals zu einem
 * veröffentlichungsfähigen Ergebnis führen. Ohne Angabe gilt `development` —
 * der Modus mit synthetischen Fixtures, sichtbarem Testdatenhinweis und
 * `noindex`. Nur eine ausdrückliche, vollständige Konfiguration erzeugt
 * `production`.
 */
import launch from './launch.json' with { type: 'json' };
import { type BuildMode, createSiteConfig, type OperatorInfo, readBuildMode } from './site.ts';

export type DataSource = 'fixtures' | 'published';

export interface BuildConfig {
  readonly mode: BuildMode;
  /** Woher fachliche Daten stammen dürfen. `fixtures` ist nie öffentlich. */
  readonly dataSource: DataSource;
  /** Sichtbarer Hinweis, dass angezeigte Daten synthetisch sind. */
  readonly showTestDataBanner: boolean;
  /** Nur production darf indexierbar sein — und nur nach Launch-Freigabe. */
  readonly indexable: boolean;
  /** Affiliate-Ausgabe hängt zusätzlich an einem freigegebenen Gate. */
  readonly affiliateEnabled: boolean;
  readonly baseUrl: string;
}

export class BuildConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BuildConfigError';
  }
}

/** Ein Gate gilt nur als erfüllt, wenn es ausdrücklich auf true steht. */
function gateApproved(name: keyof typeof launch.gates): boolean {
  return launch.gates[name]?.approved === true;
}

function fixturesRequested(env: Record<string, string | undefined>): boolean {
  return env.USE_FIXTURES === 'true' || env.USE_FIXTURES === '1';
}

/**
 * Baut die Build-Konfiguration oder scheitert.
 *
 * `production` verlangt:
 *   - eine echte `PUBLIC_SITE_URL` und vollständige Betreiberangaben (M00-03),
 *   - eine dokumentierte Launch-Freigabe in `config/launch.json`,
 *   - dass keine Fixtures angefordert werden.
 */
export function resolveBuildConfig(
  env: Record<string, string | undefined> = process.env,
  operator?: OperatorInfo,
): BuildConfig {
  const mode = readBuildMode(env);

  if (mode === 'production') {
    if (fixturesRequested(env)) {
      throw new BuildConfigError(
        'production darf keine Fixtures ausliefern. USE_FIXTURES ist in production unzulässig.',
      );
    }
    if (launch.publicRelease.approved !== true) {
      throw new BuildConfigError(
        'production ist gesperrt: config/launch.json meldet publicRelease.approved=false. ' +
          'Die Launch-Gates aus docs/QUALITY_GATES.md sind nicht dokumentiert erfüllt.',
      );
    }
  }

  // Wirft, wenn Domain oder Betreiberangaben in production fehlen.
  const site = createSiteConfig(mode, env, operator);

  if (mode === 'development') {
    return {
      mode,
      dataSource: 'fixtures',
      showTestDataBanner: true,
      indexable: false,
      affiliateEnabled: false,
      baseUrl: site.baseUrl,
    };
  }

  if (mode === 'preview') {
    const useFixtures = fixturesRequested(env);
    return {
      mode,
      dataSource: useFixtures ? 'fixtures' : 'published',
      // Auch ohne Fixtures bleibt preview als Nicht-Produktion erkennbar.
      showTestDataBanner: useFixtures,
      indexable: false,
      // Partnerfunktionen bleiben im Preview grundsätzlich aus (ADR-008).
      affiliateEnabled: false,
      baseUrl: site.baseUrl,
    };
  }

  return {
    mode,
    dataSource: 'published',
    showTestDataBanner: false,
    indexable: true,
    affiliateEnabled: gateApproved('commerceAffiliate'),
    baseUrl: site.baseUrl,
  };
}

/** Meta-robots-Wert für eine Seite. Nicht indexierbar heißt immer `noindex`. */
export function robotsDirective(config: BuildConfig): string {
  return config.indexable ? 'index, follow' : 'noindex, nofollow';
}
