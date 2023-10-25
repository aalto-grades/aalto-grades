// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData,
  ChildParamsObject,
  Status,
} from 'aalto-grades-common/types';
import * as yup from 'yup';

export interface CalculationResult {
  attainment: AttainmentData;
  grade: number;
  status: Status;
}

/**
 * Type of functions implementing grade calculation formulas.
 */
export type FormulaFunction = (
  attainment: AttainmentData,
  subGrades: Array<CalculationResult>
) => CalculationResult;

/**
 * Stores a formula function as well as the Yup schema for validating its
 * parameters.
 */
export interface FormulaImplementation {
  formulaFunction: FormulaFunction;
  paramSchema: yup.AnyObjectSchema;
  codeSnippet: string;
  name: string;
  params: Array<string>;
  childParams: Array<string>;
  defaultChildParams: ChildParamsObject;
}

/**
 * Stores information needed for calculating the grade of an attainment.
 */
export interface FormulaNode {
  formulaImplementation: FormulaImplementation;
  subFormulaNodes: Array<FormulaNode>;
  attainment: AttainmentData;
}
