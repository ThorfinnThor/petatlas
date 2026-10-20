#!/usr/bin/env python3
"""Merge scratch category files into the repo dataset, applying documented editorial overrides."""
import json, glob, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', '..', 'content-data', 'products', 'comparison-2026-10.json')
ORDER = ['katzentrinkbrunnen','katzen-futterautomat','katzentoilette','katzenspielzeug-kugelbahn',
         'katzentransportbox','hunderampe-auto','kauspielzeug-hund','rollleine','hundetransportbox-auto']
# (id, spec) -> dict of replacements. Each override keeps a verbatim that is FOUND on the source.
OVERRIDES = json.load(open(os.path.join(os.path.dirname(__file__), 'overrides.json')))
products = []
for cat in ORDER:
    f = os.path.join(HERE, 'raw', cat + '.json')
    if not os.path.exists(f): print('missing', cat); continue
    d = json.load(open(f))
    for p in d['products']:
        specs = dict(p['specs'])
        for k in [k for k in p if k not in ('id','brand','model','variant','sourceUrl','specs','price','notes','checkedAt','category')]:
            v = p[k]
            if isinstance(v, dict) and 'value' in v: specs[k] = v
            elif v is not None: specs[k] = {'value': v, 'verbatim': (p.get(k.replace('Count',''), {}) or {}).get('verbatim'), 'sourceUrl': (p.get(k.replace('Count',''), {}) or {}).get('sourceUrl')}
        for key, rep in OVERRIDES.get(p['id'], {}).items():
            if key == '#variant': p['variant'] = rep; continue
            if rep is None: specs.pop(key, None)
            else: specs[key] = rep
        specs = {k: {'value': v.get('value'), 'verbatim': v.get('verbatim') or None, 'sourceUrl': (v.get('sourceUrl') or None) if str(v.get('sourceUrl') or '').startswith('http') else None} for k, v in specs.items()}
        price = p.get('price')
        if price: price = {k: price[k] for k in ('retailer','priceEur','label','url','verbatim')}
        if OVERRIDES.get(p['id'] + '#drop'): continue
        products.append({'id': p['id'], 'category': cat, 'brand': p['brand'], 'model': p['model'], 'variant': p.get('variant'),
                         'sourceUrl': p['sourceUrl'], 'specs': specs, 'price': price, 'checkedAt': d.get('checkedAt','2026-10-20'),
                         **({'notes': p['notes']} if p.get('notes') else {})})
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump({'datasetId': 'product-comparison-2026-10', 'checkedAt': '2026-10-20', 'dataKind': 'real', 'products': products},
          open(OUT, 'w'), ensure_ascii=False, indent=2)
open(OUT, 'a').write('\n')
from collections import Counter
print(Counter(p['category'] for p in products))
