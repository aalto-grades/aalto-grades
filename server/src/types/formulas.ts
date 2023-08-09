// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { ChildParamsObject, ParamsObject, Status } from 'aalto-grades-common/types';
import * as yup from 'yup';

export interface CalculationResult {
  attainmentName: string,
  grade: number,
  status: Status
}

/**
 * Type of functions implementing grade calculation formulas.
 */
export type FormulaFunction = (
  attainmenName: string,
  paramsObject: ParamsObject,
  subGrades: Array<CalculationResult>
) => CalculationResult;

/**
 * Stores a formula function as well as the Yup schema for validating its
 * parameters.
 */
export interface FormulaImplementation {
  formulaFunction: FormulaFunction,
  paramSchema: yup.AnyObjectSchema,
  codeSnippet: string,
  name: string,
  params: Array<string>,
  childParams: Array<string>,
  defaultChildParams: ChildParamsObject
}

/**
 * Stores information needed for calculating the grade of an attainment.
 */
export interface FormulaNode {
  formulaImplementation: FormulaImplementation,
  subFormulaNodes: Array<FormulaNode>,
  formulaParams: ParamsObject,
  attainmentId: number,
  attainmentName: string
}
