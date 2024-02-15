// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Edge, Node} from 'reactflow';
import {
  AllNodeSettings,
  AverageNodeSettings,
  MaxNodeSettings,
  MinPointsNodeSettings,
  NodeValue,
  NodeValues,
  StepperNodeSettings,
} from '../../context/GraphProvider';

export type NodeTypes =
  | 'attainment'
  | 'addition'
  | 'average'
  | 'stepper'
  | 'max'
  | 'minpoints'
  | 'grade';

export const getInitNodeValues = (nodes: Node[]) => {
  const initNodeValues: NodeValues = {};
  for (const node of nodes) {
    const type = node.type as NodeTypes;
    switch (type) {
      case 'grade':
      case 'minpoints':
      case 'stepper':
        initNodeValues[node.id] = {type, source: 0, value: 0};
        break;
      case 'addition':
        initNodeValues[node.id] = {type: 'addition', sourceSum: 0, value: 0};
        break;
      case 'average':
      case 'max':
        initNodeValues[node.id] = {type, sources: {}, value: 0};
        break;
      case 'attainment':
        initNodeValues[node.id] = {
          type: 'attainment',
          value: Math.round(Math.random() * 10),
        };
        break;
    }
  }
  return initNodeValues;
};

const setNodeValue = (
  nodeId: string,
  nodeValue: NodeValue,
  nodeSettings: AllNodeSettings
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
    case 'max': {
      const settings = nodeSettings[nodeId] as MaxNodeSettings;
      let maxValue = settings.minValue === 'fail' ? -1 : settings.minValue;

      for (const value of Object.values(nodeValue.sources)) {
        if (value.isConnected && value.value !== 'fail')
          maxValue = Math.max(maxValue, value.value);
      }
      nodeValue.value = maxValue === -1 ? 'fail' : maxValue;
      break;
    }
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
  nodeSettings: AllNodeSettings,
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
    if (nodeValue.type !== 'attainment') nodeValue.value = 0;
    switch (nodeValue.type) {
      case 'attainment':
        break;
      case 'grade':
      case 'stepper':
      case 'minpoints':
        nodeValue.source = 0;
        break;
      case 'addition':
        nodeValue.sourceSum = 0;
        break;
      case 'average':
      case 'max':
        for (const value of Object.values(nodeValue.sources)) {
          value.value = 0;
          value.isConnected = false;
        }
        break;
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
        case 'attainment':
          throw new Error('Should not happen');
        case 'minpoints':
          nodeValue.source = sourceValue;
          break;
        case 'grade':
        case 'stepper':
          // TODO: handle error
          if (sourceValue === 'fail') throw new Error('fail passed to stepper');
          nodeValue.source = sourceValue;
          break;
        case 'addition':
          nodeValue.sourceSum += sourceValue === 'fail' ? 0 : sourceValue;
          break;
        case 'average':
        case 'max':
          nodeValue.sources[edge.targetHandle as string] = {
            value: sourceValue,
            isConnected: true,
          };
          break;
      }
    }
  }
  return newNodeValues;
};
