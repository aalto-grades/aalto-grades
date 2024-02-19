// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dispatch, SetStateAction, createContext} from 'react';

import AdditionNode from '../components/graph/AdditionNode';
import AttanmentNode from '../components/graph/AttainmentNode';
import AverageNode from '../components/graph/AverageNode';
import GradeNode from '../components/graph/GradeNode';
import MaxNode from '../components/graph/MaxNode';
import MinPointsNode from '../components/graph/MinPointsNode';
import RequireNode from '../components/graph/RequireNode';
import StepperNode from '../components/graph/StepperNode';

// eslint-disable-next-line react-refresh/only-export-components
export const nodeMap = {
  addition: AdditionNode,
  attainment: AttanmentNode,
  average: AverageNode,
  grade: GradeNode,
  max: MaxNode,
  minpoints: MinPointsNode,
  require: RequireNode,
  stepper: StepperNode,
};

// Node values
export type DropInNodes =
  | 'addition'
  | 'average'
  | 'max'
  | 'minpoints'
  | 'require'
  | 'stepper';

export type NodeTypes = DropInNodes | 'attainment' | 'grade';

export type AdditionNodeValues = {
  type: 'addition';
  sources: {[key: string]: {isConnected: boolean; value: number | 'fail'}};
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
export type RequireNodeValues = {
  type: 'require';
  sources: {[key: string]: {isConnected: boolean; value: number | 'fail'}};
  values: {[key: string]: number | 'fail'};
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
  | RequireNodeValues
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
};
export type MaxNodeSettings = {
  minValue: number | 'fail';
};
export type MinPointsNodeSettings = {
  minPoints: number;
};
export type RequireNodeSettings = {
  numMissing: number;
};
export type StepperNodeSettings = {
  numSteps: number;
  outputValues: (number | 'same')[];
  middlePoints: number[];
};

export type NodeSettings =
  | AverageNodeSettings
  | MaxNodeSettings
  | MinPointsNodeSettings
  | RequireNodeSettings
  | StepperNodeSettings;
export type AllNodeSettings = {[key: string]: NodeSettings};
type NodeSettingsContext = {
  nodeSettings: AllNodeSettings;
  setNodeSettings: (id: string, newSettings: NodeSettings) => void;
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
  setNodeHeight: (id: string, newHeight: number) => void;
};
export const NodeHeightsContext = createContext<NodeHeightsContext>(
  {} as NodeHeightsContext
);
