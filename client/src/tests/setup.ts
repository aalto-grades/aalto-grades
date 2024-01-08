// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {afterEach, beforeAll, afterAll} from 'vitest';
import {cleanup} from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

import {server} from '../tests/mock-data/server';

expect.extend(matchers);

beforeAll(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  cleanup();
  vi.resetAllMocks();
});

afterAll(() => server.close());
