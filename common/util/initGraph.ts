// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Edge, Node} from 'reactflow';

import type {
  CoursePartData,
  CustomNodeTypes,
  FullNodeData,
  GraphStructure,
} from '../types';

export type GraphTemplate = 'none' | 'addition' | 'average';

const createEdge = (
  source: string,
  target: string,
  sourceHandle?: string | number,
  targetHandle?: string | number
): Edge => ({
  id: `${source}:${sourceHandle ?? ''}-${target}:${targetHandle ?? ''}`,
  source,
  target,
  sourceHandle:
    sourceHandle !== undefined
      ? `${source}-${sourceHandle}-source`
      : `${source}-source`,
  targetHandle:
    targetHandle !== undefined ? `${target}-${targetHandle}` : target,
});

export const initGraph = (
  template: GraphTemplate,
  courseParts: CoursePartData[]
): GraphStructure => {
  const nodes: Node<object, CustomNodeTypes>[] = [
    {
      id: 'final-grade',
      type: 'sink',
      position: {x: 1116, y: 0},
      data: {},
    },
    ...courseParts.map(
      (coursePart, index): Node<object, CustomNodeTypes> => ({
        id: `source-${coursePart.id}`,
        type: 'source',
        position: {x: 12, y: 173 * index},
        data: {},
      })
    ),
  ];
  const edges: Edge[] = [];
  const nodeData: FullNodeData = {
    'final-grade': {title: 'Final grade'},
    ...Object.fromEntries(
      courseParts.map(coursePart => [
        `source-${coursePart.id}`,
        {
          title: coursePart.name,
          settings: {onFailSetting: 'fullfail', minPoints: null},
        },
      ])
    ),
  };

  if (template === 'addition' || template === 'average') {
    const middleNodeId = template === 'addition' ? 'addition' : 'average';
    const middleNodeType = template === 'addition' ? 'addition' : 'average';

    // Add addition/average node
    nodes.push({
      id: middleNodeId,
      type: middleNodeType,
      position: {x: 437, y: 0},
      data: {},
    });
    for (let i = 0; i < courseParts.length; i++) {
      const coursePartNodeId = `source-${courseParts[i].id}`;
      edges.push(createEdge(coursePartNodeId, middleNodeId, undefined, i));
    }
    nodeData[middleNodeId] =
      template === 'addition'
        ? {title: 'Addition'}
        : {
            title: 'Average',
            settings: {
              weights: Object.fromEntries(
                courseParts.map((_, i) => [
                  `average-${i}`,
                  Math.round((100 / courseParts.length) * 10) / 10,
                ])
              ),
              percentageMode: true,
            },
          };

    // Add stepper node
    nodes.push({
      id: 'stepper',
      type: 'stepper',
      position: {x: 725, y: 0},
      data: {},
    });
    edges.push(createEdge(middleNodeId, 'stepper'));
    nodeData.stepper = {
      title: 'Convert to grade',
      settings: {
        numSteps: 6,
        outputValues: [0, 1, 2, 3, 4, 5],
        middlePoints:
          template === 'average'
            ? [1.7, 3.3, 5, 6.7, 8.3]
            : Array.from(
                {length: 5},
                (_, i) =>
                  Math.round((((i + 1) * 10 * courseParts.length) / 6) * 10) /
                  10
              ),
      },
    };

    edges.push(createEdge('stepper', 'final-grade'));
  }

  return {nodes, edges, nodeData};
};
