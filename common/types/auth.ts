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

export const AuthDataSchema = z.strictObject({
  id: z.number().int(),
  name: z.string(),
  role: SystemRoleSchema,
});

export const LoginDataSchema = z.strictObject({
  email: z.string(),
  password: z.string(),
});
export const LoginResultSchema = z.discriminatedUnion('redirect', [
  z.strictObject({
    redirect: z.literal(true),
    resetPassword: z.boolean(),
    resetMfa: z.boolean(),
  }),
  z.strictObject({
    redirect: z.literal(false),
    id: z.number().int(),
    name: z.string(),
    role: SystemRoleSchema,
  }),
]);

export const ResetAuthDataSchema = z.strictObject({
  email: z.string(),
  password: z.string(),
  newPassword: z.string().nullable(),
});
export const ResetAuthResponseSchema = z.string().nullable();

export const ResetPasswordResultSchema = z.strictObject({
  temporaryPassword: z.string(),
});

export const ChangePasswordDataSchema = z.strictObject({
  newPassword: PasswordSchema,
});

export type AuthData = z.infer<typeof AuthDataSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;
export type LoginResult = z.infer<typeof LoginResultSchema>;
export type ResetAuthData = z.infer<typeof ResetAuthDataSchema>;
export type ResetAuthResponse = z.infer<typeof ResetAuthResponseSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordDataSchema>;
export type ResetPasswordResult = z.infer<typeof ResetPasswordResultSchema>;
