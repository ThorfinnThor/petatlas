// M20-01 — Die Detailseiten entstehen aus dem Snapshot. Geprüft wird, dass
// die Slugs stabil und eindeutig sind und dass die Beträge stimmen —
// beides von Hand nachgerechnet.
import { describe, expect, it } from 'vitest';

import {
  faktorzeilen,
  fundstelleZerlegen,
  gruppeNachSlug,
  gruppeVon,
  gruppen,
  nachbarn,
  positionNachSlug,
  positionen,
  positionsSlug,
  slugTeil,
  teile,
} from '../../src/features/costs/detail.ts';
import { COST_CONFIG } from '../../src/features/costs/engine.ts';

describe('Slugs', () => {
  it('macht aus einer Bezeichnung ASCII mit Bindestrichen', () => {
    expect(slugTeil('Beratung im einzelnen Fall')).toBe('beratung-im-einzelnen-fall');
    expect(slugTeil('Röntgen — Gliedmaßen (2 Ebenen)')).toBe('roentgen-gliedmassen-2-ebenen');
  });

  it('setzt die amtliche Nummer nach vorn', () => {
    expect(positionsSlug({ officialItemId: '1', originalLabel: 'Beratung' })).toBe('1-beratung');
  });

  it('kommt mit einer Bezeichnung ohne verwertbare Zeichen zurecht', () => {
    expect(positionsSlug({ officialItemId: '7', originalLabel: '———' })).toBe('nr-7');
  });

  it('vergibt für 1006 Positionen 1006 verschiedene Slugs', () => {
    const alle = positionen();
    expect(alle.length).toBe(1006);
    expect(new Set(alle.map((eintrag) => eintrag.slug)).size).toBe(alle.length);
  });

  it('findet eine Position über ihren Slug wieder', () => {
    const erste = positionen()[0];
    expect(erste).toBeDefined();
    expect(positionNachSlug(erste!.slug)?.item.officialItemId).toBe(erste!.item.officialItemId);
  });

  it('enthält keinen Schrägstrich — sonst entstünde eine Ebene mehr', () => {
    for (const eintrag of positionen()) {
      expect(eintrag.slug.includes('/'), eintrag.slug).toBe(false);
    }
  });
});

describe('Fundstelle', () => {
  it('zerlegt Teil und Gruppe', () => {
    const zerlegt = fundstelleZerlegen('GOT · Teil A · Grundleistungen · lfd. Nr. 1');
    expect(zerlegt.teil).toBe('Teil A');
    expect(zerlegt.gruppe).toBe('Grundleistungen');
  });

  it('lässt die Gruppe leer, wenn direkt die Nummer folgt', () => {
    const zerlegt = fundstelleZerlegen('GOT · Teil B · lfd. Nr. 90');
    expect(zerlegt.teil).toBe('Teil B');
    expect(zerlegt.gruppe).toBeNull();
  });
});

describe('Gliederung', () => {
  it('fasst die Positionen in Gruppen mit eindeutigem Slug', () => {
    const alle = gruppen();
    expect(alle.length).toBeGreaterThan(100);
    expect(new Set(alle.map((gruppe) => gruppe.slug)).size).toBe(alle.length);
  });

  it('ordnet jede Position genau einer Gruppe zu', () => {
    const summe = gruppen().reduce((zahl, gruppe) => zahl + gruppe.positionen.length, 0);
    expect(summe).toBe(positionen().length);
  });

  it('findet zu einer Position ihre Gruppe und umgekehrt', () => {
    const erste = positionen()[0]!;
    const gruppe = gruppeVon(erste);
    expect(gruppe).toBeDefined();
    expect(gruppeNachSlug(gruppe!.slug)?.name).toBe(gruppe!.name);
    expect(gruppe!.positionen.some((eintrag) => eintrag.slug === erste.slug)).toBe(true);
  });

  it('gliedert in Teile', () => {
    const alle = teile();
    expect(alle.length).toBeGreaterThan(1);
    expect(alle.every((teil) => teil.gruppen.length > 0)).toBe(true);
  });

  it('zeigt als Nachbarn nur Positionen derselben Gruppe', () => {
    const erste = positionen()[0]!;
    for (const nachbar of nachbarn(erste)) {
      expect(nachbar.teil).toBe(erste.teil);
      expect(nachbar.gruppe).toBe(erste.gruppe);
      expect(nachbar.slug).not.toBe(erste.slug);
    }
  });
});

describe('Gebührensätze', () => {
  // Position 1 kostet 11,26 € netto. 19 % Umsatzsteuer ergeben 2,14 € →
  // 13,40 € brutto. Zweifach: 22,52 € netto, 4,28 € Steuer, 26,80 € brutto.
  const erste = positionen()[0]!;

  it('rechnet den regulären Rahmen von einfach bis dreifach', () => {
    const zeilen = faktorzeilen(erste.item, 'regular');
    expect(zeilen.map((zeile) => zeile.faktor)).toEqual([1, 2, 3]);
    expect(zeilen[0]?.nettoMinor).toBe(1126);
    expect(zeilen[0]?.bruttoMinor).toBe(1340);
    expect(zeilen[1]?.nettoMinor).toBe(2252);
    expect(zeilen[1]?.bruttoMinor).toBe(2680);
  });

  it('rechnet im Notdienst von zweifach bis vierfach', () => {
    const zeilen = faktorzeilen(erste.item, 'emergency');
    expect(zeilen.map((zeile) => zeile.faktor)).toEqual([2, 3, 4]);
    expect(zeilen.at(-1)?.nettoMinor).toBe(4504);
  });

  it('bleibt bei den Faktorgrenzen der Konfiguration', () => {
    const zeilen = faktorzeilen(erste.item, 'regular');
    expect(zeilen[0]?.faktor).toBe(COST_CONFIG.standardFactorMin);
    expect(zeilen.at(-1)?.faktor).toBe(COST_CONFIG.standardFactorMax);
  });

  it('enthält die Notdienstgebühr nicht in den Zeilen', () => {
    const zeilen = faktorzeilen(erste.item, 'emergency');
    for (const zeile of zeilen) {
      expect(zeile.nettoMinor).toBeLessThan(COST_CONFIG.emergencyFeeMinor + zeile.nettoMinor);
      expect(zeile.nettoMinor % erste.item.baseAmountMinor).toBe(0);
    }
  });
});
