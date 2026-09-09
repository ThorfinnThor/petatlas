// M21-01 — Die Komponentenbibliothek. Geprüft wird nicht, ob sie hübsch ist,
// sondern ob sie das Falsche verweigert: eine erfundene Variante, ein
// deaktivierter Link, ein Badge mit freiem Text, ein Leerzustand ohne
// Erklärung.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { experimental_AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import Alert from '../src/components/ui/Alert.astro';
import Badge from '../src/components/ui/Badge.astro';
import Breadcrumbs from '../src/components/ui/Breadcrumbs.astro';
import Button from '../src/components/ui/Button.astro';
import Card from '../src/components/ui/Card.astro';
import { defaultMarket, withEnabledFeatures } from '../src/domain/market.ts';
import EmptyState from '../src/components/ui/EmptyState.astro';
import ProductCard from '../src/components/commerce/ProductCard.astro';
import RadioCard from '../src/components/forms/RadioCard.astro';
import { merkmalLabel } from '../src/features/care/attributes.ts';
import PageHeader from '../src/components/ui/PageHeader.astro';
import ToolShell from '../src/components/tools/ToolShell.astro';
import ToolStepper from '../src/components/tools/ToolStepper.astro';
import {
  BADGE_ARTEN,
  BUTTON_GROESSEN,
  BUTTON_VARIANTEN,
  unerlaubteButtonKopie,
} from '../src/components/ui/varianten.ts';

const container = await experimental_AstroContainer.create();

async function render(
  komponente: Parameters<typeof container.renderToString>[0],
  props: Record<string, unknown>,
  slots: Record<string, string> = {},
): Promise<string> {
  return container.renderToString(komponente, { props, slots });
}

describe('Button', () => {
  it('rendert jede Variante mit eigener Klasse', async () => {
    for (const variante of BUTTON_VARIANTEN) {
      const html = await render(Button, { variante }, { default: 'Kosten berechnen' });
      expect(html).toContain(`knopf--${variante}`);
      expect(html).toContain('Kosten berechnen');
    }
  });

  it('ist ohne Angabe sekundär — eine primäre Aktion je Bereich', async () => {
    const html = await render(Button, {}, { default: 'Details' });
    expect(html).toContain('knopf--sekundaer');
    expect(html).not.toContain('knopf--primaer');
  });

  it('wird mit href zum Link und ohne href zum Knopf', async () => {
    const link = await render(Button, { href: '/de-de/' }, { default: 'Zur Startseite' });
    expect(link).toContain('<a');
    expect(link).toContain('href="/de-de/"');

    const knopf = await render(Button, {}, { default: 'Rechnen' });
    expect(knopf).toContain('<button');
    expect(knopf).toContain('type="button"');
  });

  it('verweigert einen deaktivierten Link, weil er anklickbar bliebe', async () => {
    await expect(render(Button, { href: '/de-de/', deaktiviert: true }, {})).rejects.toThrow(
      /lässt sich nicht deaktivieren/,
    );
  });

  it('verweigert href und typ zusammen', async () => {
    await expect(render(Button, { href: '/de-de/', typ: 'submit' }, {})).rejects.toThrow(
      /entweder Ziel oder Knopfart/,
    );
  });

  it('verweigert eine erfundene Variante', async () => {
    await expect(render(Button, { variante: 'knallig' }, {})).rejects.toThrow(
      /Unbekannte Button-Variante/,
    );
  });

  it('kennt drei Größen, die mittlere ohne eigene Klasse', async () => {
    expect([...BUTTON_GROESSEN]).toEqual(['klein', 'mittel', 'gross']);
    const mittel = await render(Button, { groesse: 'mittel' }, { default: 'x' });
    expect(mittel).not.toContain('knopf--mittel');
    const gross = await render(Button, { groesse: 'gross' }, { default: 'x' });
    expect(gross).toContain('knopf--gross');
  });
});

