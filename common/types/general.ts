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
  InternalServerError = 500,
  BadGateway = 502,
}

export enum Language {
  English = 'EN',
  Finnish = 'FI',
  Swedish = 'SV',
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
export const LocalizedStringSchema = z.object({
  fi: z.string(),
  en: z.string(),
  sv: z.string(),
});

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;
