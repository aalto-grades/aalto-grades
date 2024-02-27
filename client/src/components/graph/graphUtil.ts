// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Edge, Node} from 'reactflow';
import {
  AverageNodeSettings,
  MaxNodeSettings,
  MinPointsNodeSettings,
  NodeValue,
  NodeValues,
  RequireNodeSettings,
  StepperNodeSettings,
  SubstituteNodeSettings,
  FullNodeData,
  DropInNodes,
  NodeData,
} from '../../context/GraphProvider';

export const initNode = (
  type: DropInNodes
): {
  value: NodeValue;
  data: NodeData;
} => {
  switch (type) {
    case 'addition':
      return {
        value: {type, sources: {}, value: 0},
        data: {title: 'Addition'},
      };
    case 'average':
      return {
        value: {type, sources: {}, value: 0},
        data: {title: 'Average', settings: {weights: {}}},
      };
    case 'max':
      return {
        value: {type, sources: {}, value: 0},
        data: {title: 'Max', settings: {minValue: 0}},
      };
    case 'minpoints':
      return {
        value: {type, source: 0, value: 0},
        data: {title: 'Require Points', settings: {minPoints: 0}},
      };
    case 'require':
      return {
        value: {type, sources: {}, values: {}, courseFail: false},
        data: {title: 'Require', settings: {numFail: 0, failSetting: 'ignore'}},
      };
    case 'stepper':
      return {
        value: {type, source: 0, value: 0},
        data: {
          title: 'Stepper',
          settings: {numSteps: 1, middlePoints: [], outputValues: [0]},
        },
      };
    case 'substitute':
      return {
        value: {type, sources: {}, values: {}},
        data: {
          title: 'Substitute',
          settings: {maxSubstitutions: 0, substituteValues: []},
        },
      };
  }
};

const setNodeValue = (
  nodeId: string,
  nodeValue: NodeValue,
  nodeData: FullNodeData
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
      const settings = nodeData[nodeId].settings as AverageNodeSettings;
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
      const settings = nodeData[nodeId].settings as MaxNodeSettings;
      let maxValue = settings.minValue;

      for (const value of Object.values(nodeValue.sources)) {
        if (value.isConnected) maxValue = Math.max(maxValue, value.value);
      }
      nodeValue.value = maxValue;
      break;
    }
    case 'minpoints': {
      const settings = nodeData[nodeId].settings as MinPointsNodeSettings;
      if (nodeValue.source < settings.minPoints) nodeValue.value = 'fail';
      else nodeValue.value = nodeValue.source;
      break;
    }
    case 'require': {
      const settings = nodeData[nodeId].settings as RequireNodeSettings;
      let numFail = 0;
      for (const [handleId, source] of Object.entries(nodeValue.sources)) {
        if (!source.isConnected) continue;
        nodeValue.values[handleId] = source.value === 'fail' ? 0 : source.value;
        if (source.value === 'fail') numFail++;
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
      const settings = nodeData[nodeId].settings as StepperNodeSettings;
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
    case 'substitute': {
      const settings = nodeData[nodeId].settings as SubstituteNodeSettings;
      let numSubstitutes = 0;
      let numToSubstitute = 0;
      for (const [key, source] of Object.entries(nodeValue.sources)) {
        if (
          key.split('-').at(-2) === 'substitute' &&
          source.isConnected &&
          source.value !== 'fail'
        )
          numSubstitutes += 1;
        else if (
          key.split('-').at(-2) === 'exercise' &&
          source.isConnected &&
          source.value === 'fail'
        )
          numToSubstitute += 1;
      }
      numSubstitutes = Math.min(numSubstitutes, settings.maxSubstitutions);
      numToSubstitute = Math.min(numToSubstitute, settings.maxSubstitutions);
      numSubstitutes = Math.min(numSubstitutes, numToSubstitute);
      numToSubstitute = Math.min(numSubstitutes, numToSubstitute);

      let exerciseIndex = -1;
      for (const [key, source] of Object.entries(nodeValue.sources)) {
        if (key.split('-').at(-2) === 'substitute') {
          if (
            source.isConnected &&
            source.value !== 'fail' &&
            numToSubstitute > 0
          ) {
            numToSubstitute -= 1;
            nodeValue.values[key] = 'fail';
          } else if (source.isConnected) {
            nodeValue.values[key] = source.value;
          }
        } else {
          exerciseIndex++;
          if (
            source.isConnected &&
            source.value === 'fail' &&
            numSubstitutes > 0
          ) {
            numSubstitutes -= 1;
            nodeValue.values[key] = settings.substituteValues[exerciseIndex];
          } else if (source.isConnected) {
            nodeValue.values[key] = source.value;
          }
        }
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
    const sourceNodeValue = newNodeValues[node.id];
    if (
      sourceNodeValue.type === 'require' ||
      sourceNodeValue.type === 'substitute'
    ) {
      for (const value of Object.values(sourceNodeValue.sources)) {
        value.value = 0;
        value.isConnected = false;
      }
    }
  }

  for (const node of nodes) {
    if (!(node.id in nodeTargets)) continue;
    for (const edge of nodeTargets[node.id]) {
      const nodeValue = newNodeValues[edge.target];
      if (nodeValue.type !== 'require' && nodeValue.type !== 'substitute')
        continue;

      nodeValue.sources[edge.targetHandle as string] = {
        value: 0,
        isConnected: true,
      };
    }
  }

  const badEdges = [];
  for (const edge of edges) {
    const sourceNodeValues = newNodeValues[edge.source];

    if (
      sourceNodeValues.type !== 'require' &&
      sourceNodeValues.type !== 'substitute'
    )
      continue;

    const sourceHandle = (edge.sourceHandle as string).replace('-source', '');
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
  nodeData: FullNodeData,
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
    if (nodeValue.type === 'require' || nodeValue.type === 'substitute')
      nodeValue.values = {};
    else if (nodeValue.type !== 'attainment') nodeValue.value = 0;
    switch (nodeValue.type) {
      case 'attainment':
        break;
      case 'grade':
      case 'minpoints':
      case 'stepper':
        nodeValue.source = 0;
        break;
      case 'addition':
      case 'average':
      case 'max':
      case 'require':
      case 'substitute':
        for (const value of Object.values(nodeValue.sources)) {
          value.value = 0;
          value.isConnected = false;
        }
        break;
    }
  }

  let courseFail = false;
  while (noSources.length > 0) {
    const sourceId = noSources.shift() as string;
    setNodeValue(sourceId, newNodeValues[sourceId], nodeData);
    const sourceNodeValue = newNodeValues[sourceId];

    if (sourceNodeValue.type === 'require' && sourceNodeValue.courseFail) {
      courseFail = true;
    }
    if (!(sourceId in nodeTargets)) continue;

    for (const edge of nodeTargets[sourceId]) {
      const sourceValue =
        sourceNodeValue.type === 'require' ||
        sourceNodeValue.type === 'substitute'
          ? sourceNodeValue.values[
              (edge.sourceHandle as string)
                .replace('-substitute-source', '')
                .replace('-exercise-source', '')
                .replace('-source', '')
            ]
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
        case 'substitute':
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
