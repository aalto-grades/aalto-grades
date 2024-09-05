// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Edge} from 'reactflow';

import {initNodeValues, updateNodeValue} from './graphCalculationUtil';
import type {GradingModelData} from '../types';
import type {
  FullNodeData,
  NodeValues,
  SinkNodeValue,
  TypedNode,
} from '../types/graph';

/** Calculates new values for all nodes in a graph. */
export const calculateNodeValues = (
  nodeValues: NodeValues,
  nodeData: FullNodeData,
  nodes: TypedNode[],
  edges: Edge[]
): NodeValues => {
  // Create helper dictionaries
  const nodeSources: {[key: string]: Set<string>} = {};
  const nodeTargets: {[key: string]: Edge[]} = {};
  for (const edge of edges) {
    if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
    nodeTargets[edge.source].push(edge);
    if (!(edge.target in nodeSources)) nodeSources[edge.target] = new Set();
    nodeSources[edge.target].add(edge.source);
  }

  // Reset values for everything except source nodes & populate noSources array
  const newNodeValues = structuredClone(nodeValues);
  const noSources: string[] = [];
  for (const node of nodes) {
    if (!(node.id in nodeSources)) noSources.push(node.id);

    const nodeValue = newNodeValues[node.id];
    if (nodeValue.type === 'require' || nodeValue.type === 'substitute')
      nodeValue.values = {};
    else nodeValue.value = 0;
    switch (nodeValue.type) {
      case 'source':
        break;
      case 'minpoints':
      case 'round':
      case 'sink':
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

  // Actual calculation
  let fullFail = false;
  const alreadyAdded = new Set();
  while (noSources.length > 0) {
    // We always take the next node with no other (uncovered) nodes pointing to it
    // To always first calculate node parents.
    const sourceNodeId = noSources.shift()!;

    // Update node value
    updateNodeValue(sourceNodeId, newNodeValues[sourceNodeId], nodeData);
    const sourceNodeValue = newNodeValues[sourceNodeId];

    // Check for full fail
    if ('fullFail' in sourceNodeValue && sourceNodeValue.fullFail)
      fullFail = true;

    // If the node has no targets continue
    if (!(sourceNodeId in nodeTargets)) continue;

    // Go through all targets and update their sources
    for (const edge of nodeTargets[sourceNodeId]) {
      let sourceValue: number | 'fail' = 0;

      // Handle nodes with multiple sources
      if (
        sourceNodeValue.type === 'require' ||
        sourceNodeValue.type === 'substitute'
      ) {
        const sourceHandleId = edge
          .sourceHandle!.replace('-substitute-source', '')
          .replace('-exercise-source', '')
          .replace('-source', '');
        sourceValue = sourceNodeValue.values[sourceHandleId];
      } else {
        sourceValue = sourceNodeValue.value;
      }

      // Remove parent from target and check if all parents have been covered
      nodeSources[edge.target].delete(sourceNodeId);
      if (
        nodeSources[edge.target].size === 0 &&
        !alreadyAdded.has(edge.target)
      ) {
        noSources.push(edge.target);
        alreadyAdded.add(edge.target);
      }

      // Update target node value
      const nodeValue = newNodeValues[edge.target];
      switch (nodeValue.type) {
        case 'source':
          throw new Error('Should not happen');
        case 'minpoints':
        case 'round':
        case 'sink':
        case 'stepper':
          nodeValue.source = sourceValue === 'fail' ? 0 : sourceValue;
          break;
        case 'addition':
        case 'average':
        case 'max':
          nodeValue.sources[edge.targetHandle!] = {
            value: sourceValue === 'fail' ? 0 : sourceValue,
            isConnected: true,
          };
          break;
        case 'require':
        case 'substitute':
          nodeValue.sources[edge.targetHandle!] = {
            value: sourceValue,
            isConnected: true,
          };
          break;
      }
    }
  }

  // Check for fullfail
  if (fullFail) {
    const sinkNode = nodes.find(node => nodeValues[node.id].type === 'sink');
    const nodeValue = newNodeValues[sinkNode!.id] as SinkNodeValue;
    nodeValue.value = 0;
    nodeValue.fullFail = true;
  }

  return newNodeValues;
};

// TODO: Stress test?
/** Calculate course part values for all students. */
export const batchCalculateCourseParts = (
  models: GradingModelData[],
  studentData: {
    userId: number;
    courseTasks: {id: number; grade: number}[];
  }[]
): {[key: number]: {[key: string]: number | null}} => {
  // Find course part models
  const coursePartModels = models.filter(model => model.coursePartId !== null);

  const result: {[key: number]: {[key: string]: number | null}} = {};

  for (const student of studentData) {
    result[student.userId] = {};
    let sourceValues = student.courseTasks.map(task => ({
      id: task.id,
      value: task.grade,
    }));

    const coursePartValues: {[key: string]: number} = {};
    for (const model of coursePartModels) {
      result[student.userId][model.coursePartId!] = null;
      const {nodes, edges, nodeData} = model.graphStructure;
      const [gradesFound, nodeValues] = initNodeValues(nodes, sourceValues);

      // No grades in course part.
      if (!gradesFound) continue;

      const graphValues = calculateNodeValues(
        nodeValues,
        nodeData,
        nodes,
        edges
      );
      const finalValue = (graphValues.sink as SinkNodeValue).value;
      coursePartValues[model.coursePartId!] = finalValue;
      result[student.userId][model.coursePartId!] = finalValue;
    }
    sourceValues = Object.entries(coursePartValues).map(([id, value]) => ({
      id: parseInt(id),
      value,
    }));
  }

  return result;
};

// TODO: Handle expired course parts?
// TODO: Stress test?
/** Calculate course part values and/or final grades for all students. */
export const batchCalculateFinalGrades = (
  finalModel: GradingModelData,
  models: GradingModelData[],
  studentData: {
    userId: number;
    courseTasks: {id: number; grade: number}[];
  }[]
): {
  [key: number]: {courseParts: {[key: string]: number}; finalValue: number};
} => {
  // Find course part model Ids
  const coursePartModelsIds = new Set<number>();
  for (const node of finalModel.graphStructure.nodes) {
    if (node.type !== 'source') continue;
    const partId = parseInt(node.id.split('-')[1]);
    coursePartModelsIds.add(partId);
  }

  // Find course part models
  const coursePartModels = models.filter(
    model => model.coursePartId && coursePartModelsIds.has(model.coursePartId)
  );

  const result: {
    [key: number]: {courseParts: {[key: string]: number}; finalValue: number};
  } = {};

  for (const student of studentData) {
    result[student.userId] = {courseParts: {}, finalValue: 0};
    let sourceValues = student.courseTasks.map(task => ({
      id: task.id,
      value: task.grade,
    }));

    // Calculate course parts first if necessary
    if (finalModel.coursePartId === null) {
      const coursePartValues: {[key: string]: number} = {};
      for (const model of coursePartModels) {
        const {nodes, edges, nodeData} = model.graphStructure;
        const [gradesFound, nodeValues] = initNodeValues(nodes, sourceValues);

        // No grades in course part.
        if (!gradesFound) continue;

        const graphValues = calculateNodeValues(
          nodeValues,
          nodeData,
          nodes,
          edges
        );
        const finalValue = (graphValues.sink as SinkNodeValue).value;
        coursePartValues[model.coursePartId!] = finalValue;
        result[student.userId].courseParts[model.coursePartId!] = finalValue;
      }
      sourceValues = Object.entries(coursePartValues).map(([id, value]) => ({
        id: parseInt(id),
        value,
      }));
    }

    const {nodes, edges, nodeData} = finalModel.graphStructure;
    const [_, nodeValues] = initNodeValues(nodes, sourceValues);
    const graphValues = calculateNodeValues(nodeValues, nodeData, nodes, edges);
    const finalValue = (graphValues.sink as SinkNodeValue).value;
    result[student.userId].finalValue = finalValue;
  }

  return result;
};
