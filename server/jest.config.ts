// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['test'],
  testTimeout: 5000,
  globalSetup: './test/util/setup.js',
  moduleNameMapper: {
    '^@/common/(.*)$': '<rootDir>/build/common/$1',
  },
  reporters:
    process.env.GITHUB_ACTIONS !== '1'
      ? ['default']
      : [['github-actions', {silent: false}]],
};

export default config;
