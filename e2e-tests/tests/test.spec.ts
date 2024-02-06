// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {test, expect} from '@playwright/test';

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
  await page.getByRole('button', {name: 'Andy Admin'}).click();
  await page.getByRole('menuitem', {name: 'Logout'}).click();
});

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
