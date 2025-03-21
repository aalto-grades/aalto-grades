// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type Page, expect} from '@playwright/test';
import path from 'path';

import {randomEmail} from './user';

export const randomCourseCode = (): string =>
  `cs-${crypto.randomUUID().split('-')[0]}`;

export const randomName = (): string =>
  `name-${crypto.randomUUID().split('-')[0]}`;

export const createCourse = async (page: Page): Promise<void> => {
  const courseCode = randomCourseCode();
  const teacherEmail = randomEmail();
  const assistantEmail = randomEmail();

  await page.getByRole('button', {name: 'Create new course'}).click();
  await page.getByLabel('Course code*').click();
  await page.getByLabel('Course code*').fill(courseCode);
  await page.getByLabel('Course code*').press('Tab');
  await page.getByLabel('Course name in English*').fill('testCourse');
  await page.getByLabel('Course name in Finnish*').click();
  await page.getByLabel('Course name in Finnish*').fill('testiKurssi');
  await page.getByLabel('Course name in Finnish*').press('Tab');
  await page.getByLabel('Course name in Swedish*').fill('...');
  await page.getByLabel('Course name in Swedish*').press('Tab');
  await page.getByLabel('Organizing department*').click();
  await page
    .getByRole('option', {name: 'Department of Computer Science'})
    .click();
  await page.getByLabel('Minimum course credits (ECTS)*').dblclick();
  await page.getByLabel('Maximum course credits (ECTS)*').click();
  await page.getByLabel('Maximum course credits (ECTS)*').fill('150');
  await page.getByLabel('Grading scale*').click();
  await page.getByRole('option', {name: 'Pass-Fail'}).click();
  await page.getByLabel('Course language*').click();
  await page.getByRole('option', {name: 'Japanese'}).click();
  await page.getByLabel('Teachers in charge').click();
  await page.getByLabel('Teachers in charge').fill(teacherEmail);
  await page.getByRole('button', {name: 'Add'}).first().click();
  await page.getByLabel('Assistants').click();
  await page.getByLabel('Assistants').fill(assistantEmail);
  await page.getByRole('button', {name: 'Add'}).nth(1).click();
  await page.getByRole('button', {name: 'Submit'}).click();
  await expect(page.getByRole('heading', {name: 'testCourse'})).toBeVisible();
  await expect(page.getByText(courseCode)).toBeVisible();
  await page.getByTestId('a-grades-header-link').click();
  await expect(page.getByRole('cell', {name: courseCode}).nth(0)).toBeVisible();
};

export const checkCourse = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
};

export const editCourse = async (page: Page): Promise<void> => {
  const courseCode = randomCourseCode();

  await page.getByRole('cell', {name: 'O1'}).click();
  await page.getByRole('button', {name: 'Edit course'}).click();
  await page.getByLabel('Course code*').click();
  await page.getByLabel('Course code*').fill(courseCode);
  await page.getByLabel('Course code*').press('Tab');
  await page.getByLabel('Course name in Finnish*').click();
  await page.getByLabel('Course name in Finnish*').fill('Ohjelmointi 2 - edit');
  await page.getByLabel('Course name in Finnish*').press('Tab');
  await page
    .getByLabel('Course name in Swedish*')
    .fill('Programmering 2 - edit');
  await page.getByLabel('Course name in Swedish*').press('Tab');
  await page.getByLabel('Organizing department*').click();
  await page
    .getByRole('option', {name: 'Department of Computer Science'})
    .click();
  await page.getByLabel('Minimum course credits (ECTS)*').dblclick();
  await page.getByLabel('Maximum course credits (ECTS)*').click();
  await page.getByLabel('Maximum course credits (ECTS)*').fill('6');
  await page.getByLabel('Grading scale*').click();
  await page.getByRole('option', {name: 'Pass-Fail'}).click();
  await page.getByLabel('Course language*').click();
  await page.getByRole('option', {name: 'Chinese'}).click();

  await page.getByRole('button', {name: 'Save'}).click();
  await expect(page.getByText(courseCode)).toBeVisible();
  await page.getByTestId('a-grades-header-link').click();
  await page.getByRole('cell', {name: 'O1'}).click();
  await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
};

