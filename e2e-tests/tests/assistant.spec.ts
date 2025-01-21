// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {expect, test} from '@playwright/test';

import {setupDb} from './helper';

test.beforeAll(async () => {
  await setupDb();
});

test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test.afterEach(async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Alex Assistant'}).click();
  await page.getByRole('menuitem', {name: 'Log out'}).click();
});
test.use({storageState: 'playwright/.auth/assistant.json'});
test.describe('Test courses as Assistant', () => {
  test('Check course', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
  });

  test('View grading model', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page.getByRole('button', {name: 'Grading models'}).click();

    await page.getByRole('button', {name: 'Exercises 2024'}).click();
    await expect(page.getByTestId('rf__wrapper')).toBeVisible();
  });

  test('View course parts', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page
      .getByRole('link', {name: 'Course parts'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Exercises 2024')).toBeVisible();
  });
});
