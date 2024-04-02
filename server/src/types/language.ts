// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';
import {z} from 'zod';

/**
 * Yup validation schema for validating localized strings in requests.
 * Does not allow leaving the object empty, requires at least one translation.
 * Checks that keys match the ones defined in shape, throws error if they don't.
 */
export const localizedStringSchema: yup.AnyObjectSchema = yup
  .object()
  .shape({
    fi: yup.string(),
    en: yup.string(),
    sv: yup.string(),
  })
  .test(
    'localized-string-check-not-empty',
    // Used to be MessageParams
    (params: {path: string}) =>
      `${params.path} must contain at least one translation`,
    (obj: object) =>
      obj === undefined || obj === null ? true : Object.keys(obj).length !== 0
  )
  .strict()
  .noUnknown()
  .default(undefined);

export const zodLocalizedStringSchema = z
  .object({
    fi: z.string().optional(),
    en: z.string().optional(),
    sv: z.string().optional(),
  })
  .refine(
    val => val.fi !== undefined || val.en !== undefined || val.sv !== undefined
  );
