// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {SystemRoleSchema} from './auth';
import {AaltoEmailSchema} from './general';

export const UserDataSchema = z.strictObject({
  id: z.number().int(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  studentNumber: z.string().nullable(),
});
export const FullUserDataSchema = z.strictObject({
  id: z.number().int(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  studentNumber: z.string().nullable(),
  role: SystemRoleSchema,
  idpUser: z.boolean(),
});
export const TeacherDataSchema = z.strictObject({
  id: z.number().int(),
  name: z.string().nullable(),
  email: z.string().email(),
  studentNumber: z.string().nullable(),
});

export const NewUserSchema = z.discriminatedUnion('admin', [
  // Idp user
  z.strictObject({
    admin: z.literal(false),
    email: AaltoEmailSchema,
  }),
  // Admin
  z.strictObject({
    admin: z.literal(true),
    email: AaltoEmailSchema,
    name: z
      .string()
      .min(3, {message: 'Name must be at least 3 characters long'}),
  }),
]);
export const NewUserResponseSchema = z.strictObject({
  temporaryPassword: z.string().nullable(),
});

export const UserDataArraySchema = z.array(UserDataSchema);
export const UserWithRoleArraySchema = z.array(FullUserDataSchema);

export type UserData = z.infer<typeof UserDataSchema>;
export type FullUserData = z.infer<typeof FullUserDataSchema>;
export type TeacherData = z.infer<typeof TeacherDataSchema>;
export type NewUser = z.infer<typeof NewUserSchema>;
export type NewUserResponse = z.infer<typeof NewUserResponseSchema>;
