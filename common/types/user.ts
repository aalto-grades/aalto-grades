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
export const AddIdpUserSchema = z.object({
  email: z.string().email(),
});
export const IdpUsersSchema = z.array(
  z.object({
    id: z.number().int(),
    email: z.string().email(),
  })
);

export type UserData = z.infer<typeof UserDataSchema>;
export type TeacherData = z.infer<typeof TeacherDataSchema>;
export type AddIdpUser = z.infer<typeof AddIdpUserSchema>;
export type IdpUsers = z.infer<typeof IdpUsersSchema>;
