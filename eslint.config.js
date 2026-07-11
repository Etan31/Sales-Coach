import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// Flat config covering both workspaces from the repo root.
export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/build/**',
      'client/e2e/**',
      'client/playwright.config.js'
    ]
  },
  js.configs.recommended,

  // CommonJS tooling configs (jest.config.cjs, babel.config.cjs, ...)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node }
    }
  },

  // Server + serverless entry (Node, ES Modules)
  {
    files: ['server/**/*.{js,mjs}', 'api/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn'
    }
  },

  // Server tests (Jest globals)
  {
    files: ['server/**/*.test.js', 'server/**/__tests__/**/*.js', 'server/tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
    rules: { 'no-console': 'off' }
  },

  // Client (browser, JSX)
  {
    files: ['client/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser }
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },

  // Client tests (Jest + jsdom)
  {
    files: ['client/**/*.test.{js,jsx}', 'client/**/__tests__/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.jest, ...globals.node } }
  }
];
