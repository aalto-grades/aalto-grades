// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dispatch, SetStateAction, createContext} from 'react';

// Node values
export type DropInNodes =
  | 'addition'
  | 'average'
  | 'max'
  | 'minpoints'
  | 'require'
  | 'stepper'
  | 'substitute';

export type CustomNodeTypes = DropInNodes | 'attainment' | 'grade';

export type AdditionNodeValues = {
  type: 'addition';
  sources: {[key: string]: {isConnected: boolean; value: number}};
  value: number;
};
export type AttainmentNodeValues = {
  type: 'attainment';
  value: number;
};
export type AverageNodeValues = {
  type: 'average';
  sources: {[key: string]: {isConnected: boolean; value: number}};
  value: number;
};
export type GradeNodeValues = {
  type: 'grade';
  source: number;
  value: number;
};
export type MaxNodeValues = {
  type: 'max';
  sources: {[key: string]: {isConnected: boolean; value: number}};
  value: number;
};
export type MinPointsNodeValues = {
  type: 'minpoints';
  source: number;
  value: number | 'reqfail';
};
export type RequireNodeValues = {
  type: 'require';
  sources: {[key: string]: {isConnected: boolean; value: number | 'reqfail'}};
  values: {[key: string]: number};
  courseFail: boolean;
};
export type StepperNodeValues = {
  type: 'stepper';
  source: number;
  value: number;
};
export type SubstituteNodeValues = {
  type: 'substitute';
  sources: {[key: string]: {isConnected: boolean; value: number | 'reqfail'}};
  values: {[key: string]: number | 'reqfail'};
};

export type NodeValue =
  | AdditionNodeValues
  | AttainmentNodeValues
  | AverageNodeValues
  | GradeNodeValues
  | MaxNodeValues
  | MinPointsNodeValues
  | RequireNodeValues
  | StepperNodeValues
  | SubstituteNodeValues;

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
};
export type MaxNodeSettings = {
  minValue: number;
};
export type MinPointsNodeSettings = {
  minPoints: number;
};
export type RequireNodeSettings = {
  numFail: number;
  failSetting: 'ignore' | 'coursefail';
};
export type StepperNodeSettings = {
  numSteps: number;
  outputValues: (number | 'same')[];
  middlePoints: number[];
};
export type SubstituteNodeSettings = {
  maxSubstitutions: number;
  substituteValues: number[];
};

export type NodeSettings =
  | AverageNodeSettings
  | MaxNodeSettings
  | MinPointsNodeSettings
  | RequireNodeSettings
  | StepperNodeSettings
  | SubstituteNodeSettings;
export type AllNodeSettings = {[key: string]: NodeSettings};
type NodeSettingsContext = {
  nodeSettings: AllNodeSettings;
  setNodeSettings: (id: string, newSettings: NodeSettings) => void;
};
export const NodeSettingsContext = createContext<NodeSettingsContext>(
  {} as NodeSettingsContext
);

// Node heights
export type NodeDimensions = {
  [key: string]: {width: number; height: number};
};
type NodeDimensionsContext = {
  nodeHeights: NodeDimensions;
  setNodeDimensions: (
    id: string,
    newDimensions: {width: number; height: number}
  ) => void;
};
export const NodeDimensionsContext = createContext<NodeDimensionsContext>(
  {} as NodeDimensionsContext
);
