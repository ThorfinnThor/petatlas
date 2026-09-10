/**
 * M18-05 — Rechtliche Pflichten an einer Stelle.
 *
 * Diese Datei behauptet nichts. Sie zählt auf, **was verlangt ist**, und
 * sagt je Punkt, ob er erfüllt ist und woran es sonst hängt. Ein Punkt gilt
 * erst als erfüllt, wenn es dafür einen Nachweis gibt — nicht, wenn eine
 * Seite existiert.
 *
 * Die Betreiberangaben stehen bewusst **nicht** hier: sie kommen aus der
 * Umgebung (`config/site.ts`) und fehlen, solange sie fehlen. Ein
 * Platzhalter wäre eine erfundene Rechtsangabe.
 */
import { amazonEnabled } from '../src/features/commerce/amazon.ts';
import launch from './launch.json' with { type: 'json' };
import legalReviews from './legal-review.json' with { type: 'json' };

export type PflichtStatus = 'erfuellt' | 'offen' | 'entfaellt';

export interface Pflichtangabe {
  readonly id: string;
  readonly titel: string;
  /** Woraus die Pflicht folgt. Kein Rechtsrat, sondern eine Fundstelle. */
  readonly grundlage: string;
  readonly status: PflichtStatus;
  /** Wo sie eingelöst wird, sobald sie eingelöst werden kann. */
  readonly ort: string;
  /** Wer entscheidet. Kein Agent trägt hier etwas ein. */
  readonly zustaendig: string;
  /** Was fehlt. Bei `erfuellt` steht hier der Nachweis. */
  readonly bemerkung: string;
}

/**
 * Werbung und Tracking. Die Werte werden **abgeleitet**, nicht behauptet:
 * sie folgen aus den Launch-Gates und aus der Tatsache, dass kein einziges
 * Partnerprogramm freigegeben ist.
 */
export interface WerbeStand {
  readonly anzeigenAktiv: boolean;
  readonly trackingAktiv: boolean;
  readonly cookiesGesetzt: boolean;
  readonly begruendung: string;
}

const GATES = launch.gates as Record<string, { approved: boolean }>;

export function werbeStand(env: Record<string, string | undefined> = process.env): WerbeStand {
  const werbungFreigegeben =
    amazonEnabled(env) ||
    (GATES.commerceAffiliate?.approved ?? false) ||
    (GATES.insuranceAffiliate?.approved ?? false);
  const trackingFreigegeben = GATES.adsTracking?.approved ?? false;
  return {
    anzeigenAktiv: werbungFreigegeben,
    trackingAktiv: trackingFreigegeben,
    // Ohne Tracking und ohne fremde Einbettungen gibt es nichts zu setzen.
    cookiesGesetzt: trackingFreigegeben,
    begruendung: werbungFreigegeben
      ? 'Werbelinks sind auf Betreiberanweisung oder aufgrund einer Programmfreigabe aktiv; die Kennzeichnungspflichten gelten.'
      : 'Kein Partnerprogramm freigegeben und kein Tracking eingeschaltet. Es entstehen keine Anzeigen, keine Messpunkte und keine Cookies.',
  };
}

