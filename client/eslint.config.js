// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/*.js.map',
      'vite-env.d.ts',
    ]
  },
  
  // Base ESLint recommended rules for all files
  js.configs.recommended,
  
  // TypeScript ESLint recommended for TS files without type checking first
  ...tseslint.configs.recommended,
  
  // React plugin flat configs
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'], // For React 17+ JSX transform
  
  // React Hooks recommended config
  reactHooks.configs['recommended-latest'],
  
  // Configuration for JS config files
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Disable some rules that don't apply to config files
      '@typescript-eslint/no-require-imports': 'off',
    }
  },
  
  // Main configuration for TypeScript/React files with type checking
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      importPlugin.flatConfigs.recommended, 
      importPlugin.flatConfigs.typescript
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
      'react-refresh': reactRefresh,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            './tsconfig.node.json',
            './tsconfig.app.json',
          ],
        },
        node: true,
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Disable some rules from gts that conflict with React
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': 'off',

      // Extra rules on top of base config
      camelcase: ['warn', {allow: ['required_error', 'unstable_viewTransition']}],
      eqeqeq: 'warn',
      'func-names': 'warn',
      'func-style': ['warn', 'expression'],
      'no-constant-condition': ['warn', {checkLoops: false}],
      'no-unused-vars': 'off', // Replaced by @typescript-eslint rule
      'sort-imports': ['warn', {ignoreDeclarationSort: true}],
      'spaced-comment': ['warn', 'always', {markers: ['/']}],

      // Import plugin rules
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

      // Restricted imports
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            '@/components/app-container/*',
            '@/components/course/*',
            '@/components/front-page/*',
            '@/components/login/*',
          ],
        },
      ],

      // React rules
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
      'react/prop-types': 'off', // We use TypeScript for prop validation
      'react/self-closing-comp': 'warn',

      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        {allowConstantExport: true},
      ],

      // No relative import paths plugin
      'no-relative-import-paths/no-relative-import-paths': [
        'warn',
        {allowSameFolder: true, rootDir: 'src', prefix: '@'},
      ],

      // TypeScript specific rules
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {fixStyle: 'inline-type-imports'},
      ],
      '@typescript-eslint/dot-notation': 'warn',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {allowExpressions: true},
      ],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'warn',
        {checksVoidReturn: {attributes: false}}, // To allow async onClick
      ],
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
  },
  
  // Configuration for JavaScript files
  {
    files: ['**/*.{js,mjs}'],
    extends: [importPlugin.flatConfigs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
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
);
