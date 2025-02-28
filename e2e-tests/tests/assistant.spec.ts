// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {test} from '@playwright/test';

import {checkCourse, viewCourseParts, viewGradingModel} from './common/course';
import {logOut} from './common/user';
import {setupDb} from './helper';

test.beforeAll(async () => {
  await setupDb();
});

test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test.afterEach(async ({page}) => {
  await logOut(page, 'Alex Assistant');
});

test.use({storageState: 'playwright/.auth/assistant.json'});

test.describe('Test courses as Assistant', () => {
  test('Check course', async ({page}) => {
    await checkCourse(page);
  });

  test('View grading model', async ({page}) => {
    await viewGradingModel(page);
  });

  test('View course parts', async ({page}) => {
    await viewCourseParts(page);
  });
});
