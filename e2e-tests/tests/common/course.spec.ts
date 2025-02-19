// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {type Page, expect} from '@playwright/test';
import path from 'path';

export const createCourse = async (page: Page): Promise<void> => {
  await page.getByRole('button', {name: 'Create new course'}).click();
  await page.getByLabel('Course code*').click();
  await page.getByLabel('Course code*').fill('cs-testCourse123');
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
  await page.getByLabel('Teachers in charge').fill('teacher@aalto.fi');
  await page.getByRole('button', {name: 'Add'}).first().click();
  await page.getByLabel('Assistants').click();
  await page.getByLabel('Assistants').fill('assistant@aalto.fi');
  await page.getByRole('button', {name: 'Add'}).nth(1).click();
  await page.getByRole('button', {name: 'Submit'}).click();
  await expect(page.getByRole('heading', {name: 'testCourse'})).toBeVisible();
  await page.getByTestId('a-grades-header-link').click();
  await expect(
    page.getByRole('cell', {name: 'testCourse'}).nth(1)
  ).toBeVisible();
};

export const checkCourse = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
};

export const editCourse = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  await page.getByRole('button', {name: 'Edit course'}).click();
  await page.getByLabel('Course code*').click();
  await page.getByLabel('Course code*').fill('CS-A1120 - edit');
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
  await expect(page.getByText('CS-A1120 - edit')).toBeVisible();
  await page.getByTestId('a-grades-header-link').click();
  await page.getByRole('cell', {name: 'O1'}).click();
  await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
};

export const createGradingModel = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  await page.getByRole('button', {name: 'Grading models'}).click();
  await page.getByLabel('Create new final grade model').click();
  await page.getByLabel('Name *').click();
  await page.getByLabel('Name *').fill('Test model admin');
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
  await expect(
    page.getByRole('button', {name: 'Test model admin'})
  ).toBeVisible();
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
  await expect(page.getByText('Exercises 2024')).toBeVisible();
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

export const importGradesWithCSV = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', {name: 'Add grades manually'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();
  await page.getByRole('button', {name: 'Upload CSV or Excel file'}).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, '../files/grades.csv'));
  // Check that student number from grades example CSV is loaded to the edit table
  await expect(page.getByRole('row', {name: '993456'})).toBeVisible();
};

export const importGradesWithExcel = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', {name: 'Add grades manually'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();
  await page.getByRole('button', {name: 'Upload CSV or Excel file'}).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, '../files/grades.xlsx'));
  // Check that student number from grades example Excel file is loaded to the edit table
  await expect(page.getByRole('row', {name: '487258'})).toBeVisible();
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
  // Check that student number from pasted text is loaded to the edit table
  await expect(page.getByRole('row', {name: '423896'})).toBeVisible();
};