export const createGradingModel = async (page: Page): Promise<void> => {
  const modelName = randomName();

  await page.getByRole('cell', {name: 'O1'}).click();
  await page.getByRole('button', {name: 'Grading models'}).click();
  await page.getByLabel('Create new final grade model').click();
  await page.getByLabel('Name *').click();
  await page.getByLabel('Name *').fill(modelName);
  await page.getByLabel('Select template').click();
  await page.getByRole('option', {name: 'Addition'}).click();
  await page.getByRole('button', {name: 'Submit'}).click();
  await expect(page.getByTestId('rf__node-addition')).toBeVisible();
  await page.getByRole('button', {name: 'Format'}).click();
  await expect(
    page.locator('p').filter({hasText: 'Unsaved changes'})
  ).toBeVisible();
  await page.getByRole('button', {name: 'Save'}).click();
  await expect(page.getByText('Model saved successfully')).toBeVisible();
  await page.getByRole('button', {name: 'Grades', exact: true}).click();
  await page.getByRole('button', {name: 'Grading models'}).click();
  await expect(page.getByRole('button', {name: modelName})).toBeVisible();
};

export const viewGradingModel = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  await page.getByRole('button', {name: 'Grading models'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();
  await expect(page.getByTestId('rf__wrapper')).toBeVisible();
};

export const viewCourseParts = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  await page
    .getByRole('link', {name: 'Course parts'})
    .getByRole('button')
    .click();
  await expect(page.getByText('Days valid')).toBeVisible();

  await expect(page.getByText('Exercises 2024')).toBeVisible();
};

export const addCoursePart = async (page: Page): Promise<void> => {
  const coursePartName = randomName();

  await page.getByRole('cell', {name: 'O1'}).click();
  await page
    .getByRole('link', {name: 'Course parts'})
    .getByRole('button')
    .click();
  await expect(page.getByText('Days valid')).toBeVisible();
  await expect(page.getByText('Exercises 2024')).toBeVisible();
  await page.getByRole('button', {name: 'Add new course part'}).click();
  await page.getByLabel('Name*').click();
  await page.getByLabel('Name*').fill(coursePartName);
  await page.getByRole('button', {name: 'Save'}).click();
  await expect(
    page.getByRole('button', {name: `${coursePartName} No expiry date`})
  ).toBeVisible();
};

export const downloadCSVTemplate = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Add grades manually'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();
  await page.getByText('Download CSV template').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('template.csv');
};

export const downloadExcelTemplate = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Add grades manually'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();
  await page.getByRole('button', {name: 'Download Excel template'}).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('template.xlsx');
};

const testConfirmGradeUpload = async (
  page: Page,
  studentNumbers: string[]
): Promise<void> => {
  const testBulkModify = async (
    type: 'completion' | 'expiration',
    day: string
  ): Promise<void> => {
    await page.getByRole('button', {name: `Modify ${type}`}).isDisabled();
    await page.getByLabel(`${type} date`).check();
    await page.getByRole('button', {name: `Modify ${type}`}).isEnabled();
    await page.getByLabel(`${type} date`).uncheck();
    await page.getByRole('button', {name: `Modify ${type}`}).isDisabled();
    await page.getByTestId(`${type}Date-checkbox-Tier B`).click();
    await page.getByRole('button', {name: `Modify ${type}`}).click();
    await page.getByRole('gridcell', {name: day}).click();
    await page.getByRole('button', {name: 'done'}).click();
  };
  for (const name of studentNumbers) {
    await expect(page.getByRole('row', {name})).toBeVisible();
  }
  await page.getByRole('button', {name: 'Next'}).nth(1).click();
  await testBulkModify('completion', '23');
  await testBulkModify('expiration', '24');
  await page.getByRole('button', {name: 'confirm'}).nth(1).click();
  await page.getByRole('button', {name: 'submit'}).click();
  await page.waitForTimeout(1000);
  await page.getByTestId('snackbar-close-button').click();
  for (const name of studentNumbers) {
    await expect(page.getByRole('row', {name})).toBeVisible();
  }
};

export const importGradesWithFile = async (
  page: Page,
  type: 'xlsx' | 'csv'
): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', {name: 'Add grades manually'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();
  await page.getByRole('button', {name: 'Upload CSV or Excel file'}).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, `../files/grades.${type}`));
  await testConfirmGradeUpload(page, ['131433', '487458', '487258', '497458']);
};

