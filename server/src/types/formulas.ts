// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { Status } from './grades';

export enum Formula {
  Manual = 'MANUAL',
  WeightedAverage = 'WEIGHTED_AVERAGE',
}

export interface CalculationResult {
  status: Status;
  grade: number;
}

export interface CalculationInput {
  subResult: CalculationResult;
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
export type FormulaFunction =
  (inputs: Array<CalculationInput>) => Promise<CalculationResult>;

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
  attainmentId: number;
}
