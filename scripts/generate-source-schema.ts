/**
 * M05-01 — Erzeugt `schemas/source.schema.json` aus dem Zod-Schema.
 *
 * Das JSON Schema ist die Fassung für Werkzeuge außerhalb dieses Projekts.
 * Es wird abgeleitet und nicht von Hand gepflegt, damit es nicht von der
 * tatsächlichen Prüfung abweichen kann.
 *
 * Ausführen: `npm run schema:sources`
 */
import { writeFileSync } from 'node:fs';

import { z } from 'zod';

import { SourceEntrySchema } from '../src/domain/source-registry.ts';

const ZIEL = 'schemas/source.schema.json';

const schema = z.toJSONSchema(SourceEntrySchema, { io: 'input' }) as Record<string, unknown>;
schema['$schema'] = 'https://json-schema.org/draft/2020-12/schema';
schema['$id'] = 'https://petatlas.invalid/schemas/source.schema.json';
schema['title'] = 'Source Registry Eintrag';
schema['description'] =
  'Eine konkrete Distribution mit ihren Publikationsrechten. Ein Anbietername allein ist kein gültiger Eintrag.';

writeFileSync(ZIEL, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
console.log(`${ZIEL} aus dem Zod-Schema erzeugt.`);
