// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Edge, Node} from 'reactflow';
import {
  AttainmentNodeSettings,
  AverageNodeSettings,
  CustomNodeTypes,
  FullNodeData,
  GraphStructure,
  MaxNodeSettings,
  MinPointsNodeSettings,
  NodeData,
  NodeValue,
  NodeValues,
  RequireNodeSettings,
  RoundNodeSettings,
  StepperNodeSettings,
  SubstituteNodeSettings,
} from '../types/graph';

export const initNode = (
  type: CustomNodeTypes,
  id?: string,
  edges?: Edge[]
): {
  value: NodeValue;
  data: NodeData;
} => {
  const sources: {[key: string]: {isConnected: true; value: 0}} = {};
  const values: {[key: string]: 0} = {};
  if (edges !== undefined && id !== undefined) {
    for (const edge of edges) {
      if (edge.target === id) {
        sources[edge.targetHandle as string] = {
          isConnected: true,
          value: 0,
        };
      }
      if (edge.source === id) {
        values[edge.sourceHandle as string] = 0;
      }
    }
  }
  switch (type) {
    case 'addition':
      return {
        value: {type, sources, value: 0},
        data: {title: 'Addition'},
      };
    case 'attainment':
      return {
        value: {type, source: 0, value: 0, courseFail: false},
        data: {
          title: 'Attainment',
          settings: {onFailSetting: 'coursefail', minPoints: 0},
        },
      };
    case 'average':
      return {
        value: {type, sources, value: 0},
        data: {
          title: 'Average',
          settings: {weights: {}, percentageMode: false},
        },
      };
    case 'grade':
      return {value: {type, source: 0, value: 0}, data: {title: 'Grade'}};
    case 'max':
      return {
        value: {type, sources, value: 0},
        data: {title: 'Max', settings: {minValue: 0}},
      };
    case 'minpoints':
      return {
        value: {type, source: 0, value: 0, courseFail: false},
        data: {
          title: 'Require Points',
          settings: {minPoints: 0, onFailSetting: 'coursefail'},
        },
      };
    case 'require':
      return {
        value: {type, sources, values, courseFail: false},
        data: {
          title: 'Require',
          settings: {numFail: 0, onFailSetting: 'coursefail'},
        },
      };
    case 'round':
      return {
        value: {type, source: 0, value: 0},
        data: {title: 'Round', settings: {roundingSetting: 'round-closest'}},
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
        value: {type, sources, values},
        data: {
          title: 'Substitute',
          settings: {maxSubstitutions: 0, substituteValues: []},
        },
      };
  }
};

