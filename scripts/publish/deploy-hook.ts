/**
 * M17-03 — Den Build bei Cloudflare anstoßen.
 *
 * Zwei Dinge werden hier bewusst auseinandergehalten:
 *
 * 1. **Der Hook** — eine Adresse, die einen Build anstößt. Ob der Aufruf
 *    angekommen ist, sagt der HTTP-Status.
 * 2. **Der Build** — läuft danach bei Cloudflare. Ob er durchläuft, weiß
 *    dieser Lauf **nicht**. Ein 200 auf den Hook ist keine erfolgreiche
 *    Auslieferung, und dieser Lauf behauptet das auch nicht.
 *
 * Der Hook ist ein Secret der besonderen Art: sein Token steht im **Pfad**,
 * nicht in der Query. `ohneGeheimnis()` aus dem Commerce-Build würde ihn
 * mitprotokollieren. Deshalb hier eine eigene, strengere Kürzung auf den
 * Ursprung.
 */

/** Wohin ein Deploy-Hook zeigen darf. Alles andere wäre ein verschenktes Secret. */
export const ERLAUBTE_HOOK_HOSTS: readonly string[] = ['api.cloudflare.com'];

export type HookBefund = 'uebersprungen' | 'ausgeloest' | 'fehlgeschlagen';

export interface HookErgebnis {
  readonly befund: HookBefund;
  readonly meldung: string;
  /** Der HTTP-Status, sofern es überhaupt zu einer Antwort kam. */
  readonly status: number | null;
}

/** Nur Schema und Host. Der Pfad enthält den Token und wird nie protokolliert. */
export function nurUrsprung(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '<nicht parsebare Adresse>';
  }
}

export interface HookOptionen {
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
  readonly erlaubteHosts?: readonly string[];
}

/**
 * Stößt den Build an. Kein fehlendes Secret ist ein Fehler: ohne Hook wird
 * nichts angestoßen, und der Lauf sagt das deutlich, statt so zu tun, als
 * wäre etwas passiert.
 */
export async function loeseBuildAus(
  hookUrl: string | undefined | null,
  optionen: HookOptionen = {},
): Promise<HookErgebnis> {
  const { fetchImpl = fetch, timeoutMs = 20_000, erlaubteHosts = ERLAUBTE_HOOK_HOSTS } = optionen;

  if (hookUrl === null || hookUrl === undefined || hookUrl.trim() === '') {
    return {
      befund: 'uebersprungen',
      meldung:
        'Kein Deploy-Hook hinterlegt (Secret CLOUDFLARE_DEPLOY_HOOK). Es wird nichts angestoßen.',
      status: null,
    };
  }

  let ziel: URL;
  try {
    ziel = new URL(hookUrl.trim());
  } catch {
    return {
      befund: 'fehlgeschlagen',
      meldung: 'Der Hook ist keine gültige Adresse.',
      status: null,
    };
  }
  if (ziel.protocol !== 'https:') {
    return {
      befund: 'fehlgeschlagen',
      meldung: `Nur https ist zulässig, nicht "${ziel.protocol}".`,
      status: null,
    };
  }
  if (!erlaubteHosts.includes(ziel.host)) {
    return {
      befund: 'fehlgeschlagen',
      meldung: `Host ${ziel.host} ist für einen Deploy-Hook nicht zugelassen.`,
      status: null,
    };
  }

  let antwort: Response;
  try {
    antwort = await fetchImpl(ziel, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (fehler) {
    return {
      befund: 'fehlgeschlagen',
      meldung: `${nurUrsprung(hookUrl)} nicht erreichbar: ${(fehler as Error).message}`,
      status: null,
    };
  }

  if (!antwort.ok) {
    return {
      befund: 'fehlgeschlagen',
      meldung: `${nurUrsprung(hookUrl)} antwortet mit HTTP ${antwort.status}. Der Build wurde nicht angestoßen.`,
      status: antwort.status,
    };
  }

  return {
    befund: 'ausgeloest',
    meldung:
      `${nurUrsprung(hookUrl)} hat den Aufruf mit HTTP ${antwort.status} angenommen. ` +
      'Ob der Build durchläuft, sagt dieser Lauf nicht; dafür ist der Buildstatus bei Cloudflare zuständig.',
    status: antwort.status,
  };
}

async function main(): Promise<number> {
  const ergebnis = await loeseBuildAus(process.env.CLOUDFLARE_DEPLOY_HOOK);
  console.log(`${ergebnis.befund}: ${ergebnis.meldung}`);
  return ergebnis.befund === 'fehlgeschlagen' ? 1 : 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(await main());
}
