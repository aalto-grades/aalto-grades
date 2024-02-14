// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Edge, Node} from 'reactflow';
import {
  AverageNodeSettings,
  MinPointsNodeSettings,
  NodeSettings,
  NodeValue,
  NodeValues,
  StepperNodeSettings,
} from '../../context/GraphProvider';

export type NodeTypes =
  | 'attainment'
  | 'addition'
  | 'average'
  | 'stepper'
  | 'minpoints'
  | 'grade';

export const getInitNodeValues = (nodes: Node[]) => {
  const initNodeValues: NodeValues = {};
  for (const node of nodes) {
    switch (node.type as NodeTypes) {
      case 'addition':
        initNodeValues[node.id] = {type: 'addition', sourceSum: 0, value: 0};
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
      case 'minpoints':
        initNodeValues[node.id] = {type: 'minpoints', source: 0, value: 0};
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
      nodeValue.value = nodeValue.sourceSum;
      break;
    case 'attainment':
      break; // Not needed
    case 'average': {
      const settings = nodeSettings[nodeId] as AverageNodeSettings;
      let valueSum = 0;
      let weightSum = 0;
      for (const key of Object.keys(settings.weights)) {
        if (!(key in nodeValue.sources)) continue;
        const source = nodeValue.sources[key];
        if (source.value === 'fail' || !source.isConnected) continue;
        valueSum += source.value * settings.weights[key];
        weightSum += settings.weights[key];
      }
      nodeValue.value = weightSum === 0 ? 0 : valueSum / weightSum;
      break;
    }
    case 'grade':
      nodeValue.value = nodeValue.source;
      break;
    case 'minpoints': {
      const settings = nodeSettings[nodeId] as MinPointsNodeSettings;
      if (nodeValue.source === 'fail' || nodeValue.source < settings.minPoints)
        nodeValue.value = 'fail';
      else nodeValue.value = nodeValue.source;
      break;
    }
    case 'stepper': {
      const settings = nodeSettings[nodeId] as StepperNodeSettings;
      for (let i = 0; i < settings.numSteps; i++) {
        if (
          i + 1 !== settings.numSteps &&
          nodeValue.source > settings.middlePoints[i]
        )
          continue;

        const outputValue = settings.outputValues[i];
        if (outputValue === 'same') nodeValue.value = nodeValue.source;
        else nodeValue.value = outputValue;
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
        nodeValue.sourceSum = 0;
      } else if (nodeValue.type === 'average') {
        for (const value of Object.values(nodeValue.sources)) {
          value.value = 0;
          value.isConnected = false;
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
          nodeValue.sourceSum += sourceValue === 'fail' ? 0 : sourceValue;
          break;
        case 'attainment':
          throw new Error('Should not happen');
        case 'average':
          nodeValue.sources[edge.targetHandle as string] = {
            value: sourceValue,
            isConnected: true,
          };
          break;
        case 'stepper':
          // TODO: handle error
          if (sourceValue === 'fail') throw new Error('fail passed to stepper');
          nodeValue.source = sourceValue;
          break;
        case 'minpoints':
          nodeValue.source = sourceValue;
          break;
        case 'grade':
          // TODO: handle error
          if (sourceValue === 'fail') throw new Error('fail passed to stepper');
          nodeValue.source = sourceValue;
          break;
      }
    }
  }
  return newNodeValues;
};
