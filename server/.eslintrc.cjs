// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    '../node_modules/gts',
    '../.eslintrc.cjs',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['node_modules', 'build', '.eslintrc.cjs', 'clean.js'],
  settings: {
    'import/resolver': {
      typescript: {project: `${__dirname}/`}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'error',
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
