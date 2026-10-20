#!/usr/bin/env python3
import json, sys, re, os
sys.path.insert(0, os.path.dirname(__file__))
from pagetext import fetch, text, norm
def numforms(v):
    s = ('%g' % v)
    return {s, s.replace('.', ',')}
bad = 0; total = 0
for path in sys.argv[1:]:
    d = json.load(open(path))
    for p in d['products']:
        items = list(p['specs'].items())
        if p.get('price'): items.append(('price', {'value': p['price']['priceEur'], 'verbatim': p['price']['verbatim'], 'sourceUrl': p['price']['url']}))
        for k, s in items:
            if s.get('value') is None: continue
            total += 1
            vb, url = s.get('verbatim'), s.get('sourceUrl')
            prob = []
            if not vb or not url: prob.append('no verbatim/url')
            else:
                t = norm(text(fetch(url)))
                if norm(vb) not in t: prob.append('verbatim MISSING on page')
                if isinstance(s['value'], (int, float)) and not isinstance(s['value'], bool):
                    if not any(f in vb for f in numforms(s['value'])): prob.append('number not in verbatim')
            if prob:
                bad += 1; print(f"{p['id']}.{k} = {s.get('value')!r}: {'; '.join(prob)} | {str(vb)[:80]!r}")
print(f'{total - bad}/{total} values verified')
