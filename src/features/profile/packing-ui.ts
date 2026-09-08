/**
 * M16-04 — Packliste abhaken und drucken.
 *
 * Ohne JavaScript sind die Kästchen echte Kontrollkästchen: sie lassen sich
 * anklicken und ausdrucken, werden aber nicht gespeichert. Mit JavaScript
 * kommt die Speicherung dazu — je Gerät, ohne Konto, ohne Abgleich.
 *
 * Gedruckt wird die Seite selbst. Es gibt keine eigene Druckansicht, die
 * anders aussieht als das, was auf dem Bildschirm stand: eine zweite Fassung
 * wäre eine zweite Gelegenheit, etwas wegzulassen.
 */
import {
  PACKING_STORAGE_KEY,
  abgehakt,
  fortschritt,
  leere,
  lese,
  schreibe,
  setze,
  type PackStand,
} from './packing-state.ts';

function speicher(): Storage | null {
  try {
    const probe = '__petatlas_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

function jetzt(): string {
  return new Date().toISOString();
}

function standLesen(): PackStand {
  const ablage = speicher();
  return lese(ablage === null ? null : ablage.getItem(PACKING_STORAGE_KEY), jetzt());
}

function standSchreiben(stand: PackStand): boolean {
  const ablage = speicher();
  if (ablage === null) return false;
  try {
    ablage.setItem(PACKING_STORAGE_KEY, schreibe(stand));
    return true;
  } catch {
    return false;
  }
}

export function packlisteStarten(): void {
  const bereich = document.querySelector<HTMLElement>('[data-packliste]');
  if (bereich === null) return;

  const ziel = bereich.dataset.packliste ?? '';
  if (ziel === '') return;

  const kaesten = [
    ...bereich.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-eintrag]'),
  ];
  const anzeige = document.querySelector<HTMLElement>('#packliste-stand');
  const zuruecksetzen = document.querySelector<HTMLButtonElement>('#packliste-zuruecksetzen');

  if (speicher() === null) {
    // Ohne Speicher bleiben die Kästchen bedienbar; nur das Merken entfällt.
    if (anzeige !== null) {
      anzeige.textContent =
        'Dieser Browser speichert nichts lokal — die Häkchen gelten nur, solange die Seite offen ist.';
    }
    return;
  }

  const zeige = (): void => {
    if (anzeige === null) return;
    anzeige.textContent = fortschritt(standLesen(), ziel, kaesten.length).text;
  };

  for (const kasten of kaesten) {
    const eintrag = kasten.dataset.eintrag ?? '';
    kasten.checked = abgehakt(standLesen(), ziel, eintrag);
    kasten.addEventListener('change', () => {
      standSchreiben(setze(standLesen(), ziel, eintrag, kasten.checked, jetzt()));
      zeige();
    });
  }

  if (zuruecksetzen !== null) {
    zuruecksetzen.hidden = false;
    zuruecksetzen.addEventListener('click', () => {
      standSchreiben(leere(standLesen(), ziel, jetzt()));
      for (const kasten of kaesten) kasten.checked = false;
      zeige();
    });
  }

  zeige();
}
