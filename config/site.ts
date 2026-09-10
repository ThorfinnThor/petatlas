/**
 * M00-03 — Zentrale Benennung, Basisdomain und Betreiberangaben.
 *
 * Einzige Quelle für Produktname, Domain und Impressumsdaten. Fachlogik
 * (Rechner, Karte, Reisecheck, Katalog) importiert diese Werte und schreibt
 * sie nicht selbst. Ein Namenswechsel ist dadurch eine Änderung an dieser
 * Datei plus Übersetzungstexten, kein projektweites Suchen/Ersetzen.
 *
 * "PetAtlas" ist ein austauschbarer interner Arbeitstitel. Es ist keine
 * geprüfte Marke; Verfügbarkeit oder Schutzfähigkeit werden nicht behauptet.
 */

export type BuildMode = 'development' | 'preview' | 'production';

/** Betreiberangaben. `null` bedeutet: noch nicht vom Betreiber geliefert. */
export interface OperatorInfo {
  readonly legalName: string | null;
  readonly address: string | null;
  readonly contactEmail: string | null;
  readonly responsibleForContent: string | null;
  readonly registerEntry: string | null;
  readonly vatId: string | null;
}

export interface SiteConfig {
  readonly brandName: string;
  readonly brandNameIsWorkingTitle: boolean;
  readonly defaultMarketId: string;
  readonly baseUrl: string;
  readonly operator: OperatorInfo;
}

/** Nur in development/preview zulässig; RFC 6761 reserviert `.invalid`. */
export const DEVELOPMENT_BASE_URL = 'https://example.invalid';

const OPERATOR_UNKNOWN: OperatorInfo = {
  legalName: null,
  address: null,
  contactEmail: null,
  responsibleForContent: null,
  registerEntry: null,
  vatId: null,
};

export function readBuildMode(env: Record<string, string | undefined>): BuildMode {
  const raw = env.BUILD_MODE ?? 'development';
  if (raw === 'development' || raw === 'preview' || raw === 'production') return raw;
  throw new Error(`BUILD_MODE muss development, preview oder production sein, nicht "${raw}".`);
}

/**
 * Baut die Site-Konfiguration für einen Build-Modus.
 *
 * production verlangt eine echte, konfigurierte Basis-URL und vollständige
 * Betreiberangaben. Fehlen sie, scheitert der Build — er fällt nicht still
 * auf einen Platzhalter zurück. development/preview arbeiten ohne echte
 * Domain weiter, damit lokale Entwicklung nicht blockiert ist.
 */
export function createSiteConfig(
  mode: BuildMode,
  env: Record<string, string | undefined>,
  operator: OperatorInfo = readOperator(env),
): SiteConfig {
  const configuredUrl = env.PUBLIC_SITE_URL?.trim();
  let parsed: URL | null = null;
  try {
    parsed = configuredUrl ? new URL(configuredUrl) : null;
  } catch {
    /* validated below */
  }
  const isPlaceholder =
    !parsed ||
    parsed.protocol !== 'https:' ||
    parsed.hostname.endsWith('.invalid') ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.search !== '' ||
    parsed.hash !== '' ||
    parsed.pathname !== '/';

  if (mode === 'production') {
    if (isPlaceholder) {
      throw new Error(
        'production benötigt eine echte PUBLIC_SITE_URL. Die Platzhalterdomain example.invalid ist gesperrt (M00-03).',
      );
    }
    const missing = (Object.keys(operator) as (keyof OperatorInfo)[]).filter(
      (key) => !operator[key]?.trim() && key !== 'registerEntry' && key !== 'vatId',
    );
    if (operator.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(operator.contactEmail)) {
      throw new Error('Betreiberangaben: contactEmail ist ungültig.');
    }
    if (missing.length > 0) {
      throw new Error(
        `production benötigt echte Betreiberangaben. Fehlend: ${missing.join(', ')}. Keine erfundenen Rechtsangaben (ADR-015).`,
      );
    }
  }

  return {
    brandName: env.PUBLIC_BRAND_NAME?.trim() || 'Wau & Miau',
    brandNameIsWorkingTitle: true,
    defaultMarketId: 'DE',
    baseUrl: isPlaceholder ? DEVELOPMENT_BASE_URL : (configuredUrl ?? DEVELOPMENT_BASE_URL),
    operator,
  };
}

/** Public business information only; never credentials. */
export function readOperator(env: Record<string, string | undefined>): OperatorInfo {
  const keys: Record<keyof OperatorInfo, string> = {
    legalName: 'OPERATOR_LEGAL_NAME',
    address: 'OPERATOR_ADDRESS',
    contactEmail: 'OPERATOR_CONTACT_EMAIL',
    responsibleForContent: 'OPERATOR_RESPONSIBLE',
    registerEntry: 'OPERATOR_REGISTER_ENTRY',
    vatId: 'OPERATOR_VAT_ID',
  };
  return Object.fromEntries(
    Object.entries(keys).map(([key, name]) => [
      key,
      env[name]?.trim() || OPERATOR_UNKNOWN[key as keyof OperatorInfo],
    ]),
  ) as unknown as OperatorInfo;
}
