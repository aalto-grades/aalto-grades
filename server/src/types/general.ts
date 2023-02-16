// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

export const idSchema: yup.AnyObjectSchema = yup.object().shape({
  id: yup
    .number()
    .integer()
    .min(1)
    .required()
});
