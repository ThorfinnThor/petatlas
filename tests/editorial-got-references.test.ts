import { describe, expect, it } from 'vitest';

import { artikelJeGotNummer, gotNummernImText } from '../src/features/editorial/got-references.ts';

describe('gotNummernImText', () => {
  it('liest Tabellenzeilen und Nummernfolgen im Text', () => {
    const text = [
      '| 951 | Zahnextraktion | 12,21 € | 36,63 € |',
      'Beide Beispiele enthalten Nr. 16, zweimal 166, 337, 345 und 350.',
      'Die Positionen Nr. 662 bis 665 gelten je Seite.',
    ].join('\n');
    expect([...gotNummernImText(text)].sort()).toEqual(
      ['16', '166', '337', '345', '350', '662', '665', '951'].sort(),
    );
  });

  it('nimmt keine Beträge oder Jahreszahlen als Nummer', () => {
    expect(gotNummernImText('Die GOT 2022 nennt 50 Euro und 19 Prozent.').size).toBe(0);
  });
});

describe('artikelJeGotNummer', () => {
  it('ordnet Artikel je Nummer alphabetisch zu', () => {
    const karte = artikelJeGotNummer([
      { href: '/b/', titel: 'Zahn ziehen', text: 'Nr. 951' },
      { href: '/a/', titel: 'Abszess', text: '| 951 | x |' },
    ]);
    expect(karte.get('951')?.map((eintrag) => eintrag.titel)).toEqual(['Abszess', 'Zahn ziehen']);
  });
});
