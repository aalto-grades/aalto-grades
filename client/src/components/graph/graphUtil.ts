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
  CustomNodeTypes,
  NodeValue,
  NodeValues,
  RequireNodeSettings,
  StepperNodeSettings,
} from '../../context/GraphProvider';

export const initNode = (
  type: CustomNodeTypes
): {value: NodeValue; settings?: NodeSettings} => {
  switch (type) {
    case 'addition':
      return {value: {type, sources: {}, value: 0}};
    case 'attainment':
      return {value: {type, value: Math.round(Math.random() * 10)}};
    case 'average':
      return {
        value: {type, sources: {}, value: 0},
        settings: {weights: {}},
      };
    case 'grade':
      return {value: {type, source: 0, value: 0}};
    case 'max':
      return {
        value: {type, sources: {}, value: 0},
        settings: {minValue: 0},
      };
    case 'minpoints':
      return {
        value: {type, source: 0, value: 0},
        settings: {minPoints: 0},
      };
    case 'require':
      return {
        value: {type, sources: {}, values: {}, courseFail: false},
        settings: {numFail: 0, failSetting: 'ignore'},
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
    initNodeValues[node.id] = initNode(node.type as CustomNodeTypes).value;
  }
  return initNodeValues;
};

const setNodeValue = (
  nodeId: string,
  nodeValue: NodeValue,
  nodeSettings: AllNodeSettings
): void => {
  switch (nodeValue.type) {
    case 'addition': {
      let sum = 0;
      for (const source of Object.values(nodeValue.sources))
        sum += source.value;
      nodeValue.value = sum;
      break;
    }
    case 'attainment':
      break; // Not needed
    case 'average': {
      const settings = nodeSettings[nodeId] as AverageNodeSettings;
      let valueSum = 0;
      let weightSum = 0;
      for (const key of Object.keys(settings.weights)) {
        if (!(key in nodeValue.sources)) continue;
        const source = nodeValue.sources[key];
        if (!source.isConnected) continue;
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
      let maxValue = settings.minValue;

      for (const value of Object.values(nodeValue.sources)) {
        if (value.isConnected) maxValue = Math.max(maxValue, value.value);
      }
      nodeValue.value = maxValue;
      break;
    }
    case 'minpoints': {
      const settings = nodeSettings[nodeId] as MinPointsNodeSettings;
      if (nodeValue.source < settings.minPoints) nodeValue.value = 'reqfail';
      else nodeValue.value = nodeValue.source;
      break;
    }
    case 'require': {
      const settings = nodeSettings[nodeId] as RequireNodeSettings;
      let numFail = 0;
      for (const [handleId, source] of Object.entries(nodeValue.sources)) {
        if (!source.isConnected) continue;
        nodeValue.values[handleId] =
          source.value === 'reqfail' ? 0 : source.value;
        if (source.value === 'reqfail') numFail++;
      }
      nodeValue.courseFail = false;
      if (numFail > settings.numFail && settings.failSetting === 'coursefail') {
        nodeValue.courseFail = true;
      } else if (numFail > settings.numFail) {
        for (const [handleId, source] of Object.entries(nodeValue.sources)) {
          if (!source.isConnected) continue;
          nodeValue.values[handleId] = 0;
        }
      }
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

export const findDisconnectedEdges = (
  oldNodeValues: NodeValues,
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
  for (const node of nodes) {
    const nodeValue = newNodeValues[node.id];
    switch (nodeValue.type) {
      case 'attainment':
      case 'grade':
      case 'stepper':
      case 'minpoints':
        break; // ignore
      case 'addition':
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

  for (const node of nodes) {
    if (!(node.id in nodeTargets)) continue;
    for (const edge of nodeTargets[node.id]) {
      const nodeValue = newNodeValues[edge.target];
      switch (nodeValue.type) {
        case 'attainment':
        case 'minpoints':
        case 'grade':
        case 'stepper':
          break; // Ignore
        case 'addition':
        case 'average':
        case 'max':
        case 'require':
          nodeValue.sources[edge.targetHandle as string] = {
            value: 0,
            isConnected: true,
          };
          break;
      }
    }
  }

  const badEdges = [];
  for (const edge of edges) {
    const sourceNodeValues = newNodeValues[edge.source];
    if (sourceNodeValues.type !== 'require') continue;
    const sourceHandle = edge.sourceHandle as string;
    if (
      !(sourceHandle in sourceNodeValues.sources) ||
      !sourceNodeValues.sources[sourceHandle].isConnected
    ) {
      badEdges.push(edge);
    }
  }
  return badEdges;
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

  let courseFail = false;
  while (noSources.length > 0) {
    const sourceId = noSources.pop() as string;
    setNodeValue(sourceId, newNodeValues[sourceId], nodeSettings);
    const sourceNodeValue = newNodeValues[sourceId];

    if (
      (sourceNodeValue.type === 'require' && sourceNodeValue.courseFail) ||
      courseFail
    ) {
      courseFail = true;
    }
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
        case 'grade':
        case 'stepper':
          nodeValue.source = sourceValue as number;
          break;
        case 'addition':
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
  if (courseFail) {
    for (const node of nodes) {
      const nodeValue = newNodeValues[node.id];
      if (nodeValue.type === 'grade') nodeValue.value = 0;
    }
  }

  return newNodeValues;
};
