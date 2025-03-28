// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    '../node_modules/gts',
    '../.eslintrc.cjs',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['node_modules', '.eslintrc.cjs'],
  rules: {},
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
