// SPDX-FileCopyrightText: 2025 The Ossi Developers
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

  /**
   * Tokens are cleared from localstorage after logout, wait for succesful
   * logout response before checking local storage state
   */
  const responsePromise = page.waitForResponse(
    resp => resp.url().includes('/auth/logout') && resp.status() === 200
  );
  await page.getByRole('menuitem', {name: 'Log out'}).click();
  await responsePromise;

  expect(
    await page.evaluate(() => {
      return localStorage.getItem('a+');
    })
  ).toBe(null);
};