describe('Button-Beschriftungen (Abschnitt 11.3)', () => {
  it('erkennt die ausdrücklich ausgeschlossenen Formulierungen', () => {
    expect(unerlaubteButtonKopie('Hier klicken')).not.toBeNull();
    expect(unerlaubteButtonKopie('Jetzt zuschlagen!')).not.toBeNull();
    expect(unerlaubteButtonKopie('Los!')).not.toBeNull();
  });

  it('hält erlaubte Beschriftungen für erlaubt', () => {
    for (const text of [
      'Kosten berechnen',
      'Reise prüfen',
      'Filter anwenden',
      'Auf Karte anzeigen',
      'Loslegen ohne Anmeldung',
      'Angebot ansehen',
    ]) {
      expect(unerlaubteButtonKopie(text), text).toBeNull();
    }
  });

  it('findet keine dieser Formulierungen in den ausgelieferten Seiten', () => {
    const dateien: string[] = [];
    const sammle = (verzeichnis: string): void => {
      for (const eintrag of readdirSync(verzeichnis)) {
        const pfad = join(verzeichnis, eintrag);
        if (statSync(pfad).isDirectory()) sammle(pfad);
        else if (pfad.endsWith('.astro')) dateien.push(pfad);
      }
    };
    sammle('src');
    expect(dateien.length).toBeGreaterThan(20);

    const treffer = dateien
      .map((pfad) => ({ pfad, fund: unerlaubteButtonKopie(readFileSync(pfad, 'utf8')) }))
      .filter((eintrag) => eintrag.fund !== null);
    expect(treffer).toEqual([]);
  });
});

describe('Card', () => {
  it('rendert das gewünschte Element', async () => {
    const html = await render(Card, { als: 'li' }, { default: 'Inhalt' });
    expect(html).toMatch(/^<li/);
  });

  it('bekommt nur als klickbare Karte einen Hover-Zustand', async () => {
    const ruhig = await render(Card, {}, { default: 'x' });
    expect(ruhig).not.toContain('karte--klickbar');
    const klickbar = await render(Card, { klickbar: true }, { default: 'x' });
    expect(klickbar).toContain('karte--klickbar');
  });

  it('reicht eine Klasse der Seite durch, ohne das eigene Aussehen abzugeben', async () => {
    const html = await render(Card, { class: 'werkzeugkarte' }, { default: 'x' });
    expect(html).toContain('werkzeugkarte');
    expect(html).toContain('karte--standard');
  });
});

describe('Badge', () => {
  it('kennt genau die im Vertrag aufgezählten Arten', () => {
    expect(Object.keys(BADGE_ARTEN)).toEqual([
      'aktuell',
      'datenstand',
      'offizielle_quelle',
      'nicht_geprueft',
      'nicht_unterstuetzt',
      'werbelink',
    ]);
  });

  it('nimmt die Beschriftung aus der Art, nicht aus einem freien Text', async () => {
    const html = await render(Badge, { art: 'nicht_geprueft' }, {});
    expect(html).toContain('Nicht geprüft');
    await expect(render(Badge, { art: 'aktuell', wert: 'Geprüft' }, {})).rejects.toThrow(
      /trägt keinen freien Text/,
    );
  });

  it('verweigert einen Datenstand ohne Datum', async () => {
    await expect(render(Badge, { art: 'datenstand' }, {})).rejects.toThrow(/ohne Datum/);
    const html = await render(Badge, { art: 'datenstand', wert: '06.09.2026' }, {});
    expect(html).toContain('Datenstand: 06.09.2026');
  });

  it('gibt der Werbekennzeichnung keine eigene Verkaufsfarbe', () => {
    // Abschnitt 3.1: kommerzielle Kennzeichnung bleibt in der neutralen
    // Palette. Der Unterschied steht im Text.
    expect(BADGE_ARTEN.werbelink.ton).toBe('neutral');
  });
});

describe('Alert', () => {
  it('sagt Fehler an und lässt eine Information in Ruhe', async () => {
    const fehler = await render(Alert, { variante: 'fehler', titel: 'Fehlgeschlagen' }, {});
    expect(fehler).toContain('role="alert"');
    const info = await render(Alert, { variante: 'info', titel: 'Hinweis' }, {});
    expect(info).not.toContain('role=');
  });

  it('verlangt einen Titel', async () => {
    await expect(render(Alert, { variante: 'info', titel: '  ' }, {})).rejects.toThrow(
      /ohne Titel/,
    );
  });
});

