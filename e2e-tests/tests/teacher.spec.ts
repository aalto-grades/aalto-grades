// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {expect, test} from '@playwright/test';

import {cleanDb, setupDb} from './helper';
import {login} from './login';

test.beforeAll(async () => {
  await setupDb();
});

test.beforeEach(async ({page}) => {
  await login('teacher', page);
});

test.afterEach(async ({page}) => {
  await cleanDb();
  await page.goto('/');
  await page.getByRole('button', {name: 'Timmy Teacher'}).click();
  await page.getByRole('menuitem', {name: 'Logout'}).click();
});

test.describe('Test courses as teacher', () => {
  test('Check course', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
  });

  test('View grading model', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page.getByRole('button', {name: 'Grading models'}).click();

    await page.getByRole('button', {name: 'O1 Grading'}).click();
    await expect(page.getByTestId('rf__wrapper')).toBeVisible();
  });

  test('Create grading model', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page.getByRole('button', {name: 'Grading models'}).click();
    await page.getByLabel('New grading model').click();
    await page.getByLabel('Name *').click();
    await page.getByLabel('Name *').fill('Test model');
    await page.getByLabel('Select template').click();
    await page.getByRole('option', {name: 'Addition'}).click();
    await page.getByRole('button', {name: 'Submit'}).click();
    await expect(page.getByTestId('rf__node-addition')).toBeVisible();
    await page.getByRole('button', {name: 'Format'}).click();
    await expect(
      page.locator('p').filter({hasText: 'Unsaved changes'})
    ).toBeVisible();
    await page.getByRole('button', {name: 'Save'}).click();
    await expect(page.getByText('Model saved successfully.')).toBeVisible();
    await page.getByRole('button', {name: 'Grades', exact: true}).click();
    await page.getByRole('button', {name: 'Grading models'}).click();
    await expect(page.getByRole('button', {name: 'Test model'})).toBeVisible();
  });

  test('View Course Parts', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page
      .getByRole('link', {name: 'Course parts'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Days valid')).toBeVisible();
    await expect(page.getByText('Tier A')).toBeVisible();
  });

  test('Add Course Part', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page
      .getByRole('link', {name: 'Course parts'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Days valid')).toBeVisible();
    await expect(page.getByText('Tier A')).toBeVisible();
    await page.getByRole('button', {name: 'Add new'}).click();
    await page.getByRole('textbox', {name: 'Name'}).fill('test Tier D');
    await page.getByRole('button', {name: 'Save'}).click();
    await page.getByRole('button', {name: 'Save'}).click();
    await expect(page.getByText('test Tier D')).toBeVisible();
  });
});
