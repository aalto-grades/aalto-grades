// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const NewAttainmentDataSchema = z.object({
  courseId: z.number().int().optional(),
  name: z.string(),
  daysValid: z.number().int().nonnegative().optional(),
});
export const AttainmentDataSchema = z.object({
  id: z.number().int(),
  courseId: z.number().int().optional(),
  name: z.string(),
  daysValid: z.number().int().nonnegative().optional(),
});
export const AttainmentDataArraySchema = z.array(AttainmentDataSchema);

export type NewAttainmentData = z.infer<typeof NewAttainmentDataSchema>;
export type AttainmentData = z.infer<typeof AttainmentDataSchema>;
