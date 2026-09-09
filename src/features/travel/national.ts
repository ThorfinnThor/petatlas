/** Source-checked country guidance, 2026-09-09. Local rules are not universal entry rules. */
export const NATIONAL = {
  AT: {
    title: 'Österreich: Regeln des Bundeslandes und der Gemeinde',
    text: 'Leinen- und Maulkorbpflichten sind örtlich unterschiedlich geregelt. Prüfen Sie das konkrete Bundesland, die Gemeinde und den Beförderer. Für bestimmte Hunde können zusätzliche Haltevorgaben gelten; eine deutsche Einstufung lässt sich nicht automatisch übertragen.',
    url: 'https://www.oesterreich.gv.at/de/themen/reisen_und_freizeit/haustiere/1/Seite.741010',
  },
  FR: {
    title: 'Frankreich: Hundekategorie vor der Reise klären',
    text: 'Hunde der französischen Kategorie 1 dürfen nicht eingeführt werden, auch nicht zur Durchreise. Für Kategorie 2 gelten zusätzliche Voraussetzungen, unter anderem Vorgaben zu Haltung und Zugang zu öffentlichen Orten. Die Einstufung richtet sich auch nach Abstammungsnachweisen und Körpermerkmalen; sie wird hier nicht aus dem Rassenamen geraten.',
    url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F35788',
  },
  IT: {
    title: 'Italien: aktuelle örtliche Vorgaben prüfen',
    text: 'Die amtlich gefundene landesweite Verlängerung vom 10.07.2025 galt zwölf Monate ab 04.09.2025. Eine weitere Verlängerung für den Reisetag ist in dieser Prüfung nicht belegt. Daher wird keine aktuelle landesweite Leinenlänge als sicher behauptet. Nehmen Sie Leine und passenden Maulkorb mit und prüfen Sie die Gemeinde sowie die örtliche Gesundheitsbehörde (ASL).',
    url: 'https://www.gazzettaufficiale.it/eli/id/2025/08/20/25A04616/SG',
  },
  NL: {
    title: 'Niederlande: Einreise und örtliche Leinenpflicht getrennt prüfen',
    text: 'Die NVWA stellt die Einreiseanforderungen und eine Regelhilfe bereit. Zusätzlich gelten örtliche Auslaufregeln: Amsterdam verlangt grundsätzlich eine Leine außerhalb ausgewiesener Freilaufflächen. Diese Gemeinderegel gilt nicht automatisch in allen Niederlanden. Prüfen Sie außerdem individuelle Auflagen für Ihren Hund.',
    url: 'https://www.nvwa.nl/onderwerpen/dier/op-reis-met-mijn-huisdier',
  },
} as const;

export function nationalGuidance(country: string) {
  return NATIONAL[country as keyof typeof NATIONAL];
}

/** A category-1 dog is a known exclusion, regardless of fulfilled health requirements. */
export function nationalOutcome(country: string, species: string, category?: string) {
  if (country === 'FR' && species === 'dog') {
    if (category === '1')
      return {
        state: 'not_fulfilled' as const,
        text: 'Frankreich: Kategorie 1 — Einreise und Durchreise sind untersagt.',
      };
    if (category !== 'none')
      return {
        state: 'unknown' as const,
        text: 'Frankreich: Hundekategorie oder zusätzliche Voraussetzungen der Kategorie 2 sind noch zu klären.',
      };
  }
  return {
    state: 'unknown' as const,
    text:
      nationalGuidance(country)?.text ??
      'Örtliche Regeln bitte bei der zuständigen Behörde prüfen.',
  };
}
