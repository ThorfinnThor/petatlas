// M01-03 — Flat Config. Lintfehler sollen die Pipeline scheitern lassen,
// deshalb keine projektweiten Ausnahmen und kein `--fix` in `npm run lint`.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      '.work/**',
      '.generated/**',
      'reports/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // Vergessene Debugausgaben gehören nicht in einen statischen Build.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Fachlogik darf Unbekanntes nicht durch einen Cast zu Bekanntem erklären.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Skripte laufen in Node und dürfen auf die Konsole schreiben.
    files: ['scripts/**/*.{js,mjs,ts}'],
    rules: { 'no-console': 'off' },
  },
];
