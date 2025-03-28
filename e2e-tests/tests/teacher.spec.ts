// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {test} from '@playwright/test';

import {
  addCoursePart,
  archiveCoursePart,
  checkCourse,
  createCourse,
  createGradingModel,
  editCourse,
  editCoursePart,
  importCourseDataFromSisu,
  viewCourseParts,
  viewGradingModel,
  warnDialogIfBackdropClickDisabled,
} from './common/course';
import {
  downloadCSVGradeTemplate,
  downloadExcelGradeTemplate,
  importGradesWithFile,
  importGradesWithText,
} from './common/grades';
import {addCoursePartTaskFail, addCoursePartTaskSuccess} from './common/task';
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

  test('Add course part', async ({page}) => {
    await addCoursePart(page);
  });

  test('Edit course part', async ({page}) => {
    await editCoursePart(page);
  });

  test('Archive and unarchive course part', async ({page}) => {
    await archiveCoursePart(page);
  });

  test.describe('Add course part task', () => {
    test('Success', async ({page}) => {
      await addCoursePartTaskSuccess(page);
    });

    test('Fail (duplicate name)', async ({page}) => {
      await addCoursePartTaskFail(page);
    });
  });

  test('Download grades CSV template', async ({page}) => {
    await downloadCSVGradeTemplate(page);
  });

  test('Download grades excel template', async ({page}) => {
    await downloadExcelGradeTemplate(page);
  });

  test('Import grades using CSV file', async ({page}) => {
    await importGradesWithFile(page, 'csv');
  });

  test('Import grades using Excel file', async ({page}) => {
    await importGradesWithFile(page, 'xlsx');
  });

  test('Import grades by pasting text', async ({page}) => {
    await importGradesWithText(page);
  });

  test('Show warn dialog if backdrop click disabled', async ({page}) => {
    await warnDialogIfBackdropClickDisabled(page);
  });

  test('View grading model', async ({page}) => {
    await viewGradingModel(page);
  });

  test('Create grading model', async ({page}) => {
    await createGradingModel(page);
  });

  test('Import course from Sisu', async ({page}) => {
    await importCourseDataFromSisu(page, 'teacher@aalto.fi');
  });
});

test.describe('Test API token as teacher', () => {
  test('Set A+ token', async ({page}) => {
    await aPlusToken(page, 'Timmy Teacher');
  });
});
