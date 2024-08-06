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
  otp: z.string().nullable(),
});
export const LoginResultSchema = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('resetPassword'),
  }),
  z.strictObject({
    status: z.literal('showMfa'),
    otpAuth: z.string(),
  }),
  z.strictObject({
    status: z.literal('enterMfa'),
  }),
  z.strictObject({
    status: z.literal('ok'),
    id: z.number().int(),
    name: z.string(),
    role: SystemRoleSchema,
  }),
]);

export const ResetOwnPasswordDataSchema = z.strictObject({
  email: z.string(),
  password: z.string(),
  newPassword: z.string(),
});

export const ResetAuthDataSchema = z.strictObject({
  resetPassword: z.boolean(),
  resetMfa: z.boolean(),
});
export const ResetAuthResultSchema = z.strictObject({
  temporaryPassword: z.string().nullable(),
});

export const ChangeOwnAuthDataSchema = z.discriminatedUnion('resetPassword', [
  z.strictObject({
    resetPassword: z.literal(true),
    resetMfa: z.literal(false),
    newPassword: PasswordSchema,
  }),
  z.strictObject({
    resetPassword: z.literal(false),
    resetMfa: z.literal(true),
  }),
]);
export const ChangeOwnAuthResponseSchema = z.strictObject({
  otpAuth: z.string().nullable(),
});

export const ConfirmMfaSchema = z.strictObject({otp: z.string()});

export type AuthData = z.infer<typeof AuthDataSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;
export type LoginResult = z.infer<typeof LoginResultSchema>;
export type ResetOwnPasswordData = z.infer<typeof ResetOwnPasswordDataSchema>;
export type ResetAuthData = z.infer<typeof ResetAuthDataSchema>;
export type ResetAuthResult = z.infer<typeof ResetAuthResultSchema>;
export type ChangeOwnAuthData = z.infer<typeof ChangeOwnAuthDataSchema>;
export type ChangeOwnAuthResponse = z.infer<typeof ChangeOwnAuthResponseSchema>;
export type ConfirmMfa = z.infer<typeof ConfirmMfaSchema>;
