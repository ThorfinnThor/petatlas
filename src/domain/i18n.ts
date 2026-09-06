/**
 * M03-06 — Textkataloge je Locale.
 *
 * Jeder Katalog steht für sich. Es gibt bewusst **keinen** stillen Rückfall
 * von einem Locale auf ein anderes: ein fehlender englischer Text darf nicht
 * als deutscher Satz in einer englischen Ansicht erscheinen, und das Laden
 * einer Testansicht darf den deutschen Katalog nicht verändern.
 *
 * Ein fehlender Schlüssel ist ein Fehler, keine Gelegenheit zum Raten.
 */
import de from '../../config/locales/de-DE.json' with { type: 'json' };
import en from '../../config/locales/en-US.json' with { type: 'json' };

export type LocaleId = 'de-DE' | 'en-US';

type Catalog = Readonly<Record<string, string>>;

const CATALOGS: Readonly<Record<LocaleId, Catalog>> = Object.freeze({
  'de-DE': Object.freeze({ ...de.strings }),
  'en-US': Object.freeze({ ...en.strings }),
});

export class TranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranslationError';
  }
}

export function availableLocales(): readonly LocaleId[] {
  return Object.keys(CATALOGS) as LocaleId[];
}

/** Der Katalog eines Locales, unveränderlich. */
export function catalog(locale: LocaleId): Catalog {
  const found = CATALOGS[locale];
  if (!found) throw new TranslationError(`Kein Textkatalog für ${locale}.`);
  return found;
}

/**
 * Übersetzt einen Schlüssel. Platzhalter der Form `{name}` werden ersetzt;
 * ein nicht belegter Platzhalter ist ein Fehler, damit keine geschweiften
 * Klammern in der Oberfläche landen.
 */
export function translate(
  locale: LocaleId,
  key: string,
  values: Readonly<Record<string, string>> = {},
): string {
  const text = catalog(locale)[key];
  if (text === undefined) {
    throw new TranslationError(
      `Kein Text für "${key}" in ${locale}. Kein Rückfall auf ein anderes Locale.`,
    );
  }
  return text.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = values[name];
    if (value === undefined) {
      throw new TranslationError(`Platzhalter "${name}" in "${key}" ist nicht belegt.`);
    }
    return value;
  });
}
