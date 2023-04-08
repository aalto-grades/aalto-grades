// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import {
  CalculationResult,
  Formula,
  FormulaFunction,
  ParameterizedFormulaFunction
} from '../types/formulas';

interface FormulaImplementation {
  formulaFunction: ParameterizedFormulaFunction;
  paramSchema: yup.AnyObjectSchema;
}

// The registry of formula implementations corresponding to their names, along
// with a schema specifying what form their user parameters should take.
const formulaImplementations: Map<Formula, FormulaImplementation> = new Map();

// registerFormula adds a formula implementation to the formula registry.
// The caller should specify a schema for the user-configurable parameters
// per-formula.
export function registerFormula(
  formulaId: Formula,
  formulaFunction: ParameterizedFormulaFunction,
  paramSchema: yup.AnyObjectSchema
): void {
  formulaImplementations.set(
    formulaId,
    {
      formulaFunction: formulaFunction,
      paramSchema: paramSchema
    }
  );
}

// Gets a FormulaFunction based on a given name and user parameters.
export async function getFormulaFunction(
  formulaId: Formula, params: object
): Promise<FormulaFunction> {
  const formulaImplementation: FormulaImplementation | undefined =
    formulaImplementations.get(formulaId);

  if (!formulaImplementation) {
    throw new Error(`invalid formula ID ${formulaId}`);
  }

  await formulaImplementation.paramSchema.validate(params);

  return (subGrades: Array<CalculationResult>) =>
    formulaImplementation.formulaFunction(params, subGrades);
}

