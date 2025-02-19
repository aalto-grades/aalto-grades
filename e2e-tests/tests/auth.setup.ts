// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Page} from '@playwright/test';
import {test as setup} from '@playwright/test';
import {authenticator} from 'otplib';

import {cleanDb, setupDb} from './helper';

type UserType = 'admin' | 'teacher' | 'assistant' | 'student';
const mfaSecrets = {
  admin: '',
  teacher: '',
  assistant: '',
  student: '',
};

export const login = async (user: UserType, page: Page): Promise<void> => {
  await page.goto('/login');
  await page.getByLabel('Email').click();
  await page.getByLabel('Email').fill(`${user}@aalto.fi`);
  await page.getByLabel('Email').press('Tab');
  await page.getByLabel('Password', {exact: true}).fill('password');
  await page.getByRole('button', {name: 'Log in', exact: true}).click(); // TODO: flaky

  const showSecretButton = page.getByRole('button', {
    name: 'Or manually enter the secret',
  });

  // Wait for the MFA secret prompt to appear (if it ever does)
  await showSecretButton
    .waitFor({state: 'visible', timeout: 1000})
    .then(async () => {
      await showSecretButton.click();

      // Get new MFA secret
      const secretText = await page.getByTestId('mfa-secret').textContent();
      const secret = secretText!.replaceAll('\n', '').replaceAll(' ', '');
      mfaSecrets[user] = secret;
    })
    .catch(() => console.log('Using old MFA secret'));

  if (mfaSecrets[user] === '') {
    throw new Error(`MFA secret is empty for user ${user}`);
  }

  // Find MFA input fields
  const mfaLocator = page.getByTestId('mfa-input');
  const mfaInputFields = await mfaLocator.locator('input').elementHandles();

  // Try MFA 3 times in case the code expires
  for (let attempt = 0; attempt < 3; attempt++) {
    const token = authenticator.generate(mfaSecrets[user]);

    for (let i = 0; i < mfaInputFields.length; i++) {
      await mfaInputFields[i].fill(token[i]);
    }

    try {
      await mfaInputFields[0].waitForElementState('hidden', {timeout: 1000});
      return; // Login success
    } catch {
      // Clear input fields for next attempt
      for (let i = mfaInputFields.length - 1; i >= 0; i--) {
        await mfaInputFields[i].fill('');
      }
    }
  }
  throw new Error(`Failed to log in with user ${user}`);
};

setup('authenticate all user roles', async ({page}) => {
  await setupDb();
  for (const role of [
    'admin',
    'teacher',
    'assistant',
    'student',
  ] as UserType[]) {
    const userFile = `playwright/.auth/${role}.json`;
    await login(role, page);
    await page.context().storageState({path: userFile});
  }
  await cleanDb();
});
