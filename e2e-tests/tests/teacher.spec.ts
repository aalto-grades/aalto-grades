// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
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
  await page.getByRole('button', {name: 'Timmy Teacher'}).click();
  await page.getByRole('menuitem', {name: 'Log out'}).click();
});
test.use({storageState: 'playwright/.auth/teacher.json'});
test.describe('Test courses as teacher', () => {
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

  test('Create grading model', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page.getByRole('button', {name: 'Grading models'}).click();
    await page.getByLabel('Create new final grade model').click();
    await page.getByLabel('Name *').click();
    await page.getByLabel('Name *').fill('Test model teacher');
    await page.getByLabel('Select template').click();
    await page.getByRole('option', {name: 'Addition'}).click();
    await page.getByRole('button', {name: 'Submit'}).click();
    await expect(page.getByTestId('rf__node-addition')).toBeVisible();
    await page.getByRole('button', {name: 'Format'}).click();
    await expect(
      page.locator('p').filter({hasText: 'Unsaved changes'})
    ).toBeVisible();
    await page.getByRole('button', {name: 'Save'}).click();
    await expect(page.getByText('Model saved successfully')).toBeVisible();
    await page.getByRole('button', {name: 'Grades', exact: true}).click();
    await page.getByRole('button', {name: 'Grading models'}).click();
    await expect(
      page.getByRole('button', {name: 'Test model teacher'})
    ).toBeVisible();
  });

  test('View Course Parts', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page
      .getByRole('link', {name: 'Course parts'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Days valid')).toBeVisible();
    await expect(page.getByText('Exercises 2024')).toBeVisible();
  });

  test('Add Course Part', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page
      .getByRole('link', {name: 'Course parts'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Days valid')).toBeVisible();
    await expect(page.getByText('Exercises 2024')).toBeVisible();
    await page.getByRole('button', {name: 'Add new course part'}).click();
    await page.getByLabel('Name*').click();
    await page.getByLabel('Name*').fill('Exercises 2025');
    await page.getByRole('button', {name: 'Save'}).click();
    await expect(
      page.getByRole('button', {name: 'Exercises 2025 No expiry date'})
    ).toBeVisible();
  });
});
