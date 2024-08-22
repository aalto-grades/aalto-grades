// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

module.exports = {
  extends: ['plugin:import/recommended', 'plugin:import/typescript'],
  plugins: ['import'],
  rules: {
    // Disable some rules from gts
    'n/no-unpublished-import': 'off',

    // Extra rules on top of gts
    camelcase: 'warn',
    eqeqeq: 'warn',
    'func-names': 'warn', // Try to forbid function keyword
    'func-style': ['warn', 'expression'], // Try to forbid function keyword
    'no-constant-condition': ['warn', {checkLoops: false}],
    'no-unused-vars': 'off', // Replaced by @typescript-eslint rule
    'sort-imports': ['warn', {ignoreDeclarationSort: true}],
    'spaced-comment': ['warn', 'always', {markers: ['/']}],

    'import/extensions': [
      'error',
      'ignorePackages',
      {ts: 'never', tsx: 'never'},
    ],
    'import/no-named-as-default-member': 'off',
    'import/no-unresolved': 'warn',
    'import/order': [
      'warn',
      {
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
        },
        // https://github.com/import-js/eslint-plugin-import/issues/2008#issuecomment-801263294
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        distinctGroup: false,
        pathGroupsExcludedImportTypes: ['builtin', 'object'],
      },
    ],

    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {fixStyle: 'inline-type-imports'},
    ],
    '@typescript-eslint/dot-notation': 'warn',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {allowExpressions: true},
    ],
    '@typescript-eslint/no-import-type-side-effects': 'warn',
    '@typescript-eslint/no-shadow': ['warn', {allow: ['_']}],
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unnecessary-template-expression': 'warn',
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
    ],
    '@typescript-eslint/no-use-before-define': 'warn',
    '@typescript-eslint/prefer-find': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/promise-function-async': 'warn',
    '@typescript-eslint/return-await': 'warn',
    '@typescript-eslint/switch-exhaustiveness-check': 'warn',
  },
};