export const importGradesWithText = async (page: Page): Promise<void> => {
  const input = `studentNo,Tier A,Tier B,Tier C
  177756,1,1,1
  423896,1,1,1
  643456,1,1,1`;

  await page.getByRole('cell', {name: 'O1'}).click();
  await page.getByRole('button', {name: 'Add grades manually'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();
  await page.getByRole('button', {name: 'Paste text'}).click();
  await page.getByPlaceholder('Input raw text here').fill(input);
  await page.getByRole('button', {name: 'Import'}).click();
  await testConfirmGradeUpload(page, ['177756', '423896', '643456']);
};

export const warnDialogIfBackdropClickDisabled = async (
  page: Page
): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  await page.getByRole('button', {name: 'Add grades manually'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();

  // Simulate user trying to click outside the dialog window in order to close the dialog box
  await page.mouse.click(1, 1);
  await page.mouse.click(1, 1);
  await page.mouse.click(1, 1);

  await expect(
    page.getByText('Backdrop click disabled, use close buttons!')
  ).toBeVisible();
  await page.getByTestId('snackbar-close-button').click();
  await page.getByTestId('dialog-close-button').click();
};

export const importCourseDataFromSisu = async (
  page: Page,
  teacherEmail?: string
): Promise<void> => {
  const courseCode = randomCourseCode();

  await page.getByRole('button', {name: 'Create new course'}).click();
  await expect(
    page.getByText('Try to find course data from Sisu based on course code')
  ).toBeVisible();

  await page.getByLabel('Course code*').click();
  await page.getByLabel('Course code*').fill(courseCode);
  await page.getByRole('button', {name: 'Search from Sisu'}).click();

  await expect(
    page.getByText(`2 course instances found with course code ${courseCode}:`)
  ).toBeVisible();

  await page.getByRole('button', {name: 'Select'}).nth(1).click();

  await expect(page.getByLabel('Course code*')).toHaveValue('CS-A1111');

  await page.getByLabel('Course code*').fill(courseCode);

  await expect(page.getByLabel('Course name in English*')).toHaveValue(
    'Basic Course in Programming Y1, Exam (retake exam for 2024 courses)'
  );
  await expect(page.getByLabel('Course name in Finnish*')).toHaveValue(
    'Ohjelmoinnin peruskurssi Y1, Tentti (rästitentti 2024 kursseille)'
  );
  await expect(page.getByLabel('Course name in Swedish*')).toHaveValue(
    'Grundkurs i programmering Y1, Tentamen (för 2024 kurs)'
  );
  await expect(page.getByLabel('Minimum course credits (ECTS)*')).toHaveValue(
    '5'
  );
  await expect(page.getByLabel('Maximum course credits (ECTS)*')).toHaveValue(
    '5'
  );

  // Scroll to reveal the teachers list
  await page.evaluate(() => {
    const dialogContent = document.querySelector(
      '[data-testid="new-course-form"]'
    );
    if (dialogContent)
      dialogContent.scrollTop = dialogContent.scrollHeight / 2.5;
  });

  await expect(page.getByText('mike.mock@aalto.fi').nth(0)).toBeVisible();
  await expect(page.getByText('filipa.fake@aalto.fi').nth(0)).toBeVisible();

  if (teacherEmail) {
    await page.getByLabel('Teachers in charge').click();
    await page.getByLabel('Teachers in charge').fill(teacherEmail);
    await page.getByRole('button', {name: 'Add'}).first().click();
  }

  await page.getByRole('button', {name: 'Submit'}).click();
  await expect(
    page.getByRole('heading', {
      name: 'Basic Course in Programming Y1, Exam (retake exam for 2024 courses)',
    })
  ).toBeVisible();
  await page.getByTestId('a-grades-header-link').click();
  await expect(
    page
      .getByRole('cell', {
        name: 'Basic Course in Programming Y1, Exam (retake exam for 2024 courses)',
      })
      .nth(0)
  ).toBeVisible();
  await expect(
    page.getByRole('cell', {name: 'Department of Computer Science'}).nth(0)
  ).toBeVisible();
  await expect(page.getByRole('cell', {name: courseCode}).nth(0)).toBeVisible();
};
