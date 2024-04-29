// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const AttainmentDataSchema = z.object({
  id: z.number().int(),
  courseId: z.number().int(),
  name: z.string(),
  daysValid: z.number().int().nonnegative(),
});
export const NewAttainmentDataSchema = z.object({
  name: z.string(),
  daysValid: z.number().int().nonnegative(),
});
export const EditAttainmentDataSchema = AttainmentDataSchema.omit({
  id: true,
  courseId: true,
}).partial();

export const AttainmentDataArraySchema = z.array(AttainmentDataSchema);

export type NewAttainmentData = z.infer<typeof NewAttainmentDataSchema>;
export type AttainmentData = z.infer<typeof AttainmentDataSchema>;
export type EditAttainmentData = z.infer<typeof EditAttainmentDataSchema>;
