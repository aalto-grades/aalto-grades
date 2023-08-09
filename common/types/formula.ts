// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum Formula {
  Manual = 'MANUAL',
  WeightedAverage = 'WEIGHTED_AVERAGE',
}

export interface FormulaData {
  id: Formula,
  name: string,
  params: Array<string>,
  childParams: Array<string>,
  codeSnippet: string
}

export type ChildParamsObject = { [key: string]: any };

export interface ParamsObject<T = ChildParamsObject> {
  children?: Array<[string, T]>,
  minRequiredGrade: number,
  [key: string]: any
}