describe('EmptyState', () => {
  it('verlangt die Erklärung, warum hier nichts steht', async () => {
    await expect(render(EmptyState, { titel: 'Keine Treffer' }, {})).rejects.toThrow(
      /liest sich wie|gibt es nicht/,
    );
  });

  it('zeigt Zustand, Erklärung und Aktion', async () => {
    const html = await render(
      EmptyState,
      { titel: 'Keine erfassten Treffer in diesem Bereich' },
      { default: '<p>Das heißt nicht, dass es dort keine gibt.</p>', aktionen: '<a>Radius</a>' },
    );
    expect(html).toContain('Keine erfassten Treffer');
    expect(html).toContain('Das heißt nicht');
    expect(html).toContain('leerzustand__aktionen');
  });
});

describe('PageHeader', () => {
  it('erzeugt genau eine H1', async () => {
    const html = await render(PageHeader, { titel: 'Tierarztkosten' }, {});
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it('zeigt den Aktionsbereich nur, wenn es Aktionen gibt', async () => {
    const ohne = await render(PageHeader, { titel: 'T' }, {});
    expect(ohne).not.toContain('seitenkopf__aktionen');
    const mit = await render(
      PageHeader,
      { titel: 'T' },
      { aktionen: '<a href="/">Los geht es</a>' },
    );
    expect(mit).toContain('seitenkopf__aktionen');
  });
});

describe('Eine Designsprache, nicht zwei', () => {
  it('führt Buttons, Karten und Badges nicht mehr als globale Klassen', () => {
    const base = readFileSync('src/styles/base.css', 'utf8');
    expect(base).not.toMatch(/^\.button/m);
    expect(base).not.toMatch(/^\.card/m);
    expect(base).not.toMatch(/^\.badge/m);
  });

  it('lässt Notice über dieselbe Hinweisbox laufen', () => {
    const notice = readFileSync('src/components/Notice.astro', 'utf8');
    expect(notice).toContain("from './ui/Alert.astro'");
  });
});

describe('Breadcrumbs (M21-02)', () => {
  const markt = withEnabledFeatures(defaultMarket(), ['costs', 'map', 'travel', 'care', 'food']);

  it('setzt Start selbst und verlinkt die aktuelle Seite nicht', async () => {
    const html = await render(
      Breadcrumbs,
      {
        market: markt,
        stufen: [{ label: 'Tierarztkosten', route: 'costs' }, { label: 'Gebührenkatalog' }],
      },
      {},
    );
    expect(html).toContain('>Start<');
    expect(html).toContain('href="/de-de/tierarztkosten/"');
    expect(html).toContain('aria-current="page"');
    // Die letzte Stufe steht als Text da, nicht als Link.
    expect(html).toMatch(/<span aria-current="page"[^>]*>Gebührenkatalog<\/span>/);
  });

  it('verlinkt die aktuelle Seite auch dann nicht, wenn ein Ziel mitgegeben wird', async () => {
    const html = await render(
      Breadcrumbs,
      { market: markt, stufen: [{ label: 'Tierarztkosten', route: 'costs' }] },
      {},
    );
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain('href="/de-de/tierarztkosten/"');
  });

  it('verweigert Brotkrumen auf Ebene eins', async () => {
    await expect(render(Breadcrumbs, { market: markt, stufen: [] }, {})).rejects.toThrow(
      /ab Ebene zwei/,
    );
  });

  it('baut Unterpfade über die Route Registry, nicht über Zeichenketten', async () => {
    const html = await render(
      Breadcrumbs,
      {
        market: markt,
        stufen: [
          { label: 'Tierarztkosten', route: 'costs' },
          { label: 'Gebührenkatalog', route: 'costs', slugs: ['katalog'] },
          { label: 'Nr. 1' },
        ],
      },
      {},
    );
    expect(html).toContain('href="/de-de/tierarztkosten/katalog/"');
  });

  it('trägt das Trennzeichen im CSS, nicht im Text', () => {
    const quelle = readFileSync('src/components/ui/Breadcrumbs.astro', 'utf8');
    // Ein „›“ im Markup läse ein Screenreader mit vor.
    const markup = quelle.slice(quelle.indexOf('<nav'), quelle.indexOf('<style>'));
    expect(markup).not.toContain('›');
    expect(quelle).toContain("content: '›'");
  });

  it('steht auf jeder Unterseite', () => {
    // Jede Seite mit einem dynamischen Segment ist mindestens Ebene zwei.
    const unterseiten: string[] = [];
    const sammle = (verzeichnis: string): void => {
      for (const eintrag of readdirSync(verzeichnis)) {
        const pfad = join(verzeichnis, eintrag);
        if (statSync(pfad).isDirectory()) sammle(pfad);
        else if (pfad.endsWith('.astro') && /\[/.test(pfad)) unterseiten.push(pfad);
      }
    };
    sammle(join('src', 'pages', 'de-de'));
    expect(unterseiten.length).toBeGreaterThan(4);

    const ohne = unterseiten.filter((pfad) => !readFileSync(pfad, 'utf8').includes('<Breadcrumbs'));
    expect(ohne).toEqual([]);
  });
});

describe('ToolShell (M21-03)', () => {
  it('verlangt beide Bereiche — eine leere Spalte ist keine zweispaltige Ansicht', async () => {
    await expect(
      render(
        ToolShell,
        { eingabeTitel: 'Eingaben', ergebnisTitel: 'Rechnung' },
        { eingabe: '<p>x</p>' },
      ),
    ).rejects.toThrow(/braucht beide Bereiche/);
  });

  it('beschriftet beide Bereiche über ihre Überschrift', async () => {
    const html = await render(
      ToolShell,
      { eingabeTitel: 'Eingaben', ergebnisTitel: 'Rechnung', ergebnisId: 'ergebnis-titel' },
      { eingabe: '<p>Formular</p>', ergebnis: '<p>Summe</p>' },
    );
    expect(html).toContain('aria-labelledby="werkzeug-eingabe-titel"');
    expect(html).toContain('aria-labelledby="ergebnis-titel"');
    expect(html.indexOf('werkzeug__eingabe')).toBeLessThan(html.indexOf('werkzeug__ergebnis'));
  });

  it('ist ohne ausdrückliche Entscheidung nicht sticky', async () => {
    const html = await render(
      ToolShell,
      { eingabeTitel: 'E', ergebnisTitel: 'R' },
      { eingabe: 'a', ergebnis: 'b' },
    );
    expect(html).not.toContain('werkzeug__ergebnis--sticky');
  });
});

describe('ToolStepper (M21-04)', () => {
  const SCHRITTE = [
    { id: 'schritt-reise', titel: 'Reise' },
    { id: 'schritt-tier', titel: 'Tier' },
    { id: 'schritt-angaben', titel: 'Angaben' },
    { id: 'schritt-ergebnis', titel: 'Ergebnis' },
  ];

  it('zeigt Nummer und Text, nicht nur einen Balken', async () => {
    const html = await render(ToolStepper, { schritte: SCHRITTE, label: 'Schritte' }, {});
    for (const [index, schritt] of SCHRITTE.entries()) {
      expect(html).toContain(schritt.titel);
      expect(html).toContain(`>${index + 1}`);
    }
    expect(html).not.toContain('<progress');
  });

  it('benennt den aktuellen Schritt mit aria-current', async () => {
    const html = await render(
      ToolStepper,
      { schritte: SCHRITTE, label: 'Schritte', aktiv: 'schritt-tier' },
      {},
    );
    expect(html).toMatch(/aria-current="step"[^>]*>\s*<span[^>]*>2/);
  });

  it('bleibt ohne JavaScript eine echte Sprungnavigation', async () => {
    const html = await render(ToolStepper, { schritte: SCHRITTE, label: 'Schritte' }, {});
    for (const schritt of SCHRITTE) expect(html).toContain(`href="#${schritt.id}"`);
  });

  it('verweigert doppelte Ids und einen unbekannten aktiven Schritt', async () => {
    await expect(
      render(
        ToolStepper,
        {
          schritte: [
            { id: 'a', titel: 'A' },
            { id: 'a', titel: 'B' },
          ],
          label: 'x',
        },
        {},
      ),
    ).rejects.toThrow(/nicht eindeutig/);
    await expect(
      render(ToolStepper, { schritte: SCHRITTE, label: 'x', aktiv: 'gibt-es-nicht' }, {}),
    ).rejects.toThrow(/steht nicht in der Liste/);
  });
});

describe('RadioCard (M21-05)', () => {
  it('legt ein echtes Radio ins Dokument, nicht eine nachgebaute Karte', async () => {
    const html = await render(
      RadioCard,
      { name: 'tierart', value: 'dog', label: 'Hund', erlaeuterung: 'Für Hunde.' },
      {},
    );
    expect(html).toContain('type="radio"');
    expect(html).toContain('name="tierart"');
    expect(html).toContain('value="dog"');
    // Die ganze Karte ist das Label — deshalb ist sie klickbar, ohne dass ein
    // Skript Klicks abfängt.
    expect(html).toMatch(/^<label/);
    expect(html).toContain('Für Hunde.');
  });

  it('verweigert eine Karte ohne Name, Wert oder Beschriftung', async () => {
    await expect(render(RadioCard, { name: '', value: 'x', label: 'X' }, {})).rejects.toThrow(
      /kommt im Formular nicht an/,
    );
    await expect(render(RadioCard, { name: 'a', value: '', label: 'X' }, {})).rejects.toThrow(
      /kommt im Formular nicht an/,
    );
    await expect(render(RadioCard, { name: 'a', value: 'x', label: ' ' }, {})).rejects.toThrow(
      /nicht bedienbar/,
    );
  });

  it('zeigt den Zustand nicht allein über Farbe', () => {
    const quelle = readFileSync('src/components/forms/RadioCard.astro', 'utf8');
    // Der Radiopunkt wird nicht versteckt; er ist die eigentliche Anzeige.
    expect(quelle).not.toMatch(/input[^{]*\{[^}]*(display:\s*none|visibility:\s*hidden)/);
    expect(quelle).not.toContain('appearance: none');
  });
});

describe('ProductCard (M21-06)', () => {
  it('hält die Reihenfolge aus Abschnitt 20.3 ein', async () => {
    const html = await render(
      ProductCard,
      {
        name: 'Beispielball',
        marke: 'Beispielmarke',
        merkmale: [{ label: 'Größe', wert: 'M', beleg: 'Herstellerangabe' }],
        passtZu: ['10–25 kg'],
        werbelink: true,
      },
      { preis: '<p>ab 29,99 €</p>', aktion: '<a href="https://x.invalid/">Angebot ansehen</a>' },
    );
    const reihenfolge = [
      'Beispielball',
      'Beispielmarke',
      'Größe',
      'Warum angezeigt?',
      'ab 29,99 €',
    ];
    let letzte = -1;
    for (const teil of reihenfolge) {
      const stelle = html.indexOf(teil);
      expect(stelle, teil).toBeGreaterThan(letzte);
      letzte = stelle;
    }
    // Die Kennzeichnung steht zuletzt, nicht zuerst.
    expect(html.indexOf('Werbelink')).toBeGreaterThan(html.indexOf('Angebot ansehen'));
  });

  it('zeigt einen unbekannten Wert als unbekannt statt ihn wegzulassen', async () => {
    const html = await render(
      ProductCard,
      {
        name: 'Beispielbürste',
        marke: null,
        merkmale: [{ label: 'Borstenlänge', wert: null, beleg: 'Händlerfeed' }],
      },
      {},
    );
    expect(html).toContain('Borstenlänge');
    expect(html).toContain('unbekannt');
    expect(html).toContain('Marke nicht angegeben');
  });

  it('sagt es, wenn kein Merkmal belegt ist', async () => {
    const html = await render(ProductCard, { name: 'Beispielseil', marke: null, merkmale: [] }, {});
    expect(html).toContain('kein Merkmal belegt');
    expect(html).toContain('heißt nicht, dass es keine hat');
  });

  it('behauptet keine Übereinstimmung, wenn es keine gibt', async () => {
    const html = await render(
      ProductCard,
      { name: 'X', marke: null, merkmale: [], passtZu: [], nichtGeprueft: ['Größe'] },
      {},
    );
    expect(html).toContain('Keine belegte Übereinstimmung');
    expect(html).toContain('Nicht geprüft: Größe');
  });

  it('verweigert eine Karte ohne Produktnamen', async () => {
    await expect(
      render(ProductCard, { name: '  ', marke: null, merkmale: [] }, {}),
    ).rejects.toThrow(/ohne Produktnamen/);
  });
});

describe('Merkmalsbeschriftungen (M21-06)', () => {
  it('übersetzt die Bezeichner des Datenmodells', () => {
    expect(merkmalLabel('coatLength')).toBe('Fellänge');
    expect(merkmalLabel('washableAtCelsius')).toBe('Waschbar bei Grad Celsius');
  });

  it('lässt einen unbekannten Bezeichner sichtbar stehen, statt ihn zu erfinden', () => {
    expect(merkmalLabel('gibtEsNicht')).toBe('gibtEsNicht');
  });
});
