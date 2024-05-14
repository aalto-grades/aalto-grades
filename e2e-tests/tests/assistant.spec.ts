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
  await page.getByLabel('Email').fill('assistant@aalto.fi');
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
  await page.getByRole('button', {name: 'Alex Assistant'}).click();
  await page.getByRole('menuitem', {name: 'Logout'}).click();
});

test.describe('Test Courses as Assistant', () => {
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

  test('View Attainments', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page
      .getByRole('link', {name: 'Attainments'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Tier A')).toBeVisible();
  });
});
