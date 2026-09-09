/**
 * M22-02 — Laufzeitprüfungen ohne Schemabibliothek.
 *
 * Die Fachschemas in `src/domain/schemas/` bleiben die Wahrheit. Sie
 * beschreiben mehr, als der Browser braucht, und sie bringen dafür 87 KiB
 * Bibliothek mit — auf jeder Seite, die irgendetwas nachlädt. Gemessen:
 * Rechner 98 KiB, Reisecheck 113,8 KiB, Futter 95,6 KiB JavaScript beim
 * ersten Laden, bei einem Budget von 60 KiB.
 *
 * Deshalb steht hier eine zweite, kleine Prüfung — **nicht** eine
 * schwächere:
 *
 * - Sie ist von Hand geschrieben und ohne Abhängigkeit.
 * - Sie prüft genau die Formen, die im Browser tatsächlich zur Laufzeit
 *   ankommen: nachgeladene Datenchunks, der lokale Speicher und eine vom
 *   Nutzer gewählte Datei. Alles andere ist zur Bauzeit konstant und wird
 *   dort geprüft (`npm run check:content`), nicht bei jedem Seitenaufruf.
 * - Dass sie dasselbe sagt wie das Schema, ist keine Behauptung: für jede
 *   Form vergleicht `tests/runtime-guards.test.ts` beide über echte Daten
 *   **und** über gezielt kaputt gemachte Fassungen. Sagen sie
 *   Unterschiedliches, ist der Test rot.
 *
 * Der Grundsatz bleibt: unbekannt ist nicht gültig. Jede Prüfung lehnt ab,
 * was sie nicht kennt — auch ein zusätzliches Feld, weil ein unerwartetes
 * Feld bedeutet, dass die Daten aus einer anderen Welt stammen.
 */

/** Ein Objekt, das kein Array und kein `null` ist. */
function objekt(wert: unknown): wert is Record<string, unknown> {
  return typeof wert === 'object' && wert !== null && !Array.isArray(wert);
}

/** Genau die erwarteten Schlüssel, nicht mehr und nicht weniger. */
function nurSchluessel(wert: Record<string, unknown>, erlaubt: readonly string[]): boolean {
  const schluessel = Object.keys(wert);
  if (schluessel.length !== erlaubt.length) return false;
  return schluessel.every((eintrag) => erlaubt.includes(eintrag));
}

function text(wert: unknown, mindestens = 1, hoechstens = Number.POSITIVE_INFINITY): boolean {
  return typeof wert === 'string' && wert.length >= mindestens && wert.length <= hoechstens;
}

function ganzzahl(wert: unknown): boolean {
  return typeof wert === 'number' && Number.isInteger(wert);
}

/** `YYYY-MM-DD`, und der Tag muss es wirklich geben. */
export function istKalenderdatum(wert: unknown): wert is string {
  if (typeof wert !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(wert)) return false;
  const zeit = Date.parse(`${wert}T00:00:00Z`);
  if (Number.isNaN(zeit)) return false;
  return new Date(zeit).toISOString().slice(0, 10) === wert;
}

/** Zeitpunkt mit ausdrücklichem Zonenversatz. Ohne Versatz ist er mehrdeutig. */
export function istZeitpunkt(wert: unknown): wert is string {
  if (typeof wert !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(wert)) return false;
  return !Number.isNaN(Date.parse(wert));
}

const TIERARTEN = ['dog', 'cat', 'other'];

// ---------------------------------------------------------------------------
// Nachgeladene Datenchunks
// ---------------------------------------------------------------------------

const FEE_ITEM_FELDER = [
  'officialItemId',
  'catalogVersion',
  'originalLabel',
  'species',
  'baseUnit',
  'baseAmountMinor',
  'currency',
  'sourceReference',
  'validity',
] as const;

function istGeltung(wert: unknown): boolean {
  if (!objekt(wert) || !nurSchluessel(wert, ['from', 'until'])) return false;
  if (!istKalenderdatum(wert.from)) return false;
  return wert.until === null || istKalenderdatum(wert.until);
}

/** Eine Gebührenposition, wie sie aus `/data/v1/fees/…` kommt. */
export function istGebuehrenposition(wert: unknown): boolean {
  if (!objekt(wert) || !nurSchluessel(wert, FEE_ITEM_FELDER)) return false;
  if (!text(wert.officialItemId) || !text(wert.catalogVersion)) return false;
  if (!text(wert.originalLabel) || !text(wert.baseUnit) || !text(wert.sourceReference))
    return false;
  if (wert.species !== null && !TIERARTEN.includes(wert.species as string)) return false;
  // Geldbeträge sind ganzzahlige Untereinheiten und nie negativ.
  if (!ganzzahl(wert.baseAmountMinor) || (wert.baseAmountMinor as number) < 0) return false;
  if (typeof wert.currency !== 'string' || !/^[A-Z]{3}$/.test(wert.currency)) return false;
  return istGeltung(wert.validity);
}

