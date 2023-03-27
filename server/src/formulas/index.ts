// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import {
  CalculationResult,
  Formula,
  FormulaFunction,
  FormulaParams,
  ParameterizedFormulaFunction,
  Status
} from '../types/formulas';

const formulasWithSchema: Map<
  Formula,
  [yup.AnyObjectSchema, ParameterizedFormulaFunction]
> = new Map();

export function registerFormula(
  name: Formula,
  schema: yup.AnyObjectSchema,
  impl: ParameterizedFormulaFunction,
): void {
  formulasWithSchema.set(name, [schema, impl]);
}

// formulaChecker verifies that a provided string is valid for `type Formula`.
export const formulaChecker: yup.StringSchema =
  yup.string().oneOf(Object.values(Formula)).required();

async function validate<P extends FormulaParams>(
  fn: (params: P, subPoints: Array<CalculationResult>) => Promise<CalculationResult>,
  schema: yup.AnyObjectSchema,
  params: unknown,
): Promise<FormulaFunction> {
  await schema.validate(params);
  return (subGrades: Array<CalculationResult>) => fn(params as P, subGrades);
}

// getFormula fetches a FormulaFunction based on a given name and user parameters.
export function getFormula(name: Formula, params: FormulaParams): Promise<FormulaFunction> {
  const formulaWithSchema: [yup.AnyObjectSchema, ParameterizedFormulaFunction] =
    formulasWithSchema.get(name)!;
  return validate(formulaWithSchema[1], formulaWithSchema[0], params);
}

registerFormula(
  Formula.Manual,
  yup.object(),
  // If no points have been input for a student, assume the attainment
  // has been failed.
  async (
    _params: any,
    _subGrades: Array<CalculationResult>,
  ): Promise<CalculationResult> => {
    return { status: Status.Fail, points: undefined };
  },
);

