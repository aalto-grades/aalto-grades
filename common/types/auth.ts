// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import zxcvbn from 'zxcvbn';

export enum SystemRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export const SystemRoleSchema = z.nativeEnum(SystemRole);
export const PasswordSchema = z.string().superRefine((password, ctx) => {
  const result = zxcvbn(password);
  if (password.length < 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be at least 12 characters long',
    });
  }

  if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'A password must include at least one upper case character, one lower case character and one numeric',
    });
  }

  if (result.score < 4) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Password too weak. (estimated 10^${Math.floor(10 * result.guesses_log10) / 10} <= 10^10 guesses)`,
    });
  }
});

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
