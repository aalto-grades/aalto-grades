// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dispatch, SetStateAction, createContext} from 'react';

// Node values
export type AdditionNodeIO = {
  type: 'addition';
  sourceSum: number;
  value: number;
};
export type AttainmentNodeIO = {
  type: 'attainment';
  value: number | 'fail';
};
export type AverageNodeIO = {
  type: 'average';
  sources: {[key: string]: {isConnected: boolean; value: number | 'fail'}};
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
  outputValues: (number | 'same')[];
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

// Node heights
export type NodeHeights = {
  [key: string]: number;
};
type NodeHeightsContext = {
  nodeHeights: NodeHeights;
  setNodeHeights: Dispatch<SetStateAction<NodeHeights>>;
};
export const NodeHeightsContext = createContext<NodeHeightsContext>(
  {} as NodeHeightsContext
);
