// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type Page, expect} from '@playwright/test';

export const aPlusToken = async (page: Page, name: string): Promise<void> => {
  const token = 'dfguifg983hfujterjht4m350gkvm03j40kg034g';

  await page.getByRole('button', {name}).click();
  await page.getByRole('menuitem', {name: 'A+ API token'}).click();

  await expect(page.getByText('Your current token')).not.toBeVisible();
  await page.getByLabel('API token *').click();
  await page.getByLabel('API token *').fill(token);
  await page.getByRole('button', {name: 'Submit'}).click();

  await page.getByRole('button', {name}).click();
  await page.getByRole('menuitem', {name: 'A+ API token'}).click();

  await expect(page.getByText('Your current token')).toBeVisible();
  await expect(page.getByText('dfguifg983hf...')).toBeVisible();
  await expect(page.getByText(token)).not.toBeVisible();

  await page.getByRole('button', {name: 'Show full token'}).click();
  await expect(page.getByText(token)).toBeVisible();
  await expect(page.getByText('dfguifg983hf...')).not.toBeVisible();

  await page.getByRole('button', {name: 'Hide token'}).click();
  await expect(page.getByText(token)).not.toBeVisible();
  await expect(page.getByText('dfguifg983hf...')).toBeVisible();

  expect(
    await page.evaluate(() => {
      return localStorage.getItem('a+');
    })
  ).toBe(token);

  await expect(page.getByLabel('API token *')).toBeEmpty();
  await page.getByRole('button', {name: 'cancel'}).click();
};
