// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

module.exports = {
  root: true,
  env: {browser: true, es2020: true},
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    '../node_modules/gts',
    '../.eslintrc.cjs',
  ],
  ignorePatterns: ['node_modules', 'dist', '.eslintrc.cjs', 'vite-env.d.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-refresh', 'no-relative-import-paths'],
  settings: {
    'import/resolver': {
      typescript: {project: `${__dirname}/`}, // this loads <rootdir>/tsconfig.json to eslint
    },
    react: {version: 'detect'},
  },
  rules: {
    camelcase: ['warn', {allow: ['required_error', 'unstable_viewTransition']}],
    'no-restricted-imports': [
      'warn',
      {
        patterns: [
          // Broken :/
          // {
          //   regex: '@/components/(?!(api/enums$)).*',
          //   message:
          //     "Sideways component imports shouldn't be necessary outside from importing from shared",
          // },
          '@/components/app-container/*',
          '@/components/course/*',
          '@/components/front-page/*',
          '@/components/login/*',
        ],
      },
    ],

    'react/button-has-type': 'warn',
    'react/destructuring-assignment': 'warn',
    'react/function-component-definition': [
      'warn',
      {namedComponents: 'arrow-function', unnamedComponents: 'arrow-function'},
    ],
    'react/hook-use-state': 'warn',
    'react/jsx-boolean-value': 'warn',
    'react/jsx-curly-brace-presence': 'warn',
    'react/jsx-filename-extension': ['warn', {extensions: ['.tsx']}],
    'react/jsx-no-constructed-context-values': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    'react/no-danger': 'error',
    'react/prop-types': 'off', // Buggy
    'react/self-closing-comp': 'warn',

    'react-refresh/only-export-components': [
      'warn',
      {allowConstantExport: true},
    ],

    'no-relative-import-paths/no-relative-import-paths': [
      'warn',
      {allowSameFolder: true, rootDir: 'src', prefix: '@'},
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
