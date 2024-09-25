// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Page} from '@playwright/test';
import {authenticator} from 'otplib';

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
  await page.getByLabel('Password', {exact: true}).press('Enter');

  // Wait for the MFA prompt to appear (if it ever does)
  await page.waitForTimeout(100);
  const showSecretButton = page.getByRole('button', {
    name: 'Or manually enter the secret',
  });

  // Check for new MFA secret
  let newMfaSecret;
  try {
    await showSecretButton.waitFor({state: 'visible', timeout: 500});
    newMfaSecret = true;
  } catch {
    newMfaSecret = false;
  }

  // Login when MFA qr code is shown
  if (newMfaSecret) {
    await showSecretButton.click();

    const secretText = await page.getByTestId('mfa-secret').textContent();
    const secret = secretText!.replaceAll('\n', '').replaceAll(' ', '');
    mfaSecrets[user] = secret;

    const mfaLocator = page.getByTestId('mfa-input');
    const inputFields = await mfaLocator.locator('input').elementHandles();
    for (let attempt = 0; attempt < 3; attempt++) {
      const token = authenticator.generate(mfaSecrets[user]);

      for (let i = 0; i < inputFields.length; i++) {
        await inputFields[i].fill(token[i]);
      }

      try {
        await inputFields[0].waitForElementState('hidden', {timeout: 500});
        return; // Login success
      } catch {
        // Clear input fields for next attempt
        for (let i = inputFields.length - 1; i >= 0; i--) {
          await inputFields[i].fill('');
        }
      }
    }
    throw new Error('Failed to log in with new MFA secret');
  }

  if (mfaSecrets[user] === '') {
    throw new Error(`Old MFA secret is empty for user ${user}`);
  }

  // Login when MFA qr code is not shown
  const mfaLocator = page.getByTestId('mfa-input');
  const inputFields = await mfaLocator.locator('input').elementHandles();
  for (let attempt = 0; attempt < 3; attempt++) {
    const token = authenticator.generate(mfaSecrets[user]);

    for (let i = 0; i < inputFields.length; i++) {
      await inputFields[i].fill(token[i]);
    }

    // Wait for the login to go through
    await page.waitForTimeout(100);

    const success = await page
      .getByRole('heading', {name: 'Courses'})
      .isVisible();
    if (success) return;

    for (let i = inputFields.length - 1; i >= 0; i--) {
      await inputFields[i].fill('');
    }
  }
  throw new Error('Failed to log in with old MFA secret');
};
