// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

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

export interface LocalizedString {
  fi: string;
  sv: string;
  en: string;
}
