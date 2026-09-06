/**
 * M05-06 — Lizenzprüfung vor der Veröffentlichung.
 *
 * Fragt für jede erfasste Quelle: stimmt der Rechtestand noch, und trägt die
 * Ausgabe die verlangten Hinweise?
 *
 * Der wichtigste Fall ist der **Rechteverlust**. Läuft eine Freigabe ab,
 * ändern sich die Bedingungen (`termsHash`) oder wird die Bilderlaubnis
 * entzogen, muss die betroffene Ausgabe stoppen. Ein alter Datenstand, ein
 * bereits gebautes `dist/` oder ein Cache dürfen das nicht überspielen.
 *
 * Ausführen: `npm run check:licenses`
 * Exit 0 = keine Beanstandung, 1 = Beanstandung, 2 = Aufrufproblem.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { mayPublish } from '../../src/domain/rights.ts';
import { allSources, type SourceEntry } from '../../src/domain/source-registry.ts';

export interface Beanstandung {
  readonly sourceId: string;
  readonly problem: string;
}

/**
 * Prüft die Registryeinträge für sich: Ein `verified`-Eintrag braucht
 * Prüfdatum, Nachweis, benannte Lizenz und — bei Attributionspflicht — den
 * verlangten Wortlaut samt Hash der geprüften Bedingungen.
 */
export function pruefeRegistry(quellen: readonly SourceEntry[]): Beanstandung[] {
  const beanstandungen: Beanstandung[] = [];

  for (const quelle of quellen) {
    const rechte = quelle.rights;
    if (rechte.status !== 'verified') continue;

    if (rechte.termsHash === null) {
      beanstandungen.push({
        sourceId: quelle.sourceId,
        problem: 'verified ohne termsHash: eine Bedingungsänderung wäre nicht erkennbar.',
      });
    }
    if (rechte.attributionRequired && !quelle.attributionText) {
      beanstandungen.push({
        sourceId: quelle.sourceId,
        problem: 'Attribution ist Pflicht, aber kein Wortlaut hinterlegt.',
      });
    }
    if (rechte.shareAlike && !mayPublish(rechte, 'publicJsonDelivery').allowed) {
      // Kein Fehler, aber ein Hinweis: Share-Alike ohne Weitergaberecht ist
      // eine ungewöhnliche Kombination und meist ein Konfigurationsfehler.
      beanstandungen.push({
        sourceId: quelle.sourceId,
        problem:
          'shareAlike gesetzt, aber öffentliche Weitergabe nicht erlaubt — Rechteeintrag prüfen.',
      });
    }
  }

  return beanstandungen;
}

/**
 * Prüft den Buildoutput: Trägt jede ausgelieferte Datendatei einer
 * attributionspflichtigen Quelle deren Hinweis?
 */
export function pruefeAusgabe(distDir: string, quellen: readonly SourceEntry[]): Beanstandung[] {
  const datenVerzeichnis = join(distDir, 'data', 'v1');
  if (!existsSync(datenVerzeichnis)) return [];

  const beanstandungen: Beanstandung[] = [];
  const dateien: string[] = [];

  function sammle(verzeichnis: string): void {
    for (const eintrag of readdirSync(verzeichnis, { withFileTypes: true })) {
      const pfad = join(verzeichnis, eintrag.name);
      if (eintrag.isDirectory()) sammle(pfad);
      else if (eintrag.name.endsWith('.json')) dateien.push(pfad);
    }
  }
  sammle(datenVerzeichnis);

  for (const datei of dateien) {
    const inhalt = readFileSync(datei, 'utf8');
    for (const quelle of quellen) {
      if (!inhalt.includes(quelle.sourceId)) continue;

      if (!mayPublish(quelle.rights, 'publicJsonDelivery').allowed) {
        beanstandungen.push({
          sourceId: quelle.sourceId,
          problem: `${datei} liefert Daten einer Quelle aus, die für publicJsonDelivery nicht freigegeben ist.`,
        });
        continue;
      }
      if (quelle.rights.attributionRequired && quelle.attributionText) {
        if (!inhalt.includes(quelle.attributionText)) {
          beanstandungen.push({
            sourceId: quelle.sourceId,
            problem: `${datei} enthält den Pflichthinweis „${quelle.attributionText}“ nicht.`,
          });
        }
      }
    }
  }

  return beanstandungen;
}

function main(): number {
  const quellen = allSources();
  const beanstandungen = [...pruefeRegistry(quellen), ...pruefeAusgabe('dist', quellen)];

  const verified = quellen.filter((q) => q.rights.status === 'verified').length;
  const gesperrt = quellen.length - verified;

  if (beanstandungen.length === 0) {
    console.log(
      `Lizenzprüfung: ${quellen.length} Quellen, ${verified} freigegeben, ${gesperrt} gesperrt. Keine Beanstandung.`,
    );
    return 0;
  }

  console.error(`Lizenzprüfung: ${beanstandungen.length} Beanstandung(en).`);
  for (const beanstandung of beanstandungen) {
    console.error(`  ${beanstandung.sourceId}: ${beanstandung.problem}`);
  }
  return 1;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
