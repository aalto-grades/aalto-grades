// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {defineConfig} from 'i18next-cli';

export default defineConfig({
  locales: [
    'en',
    'fi',
    'sv'
  ],
  extract: {
    input: 'src/**/*.{js,jsx,ts,tsx}',
    output: 'locales/{{language}}/{{namespace}}.json',
    defaultNS: 'translation',
    functions: [
      't',
      '*.t'
    ],
    transComponents: [
      'Trans'
    ]
  },
  types: {
    input: [
      'locales/{{language}}/{{namespace}}.json'
    ],
    output: 'src/types/i18next.d.ts'
  }
});
