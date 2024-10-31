// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {TFunction} from 'i18next';
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
export const nullableIntSchema = (
  t: TFunction
): z.ZodNullable<z.ZodPipeline<z.ZodString, z.ZodNumber>> =>
  z
    .string()
    .regex(/^[1-9]+\d*$/, t('general.not-int'))
    .pipe(z.coerce.number().int().nonnegative())
    .nullable();

export const nullableDateSchema = (
  _t: TFunction
): z.ZodNullable<z.ZodPipeline<z.ZodString, z.ZodDate>> =>
  z.string().date().pipe(z.coerce.date()).nullable();

export class CustomError extends Error {
  action?: React.FC | null;

  constructor({message, action}: {message: string; action: React.FC}) {
    super();
    this.message = message;
    this.action = action;
  }
}
