// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const UserDataSchema = z.object({
  id: z.number().int(),
  name: z.string().optional(),
  email: z.string().optional(),
  studentNumber: z.string().optional(),
});
export const TeacherDataSchema = z.object({
  id: z.number().int(),
  name: z.string().optional(),
  email: z.string(),
  studentNumber: z.string().optional(),
});

export type UserData = z.infer<typeof UserDataSchema>;
