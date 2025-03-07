// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {test} from '@playwright/test';

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
import {logOut} from './common/user';
import {setupDb} from './helper';

test.beforeAll(async () => {
  await setupDb();
});

test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test.afterEach(async ({page}) => {
  await logOut(page, 'Timmy Teacher');
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

  test('Add Course Part', async ({page}) => {
    await addCoursePart(page);
  });

  test('Import course from Sisu', async ({page}) => {
    await importFromSisu(page, 'teacher@aalto.fi');
  });
});

test.describe('Test API token as teacher', () => {
  test('Set A+ token', async ({page}) => {
    await aPlusToken(page, 'Timmy Teacher');
  });
});
