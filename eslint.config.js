// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import eslintPluginYml from 'eslint-plugin-yml';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    name: 'Global Ignore',
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/*.js.map',
      '**/coverage/'
    ]
  },

  {
    name: 'Stylistic Clean Old Rules',
    ...stylistic.configs['disable-legacy']

  },
  {
    name: 'Stylistic Configuration',
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
      '@stylistic/operator-linebreak': ['error', 'before', {overrides: {'=': 'after',}}], // default in old eslint
      '@stylistic/spaced-comment': ['warn', 'always', {markers: ['/']}], // Fix some weird issues
      // '@stylistic/indent-binary-ops': ['off'], // WTF NEED TO FIX
      '@stylistic/quotes': ['error', 'single', {allowTemplateLiterals: 'always', avoidEscape: true}],
    }

  },

  {
    name: 'ESLint Recommended',
    ...js.configs.recommended
  },

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

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

  // Main configuration for TypeScript files
  {
    name: 'TypeScript Configuration',
    files: ['**/*.{ts,tsx}'],
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
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
      'camelcase': 'warn',
      'eqeqeq': 'warn',
      'func-names': 'warn', // Try to forbid function keyword
      'func-style': ['warn', 'expression'], // Try to forbid function keyword
      'no-constant-condition': ['warn', {checkLoops: false}],
      'no-unused-vars': 'off', // Replaced by @typescript-eslint rule
      'sort-imports': ['warn', {ignoreDeclarationSort: true}],

      'import/extensions': [
        'warn', // Changed from error to warning
        'ignorePackages',
        {ts: 'never', tsx: 'never'}
      ],
      'import/newline-after-import': 'warn',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': ['warn', {
        ignore: ['^@/'] // Ignore path alias resolution issues
      }],
      'import/order': [
        'warn',
        {
          'groups': [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index']
          ],
          'newlines-between': 'always',
          'alphabetize': {order: 'asc'},
          // https://github.com/import-js/eslint-plugin-import/issues/2008#issuecomment-801263294
          'pathGroups': [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before'
            }
          ],
          'distinctGroup': false,
          'pathGroupsExcludedImportTypes': ['builtin', 'object']
        }
      ],

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
      '@typescript-eslint/switch-exhaustiveness-check': 'warn',
      '@typescript-eslint/no-deprecated': 'warn'
    }
  },

  // Configuration for JavaScript files (disabling TypeScript-specific rules)
  {
    name: 'JavaScript Configuration',
    files: ['**/*.{js,mjs}'],
    extends: [importPlugin.flatConfigs.recommended],
    settings: {
      'import/resolver': {
        node: true
      }
    },
    rules: {
      // Only basic rules for JS files
      'camelcase': 'warn',
      'eqeqeq': 'warn',
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
          'groups': [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index']
          ],
          'newlines-between': 'always',
          'alphabetize': {order: 'asc'}
        }
      ]
    }
  },

  {
    name: 'Yaml Configuration',
    files: ['*.yaml', '**/*.yaml', '*.yml', '**/*.yml'],
    extends: [eslintPluginYml.configs['flat/recommended']],
    rules: {
      'yml/no-multiple-empty-lines': ['error', {max: 1}] // Default is 2
    }

  },

  // Special configuration for config files (must be last to override)
  {
    files: ['**/eslint.config.js'],
    rules: {
      'import/no-unresolved': 'off' // typescript-eslint might not be resolved properly by import plugin
    }
  }
);
