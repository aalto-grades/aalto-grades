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
  await page.getByLabel('Email').fill('admin@aalto.fi');
  await page.getByLabel('Email').press('Tab');
  await page.getByLabel('Password', {exact: true}).fill('password');
  await page.getByLabel('Password', {exact: true}).press('Enter');
  await expect(
    page.getByRole('heading', {name: 'Log in to Aalto Grades'})
  ).toBeHidden();
  await expect(page.getByRole('heading', {name: 'Courses'})).toBeVisible();
});

test.afterEach(async ({page}) => {
  await cleanDb();
  await page.goto('/');
  await page.getByRole('button', {name: 'Andy Admin'}).click();
  await page.getByRole('menuitem', {name: 'Logout'}).click();
});

test.describe('Manage users as admin', () => {
  test('Add user', async ({page}) => {
    await page.getByRole('button', {name: 'Add user'}).click();
    await page.getByLabel('Email').click();
    await page.getByLabel('Email').fill('testuser@aalto.fi');
    await page.getByRole('button', {name: 'Add user'}).click();
    await page.goto('/');
    await expect(
      page.getByRole('cell', {name: 'testuser@aalto.fi'})
    ).toBeAttached();
  });

  test('Delete user', async ({page}) => {
    await page.goto('/');
    const cell = page.getByRole('cell', {name: 'idpuser@aalto.fi'});
    await expect(cell).toBeAttached();
    const parent = page.getByRole('row').filter({has: cell});
    await parent.getByTestId('DeleteIcon').click();
    await expect(
      page.getByRole('heading', {name: 'Delete user'})
    ).toBeVisible();
    await page.getByRole('button', {name: 'Delete'}).click();
    await expect(cell).not.toBeAttached();
  });
});

test.describe('Test courses as admin', () => {
  test('Check course', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
  });

  test('Add course', async ({page}) => {
    await page.getByRole('button', {name: 'Create new course'}).click();
    await page.getByLabel('Course code*').click();
    await page.getByLabel('Course code*').fill('cs-testcourse123');
    await page.getByLabel('Course code*').press('Tab');
    await page.getByLabel('Course name in English*').fill('testcourse');
    await page.getByLabel('Course name in Finnish*').click();
    await page.getByLabel('Course name in Finnish*').fill('testikurssi');
    await page.getByLabel('Course name in Finnish*').press('Tab');
    await page.getByLabel('Course name in Swedish*').fill('...');
    await page.getByLabel('Course name in Swedish*').press('Tab');
    await page.getByLabel('Organizing department*').click();
    await page.getByLabel('Department of Computer Science').click();
    await page.getByLabel('Minimum course credits (ECTS)*').dblclick();
    await page.getByLabel('Maximum course credits (ECTS)*').click();
    await page.getByLabel('Maximum course credits (ECTS)*').fill('150');
    await page.getByLabel('General scale, 0-').click();
    await page.locator('#menu-gradingScale div').first().click();
    await page.getByLabel('Course language*').click();
    await page.getByRole('option', {name: 'Japanese'}).click();
    await page.getByLabel('Teachers in charge*').click();
    await page.getByLabel('Teachers in charge*').fill('teacher@aalto.fi');
    await page.getByRole('button', {name: 'Add'}).first().click();
    await page.getByLabel('Assistants*').click();
    await page.getByLabel('Assistants*').fill('assistant@aalto.fi');
    await page.getByRole('button', {name: 'Add'}).nth(1).click();
    await page.getByRole('button', {name: 'Submit'}).click();
    await expect(page.getByRole('heading', {name: 'testcourse'})).toBeVisible();
    await page.getByRole('link', {name: 'A! Grades'}).click();
    await expect(
      page.getByRole('cell', {name: 'testcourse'}).nth(1)
    ).toBeVisible();
  });

  test('Edit course', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await page.getByRole('button', {name: 'Edit course'}).click();
    await page.getByLabel('Course code*').click();
    await page.getByLabel('Course code*').fill('CS-A1120 - edit');
    await page.getByLabel('Course code*').press('Tab');
    await page.getByLabel('Course name in Finnish*').click();
    await page
      .getByLabel('Course name in Finnish*')
      .fill('Ohjelmointi 2 - edit');
    await page.getByLabel('Course name in Finnish*').press('Tab');
    await page
      .getByLabel('Course name in Swedish*')
      .fill('Programmering 2 - edit');
    await page.getByLabel('Course name in Swedish*').press('Tab');
    await page.getByLabel('Organizing department*').click();
    await page.getByLabel('Department of Computer Science').click();
    await page.getByLabel('Minimum course credits (ECTS)*').dblclick();
    await page.getByLabel('Maximum course credits (ECTS)*').click();
    await page.getByLabel('Maximum course credits (ECTS)*').fill('6');
    await page.getByLabel('Grading scale*').click();
    await page.getByRole('option', {name: 'Pass-Fail'}).click();
    await page.getByLabel('Course language*').click();
    await page.getByRole('option', {name: 'Chinese'}).click();

    await page.getByRole('button', {name: 'Save'}).click();
    await page.getByRole('link', {name: 'A! Grades'}).click();
    await page.getByRole('cell', {name: 'O1'}).click();
    await expect(page.getByText('CS-A1120 - edit')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
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
});
