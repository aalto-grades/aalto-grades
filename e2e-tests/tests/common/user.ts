// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {type Page, expect} from '@playwright/test';

export const randomEmail = (): string => `${crypto.randomUUID()}@aalto.fi`;

export const addUser = async (page: Page): Promise<string> => {
  const email = randomEmail();
  await page.getByRole('button', {name: 'Add user'}).click();
  await page.getByLabel('Email').click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', {name: 'Add user'}).click();
  await expect(page.getByRole('cell', {name: email})).toBeAttached();

  return email;
};
