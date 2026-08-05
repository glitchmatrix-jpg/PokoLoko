import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'archive/**',
      'scripts/**',
      'tests/**',
      'public/**',
      'dist/**',
      'dist-electron/**',
      'release/**',
      'coverage/**',
      'reports/**',
      'node_modules/**',
    ],
  },
  {
    files: [
      'src/**/*.{ts,tsx}',
      'electron/**/*.ts',
      'packages/**/*.ts',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
);
