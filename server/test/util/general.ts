// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
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
  z.object({
    type: z.literal('Body'),
    errors: z.object({issues: z.array(z.any()).nonempty()}),
  })
);
