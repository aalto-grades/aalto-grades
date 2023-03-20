// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula, FormulaParams } from './attainable';
import * as yup from 'yup';

export enum Status {
  Pass = 'pass',
  Fail = 'fail',
}

export interface CalculationResult {
  status: Status;
  points: number | undefined;
}

export interface WeightedAssignmentParams {
  min: number;
  max: number;
  weights: Array<number>;
}

// A FormulaFunction represents a grade formula calculation operation, including
// user-defined parameters and their values.
export type FormulaFunction = (subResults: Array<CalculationResult>) => Promise<CalculationResult>;

// A ParametrizedFormulaFunction represents a grade formula calculation operation,
// without specific parameter values having been bound at the current time.
export type ParameterizedFormulaFunction =
  (parameters: any, subResults: Array<CalculationResult>) => Promise<CalculationResult>;

// A FormulaNode represents a grade formula calculation operation, including
// information about the formulas that are lower in the hierarchy tree.
export interface FormulaNode {
  validatedFormula: FormulaFunction;
  subFormulaNodes: Array<FormulaNode>;
}

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
