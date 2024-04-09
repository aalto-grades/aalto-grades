// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {SystemRole} from '@common/types';
import {z} from 'zod';

export const stringToIdSchema = z
  .string()
  .regex(/^\d+$/)
  .pipe(z.coerce.number().int().min(1));

export interface JwtClaims {
  role: SystemRole;
  id: number;
}
