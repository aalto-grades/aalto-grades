// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dispatch, SetStateAction, createContext} from 'react';

// Node values
export type AdditionNodeValues = {
  type: 'addition';
  sourceSum: number;
  value: number;
};
export type AttainmentNodeValues = {
  type: 'attainment';
  value: number | 'fail';
};
export type AverageNodeValues = {
  type: 'average';
  sources: {[key: string]: {isConnected: boolean; value: number | 'fail'}};
  value: number;
};
export type GradeNodeValues = {
  type: 'grade';
  source: number;
  value: number;
};
export type MaxNodeValues = {
  type: 'max';
  sources: {[key: string]: {isConnected: boolean; value: number | 'fail'}};
  value: number | 'fail';
};
export type MinPointsNodeValues = {
  type: 'minpoints';
  source: number | 'fail';
  value: number | 'fail';
};
export type StepperNodeValues = {
  type: 'stepper';
  source: number;
  value: number;
};

export type NodeValue =
  | AdditionNodeValues
  | AttainmentNodeValues
  | AverageNodeValues
  | GradeNodeValues
  | MaxNodeValues
  | MinPointsNodeValues
  | StepperNodeValues;

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
export type AverageNodeSettings = {
  weights: {[key: string]: number};
  nextFree: number;
};
export type MinPointsNodeSettings = {
  minPoints: number;
};
export type StepperNodeSettings = {
  numSteps: number;
  outputValues: (number | 'same')[];
  middlePoints: number[];
};

export type NodeSettings = {
  [key: string]:
    | AverageNodeSettings
    | MinPointsNodeSettings
    | StepperNodeSettings;
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
