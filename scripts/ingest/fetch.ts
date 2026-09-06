/**
 * M06-02 — Sicherer Abruf.
 *
 * Der Fetcher nimmt **keine URL** entgegen, sondern eine Quell-ID. Die
 * Adresse kommt aus der Source Registry. Damit kann keine Eingabe von außen
 * — keine Benutzereingabe, kein Feldwert aus einer Datei, keine Umleitung —
 * bestimmen, was abgerufen wird.
 *
 * Weitere Grenzen:
 * - nur `https:`; andere Schemata werden abgelehnt, `file:`, `data:` und
 *   `javascript:` ausdrücklich,
 * - nur Hosts, die in der Registry stehen (Allowlist),
 * - jede Weiterleitung wird einzeln gegen dieselben Regeln geprüft,
 * - Zeitlimit je Versuch und Größenlimit für den Körper,
 * - `Retry-After` wird beachtet, aber gedeckelt; keine aggressiven Schleifen,
 * - Logs enthalten nie Query oder Fragment, weil dort Zugangsdaten stehen
 *   können.
 */
import { createHash } from 'node:crypto';

import { allSources, requireSource } from '../../src/domain/source-registry.ts';
import { IngestError, type FetchedResource } from './types.ts';

export interface FetchOptions {
  /** Zeitlimit je Versuch in Millisekunden. */
  readonly timeoutMs?: number;
  /** Größenlimit des Körpers in Byte. */
  readonly maxBytes?: number;
  /** Wie viele Weiterleitungen höchstens verfolgt werden. */
  readonly maxRedirects?: number;
  /** Wie oft bei 429/503 höchstens erneut versucht wird. */
  readonly maxRetries?: number;
  /** Obergrenze für `Retry-After`, damit ein Lauf nicht endlos wartet. */
  readonly maxRetryDelayMs?: number;
  /** Bedingter Abruf: spart Bandbreite und schont die Quelle. */
  readonly etag?: string | null;
  readonly lastModified?: string | null;
  /** Nur für Tests. Standard ist das globale `fetch`. */
  readonly fetchImpl?: typeof fetch;
  /** Nur für Tests. Standard ist echtes Warten. */
  readonly sleep?: (ms: number) => Promise<void>;
}

const DEFAULTS = {
  timeoutMs: 30_000,
  maxBytes: 64 * 1024 * 1024,
  maxRedirects: 3,
  maxRetries: 2,
  maxRetryDelayMs: 60_000,
} as const;

/** Hosts, die überhaupt abgerufen werden dürfen: die der erfassten Quellen. */
export function allowedHosts(): ReadonlySet<string> {
  const hosts = new Set<string>();
  for (const quelle of allSources()) {
    hosts.add(new URL(quelle.distributionUrl).host);
  }
  return hosts;
}

/** Adresse ohne Query und Fragment. Für Logs und Fehlermeldungen. */
export function safeUrlForLog(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return '<nicht parsebare Adresse>';
  }
}

export function assertAllowedUrl(sourceId: string, url: string, hosts: ReadonlySet<string>): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (cause) {
    throw new IngestError(sourceId, 'fetch', 'Adresse ist nicht parsebar.', { cause });
  }

  if (parsed.protocol !== 'https:') {
    throw new IngestError(
      sourceId,
      'fetch',
      `Nur https ist zulässig, nicht "${parsed.protocol}" (${safeUrlForLog(url)}).`,
    );
  }
  if (!hosts.has(parsed.host)) {
    throw new IngestError(
      sourceId,
      'fetch',
      `Host ${parsed.host} steht nicht in der Source Registry. Weiterleitung oder Adresse prüfen.`,
    );
  }
  return parsed;
}

function parseRetryAfter(header: string | null, maxDelayMs: number): number | null {
  if (header === null) return null;
  const sekunden = Number(header);
  if (Number.isFinite(sekunden) && sekunden >= 0) return Math.min(sekunden * 1000, maxDelayMs);
  const datum = Date.parse(header);
  if (Number.isNaN(datum)) return null;
  return Math.min(Math.max(datum - Date.now(), 0), maxDelayMs);
}

