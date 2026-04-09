// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import zxcvbn from 'zxcvbn';

import {IdSchema} from './general';

export enum SystemRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export const SystemRoleSchema = z.enum(SystemRole);
export const PasswordSchema = z.string().check((ctx) => {
  const password = ctx.value;
  const result = zxcvbn(password);
  if (password.length < 12) {
    ctx.issues.push({
      code: 'custom',
      message: 'Password must be at least 12 characters long',
      input: ctx.value
    });
  }

  if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
    ctx.issues.push({
      code: 'custom',
      message:
        'A password must include at least one upper case character, one lower case character and one numeric',
      input: ctx.value
    });
  }

  if (result.score < 4) {
    ctx.issues.push({
      code: 'custom',
      message: `Password too weak. (estimated 10^${Math.floor(10 * result.guesses_log10) / 10} <= 10^10 guesses)`,
      input: ctx.value
    });
  }
});

export const AuthDataSchema = z.strictObject({
  id: IdSchema,
  name: z.string(),
  email: z.string(),
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
  AuthDataSchema.extend({
    status: z.literal('ok'),
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

export const ConfirmMfaDataSchema = z.strictObject({otp: z.string()});

export const PasskeyLoginStartDataSchema = z.strictObject({
  email: z.string(),
});
export const PasskeyLoginStartResultSchema = z.strictObject({
  options: z.unknown(),
});
export const PasskeyLoginFinishDataSchema = z.strictObject({
  email: z.string(),
  authenticationResponse: z.unknown(),
});
export const PasskeyLoginFinishResultSchema = AuthDataSchema;

export const PasskeyRegisterStartDataSchema = z.strictObject({});
export const PasskeyRegisterStartResultSchema = z.strictObject({
  options: z.unknown(),
});
export const PasskeyRegisterFinishDataSchema = z.strictObject({
  registrationResponse: z.unknown(),
});
export const PasskeyRegisterFinishResultSchema = z.strictObject({
  ok: z.literal(true),
});
export const PasskeyInfoSchema = z.strictObject({
  id: IdSchema,
  credentialId: z.string(),
  authenticatorAttachment: z.string().nullable(),
  transports: z.array(z.string()),
  aaguid: z.string(),
  credentialDeviceType: z.string(),
  credentialBackedUp: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const PasskeyListOwnResultSchema = z.strictObject({
  passkeys: z.array(PasskeyInfoSchema),
});
export const PasskeyDeleteOwnDataSchema = z.strictObject({
  passkeyId: IdSchema,
});

export type AuthData = z.infer<typeof AuthDataSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;
export type LoginResult = z.infer<typeof LoginResultSchema>;
export type ResetOwnPasswordData = z.infer<typeof ResetOwnPasswordDataSchema>;
export type ResetAuthData = z.infer<typeof ResetAuthDataSchema>;
export type ResetAuthResult = z.infer<typeof ResetAuthResultSchema>;
export type ChangeOwnAuthData = z.infer<typeof ChangeOwnAuthDataSchema>;
export type ChangeOwnAuthResponse = z.infer<typeof ChangeOwnAuthResponseSchema>;
export type ConfirmMfaData = z.infer<typeof ConfirmMfaDataSchema>;
export type PasskeyLoginStartData = z.infer<typeof PasskeyLoginStartDataSchema>;
export type PasskeyLoginStartResult = z.infer<
  typeof PasskeyLoginStartResultSchema
>;
export type PasskeyLoginFinishData = z.infer<
  typeof PasskeyLoginFinishDataSchema
>;
export type PasskeyLoginFinishResult = z.infer<
  typeof PasskeyLoginFinishResultSchema
>;
export type PasskeyRegisterStartData = z.infer<
  typeof PasskeyRegisterStartDataSchema
>;
export type PasskeyRegisterStartResult = z.infer<
  typeof PasskeyRegisterStartResultSchema
>;
export type PasskeyRegisterFinishData = z.infer<
  typeof PasskeyRegisterFinishDataSchema
>;
export type PasskeyRegisterFinishResult = z.infer<
  typeof PasskeyRegisterFinishResultSchema
>;
export type PasskeyInfo = z.infer<typeof PasskeyInfoSchema>;
export type PasskeyListOwnResult = z.infer<typeof PasskeyListOwnResultSchema>;
export type PasskeyDeleteOwnData = z.infer<typeof PasskeyDeleteOwnDataSchema>;
