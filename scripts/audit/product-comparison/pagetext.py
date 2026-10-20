#!/usr/bin/env python3
"""Fetch a URL (cached), strip HTML to text, print it or grep it.
usage: pagetext.py URL            -> prints normalized page text (incl. JSON-LD / meta / script text)
       pagetext.py URL "snippet"  -> exit 0 + 'FOUND' if snippet occurs (whitespace/case-insensitive), else 'MISSING'
"""
import hashlib, html, os, re, subprocess, sys
CACHE = os.environ.get('PAGE_CACHE', '/tmp/product-comparison-pages')
os.makedirs(CACHE, exist_ok=True)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36'
def fetch(url):
    p = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + '.html')
    if not os.path.exists(p) or os.path.getsize(p) < 500:
        subprocess.run(['curl', '-sL', '--compressed', '--max-time', '40', '-A', UA, '-H', 'Accept-Language: de-DE,de;q=0.9', '-o', p, url], check=False)
    return open(p, encoding='utf-8', errors='replace').read() if os.path.exists(p) else ''
def text(raw):
    raw = re.sub(r'<style[\s\S]*?</style>', ' ', raw, flags=re.I)
    raw = re.sub(r'<(br|/p|/li|/tr|/h\d|/div|/td|/th)[^>]*>', '\n', raw, flags=re.I)
    raw = re.sub(r'<[^>]+>', ' ', raw)
    raw = html.unescape(html.unescape(raw))
    raw = raw.replace('\\u00a0', ' ').replace(' ', ' ').replace('\\/', '/')
    raw = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), raw)
    raw = re.sub(r'[ \t\r\f\v]+', ' ', raw)
    return re.sub(r'\n\s*\n+', '\n', raw)
def norm(s):
    return re.sub(r'\s+', ' ', s).strip().lower()
if __name__ == '__main__':
    url = sys.argv[1]
    t = text(fetch(url))
    if len(sys.argv) > 2:
        ok = norm(sys.argv[2]) in norm(t)
        print('FOUND' if ok else 'MISSING'); sys.exit(0 if ok else 1)
    print(t)
