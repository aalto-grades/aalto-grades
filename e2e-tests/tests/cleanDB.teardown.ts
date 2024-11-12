// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {test as teardown} from '@playwright/test';

import {cleanDb} from './helper';

teardown('delete database', async () => {
  await cleanDb();
});
