# Toolchain

Stand 2026-09-06 (M01-03). Alle Versionen sind exakt gepinnt, kein `^` und kein `latest`, damit ein Build reproduzierbar bleibt. `package-lock.json` ist verbindlich; Installation im CI mit `npm ci`.

## Laufzeit

| Werkzeug | Version | Begründung |
|---|---|---|
| Node | 24.19.0 (`.nvmrc`) | Node-24-LTS-Linie laut Plan; Astro 7 verlangt `>=22.12.0`. |
| npm | 11.17.0 | Mitgeliefert; erzeugt das Lockfile in Version 3. |
| Python | 3.13.15 | Für den Statushelfer, der `>=3.10` verlangt. Keine Produktabhängigkeit. |

## Abhängigkeiten und Versionsbegründung

| Paket | Version | Begründung |
|---|---|---|
| `astro` | 7.3.1 | Aktuelle stabile Linie; `output: 'static'` ohne SSR-Adapter (ADR-002). |
| `typescript` | 6.0.3 | Bewusst **nicht** 7.x: `@astrojs/check` deklariert `typescript` als Peer mit `^5.0.0 \|\| ^6.0.0`. TypeScript 7 würde den Typecheck-Pfad brechen. Prüfen, sobald `@astrojs/check` 7 unterstützt. |
| `@astrojs/check` | 0.9.10 | Liefert `astro check`, den Typecheck über `.astro`-Dateien hinweg. |
| `@types/node` | 26.4.1 | `process.env` in `config/site.ts` und in Frontmatter. |
| `eslint` | 10.10.0 | Flat Config; von `eslint-plugin-astro` 3 als `>=10.0.0` verlangt. |
| `@eslint/js` | 10.0.1 | Basisregeln (`js.configs.recommended`), passend zur ESLint-10-Linie. |
| `typescript-eslint` | 8.69.0 | Peer von `eslint-plugin-astro` (`>=8.61.0`); unterstützt TypeScript `<6.1.0`. |
| `eslint-plugin-astro` / `astro-eslint-parser` | 3.1.0 | Lint für `.astro`-Dateien; Parser und Plugin bleiben auf gleicher Minor-Linie. |
| `eslint-config-prettier` | 10.1.8 | Schaltet Stilregeln ab, die mit Prettier kollidieren. Steht als letzter Eintrag in der Flat Config. |
| `globals` | 17.12.0 | Globale Namen für Node- und Browserkontext. |
| `prettier` | 3.9.6 | Einheitliche Formatierung des Codes. |
| `prettier-plugin-astro` | 0.14.1 | Formatiert `.astro`-Dateien. |
| `vitest` | 5.0.0 | Unit- und Integrationstests; unterstützt Node 24. |
| `@playwright/test` | 1.63.0 | End-to-End inklusive zweitem Engine-Pfad und mobilem Format. |

## Befehle

| Befehl | Wirkung |
|---|---|
| `npm run lint` | ESLint über das ganze Projekt, ohne `--fix`. Fehler brechen ab. |
| `npm run typecheck` | `astro check` über `.astro`, `.ts` und Frontmatter. |
| `npm run format` / `format:check` | Prettier schreiben bzw. prüfen. |
| `npm run test:unit` | Vitest, offline, `passWithNoTests: false`. |
| `npm run test:e2e` | Playwright gegen den **gebauten** statischen Output, nicht gegen den Dev-Server. |
| `npm run build` | Statischer Astro-Build nach `dist/`. |

Die weiteren Befehle aus `docs/QUALITY_GATES.md` Abschnitt 2 entstehen in den Meilensteinen, die sie brauchen.

## Bewusste Festlegungen

- Markdown ist in `.prettierignore`. Plan-, Quellen- und Statusdokumente werden inhaltlich gepflegt, nicht bei jedem Formatlauf neu umgebrochen.
- Playwright läuft mit `retries: 0`. Ein Test, der erst im zweiten Anlauf besteht, gilt als rot.
- ESLint verbietet `any` und `console.log` in Produktcode; `scripts/**` darf auf die Konsole schreiben.
- Vitest ist offline; Tests dürfen weder Netz noch echte Credentials brauchen.

## Umgebungsproblem auf der Entwicklungsmaschine

Node verifiziert hier die Zertifikatskette von `registry.npmjs.org` nicht mit seinem eingebauten CA-Bundle (`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`), obwohl die Kette gültig ist. Lösung ohne Abschwächung der TLS-Prüfung:

```bash
mkdir -p .work/ca
security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
```

`.work/` ist ignoriert, `strict-ssl` bleibt aktiv. Auf CI-Runnern ist der Schritt voraussichtlich nicht nötig; das wird in M07 geprüft.

## Nachweis M01-03

| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Lint sauber | `npm run lint` | exit 0 |
| Typecheck sauber | `npm run typecheck` | 0 Fehler über 6 Dateien |
| Format sauber | `npm run format:check` | alle Dateien konform |
| Unit-Tests laufen | `npm run test:unit` | 1 Datei, 9 Tests bestanden |
| Playwright-Konfiguration lädt | `npx playwright test --list` | 3 Tests über 3 Projekte |
| **Absichtlicher Typfehler bricht ab** | `npm run typecheck` mit `src/canary-tmp.ts` | exit 1, `ts(2322)` |
| **Absichtliche Lintfehler brechen ab** | `npm run lint` mit `src/canary-tmp.ts` | exit 1, 4 Fehler (`no-explicit-any`, `no-console`, `eqeqeq`, `no-var`) |

Die Canary-Datei wurde nach der Prüfung entfernt; danach sind Lint und Typecheck wieder exit 0.
