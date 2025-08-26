// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginYml from 'eslint-plugin-yml';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    name: 'Global Ignore',
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/*.js.map',
      '**/coverage/',
      'vite-env.d.ts',
      '**/e2e-tests/{test-results,playwright-report}/',
    ]
  },

  {
    name: 'Stylistic Configuration',
    ignores: ['**/*.yml', '**/*.yaml'], // Handled by eslint-plugin-yml
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      ...stylistic.configs.customize({
        indent: 2,
        braceStyle: '1tbs',
        semi: true
      }).rules,
      '@stylistic/comma-dangle': ['off', 'always-multiline'], // To be changed in the future, TODO
      '@stylistic/object-curly-spacing': ['error', 'never'], // more compact, legacy rule
      '@stylistic/operator-linebreak': ['error', 'before', {overrides: {'=': 'after',}}], // "=" before is ugly
      '@stylistic/spaced-comment': ['warn', 'always', {markers: ['/']}], // Fix some weird issues
      '@stylistic/quotes': ['error', 'single', {allowTemplateLiterals: 'always', avoidEscape: true}], // as it was before
      '@stylistic/quote-props': ['error', 'as-needed'], // as it was before
    }
  },

  {
    name: 'ESLint Recommended',
    ...js.configs.recommended
  },

  // TypeScript ESLint recommended rules
  tseslint.configs.recommended,

  // // Configuration for CommonJS files (.cjs, .js in Node.js context)
  // {
  //   files: ['**/*.cjs', '**/*clean.js', '**/*setup.js', '.prettierrc.js'],
  //   languageOptions: {
  //     sourceType: 'commonjs',
  //     globals: {
  //       module: true,
  //       require: true,
  //       process: true,
  //       console: true,
  //       __dirname: true,
  //       __filename: true,
  //       Buffer: true,
  //       global: true,
  //     },
  //   },
  //   rules: {
  //     '@typescript-eslint/no-require-imports': 'off',
  //     'func-style': 'off',
  //     'func-names': 'off',
  //   },
  // },

  // Common rules shared by both TypeScript and React TS configurations
  {
    name: 'TypeScript Configuration',
    files: ['**/*.{ts,tsx}'],
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    rules: {
      // General JS rules
      camelcase: 'warn',
      eqeqeq: 'warn',
      'func-names': 'warn',
      'func-style': ['warn', 'expression'],
      'no-constant-condition': ['warn', {checkLoops: false}],
      'no-unused-vars': 'off', // Replaced by @typescript-eslint rule
      'sort-imports': ['warn', {ignoreDeclarationSort: true}],

      // Import plugin rules
      'import/newline-after-import': 'warn',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': ['warn', {ignore: ['^@/']}],
      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index']
          ],
          'newlines-between': 'always',
          alphabetize: {order: 'asc'},
          // https://github.com/import-js/eslint-plugin-import/issues/2008#issuecomment-801263294
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before'
            }
          ],
          distinctGroup: false,
          pathGroupsExcludedImportTypes: ['builtin', 'object']
        }
      ],

      // TypeScript-specific rules
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {fixStyle: 'inline-type-imports'}
      ],
      '@typescript-eslint/dot-notation': 'warn',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {allowExpressions: true}
      ],
      '@typescript-eslint/no-import-type-side-effects': 'warn',
      '@typescript-eslint/no-shadow': ['warn', {allow: ['_']}],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-template-expression': 'warn',
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}
      ],
      '@typescript-eslint/no-use-before-define': 'warn',
      '@typescript-eslint/prefer-find': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/promise-function-async': 'warn',
      '@typescript-eslint/return-await': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': ['warn',
        {considerDefaultExhaustiveForUnions: true}
      ],
    }
  },

  // Backend configuration for TypeScript files
  {
    name: 'Server TypeScript Configuration',
    ignores: ['**/client/**/*.{ts,tsx}'],
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            'tsconfig.json',
            'client/tsconfig.json',
            'server/tsconfig.json',
            'common/tsconfig.json',
            'e2e-tests/tsconfig.json'
          ]
        },
        node: true
      }
    },
    rules: {
      'import/extensions': [
        'warn', // Changed from error to warning
        'ignorePackages',
        {ts: 'never', tsx: 'never'}
      ],
      '@typescript-eslint/no-deprecated': 'warn'
    }
  },

  // Configuration for JavaScript files (disabling TypeScript-specific rules)
  // {name: 'JavaScript Configuration',
  //   files: ['**/*.{js,mjs}'],
  //   extends: [importPlugin.flatConfigs.recommended],
  //   settings: {
  //     'import/resolver': {
  //       node: true
  //     }
  //   },
  //   rules: {
  //     // Only basic rules for JS files
  //     'camelcase': 'warn',
  //     'eqeqeq': 'warn',
  //     'func-names': 'warn',
  //     'func-style': ['warn', 'expression'],
  //     'no-constant-condition': ['warn', {checkLoops: false}],
  //     'sort-imports': ['warn', {ignoreDeclarationSort: true}],
  //     'spaced-comment': ['warn', 'always', {markers: ['/']}],

  //     'import/extensions': ['error', 'ignorePackages'],
  //     'import/newline-after-import': 'warn',
  //     'import/no-named-as-default-member': 'off',
  //     'import/order': [
  //       'warn',
  //       {
  //         'groups': [
  //           ['builtin', 'external'],
  //           ['internal', 'parent', 'sibling', 'index']
  //         ],
  //         'newlines-between': 'always',
  //         'alphabetize': {order: 'asc'}
  //       }
  //     ]
  //   }
  // },

  {
    name: 'Yaml Configuration',
    files: ['*.yaml', '**/*.yaml', '*.yml', '**/*.yml'],
    extends: [eslintPluginYml.configs['flat/recommended']],
    rules: {
      'yml/no-multiple-empty-lines': ['error', {max: 1}] // Default is 2
    }
  },

  // Special configuration for config files
  {
    name: 'weird fix for this file',
    files: ['**/eslint.config.js'],
    rules: {
      'import/no-unresolved': 'off' // typescript-eslint might not be resolved properly by import plugin
    }
  },

  // Main configuration for TypeScript/React files with type checking
  {
    name: 'React TS',
    files: ['**/client/**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs['recommended-latest'],
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
      // Restricted imports
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: [
                '@/components/app-container/*',
                '@/components/course/*',
                '@/components/front-page/*',
                '@/components/login/*',
              ],
              message: 'Use relative paths for components in the same folder or subfolders.'
            }
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
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': [
        'warn',
        {checksVoidReturn: {attributes: false}}, // To allow async onClick
      ],

    },
  },
  {
    name: 'Stylistic fix for MUI Css Props',
    files: ['**/client/**/*.{tsx}'],
    rules: {
      // Stylistic
      '@stylistic/quote-props': ['error', 'as-needed'],
    }}
);
