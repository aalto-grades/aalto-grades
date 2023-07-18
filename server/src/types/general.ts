// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { SystemRole } from 'aalto-grades-common/types';

export const idSchema: yup.AnyObjectSchema = yup.object().shape({
  id: yup
    .number()
    .integer()
    .min(1)
    .required()
});

export interface JwtClaims {
  role: SystemRole,
  id: number
}
