// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {TFunction} from 'i18next';
import type {JSX} from 'react';
import {z} from 'zod';

import type {Department, Language, LocalizedString} from '@/common/types';

export type HeadCellData = {
  id: string;
  label: string;
};

export type Numeric = number | string;

export type DepartmentOption = {
  id: Department;
  department: LocalizedString;
};

export type LanguageOption = {
  id: Language;
  language: LocalizedString;
};

// For formik
// export const nullableIntSchema = (
//   t: TFunction
// ) =>
//   z
//     .string()
//     .regex(/^[1-9]+\d*$/, t('general.not-int'))
//     .pipe(z.coerce.number().int().nonnegative())
//     .nullable();

export const nullableDateSchema = (
  _t: TFunction
) =>
  z.iso.date().pipe(z.coerce.date()).nullable();

export class CustomError extends Error {
  action?: () => JSX.Element;

  constructor({message, action}: {message: string; action: () => JSX.Element}) {
    super();
    this.message = message;
    this.action = action;
  }
}

export type AssistantData = {
  email: string;
  expiryDate: Date | null;
};
