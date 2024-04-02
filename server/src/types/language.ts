// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const localizedStringSchema = z
  .object({
    fi: z.string().optional(),
    en: z.string().optional(),
    sv: z.string().optional(),
  })
  .refine(
    val => val.fi !== undefined || val.en !== undefined || val.sv !== undefined
  );
