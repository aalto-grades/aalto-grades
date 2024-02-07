// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dispatch, SetStateAction, createContext} from 'react';

export type NodeValues = {[key: string]: number};
type NodeValuesContext = {
  nodeValues: NodeValues;
  setNodeValues: Dispatch<SetStateAction<NodeValues>>;
};
export const NodeValuesContext = createContext<NodeValuesContext>(
  {} as NodeValuesContext
);

export type StepperNodeSettings = {
  numSteps: number;
  outputValues: number[];
  middlePoints: number[];
};
export const initStepperNodeSettings = {
  numSteps: 1,
  outputValues: [0],
  middlePoints: [],
};

export type NodeSettings = {[key: string]: StepperNodeSettings};
type NodeSettingsContext = {
  nodeSettings: NodeSettings;
  setNodeSettings: Dispatch<SetStateAction<NodeSettings>>;
};
export const NodeSettingsContext = createContext<NodeSettingsContext>(
  {} as NodeSettingsContext
);
