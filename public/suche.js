/**
 * M04-04 — Suchlogik im Browser.
 *
 * Bewusst eine eigene Datei in `public/` statt eines gebündelten Skripts:
 * der Pagefind-Index entsteht erst nach dem HTML-Build, deshalb darf der
 * Bundler diesen dynamischen Import nicht auflösen.
 *
 * Die Suche läuft vollständig lokal. Es wird nichts an einen Server oder
 * Dritten gesendet.
 */

/** @typedef {{ url: string, meta: { title?: string }, excerpt: string }} Treffer */

const form = document.querySelector('#suche-form');
const feld = document.querySelector('#suche-feld');
const status = document.querySelector('#suche-status');
const liste = document.querySelector('#suche-treffer');

if (form && feld && status && liste) {
  // Erst anzeigen, wenn die Suche wirklich bedienbar ist.
  form.hidden = false;

  let api = null;
  let laufendeAnfrage = 0;
  const weitere = document.createElement('button');
  weitere.type = 'button';
  weitere.textContent = 'Weitere Treffer anzeigen';
  weitere.hidden = true;
  liste.after(weitere);
  let weitereLaden = null;
  weitere.addEventListener('click', () => {
    if (weitereLaden) void weitereLaden();
  });

  async function ladeApi() {
    if (api) return api;
    api = await import(`${window.location.origin}/pagefind/pagefind.js`);
    return api;
  }

  async function suchen(begriff) {
    const anfrage = ++laufendeAnfrage;
    liste.replaceChildren();
    weitere.hidden = true;
    weitereLaden = null;

    if (begriff.trim().length < 2) {
      status.textContent = begriff.trim() === '' ? '' : 'Bitte mindestens zwei Zeichen eingeben.';
      return;
    }

    status.textContent = 'Suche läuft …';

    let gefunden;
    try {
      gefunden = await (await ladeApi()).search(begriff);
    } catch (fehler) {
      if (anfrage !== laufendeAnfrage) return;
      // Kein stilles Scheitern: ein kaputter Index darf nicht wie „keine
      // Treffer“ aussehen.
      status.textContent = 'Die Suche ist gerade nicht verfügbar.';
      console.error('Pagefind konnte nicht geladen werden:', fehler);
      return;
    }
    if (anfrage !== laufendeAnfrage) return;

    const gesamt = gefunden.results.length;
    let angezeigt = 0;
    let laedt = false;

    weitereLaden = async () => {
      if (laedt || anfrage !== laufendeAnfrage) return;
      laedt = true;
      weitere.disabled = true;
      const naechste = gefunden.results.slice(angezeigt, angezeigt + 10);
      try {
        const treffer = await Promise.all(naechste.map((r) => r.data()));
        if (anfrage !== laufendeAnfrage) return;
        for (const eintrag of treffer) {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = eintrag.url;
          link.textContent = eintrag.meta.title ?? eintrag.url;
          const auszug = document.createElement('p');
          // Pagefind liefert den Auszug mit <mark>-Auszeichnung aus dem
          // eigenen statischen Index; Nutzereingaben sind nicht enthalten.
          auszug.innerHTML = eintrag.excerpt;
          li.append(link, auszug);
          liste.append(li);
        }
        angezeigt += treffer.length;
        status.textContent =
          gesamt === 0
            ? `Keine Treffer für „${begriff}“.`
            : angezeigt < gesamt
              ? `${angezeigt} von ${gesamt} Treffern für „${begriff}“ angezeigt.`
              : `${gesamt} Treffer für „${begriff}“.`;
        weitere.hidden = angezeigt >= gesamt;
      } catch {
        if (anfrage === laufendeAnfrage)
          status.textContent =
            'Die Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.';
      } finally {
        laedt = false;
        weitere.disabled = false;
      }
    };

    await weitereLaden();
  }

  let timer;
  feld.addEventListener('input', () => {
    laufendeAnfrage += 1;
    weitere.hidden = true;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void suchen(feld.value), 200);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(timer);
    void suchen(feld.value);
  });
}
