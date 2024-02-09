// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dispatch, SetStateAction, createContext} from 'react';

// Node values
export type AdditionNodeIO = {
  type: 'addition';
  sources: number[];
  value: number;
};
export type AttainmentNodeIO = {
  type: 'attainment';
  value: number;
};
export type AverageNodeIO = {
  type: 'average';
  sources: {[key: string]: {num: number; sum: number}};
  value: number;
};
export type GradeNodeIO = {
  type: 'grade';
  source: number;
  value: number;
};
export type StepperNodeIO = {
  type: 'stepper';
  source: number;
  value: number;
};

export type NodeValue =
  | AdditionNodeIO
  | AttainmentNodeIO
  | AverageNodeIO
  | GradeNodeIO
  | StepperNodeIO;

export type NodeValues = {
  [key: string]: NodeValue;
};
type NodeValuesContext = {
  nodeValues: NodeValues;
  setNodeValues: Dispatch<SetStateAction<NodeValues>>;
};
export const NodeValuesContext = createContext<NodeValuesContext>(
  {} as NodeValuesContext
);

// Node settings
export type StepperNodeSettings = {
  numSteps: number;
  outputValues: number[];
  middlePoints: number[];
};
export type AverageNodeSettings = {
  weights: {[key: string]: number};
  nextFree: number;
};

export type NodeSettings = {
  [key: string]: StepperNodeSettings | AverageNodeSettings;
};
type NodeSettingsContext = {
  nodeSettings: NodeSettings;
  setNodeSettings: Dispatch<SetStateAction<NodeSettings>>;
};
export const NodeSettingsContext = createContext<NodeSettingsContext>(
  {} as NodeSettingsContext
);
