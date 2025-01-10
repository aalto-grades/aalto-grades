// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {AaltoEmailSchema, DateSchema, IdSchema} from './general';

export const UserDataSchema = z.strictObject({
  id: IdSchema,
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  studentNumber: z.string().nullable(),
});
export const FullUserDataSchema = z.strictObject({
  id: IdSchema,
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  studentNumber: z.string().nullable(),
  idpUser: z.boolean(),
  admin: z.boolean(),
});
export const StudentDataSchema = z.strictObject({
  id: IdSchema,
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  studentNumber: z.string(),
});
export const TeacherDataSchema = z.strictObject({
  id: IdSchema,
  name: z.string().nullable(),
  email: z.string().email(),
  studentNumber: z.string().nullable(),
});
export const AssistantDataSchema = z.strictObject({
  id: IdSchema,
  name: z.string().nullable(),
  email: z.string().email(),
  studentNumber: z.string().nullable(),
  expiryDate: z.string().nullable(),
});
export const NewAssistantDataSchema = z.strictObject({
  email: z.string().email(),
  expiryDate: DateSchema.nullable(),
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
export const UserIdArraySchema = z
  .array(IdSchema)
  .refine(items => new Set(items).size === items.length);

export const VerifyEmailSchema = z.strictObject({
  email: z.string().email(),
});

export const VerifyEmailResponseSchema = z.strictObject({
  exists: z.boolean(),
});

export const UserDataArraySchema = z.array(UserDataSchema);
export const UserWithRoleArraySchema = z.array(FullUserDataSchema);

export type UserData = z.infer<typeof UserDataSchema>;
export type FullUserData = z.infer<typeof FullUserDataSchema>;
export type StudentData = z.infer<typeof StudentDataSchema>;
export type TeacherData = z.infer<typeof TeacherDataSchema>;
export type AssistantData = z.infer<typeof AssistantDataSchema>;
export type NewUser = z.infer<typeof NewUserSchema>;
export type NewUserResponse = z.infer<typeof NewUserResponseSchema>;
export type UserIdArray = z.infer<typeof UserIdArraySchema>;
export type VerifyEmail = z.infer<typeof VerifyEmailSchema>;
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;