async function readLimitedBody(
  sourceId: string,
  response: Response,
  maxBytes: number,
): Promise<Uint8Array> {
  const angekuendigt = response.headers.get('content-length');
  if (angekuendigt !== null && Number(angekuendigt) > maxBytes) {
    throw new IngestError(
      sourceId,
      'fetch',
      `Antwort kündigt ${angekuendigt} Byte an, Grenze ist ${maxBytes}.`,
    );
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength > maxBytes) {
    throw new IngestError(
      sourceId,
      'fetch',
      `Antwort ist ${buffer.byteLength} Byte groß, Grenze ist ${maxBytes}.`,
    );
  }
  return buffer;
}

export interface FetchOutcome {
  readonly status: 'fetched' | 'not_modified';
  readonly resource: FetchedResource | null;
}

/**
 * Ruft die Distribution einer registrierten Quelle ab.
 *
 * `not_modified` ist ein reguläres Ergebnis: die Quelle hat sich seit dem
 * letzten Abruf nicht geändert, und der vorhandene Snapshot bleibt gültig.
 */
export async function fetchSource(
  sourceId: string,
  options: FetchOptions = {},
): Promise<FetchOutcome> {
  const quelle = requireSource(sourceId);
  const hosts = allowedHosts();
  const {
    timeoutMs = DEFAULTS.timeoutMs,
    maxBytes = DEFAULTS.maxBytes,
    maxRedirects = DEFAULTS.maxRedirects,
    maxRetries = DEFAULTS.maxRetries,
    maxRetryDelayMs = DEFAULTS.maxRetryDelayMs,
    etag = null,
    lastModified = null,
    fetchImpl = fetch,
    sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = options;

  const kopfzeilen: Record<string, string> = { accept: '*/*' };
  if (etag !== null) kopfzeilen['if-none-match'] = etag;
  if (lastModified !== null) kopfzeilen['if-modified-since'] = lastModified;

  let ziel = assertAllowedUrl(sourceId, quelle.distributionUrl, hosts);
  let weiterleitungen = 0;
  let versuche = 0;

  for (;;) {
    const abbruch = AbortSignal.timeout(timeoutMs);
    const antwort = await fetchImpl(ziel, {
      redirect: 'manual',
      headers: kopfzeilen,
      signal: abbruch,
    });

    if (antwort.status === 304) {
      return { status: 'not_modified', resource: null };
    }

    if (antwort.status === 429 || antwort.status === 503) {
      if (versuche >= maxRetries) {
        throw new IngestError(
          sourceId,
          'fetch',
          `Quelle antwortet weiterhin mit ${antwort.status} nach ${versuche + 1} Versuchen.`,
        );
      }
      versuche += 1;
      const warten = parseRetryAfter(antwort.headers.get('retry-after'), maxRetryDelayMs);
      // Ohne Retry-After konservativ warten statt sofort erneut anzufragen.
      await sleep(warten ?? Math.min(5000 * versuche, maxRetryDelayMs));
      continue;
    }

    if (antwort.status >= 300 && antwort.status < 400) {
      const ort = antwort.headers.get('location');
      if (ort === null) {
        throw new IngestError(sourceId, 'fetch', `Weiterleitung ${antwort.status} ohne Location.`);
      }
      if (weiterleitungen >= maxRedirects) {
        throw new IngestError(sourceId, 'fetch', `Mehr als ${maxRedirects} Weiterleitungen.`);
      }
      weiterleitungen += 1;
      // Jede einzelne Zieladresse wird erneut geprüft, nicht nur die erste.
      ziel = assertAllowedUrl(sourceId, new URL(ort, ziel).toString(), hosts);
      continue;
    }

    if (!antwort.ok) {
      throw new IngestError(
        sourceId,
        'fetch',
        `${safeUrlForLog(ziel.toString())} antwortet mit ${antwort.status}.`,
      );
    }

    const body = await readLimitedBody(sourceId, antwort, maxBytes);
    if (body.byteLength === 0) {
      throw new IngestError(sourceId, 'fetch', 'Antwort ist leer.');
    }

    return {
      status: 'fetched',
      resource: {
        sourceId,
        url: ziel.toString(),
        body,
        contentType: antwort.headers.get('content-type'),
        contentHash: createHash('sha256').update(body).digest('hex'),
        retrievedAt: new Date().toISOString(),
        etag: antwort.headers.get('etag'),
        lastModified: antwort.headers.get('last-modified'),
      },
    };
  }
}
