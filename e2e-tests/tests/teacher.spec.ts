// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {expect, test} from '@playwright/test';
import path from 'path';

import {setupDb} from './helper';

test.beforeAll(async () => {
  await setupDb();
});

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await page.getByRole('cell', {name: 'O1'}).click();
});

test.afterEach(async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Timmy Teacher'}).click();
  await page.getByRole('menuitem', {name: 'Log out'}).click();
});
test.use({storageState: 'playwright/.auth/teacher.json'});
test.describe('Test courses as teacher', () => {
  test('Check course', async ({page}) => {
    await expect(page.getByRole('heading', {name: 'O1'})).toBeVisible();
  });

  test('Download grades CSV template', async ({page}) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Add grades manually'}).click();
    await page.getByRole('button', {name: 'Exercises 2024'}).click();
    await page.getByText('Download CSV template').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('template.csv');
  });

  test('Download grades excel template', async ({page}) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Add grades manually'}).click();
    await page.getByRole('button', {name: 'Exercises 2024'}).click();
    await page.getByRole('button', {name: 'Download Excel template'}).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('template.xlsx');
  });

  test('Import grades using CSV file', async ({page}) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', {name: 'Add grades manually'}).click();
    await page.getByRole('button', {name: 'Exercises 2024'}).click();
    await page.getByRole('button', {name: 'Upload CSV or Excel file'}).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, './files/grades.csv'));
    // Check that student number from grades example CSV is loaded to the edit table
    await expect(page.getByRole('row', {name: '993456'})).toBeVisible();
  });

  test('Import grades using Excel file', async ({page}) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', {name: 'Add grades manually'}).click();
    await page.getByRole('button', {name: 'Exercises 2024'}).click();
    await page.getByRole('button', {name: 'Upload CSV or Excel file'}).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, './files/grades.xlsx'));
    // Check that student number from grades example Excel file is loaded to the edit table
    await expect(page.getByRole('row', {name: '487258'})).toBeVisible();
  });

  test('Import grades by pasting text', async ({page}) => {
    const input = `studentNo,Tier A,Tier B,Tier C
      177756,1,1,1
      423896,1,1,1
      643456,1,1,1`;

    await page.getByRole('button', {name: 'Add grades manually'}).click();
    await page.getByRole('button', {name: 'Exercises 2024'}).click();
    await page.getByRole('button', {name: 'Paste text'}).click();
    await page.getByPlaceholder('Input raw text here').fill(input);
    await page.getByRole('button', {name: 'Import'}).click();
    // Check that student number from pasted text is loaded to the edit table
    await expect(page.getByRole('row', {name: '423896'})).toBeVisible();
  });

  test('View grading model', async ({page}) => {
    await page.getByRole('button', {name: 'Grading models'}).click();
    await page.getByRole('button', {name: 'Exercises 2024'}).click();
    await expect(page.getByTestId('rf__wrapper')).toBeVisible();
  });

  test('Create grading model', async ({page}) => {
    await page.getByRole('button', {name: 'Grading models'}).click();
    await page.getByLabel('Create new final grade model').click();
    await page.getByLabel('Name *').click();
    await page.getByLabel('Name *').fill('Test model teacher');
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
      page.getByRole('button', {name: 'Test model teacher'})
    ).toBeVisible();
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
});
