// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum Formula {
  Manual = 'MANUAL',
  WeightedAverage = 'WEIGHTED_AVERAGE',
}

export interface FormulaData {
  id: Formula;
  name: string;
}

export interface FormulaPreview extends FormulaData {
  attributes: Array<string>;
  codeSnippet: string;
}
