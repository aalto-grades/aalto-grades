// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {createContext} from 'react';

import {NodeData, NodeSettings, NodeValues} from '@/common/types';

type NodeValuesContext = NodeValues;
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
  [key: string]: {warning?: string} | undefined;
};
type ExtraNodeDataContext = ExtraNodeData;
export const ExtraNodeDataContext = createContext<ExtraNodeDataContext>(
  {} as ExtraNodeDataContext
);
