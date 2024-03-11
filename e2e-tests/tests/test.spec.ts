// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {test, expect} from '@playwright/test';
import {setupDb, cleanDb} from './helper';

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

test.describe('Test Courses as Admin', () => {
  test('Check course', async ({page}) => {
    await page.getByRole('cell', {name: 'Programming 1'}).click();
    await expect(page.getByText('William Thomas')).toBeVisible();
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
    await page.getByLabel('Teachers In Charge*').fill('admin@aalto.fi');
    await page.getByRole('button', {name: 'Add'}).click();
    await page.getByText('Create a New CourseCourse').click();
    await page.getByRole('button', {name: 'Submit'}).click();
    await page.getByRole('link', {name: 'Aalto Grades'}).click();
    await expect(
      page.getByRole('cell', {name: 'testcourse'}).nth(1)
    ).toBeVisible();
  });

  test('Edit course', async ({page}) => {
    await page.getByRole('cell', {name: 'Programming 2'}).click();
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

    await page.getByRole('button', {name: 'Submit'}).click();
    await page.getByRole('link', {name: 'Aalto Grades'}).click();
    await page.getByRole('cell', {name: 'Programming 2'}).click();
    await expect(
      page.getByRole('heading', {name: 'CS-A1120 - edit'})
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {name: 'Programming 2'})
    ).toBeVisible();
  });

  // We know these are currently broken because of API
  // test('Create assessment model', async ({page}) => {
  //   await page.getByRole('cell', {name: 'Programming 2'}).click();
  //   await page.getByLabel('New assessment model').click();
  //   await page.getByLabel('Name*').click();
  //   await page.getByLabel('Name*').fill('testmodel');
  //   await page.getByRole('button', {name: 'Submit'}).click();
  //   await expect(page.getByText('testmodel')).toBeAttached();
  // });

  test('Create course instance', async ({page}) => {
    await page.getByRole('cell', {name: 'Programming 2'}).click();
    await page.getByRole('button', {name: 'Add instance'}).click();
    await expect(
      page.getByRole('heading', {name: 'Instances Found from Sisu'})
    ).toBeVisible();
    await page.getByRole('button', {name: 'Start from Scratch'}).click();
    await page.getByLabel('Type*').click();
    await page.getByLabel('Type*').fill('testinst');
    await page.getByLabel('Starting Date*').click();
    await page.getByLabel('Ending Date*').click();
    await page.getByLabel('Starting Period*').click();
    await page.locator('#menu-startingPeriod div').first().click();
    await page.getByLabel('Ending Period*').click();
    await page.locator('#menu-endingPeriod div').first().click();
    await page.getByRole('button', {name: 'Submit'}).click();
    await expect(
      page.getByRole('cell', {name: 'testinst'}).first()
    ).toBeAttached();
  });
});

test.describe('Manage users as admin', () => {
  test('Add user', async ({page}) => {
    await page.getByRole('button', {name: 'Add user'}).click();
    await page.getByLabel('Email').click();
    await page.getByLabel('Email').fill('teste2e@aalto.fi');
    await page.getByRole('button', {name: 'Add User'}).click();
    await page.goto('/');
    await expect(
      page.getByRole('cell', {name: 'teste2e@aalto.fi'})
    ).toBeAttached();
  });
});
