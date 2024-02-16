import {Edge, Node} from 'reactflow';
import {
  AllNodeSettings,
  AverageNodeSettings,
  NodeValues,
} from '../../context/GraphProvider';
import {getInitNodeValues} from './graphUtil';

const NUM_SIMPLE_EXERCISES = 10;

export const createSimpleGraph = (
  useAverage = false
): {
  nodes: Node[];
  edges: Edge[];
  nodeSettings: AllNodeSettings;
  nodeValues: NodeValues;
} => {
  const nodes = [
    {
      id: 'stepper1',
      type: 'stepper',
      position: {x: 700, y: 400},
      data: {label: 'Stepper'},
    },
    {
      id: 'grade',
      type: 'grade',
      position: {x: 1050, y: 465},
      data: {label: 'Final grade'},
    },
  ];

  const edges: Edge[] = [
    {id: 'stepper1-grade', source: 'stepper1', target: 'grade'},
  ];

  for (let i = 0; i < NUM_SIMPLE_EXERCISES; i++) {
    nodes.push({
      id: `ex${i + 1}`,
      type: 'attainment',
      position: {x: 0, y: 15 + i * 100},
      data: {label: `Exercise ${i + 1}`},
    });
    if (useAverage) {
      edges.push({
        id: `ex${i + 1}-average1`,
        source: `ex${i + 1}`,
        target: 'average1',

        targetHandle: i.toString(),
      });
    } else {
      edges.push({
        id: `ex${i + 1}-addition1`,
        source: `ex${i + 1}`,
        target: 'addition1',
      });
    }
  }

  const nodeSettings: AllNodeSettings = {
    stepper1: useAverage
      ? {
          numSteps: 6,
          outputValues: [0, 1, 2, 3, 4, 5],
          middlePoints: [1.7, 3.3, 5, 6.7, 8.3],
        }
      : {
          numSteps: 6,
          outputValues: [0, 1, 2, 3, 4, 5],
          middlePoints: [17, 33, 50, 67, 83],
        },
    average1: {weights: {}, nextFree: 100},
  };

  if (useAverage) {
    nodes.push({
      id: 'average1',
      type: 'average',
      position: {x: 300, y: 400},
      data: {label: 'Average'},
    });
    edges.push({
      id: 'average1-stepper1',
      source: 'average1',
      target: 'stepper1',
    });
    for (let i = 0; i < NUM_SIMPLE_EXERCISES; i++) {
      const averageSettings = nodeSettings.average1 as AverageNodeSettings;
      averageSettings.weights[i.toString()] =
        Math.ceil(10 * Math.random()) / 10;
    }
  } else {
    nodes.push({
      id: 'addition1',
      type: 'addition',
      position: {x: 300, y: 400},
      data: {label: 'Addition'},
    });
    edges.push({
      id: 'addition1-stepper1',
      source: 'addition1',
      target: 'stepper1',
    });
  }

  const nodeValues = getInitNodeValues(nodes);

  return {nodes, edges, nodeSettings, nodeValues};
};
