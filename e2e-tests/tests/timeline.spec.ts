// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {expect, test} from '@playwright/test';

import {checkCourse} from './common/course';
import {logOut} from './common/user';
import {setupDb} from './helper';

test.beforeAll(async () => {
  await setupDb();
});

test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test.describe('Timeline View as Teacher', () => {
  test.use({storageState: 'playwright/.auth/teacher.json'});

  test.afterEach(async ({page}) => {
    await logOut(page, 'Timmy Teacher');
  });

  test('Teacher can view timeline', async ({page}) => {
    await checkCourse(page);
    await page.getByRole('link', {name: 'Timeline'}).click();
    await expect(page.getByRole('heading', {name: 'Grade Expiration Timeline'})).toBeVisible();
    await expect(page.getByPlaceholder('Search')).toBeVisible();
    await expect(page.getByRole('slider')).toBeVisible();
  });

  test('Teacher can search in timeline', async ({page}) => {
    await checkCourse(page);
    await page.getByRole('link', {name: 'Timeline'}).click();
    const searchInput = page.getByPlaceholder('Search');
    await searchInput.fill('NonExistentStudent');
    await expect(searchInput).toHaveValue('NonExistentStudent');
  });
});

test.describe('Timeline View as Assistant', () => {
  test.use({storageState: 'playwright/.auth/assistant.json'});

  test.afterEach(async ({page}) => {
    await logOut(page, 'Alex Assistant');
  });

  test('Assistant can view timeline', async ({page}) => {
    // Use existing course O1 where Alex is assistant
    await page.getByRole('cell', {name: 'O1'}).click();
    await page.getByRole('link', {name: 'Timeline'}).click();
    await expect(page.getByRole('heading', {name: 'Grade Expiration Timeline'})).toBeVisible();
    await expect(page.getByPlaceholder('search')).toBeVisible();
  });
});
