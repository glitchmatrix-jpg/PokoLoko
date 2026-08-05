import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'archive/**',
      'dist/**',
      'dist-electron/**',
      'release/**',
      'coverage/**',
      'reports/**',
      'node_modules/**',
      'public/assets/runtime/runtime_registry.ts',
      'scripts/*.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'electron/**/*.ts', 'packages/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);