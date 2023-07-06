// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { FormulaFunction, FormulaImplementation } from '../types/formulas';
import { Formula, FormulaData } from 'aalto-grades-common/types';

// The registry of formula implementations corresponding to their names, along
// with a schema specifying what form their user parameters should take.
const formulaImplementations: Map<Formula, FormulaImplementation> = new Map();

/**
 * Adds a formula implementation to the formula registry.
 * @param {Formula} formula - The name and ID of the formula.
 * @param {FormulaFunction} formulaFunction - The function implementing the formula.
 * @param {yup.AnyObjectSchema} paramSchema - Schema for the parameters of this formula.
 */
export function registerFormula(
  formula: Formula,
  formulaFunction: FormulaFunction,
  codeSnippet: string,
  name: string,
  attributes: Array<string>,
  paramSchema: yup.AnyObjectSchema
): void {
  formulaImplementations.set(
    formula,
    {
      formulaFunction: formulaFunction,
      codeSnippet,
      name,
      attributes,
      paramSchema: paramSchema
    }
  );
}

export function getFormulaImplementation(
  formulaId: Formula
): FormulaImplementation {
  const formulaImplementation: FormulaImplementation | undefined =
    formulaImplementations.get(formulaId);

  if (!formulaImplementation) {
    throw new Error(`invalid formula ID ${formulaId}`);
  }

  return formulaImplementation;
}

export async function getAllFormulasBasicData(): Promise<Array<FormulaData>> {
  const formulas: Array<FormulaData> = [];

  for (const [key, value] of formulaImplementations) {
    formulas.push({
      id: key,
      name: value.name
    });
  }

  return formulas;
}

// Call registerFormula in all formula definition files.
require('./manual');
require('./weightedAverage');
