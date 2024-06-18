// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {PasswordSchema} from './user';

export enum SystemRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export const SystemRoleSchema = z.nativeEnum(SystemRole);

export const AuthDataSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  role: SystemRoleSchema,
});

export const LoginDataSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export const LoginResultSchema = z.discriminatedUnion('resetPassword', [
  z.object({
    resetPassword: z.literal(true),
  }),
  z.object({
    resetPassword: z.literal(false),
    id: z.number().int(),
    name: z.string(),
    role: SystemRoleSchema,
  }),
]);

export const ResetPasswordDataSchema = z.object({
  email: z.string(),
  password: z.string(),
  newPassword: z.string(),
});
export const ChangePasswordDataSchema = z.object({newPassword: PasswordSchema});

export type AuthData = z.infer<typeof AuthDataSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;
export type LoginResult = z.infer<typeof LoginResultSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordDataSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordDataSchema>;
