/**
 * M21-04 — Fortschreibung der Schrittanzeige.
 *
 * Verbesserung, keine Voraussetzung: ohne dieses Modul steht die Anzeige als
 * Sprungnavigation da und funktioniert. Mit ihm markiert sie zusätzlich den
 * Abschnitt, in dem man gerade liest.
 *
 * Es wird nichts ein- oder ausgeblendet. Alle Felder bleiben im Dokument —
 * sonst verlöre ein Zurückgehen die Eingaben, und genau das darf ein
 * Assistent nicht tun.
 */

/** Der Abschnitt, der oben im Fenster am nächsten am Lesepunkt steht. */
export function aktiverSchritt(
  positionen: readonly { readonly id: string; readonly oben: number }[],
  lesepunkt: number,
): string | null {
  if (positionen.length === 0) return null;
  let treffer = positionen[0]?.id ?? null;
  for (const position of positionen) {
    if (position.oben <= lesepunkt) treffer = position.id;
  }
  return treffer;
}

export function schritteVerfolgen(dokument: Document = document): void {
  const anzeige = dokument.querySelector('[data-schrittanzeige]');
  if (anzeige === null) return;

  const verweise = [...anzeige.querySelectorAll<HTMLAnchorElement>('a[data-schritt]')];
  const abschnitte = verweise
    .map((verweis) => ({
      id: verweis.dataset.schritt ?? '',
      element: dokument.getElementById(verweis.dataset.schritt ?? ''),
    }))
    .filter((eintrag): eintrag is { id: string; element: HTMLElement } => eintrag.element !== null);

  // Fehlt ein Abschnitt, wird nichts markiert: eine falsche Markierung wäre
  // schlechter als keine.
  if (abschnitte.length !== verweise.length || abschnitte.length === 0) return;

  const markiere = (): void => {
    // Ein Viertel der Fensterhöhe unter der Oberkante: dort liest man.
    const lesepunkt = window.scrollY + window.innerHeight / 4;
    const positionen = abschnitte.map((abschnitt) => ({
      id: abschnitt.id,
      oben: abschnitt.element.getBoundingClientRect().top + window.scrollY,
    }));
    const aktiv = aktiverSchritt(positionen, lesepunkt);
    for (const verweis of verweise) {
      if (verweis.dataset.schritt === aktiv) verweis.setAttribute('aria-current', 'step');
      else verweis.removeAttribute('aria-current');
    }
  };

  markiere();
  let geplant = false;
  const beiBewegung = (): void => {
    if (geplant) return;
    geplant = true;
    window.requestAnimationFrame(() => {
      geplant = false;
      markiere();
    });
  };
  window.addEventListener('scroll', beiBewegung, { passive: true });
  window.addEventListener('resize', beiBewegung, { passive: true });
}
