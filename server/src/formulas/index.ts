// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import {
  ChildParamsObject,
  Formula,
  FormulaData,
} from 'aalto-grades-common/types';
import {FormulaFunction, FormulaImplementation} from '../types';

// The registry of formula implementations corresponding to their names, along
// with a schema specifying what form their user parameters should take.
const formulaImplementations: Map<Formula, FormulaImplementation> = new Map();

/**
 * Adds a formula implementation to the formula registry.
 * @param {Formula} formula - The ID of the formula.
 * @param {FormulaFunction} formulaFunction - The function implementing the formula.
 * @param {string} codeSnippet - A string containing the formula function and its
 * parameters.
 * @param {string} name - Human readable name of the formula.
 * @param {Array<string>} params - The parameters of the formula which don't concern
 * child attainments.
 * @param {Array<string>} childParams - The parameters of the formula which relate
 * to child attainments.
 * @param {yup.AnyObjectSchema} paramSchema - Schema for the parameters of this formula.
 */
export function registerFormula(
  formula: Formula,
  formulaFunction: FormulaFunction,
  codeSnippet: string,
  name: string,
  params: Array<string>,
  childParams: Array<string>,
  defaultChildParams: ChildParamsObject,
  paramSchema: yup.AnyObjectSchema
): void {
  formulaImplementations.set(formula, {
    formulaFunction,
    codeSnippet,
    name,
    params,
    childParams,
    defaultChildParams,
    paramSchema,
  });
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

export function getAllFormulasData(): Array<FormulaData> {
  const formulas: Array<FormulaData> = [];

  for (const [key, value] of formulaImplementations) {
    formulas.push({
      id: key,
      name: value.name,
      params: value.params,
      childParams: value.childParams,
      codeSnippet: value.codeSnippet,
    });
  }

  return formulas;
}

// Call registerFormula in all formula definition files.
require('./manual');
require('./weightedAverage');
