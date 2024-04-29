// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const UserDataSchema = z.object({
  id: z.number().int(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  studentNumber: z.string().optional(),
});
export const TeacherDataSchema = z.object({
  id: z.number().int(),
  name: z.string().optional(),
  email: z.string().email(),
  studentNumber: z.string().optional(),
});
export const NewIdpUserSchema = z.object({
  email: z.string().email(),
});
export const IdpUserSchema = z.object({
  id: z.number().int(),
  email: z.string().email().nullable(),
});
export const IdpUsersSchema = z.array(IdpUserSchema);

export type UserData = z.infer<typeof UserDataSchema>;
export type TeacherData = z.infer<typeof TeacherDataSchema>;
export type NewIdpUser = z.infer<typeof NewIdpUserSchema>;
export type IdpUsers = z.infer<typeof IdpUsersSchema>;
