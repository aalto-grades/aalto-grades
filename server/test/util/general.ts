// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import * as fs from 'fs';
import * as path from 'path';
import {z} from 'zod';

// Read IDs from the file generated in globalSetup
const idsPath = path.join(__dirname, 'test-ids.json');
let ids: {
  ADMIN_ID: number;
  TEACHER_ID: number;
  ASSISTANT_ID: number;
  STUDENT_ID: number;
};

try {
  const data = fs.readFileSync(idsPath, 'utf-8');
  ids = JSON.parse(data);
} catch {
  // This might happen during linting or if globalSetup hasn't run
  ids = {ADMIN_ID: 0, TEACHER_ID: 0, ASSISTANT_ID: 0, STUDENT_ID: 0};
}

export const ADMIN_ID = ids.ADMIN_ID;
export const TEACHER_ID = ids.TEACHER_ID;
export const ASSISTANT_ID = ids.ASSISTANT_ID;
export const STUDENT_ID = ids.STUDENT_ID;

export const ErrorSchema = z.strictObject({
  errors: z.array(z.string()).nonempty(),
});

export const ZodErrorSchema = z.array(
  z.strictObject({
    type: z.literal('Body'),
    errors: z.strictObject({
      name: z.literal('ZodError'),
      message: z.string(),
    }),
  })
);

/**
 * Convert date to match dateonly type of the database by setting the time
 * portion to UTC midnight. Example: 03:00:00 +3:00 / 02:00:00 +2:00
 */
export const convertDate = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

export const NEXT_YEAR = new Date(Date.now() + 365 * 24 * 3600 * 1000);
