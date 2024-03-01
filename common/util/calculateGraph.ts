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
  GraphStructure,
} from '../types/graph';

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
      const getKeyType = (key: string): 'substitute' | 'exercise' =>
        key.split('-')[key.split('-').length - 2] as 'substitute' | 'exercise';
      let numSubstitutes = 0;
      let numToSubstitute = 0;

      for (const [key, source] of Object.entries(nodeValue.sources)) {
        if (
          getKeyType(key) === 'substitute' &&
          source.isConnected &&
          source.value !== 'fail'
        )
          numSubstitutes += 1;
        else if (
          getKeyType(key) === 'exercise' &&
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
        if (getKeyType(key) === 'substitute') {
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
  const noSources: string[] = [];
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
    calculateNodeValue(sourceId, newNodeValues[sourceId], nodeData);
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

export const batchCalculateGraph = (
  graphStructure: GraphStructure,
  studentData: {[key: string]: {[key: string]: number}} // {studentNum: {attId1: num, attId2: num, ...}, ...}
) => {
  const {nodes, edges, nodeData} = graphStructure;
  const nodeValues: {[key: string]: {[key: string]: NodeValue}} = {};

  const nodeSources: {[key: string]: Set<string>} = {};
  const nodeTargets: {[key: string]: Edge[]} = {};
  for (const edge of edges) {
    if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
    nodeTargets[edge.source].push(edge);
    if (!(edge.target in nodeSources)) nodeSources[edge.target] = new Set();
    nodeSources[edge.target].add(edge.source);
  }

  const noSources: string[] = [];
  for (const node of nodes) {
    if (!(node.id in nodeSources)) noSources.push(node.id);

    for (const [student, attainmentVals] of Object.entries(studentData)) {
      const nodeValue = nodeValues[student][node.id];
      if (nodeValue.type === 'require' || nodeValue.type === 'substitute')
        nodeValue.values = {};
      else if (nodeValue.type !== 'attainment') nodeValue.value = 0;
      switch (nodeValue.type) {
        case 'attainment':
          nodeValue.value = attainmentVals[node.id];
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
  }

  const courseFail: {[key: string]: boolean} = {};
  for (const student of Object.keys(studentData)) courseFail[student] = false;

  while (noSources.length > 0) {
    const sourceId = noSources.shift() as string;
    for (const student of Object.keys(studentData)) {
      calculateNodeValue(sourceId, nodeValues[student][sourceId], nodeData);
      const sourceNodeValue = nodeValues[student][sourceId];

      if (sourceNodeValue.type === 'require' && sourceNodeValue.courseFail) {
        courseFail[student] = true;
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

        const nodeValue = nodeValues[student][edge.target];
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
  }
  for (const student of Object.keys(studentData)) {
    if (courseFail[student]) {
      for (const node of nodes) {
        const nodeValue = nodeValues[student][node.id];
        if (nodeValue.type === 'grade') nodeValue.value = 0;
      }
    }
  }

  return nodeValues;
};
