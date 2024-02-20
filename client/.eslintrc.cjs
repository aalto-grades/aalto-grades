// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

module.exports = {
  root: true,
  env: {browser: true, es2020: true},
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    '../.eslintrc.json',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite-env.d.ts', 'vite.config.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-hooks/rules-of-hooks': 'warn',
    '@typescript-eslint/switch-exhaustiveness-check': 'warn',
    'react-refresh/only-export-components': [
      'warn',
      {allowConstantExport: true},
    ],
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
