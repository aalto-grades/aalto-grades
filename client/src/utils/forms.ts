// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {ZodType} from 'zod';

/** Allows use of Zod schemas with the Formik `validate` prop. */
// eslint-disable-next-line func-style
export function withZodSchema<T>(
  schema: ZodType<T>
) {
  return (values: T): Partial<T> => {
    const result = schema.safeParse(values);

    if (result.success) return {};

    return result.error.issues.reduce((acc, curr) => {
      const key = curr.path.join('.');
      return {
        ...acc,
        [key]: curr.message,
      };
    }, {});
  };
}
