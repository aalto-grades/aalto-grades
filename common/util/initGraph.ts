// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Edge} from 'reactflow';

import type {
  CoursePartData,
  CourseTaskData,
  CustomNodeTypes,
  FullNodeData,
  GraphStructure,
  NodeData,
  NodeValue,
  TypedNode,
} from '../types';

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
        sources[edge.targetHandle!] = {
          isConnected: true,
          value: 0,
        };
      }
      if (edge.source === id) {
        values[edge.sourceHandle!] = 0;
      }
    }
  }
  switch (type) {
    case 'addition':
      return {
        value: {type, sources, value: 0},
        data: {title: 'Addition'},
      };
    case 'average':
      return {
        value: {type, sources, value: 0},
        data: {
          title: 'Average',
          settings: {weights: {}, percentageMode: false},
        },
      };
    case 'max':
      return {
        value: {type, sources, value: 0},
        data: {title: 'Max', settings: {minValue: 0}},
      };
    case 'minpoints':
      return {
        value: {type, source: 0, value: 0, fullFail: false},
        data: {
          title: 'Require points',
          settings: {minPoints: 0, onFailSetting: 'fullfail'},
        },
      };
    case 'require':
      return {
        value: {type, sources, values, fullFail: false},
        data: {
          title: 'Require',
          settings: {numFail: 0, onFailSetting: 'fullfail'},
        },
      };
    case 'round':
      return {
        value: {type, source: 0, value: 0},
        data: {title: 'Round', settings: {roundingSetting: 'round-closest'}},
      };
    case 'sink':
      return {
        value: {type, source: 0, value: 0, fullFail: false},
        data: {title: 'unused'}, // This .data should never be used
      };
    case 'source':
      return {
        value: {type, source: 0, value: 0, fullFail: false},
        data: {
          title: 'unused', // This .data should never be used
          settings: {onFailSetting: 'fullfail', minPoints: 0},
        },
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
  sources: CoursePartData[] | CourseTaskData[],
  coursePart: CoursePartData | null = null
): GraphStructure => {
  const nodes: TypedNode[] = [
    {
      id: 'sink',
      type: 'sink',
      position: {x: 1116, y: 0},
      data: {},
    },
    ...sources.map(
      (source, index): TypedNode => ({
        id: `source-${source.id}`,
        type: 'source',
        position: {x: 12, y: 173 * index},
        data: {},
      })
    ),
  ];
  const edges: Edge[] = [];
  const nodeData: FullNodeData = {
    sink: {
      title: coursePart !== null ? coursePart.name : 'Final grade',
    },
    ...Object.fromEntries(
      sources.map(source => [
        `source-${source.id}`,
        {
          title: source.name,
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
    for (let i = 0; i < sources.length; i++) {
      const sourceNodeId = `source-${sources[i].id}`;
      edges.push(createEdge(sourceNodeId, middleNodeId, undefined, i));
    }
    nodeData[middleNodeId] =
      template === 'addition'
        ? {title: 'Addition'}
        : {
            title: 'Average',
            settings: {
              weights: Object.fromEntries(
                sources.map((_, i) => [
                  `average-${i}`,
                  Math.round((100 / sources.length) * 10) / 10,
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
                  Math.round((((i + 1) * 10 * sources.length) / 6) * 10) / 10
              ),
      },
    };

    edges.push(createEdge('stepper', 'sink'));
  }

  return {nodes, edges, nodeData};
};
