// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type Page, expect} from '@playwright/test';

import {addOneCoursePart, randomName, viewCourseParts} from './course';

export const addCoursePartTask = async (page: Page): Promise<void> => {
  await viewCourseParts(page);
  const coursePartName = await addOneCoursePart(page, randomName());
  await page
    .getByRole('button', {name: `${coursePartName} No expiry date`})
    .click();

  await page.getByRole('button', {name: 'add new course task'}).click();
  await page.keyboard.type('task 1');
  await page.keyboard.press('Tab');
  await page.keyboard.type('10');
  await page.keyboard.press('Tab');
  await page.keyboard.type('10');
  await page.mouse.click(0, 0, {delay: 500});

  // Use same task name to check error handling
  await page.getByRole('button', {name: 'add new course task'}).click();
  await page.keyboard.type('task 1');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.type('10');
  await page.mouse.click(0, 0, {delay: 500});

  await expect(
    page.getByText(
      'Errors in the table values. Fix all rows with errors (cells marked with red)'
    )
  ).toBeVisible();
  await expect(page.getByRole('button', {name: 'save'})).toBeDisabled();
  await page
    .getByTestId(/^delete-row-/)
    .nth(1)
    .click();
  await page.getByRole('button', {name: 'delete'}).click();
  await expect(
    page.getByText(
      'Errors in the table values. Fix all rows with errors (cells marked with red)'
    )
  ).not.toBeVisible();
  await page.getByRole('button', {name: 'save'}).click();
  await expect(page.getByText('Course parts saved successfully')).toBeVisible();
};
