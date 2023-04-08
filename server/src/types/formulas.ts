// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

export enum Formula {
  Manual = 'MANUAL',
  WeightedAverage = 'WEIGHTED_AVERAGE',
}

export enum Status {
  Pass = 'pass',
  Fail = 'fail',
}

export interface GradingResult {
  status: Status;
  grade: number;
}

export interface GradingInput {
  subResult: GradingResult;
  params: object | null;
}

// A FormulaFunction represents a grade formula calculation operation, including
// user-defined parameters and their values.
//
// For instance,
// `getFormula({ min: 0, max: 5, weights: [2, 3] }, Formula.WeightedAverage)`
// produces an `func: FormulaFunction` that expects two subResults.
// The produced function calculates a weighted average with weights 2, 3
// respectively.
export type FormulaFunction = (inputs: Array<GradingInput>) => Promise<GradingResult>;

export interface FormulaImplementation {
  formulaFunction: FormulaFunction;
  paramSchema: yup.AnyObjectSchema;
}

// A FormulaNode represents a grade formula calculation operation, including
// information about the formulas that are lower in the hierarchy tree.
export interface FormulaNode {
  formulaImplementation: FormulaImplementation;
  subFormulaNodes: Array<FormulaNode>;

  parentFormulaParams: object | null;
}