export const PFLICHTANGABEN: readonly Pflichtangabe[] = [
  {
    id: 'impressum',
    titel: 'Anbieterkennzeichnung',
    grundlage: '§ 5 DDG, § 18 Abs. 2 MStV',
    status: legalReviews.impressum.status as PflichtStatus,
    ort: '/de-de/impressum/',
    zustaendig: 'Betreiber',
    bemerkung:
      'Betreiberangaben vom 10.09.2026 sind im Real-Data-Build eingetragen. Register-/Steuerkennungen, Erreichbarkeit und einschlägige weitere Pflichten bleiben zu bestätigen; siehe docs/reviews/legal-amazon-2026-09-10.md.',
  },
  {
    id: 'datenschutzerklaerung',
    titel: 'Datenschutzerklärung',
    grundlage: 'Art. 13 DSGVO',
    status: legalReviews.datenschutzerklaerung.status as PflichtStatus,
    ort: '/de-de/datenschutz/',
    zustaendig: 'Betreiber mit Rechtsprüfung',
    bemerkung:
      'Verantwortlicher, Verarbeitungsvorgänge, Rechtsgrundlagen, Speicherprinzipien, Betroffenenrechte und Berliner Aufsicht sind ergänzt. Kontospezifische Hosting-/Mail-Verträge bleiben zu prüfen; siehe docs/reviews/legal-amazon-2026-09-10.md.',
  },
  {
    id: 'werbekennzeichnung',
    titel: 'Kennzeichnung bezahlter Empfehlungen',
    grundlage: '§ 5a Abs. 4 UWG, § 6 Abs. 1 Nr. 1 DDG',
    status: 'erfuellt',
    ort: 'Angebots- und Versicherungsbausteine',
    zustaendig: 'Betreiber',
    bemerkung:
      'Partnerkarten tragen „Anzeige“, die betreiberseitig beauftragten Amazon-Textlinks „Werbung“, jeder Partnerlink `rel="sponsored nofollow noopener"`. Ohne freigegebenes Programm entsteht ohnehin kein Link (tests/e2e/versicherung.spec.ts, tests/affiliate-links.test.ts).',
  },
  {
    id: 'methodik',
    titel: 'Nachvollziehbarkeit der Angaben',
    grundlage: 'redaktionelle Sorgfalt, § 18 MStV',
    status: 'erfuellt',
    ort: '/de-de/methodik/',
    zustaendig: 'Betreiber',
    bemerkung:
      'Herkunft, Stand und Prüfzustand jeder Angabe stehen auf der Methodikseite und maschinenlesbar unter /data/v1/health.json.',
  },
  {
    id: 'barrierefreiheitserklaerung',
    titel: 'Erklärung zur Barrierefreiheit',
    grundlage: 'BFSG i. V. m. BFSGV; Geltung ab 28.06.2025',
    status: legalReviews.barrierefreiheitserklaerung.status as PflichtStatus,
    ort: '/de-de/barrierefreiheit/',
    zustaendig: 'Betreiber mit fachlicher Bewertung',
    bemerkung:
      'Die Messergebnisse liegen vor (docs/ACCESSIBILITY.md). Eine Erklärung braucht zusätzlich eine Bewertung des Geltungsbereichs, einen Feedback-Weg mit erreichbarer Adresse und die Angabe, ob und für wen das Gesetz gilt. Ob das Gesetz für dieses Angebot überhaupt gilt, ist selbst zu prüfen — Kleinstunternehmen sind teilweise ausgenommen.',
  },
  {
    id: 'einwilligung',
    titel: 'Einwilligung für nicht notwendige Zugriffe auf das Endgerät',
    grundlage: '§ 25 TDDDG',
    status: 'entfaellt',
    ort: 'keiner',
    zustaendig: 'Betreiber',
    bemerkung:
      'Es gibt kein Tracking, keine Werbe-Cookies und keine fremden Einbettungen beim Aufruf. Die lokale Speicherung von Merkliste und Packliste geschieht erst auf ausdrückliche Handlung und ist für die verlangte Funktion erforderlich. Kartenkacheln werden erst nach Anforderung geladen. § 25 TDDDG betrifft Speicherung und Zugriff auf dem Endgerät; die Übermittlung der IP-Adresse ist zusätzlich nach der DSGVO zu bewerten. Ein Klick allein belegt keine wirksame datenschutzrechtliche Einwilligung.',
  },
  {
    id: 'streitbeilegung',
    titel: 'Hinweis zur Verbraucherstreitbeilegung',
    grundlage: '§ 36 VSBG',
    status: legalReviews.streitbeilegung.status as PflichtStatus,
    ort: '/de-de/impressum/',
    zustaendig: 'Betreiber',
    bemerkung:
      'Anwendbarkeit anhand von Unternehmereigenschaft, Website/AGB, Beschäftigtenzahl am 31. Dezember des Vorjahres und Teilnahmeverpflichtung oder -zusage prüfen. Die Ausnahme für höchstens zehn Beschäftigte betrifft § 36 Absatz 1 Nummer 1, nicht pauschal alle Informationspflichten.',
  },
];

export function offenePflichten(): readonly Pflichtangabe[] {
  return PFLICHTANGABEN.filter((eintrag) => eintrag.status === 'offen');
}
