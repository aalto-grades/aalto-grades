// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { Formula, FormulaFunction, FormulaImplementation } from '../types/formulas';

// The registry of formula implementations corresponding to their names, along
// with a schema specifying what form their user parameters should take.
const formulaImplementations: Map<Formula, FormulaImplementation> = new Map();

// registerFormula adds a formula implementation to the formula registry.
// The caller should specify a schema for the user-configurable parameters
// per-formula.
export function registerFormula(
  formulaId: Formula,
  formulaFunction: FormulaFunction,
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

export async function getFormulaImplementation(
  formulaId: Formula
): Promise<FormulaImplementation> {
  const formulaImplementation: FormulaImplementation | undefined =
    formulaImplementations.get(formulaId);

  if (!formulaImplementation) {
    throw new Error(`invalid formula ID ${formulaId}`);
  }

  return formulaImplementation;
}
