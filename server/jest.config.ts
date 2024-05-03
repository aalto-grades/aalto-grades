// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['test'],
  testTimeout: 5000,
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/build/common/$1',
  },
};

export default config;
