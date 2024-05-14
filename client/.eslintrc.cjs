// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

module.exports = {
  root: true,
  env: {browser: true, es2020: true},
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react-hooks/recommended',
    '../node_modules/gts',
    '../.eslintrc.json',
  ],
  ignorePatterns: [
    'node_modules',
    'dist',
    '.eslintrc.cjs',
    'vite-env.d.ts',
    'vite.config.ts',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-refresh'],
  settings: {
    'import/resolver': {
      typescript: {project: `${__dirname}/`}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  rules: {
    camelcase: ['warn', {allow: ['required_error', 'unstable_viewTransition']}],
    'react-refresh/only-export-components': [
      'warn',
      {allowConstantExport: true},
    ],
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': [
      'warn',
      {checksVoidReturn: {attributes: false}}, // To allow async onClick
    ],
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
