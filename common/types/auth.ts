// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export enum SystemRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export const SystemRoleSchema = z.nativeEnum(SystemRole);

export const LoginResultSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  role: SystemRoleSchema,
});
export const SignupRequestSchema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string(),
  studentNumber: z.string().optional(),
  role: SystemRoleSchema.optional(),
});

export type LoginResult = z.infer<typeof LoginResultSchema>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
