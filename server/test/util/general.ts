// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const ErrorSchema = z
  .object({success: z.literal(false), errors: z.array(z.string()).nonempty()})
  .strict();

export const ZodErrorSchema = z.array(
  z.object({
    type: z.literal('Body'),
    errors: z.object({issues: z.array(z.any())}),
  })
);