const calculateNodeValue = (
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
    case 'attainment': {
      const settings = nodeData[nodeId].settings as AttainmentNodeSettings;
      nodeValue.value = nodeValue.source;
      nodeValue.courseFail = false;
      if (nodeValue.source < settings.minPoints) {
        switch (settings.onFailSetting) {
          case 'coursefail':
            nodeValue.courseFail = true;
            break;
          case 'fail':
            nodeValue.value = 'fail';
            break;
        }
      }
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
      nodeValue.courseFail = false;
      nodeValue.value = nodeValue.source;
      if (nodeValue.source >= settings.minPoints) break;

      if (settings.onFailSetting === 'coursefail') nodeValue.courseFail = true;
      else nodeValue.value = 'fail';
      break;
    }
    case 'require': {
      const settings = nodeData[nodeId].settings as RequireNodeSettings;
      nodeValue.courseFail = false;

      let numFail = 0;
      for (const [handleId, source] of Object.entries(nodeValue.sources)) {
        if (!source.isConnected) continue;
        nodeValue.values[handleId] = source.value === 'fail' ? 0 : source.value;
        if (source.value === 'fail') numFail++;
      }
      if (numFail <= settings.numFail) break;

      if (settings.onFailSetting === 'coursefail') {
        nodeValue.courseFail = true;
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

export const calculateNewNodeValues = (
  oldNodeValues: NodeValues,
  nodeData: FullNodeData,
  nodes: Node[],
  edges: Edge[]
): NodeValues => {
  const nodeSources: {[key: string]: Set<string>} = {};
  const nodeTargets: {[key: string]: Edge[]} = {};
  for (const edge of edges) {
    if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
    nodeTargets[edge.source].push(edge);
    if (!(edge.target in nodeSources)) nodeSources[edge.target] = new Set();
    nodeSources[edge.target].add(edge.source);
  }

  const newNodeValues = {...oldNodeValues};
  const noSources: string[] = [];
  for (const node of nodes) {
    if (!(node.id in nodeSources)) noSources.push(node.id);

    const nodeValue = newNodeValues[node.id];
    if (nodeValue.type === 'require' || nodeValue.type === 'substitute')
      nodeValue.values = {};
    else nodeValue.value = 0;
    switch (nodeValue.type) {
      case 'attainment':
        break;
      case 'grade':
      case 'minpoints':
      case 'round':
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
  const alreadyAdded = new Set();
  while (noSources.length > 0) {
    const sourceId = noSources.shift() as string;
    calculateNodeValue(sourceId, newNodeValues[sourceId], nodeData);
    const sourceNodeValue = newNodeValues[sourceId];

    if ('courseFail' in sourceNodeValue && sourceNodeValue.courseFail)
      courseFail = true;
    if (!(sourceId in nodeTargets)) continue;

    for (const edge of nodeTargets[sourceId]) {
      const sourceValue =
        (sourceNodeValue.type === 'require' ||
        sourceNodeValue.type === 'substitute'
          ? sourceNodeValue.values[
              (edge.sourceHandle as string)
                .replace('-substitute-source', '')
                .replace('-exercise-source', '')
                .replace('-source', '')
            ]
          : sourceNodeValue.value) ?? 0;

      nodeSources[edge.target].delete(sourceId);
      if (
        nodeSources[edge.target].size === 0 &&
        !alreadyAdded.has(edge.target)
      ) {
        noSources.push(edge.target);
        alreadyAdded.add(edge.target);
      }
      const nodeValue = newNodeValues[edge.target];
      switch (nodeValue.type) {
        case 'attainment':
          throw new Error('Should not happen');
        case 'minpoints':
        case 'grade':
        case 'round':
        case 'stepper':
          nodeValue.source = sourceValue === 'fail' ? 0 : sourceValue;
          break;
        case 'addition':
        case 'average':
        case 'max':
          nodeValue.sources[edge.targetHandle as string] = {
            value: sourceValue === 'fail' ? 0 : sourceValue,
            isConnected: true,
          };
          break;
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

// TODO: Also return other data to later display in grades table
export const batchCalculateGraph = (
  graphStructure: GraphStructure,
  studentData: {
    userId: number;
    attainments: {attainmentId: number; grade: number}[];
  }[]
): {[key: number]: {finalGrade: number}} => {
  const {nodes, edges, nodeData} = graphStructure;
  const nodeValues: {[key: string]: {[key: string]: NodeValue}} = {}; // {userId: {nodeId: nodeval, ...}, ...}

  const nodeSources: {[key: string]: Set<string>} = {};
  const nodeTargets: {[key: string]: Edge[]} = {};
  for (const edge of edges) {
    if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
    nodeTargets[edge.source].push(edge);
    if (!(edge.target in nodeSources)) nodeSources[edge.target] = new Set();
    nodeSources[edge.target].add(edge.source);
  }

  // Init graph values
  const noSources: string[] = [];
  for (const node of nodes) {
    if (!(node.id in nodeSources)) noSources.push(node.id);

    for (const student of studentData) {
      if (!(student.userId in nodeValues)) nodeValues[student.userId] = {};

      const nodeType = node.type as CustomNodeTypes;
      nodeValues[student.userId][node.id] = initNode(nodeType).value;
      const nodeValue = nodeValues[student.userId][node.id];
      if (nodeValue.type !== 'attainment') continue;

      // Find matching attainment from student data
      for (const attainment of student.attainments) {
        if (node.id === `attainment-${attainment.attainmentId}`)
          nodeValue.source = attainment.grade;
      }
    }
  }

  const courseFail: {[key: string]: boolean} = {};
  for (const student of studentData) courseFail[student.userId] = false;
  const alreadyAdded = new Set();

  // Calculate values for all nodes
  while (noSources.length > 0) {
    const sourceId = noSources.shift() as string;
    // Calculate node value for all students
    for (const student of studentData) {
      calculateNodeValue(
        sourceId,
        nodeValues[student.userId][sourceId],
        nodeData
      );
      const nodeValue = nodeValues[student.userId][sourceId];
      if ('courseFail' in nodeValue && nodeValue.courseFail)
        courseFail[student.userId] = true;
    }
    if (!(sourceId in nodeTargets)) continue; // Node has no targets

    // Update values for all node targets
    for (const edge of nodeTargets[sourceId]) {
      nodeSources[edge.target].delete(sourceId);
      if (
        nodeSources[edge.target].size === 0 &&
        !alreadyAdded.has(edge.target)
      ) {
        noSources.push(edge.target);
        alreadyAdded.add(edge.target);
      }

      for (const student of studentData) {
        const sourceNodeValue = nodeValues[student.userId][sourceId];
        const sourceValue =
          (sourceNodeValue.type === 'require' ||
          sourceNodeValue.type === 'substitute'
            ? sourceNodeValue.values[
                (edge.sourceHandle as string)
                  .replace('-substitute-source', '')
                  .replace('-exercise-source', '')
                  .replace('-source', '')
              ]
            : sourceNodeValue.value) ?? 0;

        const nodeValue = nodeValues[student.userId][edge.target];
        switch (nodeValue.type) {
          case 'attainment':
            throw new Error('Should not happen');
          case 'minpoints':
          case 'grade':
          case 'round':
          case 'stepper':
            nodeValue.source = sourceValue === 'fail' ? 0 : sourceValue;
            break;
          case 'addition':
          case 'average':
          case 'max':
            nodeValue.sources[edge.targetHandle as string] = {
              value: sourceValue === 'fail' ? 0 : sourceValue,
              isConnected: true,
            };
            break;
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
  }

  // Create finalGrades object and set the values for it
  const finalGrades: {[key: string]: {finalGrade: number}} = {};
  for (const student of studentData) {
    for (const node of nodes) {
      const nodeValue = nodeValues[student.userId][node.id];
      if (nodeValue.type !== 'grade') continue;

      if (courseFail[student.userId]) nodeValue.value = 0; // Failed course
      finalGrades[student.userId] = {finalGrade: nodeValue.value};
    }
  }

  return finalGrades;
};