// ---------------------------------------------------------------------------
// Lokaler Speicher
// ---------------------------------------------------------------------------

const PROFIL_FELDER = [
  'profileId',
  'schemaVersion',
  'species',
  'displayName',
  'birthDate',
  'weightGrams',
  'breed',
] as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Das lokale Tierprofil. */
export function istTierprofil(wert: unknown): boolean {
  if (!objekt(wert) || !nurSchluessel(wert, PROFIL_FELDER)) return false;
  if (typeof wert.profileId !== 'string' || !UUID.test(wert.profileId)) return false;
  if (wert.schemaVersion !== 1) return false;
  if (typeof wert.species !== 'string' || !TIERARTEN.includes(wert.species)) return false;
  if (!text(wert.displayName, 1, 40)) return false;
  if (wert.birthDate !== null && !istKalenderdatum(wert.birthDate)) return false;
  if (
    wert.weightGrams !== null &&
    (!ganzzahl(wert.weightGrams) || (wert.weightGrams as number) <= 0)
  )
    return false;
  return wert.breed === null || text(wert.breed, 0, 60);
}

function istKoordinate(wert: unknown): boolean {
  if (!objekt(wert) || !nurSchluessel(wert, ['latitude', 'longitude'])) return false;
  const { latitude, longitude } = wert;
  if (typeof latitude !== 'number' || !Number.isFinite(latitude)) return false;
  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) return false;
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

const MERK_ARTEN = ['place', 'food'];

/** Ein Eintrag der Merkliste. */
export function istMerkEintrag(wert: unknown): boolean {
  if (!objekt(wert) || !nurSchluessel(wert, ['kind', 'id', 'coordinates', 'addedAt'])) return false;
  if (typeof wert.kind !== 'string' || !MERK_ARTEN.includes(wert.kind)) return false;
  if (!text(wert.id, 1, 120)) return false;
  if (!istZeitpunkt(wert.addedAt)) return false;
  if (wert.coordinates !== null && !istKoordinate(wert.coordinates)) return false;
  // Ein gemerkter Ort ohne Koordinate ist nicht wiederzufinden.
  return !(wert.kind === 'place' && wert.coordinates === null);
}

/** Die Merkliste. `hoechstens` kommt aus dem Aufrufer, damit es eine Zahl gibt. */
export function istMerkliste(wert: unknown, hoechstens: number): boolean {
  if (!objekt(wert) || !nurSchluessel(wert, ['version', 'entries'])) return false;
  if (wert.version !== 1) return false;
  if (!Array.isArray(wert.entries) || wert.entries.length > hoechstens) return false;
  return wert.entries.every((eintrag) => istMerkEintrag(eintrag));
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Der Abhakstand der Packlisten. */
export function istPackStand(wert: unknown): boolean {
  if (!objekt(wert) || !nurSchluessel(wert, ['version', 'ziele', 'updatedAt'])) return false;
  if (wert.version !== 1) return false;
  if (!istZeitpunkt(wert.updatedAt)) return false;
  if (!objekt(wert.ziele)) return false;
  for (const [ziel, eintraege] of Object.entries(wert.ziele)) {
    if (!SLUG.test(ziel)) return false;
    if (!Array.isArray(eintraege) || eintraege.length > 200) return false;
    if (!eintraege.every((eintrag) => typeof eintrag === 'string' && SLUG.test(eintrag))) {
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Vom Nutzer gewählte Datei
// ---------------------------------------------------------------------------

/** Die Exportdatei des lokalen Profils. */
export function istExportDatei(
  wert: unknown,
  format: string,
  version: number,
  merklisteMax: number,
): boolean {
  if (
    !objekt(wert) ||
    !nurSchluessel(wert, [
      'format',
      'version',
      'exportedAt',
      'profile',
      'interests',
      'favorites',
      'packing',
    ])
  ) {
    return false;
  }
  if (wert.format !== format || wert.version !== version) return false;
  if (!istZeitpunkt(wert.exportedAt)) return false;
  if (wert.profile !== null && !istTierprofil(wert.profile)) return false;
  if (!Array.isArray(wert.interests) || !wert.interests.every((e) => typeof e === 'string')) {
    return false;
  }
  if (wert.favorites !== null && !istMerkliste(wert.favorites, merklisteMax)) return false;
  return wert.packing === null || istPackStand(wert.packing);
}
