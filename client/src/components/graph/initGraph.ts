import {AttainmentData} from '@common/types';
import {FullNodeData, GraphStructure, NodeData} from '@common/types/graph';
import {Edge, Node} from 'reactflow';

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
  attainments: AttainmentData[]
): GraphStructure => {
  const nodes: Node[] = [
    {
      id: 'final-grade',
      type: 'grade',
      position: {x: 1116, y: 0},
      data: {},
    },
    ...attainments.map((attainment, index) => ({
      id: `attainment-${attainment.id}`,
      type: 'attainment',

      position: {x: 12, y: 173 * index},
      data: {},
    })),
  ];
  const edges: Edge[] = [];
  const nodeData: FullNodeData = {
    'final-grade': {title: 'Final Grade'},
    ...attainments.reduce((map: {[key: string]: NodeData}, attainment) => {
      map[`attainment-${attainment.id}`] = {
        title: attainment.name,
        settings: {onFailSetting: 'coursefail', minPoints: 0},
      };
      return map;
    }, {}),
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
    for (let i = 0; i < attainments.length; i++) {
      const attainmentNodeId = `attainment-${attainments[i].id}`;
      edges.push(createEdge(attainmentNodeId, middleNodeId, undefined, i));
    }
    nodeData[middleNodeId] =
      template === 'addition'
        ? {title: 'Addition'}
        : {
            title: 'Average',
            settings: {
              weights: Object.fromEntries(
                attainments.map((_, i) => [
                  `average-${i}`,
                  Math.round((1 / attainments.length) * 100) / 100,
                ])
              ),
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
    nodeData['stepper'] = {
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
                  Math.round((((i + 1) * 10 * attainments.length) / 6) * 10) /
                  10
              ),
      },
    };

    edges.push(createEdge('stepper', 'final-grade'));
  }

  return {nodes, edges, nodeData};
};
