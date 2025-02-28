// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {expect, test} from '@playwright/test';

import {
  addCoursePart,
  checkCourse,
  createCourse,
  createGradingModel,
  downloadCSVTemplate,
  downloadExcelTemplate,
  editCourse,
  importFromSisu,
  importGradesWithCSV,
  importGradesWithExcel,
  importGradesWithText,
  viewCourseParts,
  viewGradingModel,
} from './common/course';
import {aPlusToken} from './common/token';
import {addUser} from './common/user';
import {setupDb} from './helper';

test.beforeAll(async () => {
  await setupDb();
});

test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test.afterEach(async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Andy Admin'}).click();
  await page.getByRole('menuitem', {name: 'Log out'}).click();
});

test.use({storageState: 'playwright/.auth/admin.json'});

test.describe('Manage users as admin', () => {
  test('Add user', async ({page}) => {
    await addUser(page);
  });

  test('Remove user role', async ({page}) => {
    const email = await addUser(page);

    await page.goto('/');
    const cell = page.getByRole('cell', {name: email});
    await expect(cell).toBeAttached();
    const parent = page.getByRole('row').filter({has: cell});
    await parent.getByTestId('PersonRemoveIcon').click();
    await expect(
      page.getByRole('heading', {name: 'Remove user role'})
    ).toBeVisible();
    await page.getByRole('button', {name: 'Remove'}).click();
    await expect(cell).not.toBeAttached();
  });
});

test.describe('Test courses as admin', () => {
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

  test('Add Course Part', async ({page}) => {
    await addCoursePart(page);
  });

  test('View grading model', async ({page}) => {
    await viewGradingModel(page);
  });

  test('Create grading model', async ({page}) => {
    await createGradingModel(page);
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

  test('Import course from Sisu', async ({page}) => {
    await importFromSisu(page);
  });
});

test.describe('Test API token as admin', () => {
  test('Set A+ token', async ({page}) => {
    await aPlusToken(page, 'Andy Admin');
  });
});
