// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import zxcvbn from 'zxcvbn';

import {AaltoEmailSchema} from './general';

export const UserDataSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  studentNumber: z.string().nullable(),
});
export const TeacherDataSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable(),
  email: z.string().email(),
  studentNumber: z.string().nullable(),
});
export const IdpUserSchema = z.object({
  id: z.number().int(),
  email: z.string().email().nullable(),
});

export const PasswordSchema = z.string().superRefine((password, ctx) => {
  const result = zxcvbn(password);
  if (result.score < 4) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Password too weak. (estimated 10^${Math.floor(10 * result.guesses_log10) / 10} <= 10^10 guesses)`,
    });
  }
});
export const NewUserSchema = z.discriminatedUnion('admin', [
  // Idp user
  z.object({
    admin: z.literal(false),
    email: AaltoEmailSchema,
  }),
  // Admin
  z.object({
    admin: z.literal(true),
    email: AaltoEmailSchema,
    name: z
      .string()
      .min(3, {message: 'Name must be at least 3 characters long'}),
  }),
]);
export const EditUserSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    studentNumber: z.string(),
    password: PasswordSchema,
    firstLogin: z.boolean(),
  })
  .optional();
export const NewUserResponseSchema = z.object({
  temporaryPassword: z.string().nullable(),
});

export const IdpUsersSchema = z.array(IdpUserSchema);
export const UserDataArraySchema = z.array(UserDataSchema);

export type UserData = z.infer<typeof UserDataSchema>;
export type TeacherData = z.infer<typeof TeacherDataSchema>;
export type NewUser = z.infer<typeof NewUserSchema>;
export type EditUser = z.infer<typeof EditUserSchema>;
export type NewUserResponse = z.infer<typeof NewUserResponseSchema>;
export type IdpUsers = z.infer<typeof IdpUsersSchema>;
