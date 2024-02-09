// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Edge, Node} from 'reactflow';
import {
  AverageNodeSettings,
  NodeSettings,
  NodeValue,
  NodeValues,
  StepperNodeSettings,
} from '../../context/GraphProvider';

type NodeTypes = 'attainment' | 'addition' | 'average' | 'stepper' | 'grade';

export const getInitNodeValues = (nodes: Node[]) => {
  const initNodeValues: NodeValues = {};
  for (const node of nodes) {
    switch (node.type as NodeTypes) {
      case 'addition':
        initNodeValues[node.id] = {type: 'addition', sources: [], value: 0};
        break;
      case 'attainment':
        initNodeValues[node.id] = {
          type: 'attainment',
          value: Math.round(Math.random() * 10),
        };
        break;
      case 'average':
        initNodeValues[node.id] = {type: 'average', sources: {}, value: 0};
        break;
      case 'grade':
        initNodeValues[node.id] = {type: 'grade', source: 0, value: 0};
        break;
      case 'stepper':
        initNodeValues[node.id] = {type: 'stepper', source: 0, value: 0};
        break;
    }
  }
  return initNodeValues;
};

const setNodeValue = (
  nodeId: string,
  nodeValue: NodeValue,
  nodeSettings: NodeSettings
): void => {
  switch (nodeValue.type) {
    case 'addition':
      nodeValue.value = nodeValue.sources.reduce((sum, val) => sum + val, 0);
      break;
    case 'average': {
      const settings = nodeSettings[nodeId] as AverageNodeSettings;
      let valueSum = 0;
      let weightSum = 0;
      for (const key of Object.keys(settings.weights)) {
        if (!(key in nodeValue.sources)) continue;
        valueSum += nodeValue.sources[key].sum * settings.weights[key];
        weightSum += nodeValue.sources[key].num * settings.weights[key];
      }
      nodeValue.value = weightSum === 0 ? 0 : valueSum / weightSum;
      break;
    }
    case 'grade':
      nodeValue.value = nodeValue.source;
      break;
    case 'stepper': {
      const settings = nodeSettings[nodeId] as StepperNodeSettings;
      for (let i = 0; i < settings.numSteps; i++) {
        if (
          i + 1 !== settings.numSteps &&
          nodeValue.source > settings.middlePoints[i]
        )
          continue;
        nodeValue.value = settings.outputValues[i];
        break;
      }
      break;
    }
  }
};

export const calculateNewNodeValues = (
  oldNodeValues: NodeValues,
  nodeSettings: NodeSettings,
  nodes: Node[],
  edges: Edge[]
) => {
  const nodeSources: {[key: string]: Set<string>} = {};
  const nodeTargets: {[key: string]: Edge[]} = {};
  for (const edge of edges) {
    if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
    nodeTargets[edge.source].push(edge);
    if (!(edge.target in nodeSources)) nodeSources[edge.target] = new Set();
    nodeSources[edge.target].add(edge.source);
  }

  const newNodeValues = {...oldNodeValues};
  const noSources = [];
  for (const node of nodes) {
    if (!(node.id in nodeSources)) noSources.push(node.id);

    const nodeValue = newNodeValues[node.id];
    if (nodeValue.type !== 'attainment') {
      if (nodeValue.type === 'addition') {
        nodeValue.sources = [];
      } else if (nodeValue.type === 'average') {
        for (const value of Object.values(nodeValue.sources)) {
          value.sum = 0;
          value.num = 0;
        }
      } else {
        nodeValue.source = 0;
      }
      nodeValue.value = 0;
    }
  }

  while (noSources.length > 0) {
    const sourceId = noSources.pop() as string;
    setNodeValue(sourceId, newNodeValues[sourceId], nodeSettings);
    const sourceValue = newNodeValues[sourceId].value;

    if (!(sourceId in nodeTargets)) continue;

    for (const edge of nodeTargets[sourceId]) {
      nodeSources[edge.target].delete(sourceId);
      if (nodeSources[edge.target].size === 0) noSources.push(edge.target);

      const nodeValue = newNodeValues[edge.target];
      switch (nodeValue.type) {
        case 'addition':
          nodeValue.sources.push(sourceValue);
          break;
        case 'average':
          if (!((edge.targetHandle as string) in nodeValue.sources))
            nodeValue.sources[edge.targetHandle as string] = {sum: 0, num: 0};
          nodeValue.sources[edge.targetHandle as string].sum += sourceValue;
          nodeValue.sources[edge.targetHandle as string].num++;
          break;
        case 'stepper':
          nodeValue.source = sourceValue;
          break;
        case 'grade':
          nodeValue.source = sourceValue;
          break;
      }
    }
  }
  return newNodeValues;
};
