// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {defineConfig} from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.LOCALHOST_URL,
    video: false,
  },
});
