export interface TechnicalHeadingPart {
  readonly text: string;
  readonly breakAfter: false | 'soft-hyphen' | 'word-break';
}

const MAX_SEGMENT_LENGTH = 13;

function splitBalanced(value: string): readonly string[] {
  const characters = Array.from(value);
  if (characters.length <= MAX_SEGMENT_LENGTH) return [value];

  const chunkCount = Math.ceil(characters.length / MAX_SEGMENT_LENGTH);
  const baseLength = Math.floor(characters.length / chunkCount);
  const longerChunks = characters.length % chunkCount;
  const chunks: string[] = [];
  let offset = 0;

  for (let index = 0; index < chunkCount; index += 1) {
    const length = baseLength + (index < longerChunks ? 1 : 0);
    chunks.push(characters.slice(offset, offset + length).join(''));
    offset += length;
  }

  return chunks;
}

/**
 * Fügt nur Darstellungspunkte ein; der Text selbst bleibt unverändert.
 * Lange amtliche Fachwörter werden in ähnlich große Abschnitte geteilt,
 * damit kein einzelner Schlussbuchstabe auf einer eigenen Zeile landet.
 */
export function technicalHeadingParts(value: string): readonly TechnicalHeadingPart[] {
  const parts: TechnicalHeadingPart[] = [];
  const tokens = value.split(/([\p{L}\p{N}]+)/gu).filter(Boolean);

  for (const token of tokens) {
    if (/^[\p{L}\p{N}]+$/u.test(token)) {
      const chunks = splitBalanced(token);
      chunks.forEach((chunk, index) => {
        parts.push({
          text: chunk,
          breakAfter: index < chunks.length - 1 ? 'soft-hyphen' : false,
        });
      });
      continue;
    }

    let buffer = '';
    for (const character of token) {
      buffer += character;
      if (character === '/' || character === '-' || character === ')') {
        parts.push({ text: buffer, breakAfter: 'word-break' });
        buffer = '';
      }
    }
    if (buffer) parts.push({ text: buffer, breakAfter: false });
  }

  return parts;
}
