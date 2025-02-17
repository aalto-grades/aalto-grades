import type {ParseParams, ZodSchema} from 'zod';

/** Allows use of Zod schemas with the Formik `validate` prop. */
// eslint-disable-next-line func-style
export function withZodSchema<T>(
  schema: ZodSchema<T>,
  params?: Partial<ParseParams>
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  return (values: T): Partial<T> => {
    const result = schema.safeParse(values, params);

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
