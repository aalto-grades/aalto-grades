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
  await expect(page.getByRole('heading', {name: 'Your Courses'})).toBeVisible();
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
    await page.getByRole('button', {name: 'Add User'}).click();
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
      page.getByRole('heading', {name: 'Delete User'})
    ).toBeVisible();
    await page.getByRole('button', {name: 'Delete'}).click();
    await expect(cell).not.toBeAttached();
  });
});

test.describe('Test Courses as Admin', () => {
  test('Check course', async ({page}) => {
    await page.getByRole('cell', {name: 'O1'}).click();
    await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
  });

  test('Add course', async ({page}) => {
    await page.getByRole('button', {name: 'Create New Course'}).click();
    await page.getByLabel('Course Code*').click();
    await page.getByLabel('Course Code*').fill('cs-testcourse123');
    await page.getByLabel('Course Code*').press('Tab');
    await page.getByLabel('Course Name in English*').fill('testcourse');
    await page.getByLabel('Course Name in Finnish*').click();
    await page.getByLabel('Course Name in Finnish*').fill('testikurssi');
    await page.getByLabel('Course Name in Finnish*').press('Tab');
    await page.getByLabel('Course Name in Swedish*').fill('...');
    await page.getByLabel('Course Name in Swedish*').press('Tab');
    await page.getByLabel('Organizing department in English*').fill('aalto');
    await page.getByLabel('Organizing department in English*').press('Tab');
    await page.getByLabel('Organizing department in Finnish*').fill('aalto');
    await page.getByLabel('Organizing department in Finnish*').press('Tab');
    await page.getByLabel('Organizing department in Swedish*').fill('...');
    await page.getByLabel('Minimum Course Credits (ECTS)*').dblclick();
    await page.getByLabel('Maximum Course Credits (ECTS)*').click();
    await page.getByLabel('Maximum Course Credits (ECTS)*').fill('150');
    await page.getByLabel('General scale, 0-').click();
    await page.locator('#menu-gradingScale div').first().click();
    await page.getByLabel('Course language*').click();
    await page.getByRole('option', {name: 'Japanese'}).click();
    await page.getByLabel('Teachers In Charge*').click();
    await page.getByLabel('Teachers In Charge*').fill('teacher@aalto.fi');
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
    await page.getByRole('button', {name: 'Edit Course'}).click();
    await page.getByLabel('Course Code*').click();
    await page.getByLabel('Course Code*').fill('CS-A1120 - edit');
    await page.getByLabel('Course Code*').press('Tab');
    await page.getByLabel('Course Name in Finnish*').click();
    await page
      .getByLabel('Course Name in Finnish*')
      .fill('Ohjelmointi 2 - edit');
    await page.getByLabel('Course Name in Finnish*').press('Tab');
    await page
      .getByLabel('Course Name in Swedish*')
      .fill('Programmering 2 - edit');
    await page.getByLabel('Course Name in Swedish*').press('Tab');
    await page
      .getByLabel('Organizing department in English*')
      .fill('Department of Computer Science - edit');
    await page.getByLabel('Organizing department in English*').press('Tab');
    await page
      .getByLabel('Organizing department in Finnish*')
      .fill('Tietotekniikan laitos - edit');
    await page.getByLabel('Organizing department in Finnish*').press('Tab');
    await page
      .getByLabel('Organizing department in Swedish*')
      .fill('Institutionen för datateknik - edit');
    await page.getByLabel('Minimum Course Credits (ECTS)*').dblclick();
    await page.getByLabel('Maximum Course Credits (ECTS)*').click();
    await page.getByLabel('Maximum Course Credits (ECTS)*').fill('6');
    await page.getByLabel('Grading Scale*').click();
    await page.getByRole('option', {name: 'Pass-Fail'}).click();
    await page.getByLabel('Course language*').click();
    await page.getByRole('option', {name: 'Chinese'}).click();

    await page.getByRole('button', {name: 'Save'}).click();
    await page.getByRole('link', {name: 'A! Grades'}).click();
    await page.getByRole('cell', {name: 'O1'}).click();
    await expect(page.getByText('CS-A1120 - edit')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
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
});
