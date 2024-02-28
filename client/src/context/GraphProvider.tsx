// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {createContext} from 'react';
import {
  NodeData,
  NodeSettings,
  NodeValue,
  NodeValues,
} from '@common/types/graph';

type NodeValuesContext = {
  nodeValues: NodeValues;
  setNodeValue: (id: string, nodeValue: NodeValue) => void;
};
export const NodeValuesContext = createContext<NodeValuesContext>(
  {} as NodeValuesContext
);

type NodeDataContext = {
  nodeData: {[key: string]: NodeData};
  setNodeTitle: (id: string, title: string) => void;
  setNodeSettings: (id: string, settings: NodeSettings) => void;
};
export const NodeDataContext = createContext<NodeDataContext>(
  {} as NodeDataContext
);

// Node dimensions
export type NodeDimensions = {[key: string]: {width: number; height: number}};
type NodeDimensionsContext = {
  nodeDimensions: NodeDimensions;
  setNodeDimensions: (id: string, width: number, height: number) => void;
};
export const NodeDimensionsContext = createContext<NodeDimensionsContext>(
  {} as NodeDimensionsContext
);
