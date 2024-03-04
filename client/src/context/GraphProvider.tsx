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

export type ExtraNodeData = {
  [key: string]: {
    dimensions: {width: number; height: number};
    warning?: string;
  };
};
type ExtraNodeDataContext = {
  extraNodeData: ExtraNodeData;
  setNodeDimensions: (id: string, width: number, height: number) => void;
};
export const ExtraNodeDataContext = createContext<ExtraNodeDataContext>(
  {} as ExtraNodeDataContext
);
