// SPDX-FileCopyrightText: 2024 The Ossi Developers
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

export type GraphTemplate = 'none' | 'addition' | 'average' | 'max';

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
  let x = 0;
  const nodes: TypedNode[] = [
    ...sources.map(
      (source, index): TypedNode => ({
        id: `source-${source.id}`,
        type: 'source',
        position: {x, y: (97 + 50) * index},
        data: {},
      })
    ),
  ];
  x += 225 + 150;

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

  const middleNode: {
    [key: string]: {
      id: string;
      type: CustomNodeTypes;
      size: number;
      data: NodeData;
    };
  } = {
    max: {
      id: 'max',
      type: 'max',
      size: 92,
      data: {title: 'Max', settings: {minValue: 0}},
    },
    addition: {
      id: 'addition',
      type: 'addition',
      size: 88,
      data: {title: 'Addition'},
    },
    average: {
      id: 'average',
      type: 'average',
      size: 171,
      data: {
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
      },
    },
  };
  if (template === 'max' || template === 'addition' || template === 'average') {
    // Add middleNode
    nodes.push({
      id: middleNode[template].id,
      type: middleNode[template].type,
      position: {x, y: 0},
      data: {},
    });
    x += middleNode[template].size + 150;

    for (let i = 0; i < sources.length; i++) {
      const sourceNodeId = `source-${sources[i].id}`;
      edges.push(
        createEdge(sourceNodeId, middleNode[template].id, undefined, i)
      );
    }
    nodeData[middleNode[template].id] = middleNode[template].data;

    if (template === 'max' || coursePart) {
      edges.push(createEdge(middleNode[template].id, 'sink'));
    } else {
      // Add stepper node
      nodes.push({
        id: 'stepper',
        type: 'stepper',
        position: {x, y: 0},
        data: {},
      });
      x += 191 + 150;
      edges.push(createEdge(middleNode[template].id, 'stepper'));
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
  }

  nodes.push({
    id: 'sink',
    type: 'sink',
    position: {x, y: 0},
    data: {},
  });

  return {nodes, edges, nodeData};
};
