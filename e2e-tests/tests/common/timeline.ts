// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type Page, expect} from '@playwright/test';

export const viewTimeline = async (page: Page): Promise<void> => {
  await page.getByRole('link', {name: 'Timeline'}).click();
  await expect(page.getByRole('heading', {name: 'Timeline'})).toBeVisible();
  await expect(page.getByPlaceholder('Search')).toBeVisible();
  await expect(page.getByRole('slider')).toBeVisible();
};

export const searchTimeline = async (page: Page, search: string): Promise<void> => {
  await viewTimeline(page);
  const searchInput = page.getByPlaceholder('Search');
  await searchInput.fill(search);
  await expect(searchInput).toHaveValue(search);
};
