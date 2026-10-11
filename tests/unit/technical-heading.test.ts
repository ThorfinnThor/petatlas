import { describe, expect, it } from 'vitest';
import { technicalHeadingParts } from '../../src/lib/technical-heading.ts';

describe('technicalHeadingParts', () => {
  it('behält den sichtbaren amtlichen Text unverändert', () => {
    const text = 'Lungenspülprobe (BAL), zusätzlich zur Intubation/Endoskopie';
    expect(
      technicalHeadingParts(text)
        .map((part) => part.text)
        .join(''),
    ).toBe(text);
  });

  it('verteilt lange Fachwörter ohne einzelne Restbuchstaben', () => {
    const parts = technicalHeadingParts('Speicheldrüsengangverpflanzung');
    expect(parts).toHaveLength(3);
    expect(parts.every((part) => Array.from(part.text).length >= 10)).toBe(true);
    expect(parts.every((part) => Array.from(part.text).length <= 13)).toBe(true);
  });

  it('erlaubt einen Umbruch direkt nach Schrägstrichen', () => {
    const parts = technicalHeadingParts('Nase/Nasopharynx');
    expect(parts).toContainEqual({ text: '/', breakAfter: 'word-break' });
  });

  it('trennt zusammengesetzte Klammer- und Bindestrichschreibweisen sicher', () => {
    const parts = technicalHeadingParts('Reduktion (Zwillings-)trächtigkeit');
    expect(parts).toContainEqual({ text: '-', breakAfter: 'word-break' });
    expect(parts).toContainEqual({ text: ')', breakAfter: 'word-break' });
  });
});
