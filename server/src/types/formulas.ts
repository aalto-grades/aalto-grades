// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum Formula {
  Manual = 'MANUAL',
  WeightedAverage = 'WEIGHTED_AVERAGE',
}

export interface FormulaParams {
  min: number;
  max: number;
}

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
// 
// For instance,
// `getFormula({ min: 0, max: 5, weights: [2, 3] }, Formula.WeightedAverage)`
// produces an `func: FormulaFunction` that expects two subResults.
// The produced function calculates a weighted average with weights 2, 3
// respectively.
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
