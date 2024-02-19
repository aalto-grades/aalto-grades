// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Edge, Node} from 'reactflow';
import {
  AllNodeSettings,
  AverageNodeSettings,
  MaxNodeSettings,
  MinPointsNodeSettings,
  NodeSettings,
  NodeTypes,
  NodeValue,
  NodeValues,
  StepperNodeSettings,
} from '../../context/GraphProvider';

export const initNode = (
  type: NodeTypes
): {value: NodeValue; settings?: NodeSettings} => {
  switch (type) {
    case 'addition':
      return {value: {type, sourceSum: 0, value: 0}};
    case 'attainment':
      return {value: {type, value: Math.round(Math.random() * 10)}};
    case 'average':
      return {
        value: {type, sources: {}, value: 0},
        settings: {weights: {}, nextFree: 100},
      };
    case 'grade':
      return {value: {type, source: 0, value: 0}};
    case 'max':
      return {
        value: {type, sources: {}, value: 0},
        settings: {minValue: 'fail'},
      };
    case 'minpoints':
      return {value: {type, source: 0, value: 0}, settings: {minPoints: 0}};
    case 'require':
      return {
        value: {type, sources: {}, values: {}},
        settings: {numMissing: 0},
      };
    case 'stepper':
      return {
        value: {type, source: 0, value: 0},
        settings: {
          numSteps: 1,
          middlePoints: [],
          outputValues: [0],
        },
      };
  }
};
export const getInitNodeValues = (nodes: Node[]) => {
  const initNodeValues: NodeValues = {};
  for (const node of nodes) {
    initNodeValues[node.id] = initNode(node.type as NodeTypes).value;
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
    case 'require':
      // TODO: Stop if too many fails
      for (const [nodeId, source] of Object.entries(nodeValue.sources)) {
        if (source.isConnected) nodeValue.values[nodeId] = source.value;
      }
      break;
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
    if (nodeValue.type === 'require') nodeValue.values = {};
    else if (nodeValue.type !== 'attainment') nodeValue.value = 0;
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
      case 'require':
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
    const sourceNodeValue = newNodeValues[sourceId];

    if (!(sourceId in nodeTargets)) continue;

    for (const edge of nodeTargets[sourceId]) {
      const sourceValue =
        sourceNodeValue.type === 'require'
          ? sourceNodeValue.values[edge.sourceHandle as string]
          : sourceNodeValue.value;

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
          // if (sourceValuee === 'fail')
          //   throw new Error('fail passed to stepper');
          // nodeValue.source = sourceValuee;
          nodeValue.source = sourceValue === 'fail' ? 0 : sourceValue;
          break;
        case 'addition':
          nodeValue.sourceSum += sourceValue === 'fail' ? 0 : sourceValue;
          break;
        case 'average':
        case 'max':
        case 'require':
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
