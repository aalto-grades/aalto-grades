// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type Page, expect} from '@playwright/test';
import path from 'path';

export const downloadCSVGradeTemplate = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'O1'}).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Add grades manually'}).click();
  await page.getByRole('button', {name: 'Exercises 2024'}).click();
  await page.getByText('Download CSV template').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('template.csv');
};

export const downloadExcelGradeTemplate = async (page: Page): Promise<void> => {
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

export const filterGradesTable = async (page: Page): Promise<void> => {
  await page.getByRole('cell', {name: 'example & grades'}).click();
  await expect(page.getByText('showing 50 rows')).toBeVisible();

  // Filter by name
  await page.getByPlaceholder('search').fill('wi');
  await expect(page.getByRole('row', {name: 'William Thomas'})).toBeVisible();
  await expect(page.getByRole('row', {name: 'Philip Lewis'})).toBeVisible();
  await expect(page.getByText('showing 2 rows')).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(3); // Count header row also
  await page.getByLabel('reset-search').click();
  await expect(page.getByText('showing 50 rows')).toBeVisible();

  // Filter by student number
  await page.getByPlaceholder('search').fill('68');
  await expect(page.getByRole('row', {name: 'William Thomas'})).toBeVisible();
  await expect(page.getByRole('row', {name: 'Patricia Stevens'})).toBeVisible();
  await expect(page.getByText('showing 2 rows')).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(3);
  await page.getByLabel('reset-search').click();
  await expect(page.getByText('showing 50 rows')).toBeVisible();
};
