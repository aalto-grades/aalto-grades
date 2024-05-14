// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {SystemRole} from '@/common/types';

export const stringToIdSchema = z
  .string()
  .regex(/^\d+$/)
  .pipe(z.coerce.number().int().min(1));

export interface JwtClaims {
  role: SystemRole;
  id: number;
}
