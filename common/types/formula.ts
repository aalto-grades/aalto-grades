// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum Formula {
  Manual = 'MANUAL',
  WeightedAverage = 'WEIGHTED_AVERAGE',
  RiseBonus = 'RISE_BONUS'
}

export interface FormulaData {
  id: Formula;
  name: string;
  params: Array<string>;
  childParams: Array<Param>;
  codeSnippet: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChildParamsObject = {[key: string]: any};

export interface ParamsObject<T = ChildParamsObject> {
  children?: Array<[string, T]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export enum InputField {
  Text = 'TEXT',
  List = 'LIST'
}

export interface Param {
  name: string;
  inputField?: InputField;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requires?: {param: string, toBe: any}
}

export interface ListParam extends Param {
  options: Array<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionsMap: {[key: string]: any}
}
