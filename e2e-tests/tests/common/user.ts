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

export const logOut = async (page: Page, name: string): Promise<void> => {
  await page.goto('/');
  await page.getByRole('button', {name}).click();
  await page.getByRole('menuitem', {name: 'Log out'}).click();

  const localStorageToken = await page.evaluate(() => {
    return localStorage.getItem('a+');
  });
  expect(localStorageToken).toBe(null);
};
