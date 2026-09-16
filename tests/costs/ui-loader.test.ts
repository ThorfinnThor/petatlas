import { afterEach, describe, expect, it, vi } from 'vitest';

import { ladeKatalog } from '../../src/features/costs/ui.ts';

const POSITION = {
  officialItemId: 'S1',
  catalogVersion: 'SYNTHETISCH 2026',
  originalLabel: 'Synthetische Beispielposition',
  species: null,
  baseUnit: 'Einzelleistung',
  baseAmountMinor: 1000,
  currency: 'EUR',
  sourceReference: 'synthetische Fundstelle',
  validity: { from: '2026-01-01', until: null },
};

afterEach(() => vi.unstubAllGlobals());

describe('Gebührenkatalog laden', () => {
  it('prüft HTTP-Status des Manifests', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(ladeKatalog()).rejects.toThrow('HTTP 503');
  });

  it('lehnt einen falschen Payload ab', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ chunks: [] }), { status: 200 })),
    );
    await expect(ladeKatalog()).rejects.toThrow('keine Gebührendaten');
  });

  it('liefert nur nach geprüftem Manifest und geprüftem Datensatz', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            chunks: [{ kind: 'fees', marketId: 'DE', path: '/data/v1/fees/de/test.json' }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ records: [POSITION] }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(ladeKatalog()).resolves.toEqual([POSITION]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
