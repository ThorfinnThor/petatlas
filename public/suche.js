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

  async function ladeApi() {
    if (api) return api;
    api = await import(`${window.location.origin}/pagefind/pagefind.js`);
    return api;
  }

  async function suchen(begriff) {
    const anfrage = ++laufendeAnfrage;
    liste.replaceChildren();

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

    let treffer;
    try {
      treffer = await Promise.all(gefunden.results.slice(0, 10).map((r) => r.data()));
    } catch {
      if (anfrage === laufendeAnfrage)
        status.textContent =
          'Die Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.';
      return;
    }
    if (anfrage !== laufendeAnfrage) return;

    status.textContent =
      treffer.length === 0
        ? `Keine Treffer für „${begriff}“.`
        : `${treffer.length} Treffer für „${begriff}“.`;

    for (const eintrag of treffer) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = eintrag.url;
      link.textContent = eintrag.meta.title ?? eintrag.url;
      const auszug = document.createElement('p');
      // Pagefind liefert den Auszug mit <mark>-Auszeichnung aus dem eigenen
      // statischen Index; es sind keine Nutzereingaben enthalten.
      auszug.innerHTML = eintrag.excerpt;
      li.append(link, auszug);
      liste.append(li);
    }
  }

  let timer;
  feld.addEventListener('input', () => {
    laufendeAnfrage += 1;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void suchen(feld.value), 200);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(timer);
    void suchen(feld.value);
  });
}
