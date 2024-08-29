// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {initNode} from './initGraph';
import type {
  AverageNodeSettings,
  FullNodeData,
  GraphSourceValue,
  MaxNodeSettings,
  MinPointsNodeSettings,
  NodeValue,
  NodeValues,
  RequireNodeSettings,
  RoundNodeSettings,
  SourceNodeSettings,
  StepperNodeSettings,
  SubstituteNodeSettings,
  TypedNode,
} from '../types/graph';

/** Create initial nodeValues for a set of source values */
export const initNodeValues = (
  nodes: TypedNode[],
  sourceValues: GraphSourceValue[]
): [boolean, NodeValues] => {
  const nodeValues: NodeValues = {};
  let valuesFound = false;

  for (const node of nodes) {
    const nodeType = node.type!;
    nodeValues[node.id] = initNode(nodeType).value;
    const nodeValue = nodeValues[node.id];
    if (nodeValue.type !== 'source') continue;

    // Find matching course part from student data
    const sourceValue = sourceValues.find(
      source => node.id === `source-${source.id}`
    );
    if (sourceValue !== undefined) {
      valuesFound = true;
      nodeValue.source = sourceValue.value;
    }
    // for (const source of sourceValues) {
    //   if (node.id === `source-${source.id}`) nodeValue.source = source.value;
    // }
  }

  return [valuesFound, nodeValues];
};

/**
 * Calculates a new value for the node and sets it to the nodeValue parameter by
 * mutating it.
 */
export const updateNodeValue = (
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
    case 'require': {
      const settings = nodeData[nodeId].settings as RequireNodeSettings;
      nodeValue.fullFail = false;

      let numFail = 0;
      for (const [handleId, source] of Object.entries(nodeValue.sources)) {
        if (!source.isConnected) continue;
        nodeValue.values[handleId] = source.value === 'fail' ? 0 : source.value;
        if (source.value === 'fail') numFail++;
      }
      if (numFail <= settings.numFail) break;

      if (settings.onFailSetting === 'fullfail') {
        nodeValue.fullFail = true;
      } else {
        for (const [handleId, source] of Object.entries(nodeValue.sources)) {
          if (!source.isConnected) continue;
          nodeValue.values[handleId] = 'fail';
        }
      }
      break;
    }
    case 'round': {
      const settings = nodeData[nodeId].settings as RoundNodeSettings;
      switch (settings.roundingSetting) {
        case 'round-up':
          nodeValue.value = Math.ceil(nodeValue.source);
          break;
        case 'round-closest':
          nodeValue.value = Math.round(nodeValue.source);
          break;
        case 'round-down':
          nodeValue.value = Math.floor(nodeValue.source);
          break;
      }
      break;
    }
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
      nodeValue.fullFail = false;
      nodeValue.value = nodeValue.source;
      if (nodeValue.source >= settings.minPoints) break;

      if (settings.onFailSetting === 'fullfail') nodeValue.fullFail = true;
      else nodeValue.value = 'fail';
      break;
    }
    case 'sink':
      nodeValue.value = nodeValue.source;
      nodeValue.fullFail = false;
      break;
    case 'source': {
      const settings = nodeData[nodeId].settings as SourceNodeSettings;
      nodeValue.value = nodeValue.source;
      nodeValue.fullFail = false;
      if (
        settings.minPoints !== null &&
        nodeValue.source < settings.minPoints
      ) {
        switch (settings.onFailSetting) {
          case 'fullfail':
            nodeValue.fullFail = true;
            break;
          case 'fail':
            nodeValue.value = 'fail';
            break;
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
        nodeValue.value =
          outputValue === 'same' ? nodeValue.source : outputValue;
        break;
      }
      break;
    }
    case 'substitute': {
      const settings = nodeData[nodeId].settings as SubstituteNodeSettings;
      const getKeyType = (key: string): 'substitute' | 'exercise' =>
        key.split('-')[key.split('-').length - 2] as 'substitute' | 'exercise';
      let substitutesToUse = 0;
      let valuesToSubstitute = 0;

      for (const [key, source] of Object.entries(nodeValue.sources)) {
        if (
          getKeyType(key) === 'substitute' &&
          source.isConnected &&
          source.value !== 'fail'
        )
          substitutesToUse += 1;
        else if (
          getKeyType(key) === 'exercise' &&
          source.isConnected &&
          source.value === 'fail'
        )
          valuesToSubstitute += 1;
      }
      const totalSubstitutions = Math.min(
        substitutesToUse,
        valuesToSubstitute,
        settings.maxSubstitutions
      );
      substitutesToUse = totalSubstitutions;
      valuesToSubstitute = totalSubstitutions;

      let exerciseIndex = -1;
      for (const [key, source] of Object.entries(nodeValue.sources)) {
        if (getKeyType(key) === 'substitute') {
          if (
            source.isConnected &&
            source.value !== 'fail' &&
            substitutesToUse > 0
          ) {
            substitutesToUse -= 1;
            nodeValue.values[key] = 'fail';
          } else if (source.isConnected) {
            nodeValue.values[key] = source.value;
          }
        } else {
          exerciseIndex++;
          if (
            source.isConnected &&
            source.value === 'fail' &&
            valuesToSubstitute > 0
          ) {
            valuesToSubstitute -= 1;
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
