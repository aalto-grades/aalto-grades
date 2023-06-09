// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum Language {
  English = 'EN',
  Finnish = 'FI',
  Swedish = 'SV'
}

export interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}
