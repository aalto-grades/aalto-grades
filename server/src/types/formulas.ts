// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

export enum Formula {
  Manual = 'MANUAL',
  WeightedAverage = 'WEIGHTED_AVERAGE',
}

export enum Status {
  Pass = 'PASS',
  Fail = 'FAIL',
}

export interface GradingResult {
  status: Status;
  grade: number;
}

export interface GradingInput {
  subResult: GradingResult;
  params: object | null;
}

export interface FormulaPreview {
  id: Formula;
  name: string;
  attributes: Array<string>;
  codeSnippet: string;
}

/**
 * Type of functions implementing grade calculation formulas.
 */
export type FormulaFunction = (inputs: Array<GradingInput>) => Promise<GradingResult>;

/**
 * Stores a formula function as well as the Yup schema for validating its
 * parameters.
 */
export interface FormulaImplementation {
  formulaFunction: FormulaFunction;
  paramSchema: yup.AnyObjectSchema;
}

/**
 * Stores information needed for calculating the grade of an attainment.
 */
export interface FormulaNode {
  formulaImplementation: FormulaImplementation;
  subFormulaNodes: Array<FormulaNode>;
  parentFormulaParams: object | null;
}
