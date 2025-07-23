// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/node_modules/', 
      '**/dist/', 
      '**/build/', 
      '**/*.js.map',
      '**/coverage/',
    ]
  },
  
  // Base ESLint recommended rules
  js.configs.recommended,
  
  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,
  
  // Configuration for CommonJS files (.cjs, .js in Node.js context)
  {
    files: ['**/*.cjs', '**/*clean.js', '**/*setup.js', '.prettierrc.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: true,
        require: true,
        process: true,
        console: true,
        __dirname: true,
        __filename: true,
        Buffer: true,
        global: true,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'func-style': 'off',
      'func-names': 'off',
    },
  },
  
  // Main configuration for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            'tsconfig.json',
            'client/tsconfig.json',
            'server/tsconfig.json',
            'common/tsconfig.json',
            'e2e-tests/tsconfig.json',
          ],
        },
        node: true,
      },
    },
    rules: {
      
      // Disable some rules from gts
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': 'off',

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
        'warn', // Changed from error to warning
        'ignorePackages',
        {ts: 'never', tsx: 'never'},
      ],
      'import/newline-after-import': 'warn',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': ['warn', { 
        ignore: ['^@/'] // Ignore path alias resolution issues
      }],
      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: {order: 'asc'},
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
      '@typescript-eslint/no-deprecated': 'warn',
    },
  },
  
  // Configuration for JavaScript files (disabling TypeScript-specific rules)
  {
    files: ['**/*.{js,mjs}'],
    extends: [importPlugin.flatConfigs.recommended],
    settings: {
      'import/resolver': {
        node: true,
      },
    },
    rules: {
      // Only basic rules for JS files
      camelcase: 'warn',
      eqeqeq: 'warn',
      'func-names': 'warn',
      'func-style': ['warn', 'expression'],
      'no-constant-condition': ['warn', {checkLoops: false}],
      'sort-imports': ['warn', {ignoreDeclarationSort: true}],
      'spaced-comment': ['warn', 'always', {markers: ['/']}],
      
      'import/extensions': ['error', 'ignorePackages'],
      'import/newline-after-import': 'warn',
      'import/no-named-as-default-member': 'off',
      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: {order: 'asc'},
        },
      ],
    },
  },
  
  // Special configuration for config files (must be last to override)
  {
    files: ['**/eslint.config.js'],
    rules: {
      'import/no-unresolved': 'off', // typescript-eslint might not be resolved properly by import plugin
    },
  },
);
