// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const ADMIN_ID = 1;
export const TEACHER_ID = 2;
export const ASSISTANT_ID = 3;
export const STUDENT_ID = 4;

export const ErrorSchema = z.strictObject({
  errors: z.array(z.string()).nonempty(),
});

export const ZodErrorSchema = z.array(
  z.strictObject({
    type: z.literal('Body'),
    errors: z.strictObject({issues: z.array(z.any()).nonempty()}),
  })
);

/**
 * Convert date to match dateonly type of the database by setting the time
 * portion to UTC midnight. Example: 03:00:00 +3:00 / 02:00:00 +2:00
 */
export const convertDate = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

export const NEXT_YEAR = new Date(Date.now() + 365 * 24 * 3600 * 1000);
