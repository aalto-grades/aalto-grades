// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import {SystemRole} from '@common/types';
import {z} from 'zod';

export const idSchema: yup.AnyObjectSchema = yup.object().shape({
  id: yup.number().integer().min(1).required(),
});

export const zodIdSchema = z
  .string()
  .regex(/^\d+$/)
  .pipe(z.coerce.number().int().min(1));

export interface JwtClaims {
  role: SystemRole;
  id: number;
}
