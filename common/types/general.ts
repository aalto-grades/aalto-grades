// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export enum HttpCode {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
}

/** Needs to be converted into lowercase for sisu csv */
export enum Language {
  Finnish = 'FI',
  Swedish = 'SV',
  English = 'EN',
  Spanish = 'ES',
  Japanese = 'JA',
  Chinese = 'ZH',
  Portuguese = 'PT',
  French = 'FR',
  German = 'DE',
  Russian = 'RU',
}

export const LanguageSchema = z.nativeEnum(Language);

export const IdSchema = z.number().int();
export const IdArraySchema = z.array(IdSchema);
export const DateSchema = z
  .string()
  .datetime()
  .pipe(z.coerce.date()) as unknown as z.ZodDate; // To fix ts compatibility with zod-middleware
export const AaltoEmailSchema = z
  .string({required_error: 'Email is required'})
  .email()
  .regex(/^.*@aalto\.fi$/, 'Email must be a valid aalto email');

export const LocalizedStringSchema = z.strictObject({
  fi: z.string(),
  en: z.string(),
  sv: z.string(),
});

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;
