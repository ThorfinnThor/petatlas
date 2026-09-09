/**
 * M21-01 — Das Vokabular der Komponentenbibliothek.
 *
 * Die erlaubten Werte stehen hier und nicht in jeder Komponente einzeln,
 * damit Komponente und Test dieselbe Liste lesen. Wer eine Variante
 * hinzufügt, ändert genau eine Datei — und die Tests sehen es.
 *
 * Der Designvertrag zählt in Abschnitt 11.2, 15.1 und 16 jeweils
 * **abgeschlossene** Listen auf. Diese Datei nimmt das ernst: es gibt keinen
 * Freitext für eine Badge-Beschriftung und keine „sonstige“ Variante.
 */

/** Abschnitt 11.2. Ohne Angabe gilt sekundär: eine primäre Aktion je Bereich. */
export const BUTTON_VARIANTEN = ['primaer', 'sekundaer', 'soft', 'ghost', 'gefahr'] as const;
export type ButtonVariante = (typeof BUTTON_VARIANTEN)[number];

/** Abschnitt 11.1. */
export const BUTTON_GROESSEN = ['klein', 'mittel', 'gross'] as const;
export type ButtonGroesse = (typeof BUTTON_GROESSEN)[number];

/** Abschnitt 16. */
export const ALERT_VARIANTEN = ['info', 'erfolg', 'warnung', 'fehler'] as const;
export type AlertVariante = (typeof ALERT_VARIANTEN)[number];

/** Abschnitt 7.1. */
export const CARD_VARIANTEN = ['standard', 'soft'] as const;
export type CardVariante = (typeof CARD_VARIANTEN)[number];

/**
 * Abschnitt 15.1 — die vollständige Liste erlaubter Badges. Ein Badge trägt
 * **keinen** freien Text: die Beschriftung gehört zur Art. Sonst entstünde
 * genau der Badge-Zoo, den Abschnitt 15.2 verbietet, und ein „Geprüft“, das
 * niemand geprüft hat.
 */
export const BADGE_ARTEN = {
  aktuell: { text: 'Aktuell', ton: 'erfolg' },
  datenstand: { text: 'Datenstand', ton: 'neutral' },
  offizielle_quelle: { text: 'Offizielle Quelle', ton: 'info' },
  nicht_geprueft: { text: 'Nicht geprüft', ton: 'warnung' },
  nicht_unterstuetzt: { text: 'Nicht unterstützt', ton: 'neutral' },
  // Abschnitt 3.1: kommerzielle Kennzeichnung bekommt keine eigene
  // Verkaufsfarbe. Sie unterscheidet sich vom Rest durch den Text, nicht
  // durch die Farbe — Farbregel 5 verlangt das ohnehin.
  werbelink: { text: 'Werbelink', ton: 'neutral' },
} as const;
export type BadgeArt = keyof typeof BADGE_ARTEN;
export type BadgeTon = (typeof BADGE_ARTEN)[BadgeArt]['ton'];

/**
 * Abschnitt 11.3 — Beschriftungen, die der Vertrag ausdrücklich ausschließt.
 * Geprüft wird auf Wortgrenzen, damit „Loslegen“ nicht an „Los!“ scheitert.
 */
export const VERBOTENE_BUTTON_KOPIE: readonly RegExp[] = [
  /\bhier klicken\b/i,
  /\bjetzt zuschlagen\b/i,
  /\bsofort sichern\b/i,
  /\bjetzt sichern\b/i,
  /(^|[\s>])los!/i,
  /\bnicht verpassen\b/i,
];

/**
 * Nennt die verletzte Regel, nicht nur „falsch“. `null` heißt: nichts
 * gefunden — nicht „geprüft und gut“.
 */
export function unerlaubteButtonKopie(text: string): string | null {
  for (const muster of VERBOTENE_BUTTON_KOPIE) {
    const treffer = muster.exec(text);
    if (treffer !== null) return treffer[0].trim();
  }
  return null;
}
