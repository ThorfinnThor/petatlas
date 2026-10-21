# Data brief: product comparisons for deinhaustierportal.de (German pet portal)

Goal: for each assigned category, collect >= 7 models (minimum 6 after cleanup) from >= 3 DIFFERENT brands that are
currently sold in Germany, with every value sourced. Prefer the MANUFACTURER's German (or EU) product page; fallback
for missing specs: zooplus.de, fressnapf.de, or another large German retailer page. Never use Amazon reviews, blogs, or
"Test" sites as sources. Mix price levels (budget to premium).

## Tool (use it! curl works for most sites)
  python3 scripts/audit/product-comparison/pagetext.py URL              # prints the normalized text of the page (cached)
  python3 scripts/audit/product-comparison/pagetext.py URL "snippet"    # FOUND / MISSING  (case/whitespace-insensitive substring)
Every `verbatim` you record MUST return FOUND with this tool for its sourceUrl (that is how we cross-check later).
If a site only renders via JS and the tool shows nothing useful, try the site's other URL forms, its JSON-LD
(the tool keeps script text), or a retailer page; WebFetch may be used to locate pages, but recorded verbatims must
be FOUND by the tool. If you cannot verify a value, set value null and explain in notes — never guess.

## Output: one JSON file per category at scripts/audit/product-comparison/raw/<category>.json
{
  "category": "<category key>",
  "checkedAt": "2026-10-20",
  "products": [
    {
      "id": "kebab-case-unique",            // e.g. "catit-pixi-2l"
      "brand": "Catit",
      "model": "PIXI Trinkbrunnen",          // human product name without brand
      "variant": "Weiß · Art.-Nr. 43715",    // size/colour/article number used for the values, or null
      "sourceUrl": "https://… (main manufacturer page)",
      "specs": {
        "<specKey>": { "value": <number|string|boolean|null>, "verbatim": "<exact text from page proving it>", "sourceUrl": "https://…" }
      },
      "price": { "retailer": "zooplus.de", "priceEur": 39.99, "label": "what exactly is priced (variant/size)",
                 "url": "https://…", "verbatim": "<price text FOUND on page, e.g. '39,99 €'>" } | null,
      "notes": "anything uncertain, e.g. conflicting values between manufacturer and retailer, what you could not verify"
    }
  ]
}
Rules:
- Numbers in `value` as plain numbers in the unit named in the spec key (e.g. capacityL: 2). Booleans true/false only when the
  page states it explicitly; absent = null (NOT false) unless the spec says otherwise.
- For a boolean derived from a feature list, verbatim = the feature sentence.
- Price: regular single-purchase price (not subscription/Sparabo, not strike-through), retailer = domain. Prefer zooplus.de
  or fressnapf.de or the manufacturer's own shop. Record what you see today; if no price can be verified, null.
- Keep the article numbers of models already on the site (listed in your task) and add the new ones.
- Do NOT write "Test"/"Testsieger" anywhere. No marketing claims as facts: health claims stay out.
- Work efficiently: spend your effort on finding the right pages and verifying; max ~9 models per category.
- Finish with a short summary: per category the models, brands, and which values are null/uncertain.
