// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {defineConfig, devices} from '@playwright/test';

/** Read environment variables from file. https://github.com/motdotla/dotenv */
// require('dotenv').config();

/** See https://playwright.dev/docs/test-configuration. */
export default defineConfig({
  testDir: './.',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 1 : 0,
  maxFailures: 8,
  timeout: 15 * 1000,
  expect: {timeout: 2 * 1000},
  reporter: [['list'], ['html']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.LOCALHOST_URL || 'http://localhost:8080',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {name: 'setup', testMatch: /.*\.setup\.ts/},
    {name: 'setup_F', use: {browserName: 'firefox'}, testMatch: /.*\.setup\.ts/},
    {name: 'cleanDB', testMatch: /.*\.teardown\.ts/},
    {name: 'cleanDB_F', use: {browserName: 'firefox'}, testMatch: /.*\.teardown\.ts/},
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
      dependencies: ['setup'],
      teardown: 'cleanDB',
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
      dependencies: ['setup_F'],
      teardown: 'cleanDB_F',
    },

    // Broken, TODO: enable (#594)
    // {
    //   name: 'webkit',
    //   use: {...devices['Desktop Safari']},
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
