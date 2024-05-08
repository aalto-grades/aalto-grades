// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {expect, test} from '@playwright/test';
import {cleanDb, setupDb} from './helper';

test.beforeAll(async () => {
  await setupDb();
});

test.beforeEach(async ({page}) => {
  await page.goto('/login');
  await page.getByLabel('Email').click();
  await page.getByLabel('Email').fill('teacher@aalto.fi');
  await page.getByLabel('Email').press('Tab');
  await page.getByLabel('Password', {exact: true}).fill('password');
  await page.getByLabel('Password', {exact: true}).press('Enter');
  await expect(
    page.getByRole('heading', {name: 'Log in to Aalto Grades'})
  ).toBeHidden();
  await expect(page.getByRole('heading', {name: 'Your Courses'})).toBeVisible();
});

test.afterEach(async ({page}) => {
  await cleanDb();
  await page.goto('/');
  await page.getByRole('button', {name: 'Timmy Teacher'}).click();
  await page.getByRole('menuitem', {name: 'Logout'}).click();
});

test.describe('Test Courses as Teacher', () => {
  test('Check course', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
  });

  test('View assessment model', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page.getByRole('button', {name: 'Grading Models'}).click();

    await page.getByRole('button', {name: 'O1 Grading'}).click();
    await expect(page.getByTestId('rf__wrapper')).toBeVisible();
  });

  test('Create assessment model', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page.getByRole('button', {name: 'Grading Models'}).click();
    await page.getByLabel('New assessment model').click();
    await page.getByLabel('Name *').click();
    await page.getByLabel('Name *').fill('Test Model');
    await page.getByLabel('Select template').click();
    await page.getByRole('option', {name: 'Addition'}).click();
    await page.getByRole('button', {name: 'Submit'}).click();
    await page.getByRole('button', {name: 'Test Model'}).click();
    await expect(page.getByTestId('rf__node-addition')).toBeVisible();
    await page.getByRole('button', {name: 'Format'}).click();
    await expect(
      page.locator('p').filter({hasText: 'Unsaved changes'})
    ).toBeVisible();
    await page.getByRole('button', {name: 'Save'}).click();
    await expect(page.getByText('Model saved successfully.')).toBeVisible();
    await page.getByRole('button', {name: 'Grades', exact: true}).click();
    await page.getByRole('button', {name: 'Grading Models'}).click();
    await expect(page.getByRole('button', {name: 'Test Model'})).toBeVisible();
  });

  test('View Attainments', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page
      .getByRole('link', {name: 'Attainments'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Days valid')).toBeVisible();
    await expect(page.getByText('Tier A')).toBeVisible();
  });

  test('Add Attainment', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page
      .getByRole('link', {name: 'Attainments'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Days valid')).toBeVisible();
    await expect(page.getByText('Tier A')).toBeVisible();
    await page.getByRole('button', {name: 'Add attainment'}).click();
    await page.getByRole('textbox', {name: 'Name'}).fill('test Tier D');
    await page.getByRole('button', {name: 'Save'}).click();
    await page.getByRole('button', {name: 'Save'}).click();
    await expect(page.getByText('test Tier D')).toBeVisible();
  });
});
