// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {expect, test} from '@playwright/test';

import {
  checkCourse,
  createCourse,
  createGradingModel,
  downloadCSVTemplate,
  downloadExcelTemplate,
  editCourse,
  importGradesWithCSV,
  importGradesWithExcel,
  importGradesWithText,
  viewCourseParts,
  viewGradingModel,
} from './common/course.spec';
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
    await checkCourse(page);
  });

  test('Add course', async ({page}) => {
    await createCourse(page);
  });

  test('Edit course', async ({page}) => {
    await editCourse(page);
  });

  test('View course parts', async ({page}) => {
    await viewCourseParts(page);
  });

  test('Download grades CSV template', async ({page}) => {
    await downloadCSVTemplate(page);
  });

  test('Download grades excel template', async ({page}) => {
    await downloadExcelTemplate(page);
  });

  test('Import grades using CSV file', async ({page}) => {
    await importGradesWithCSV(page);
  });

  test('Import grades using Excel file', async ({page}) => {
    await importGradesWithExcel(page);
  });

  test('Import grades by pasting text', async ({page}) => {
    await importGradesWithText(page);
  });

  test('View grading model', async ({page}) => {
    await viewGradingModel(page);
  });

  test('Create grading model', async ({page}) => {
    await createGradingModel(page);
  });

  test('View Course Parts', async ({page}) => {
    await page
      .getByRole('link', {name: 'Course parts'})
      .getByRole('button')
      .click();
    await expect(page.getByText('Days valid')).toBeVisible();
    await expect(page.getByText('Exercises 2024')).toBeVisible();
  });

  test('Add Course Part', async ({page}) => {
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

  test('Import course from Sisu - no API key', async ({page}) => {
    await page.getByRole('button', {name: 'Timmy Teacher'}).click();
    await page.getByRole('menuitem', {name: 'Sisu API token'}).click();
    await expect(page.getByText('Your current token')).not.toBeVisible();
    await page.getByRole('button', {name: 'Cancel'}).click();
    await page.getByRole('button', {name: 'Create new course'}).click();
    await expect(
      page.getByText(
        'Please set the Sisu API token to search courses from Sisu'
      )
    ).toBeVisible();

    const searchButton = page.getByRole('button', {name: 'Search from Sisu'});

    await expect(searchButton).toBeDisabled();
  });
});
