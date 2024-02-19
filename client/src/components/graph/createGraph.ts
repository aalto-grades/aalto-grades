import {Edge, Node} from 'reactflow';
import {
  AllNodeSettings,
  AverageNodeSettings,
  NodeTypes,
  NodeValues,
} from '../../context/GraphProvider';
import {getInitNodeValues} from './graphUtil';

const sortNodes = (node1: Node, node2: Node): number => {
  if (node1.position.x < node2.position.x) return -1;
  else if (node1.position.x > node2.position.x) return 1;
  else if (node1.position.y < node2.position.y) return -1;
  else if (node1.position.y > node2.position.y) return 1;
  return 0;
};
const createNode = (
  type: NodeTypes,
  label: string,
  x: number,
  y: number
): Node => ({
  id: label.toLowerCase().replaceAll(' ', '-'),
  type,
  position: {x, y},
  data: {label},
});

const createEdge = (
  sourceLabel: string,
  targetLabel: string,
  sourceHandle?: string,
  targetHandle?: string
): Edge => {
  const source = sourceLabel.toLowerCase().replaceAll(' ', '-');
  const target = targetLabel.toLowerCase().replaceAll(' ', '-');
  return {
    id: `${source}-${target}`,
    source,
    target,
    sourceHandle,
    targetHandle,
  };
};

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
    createNode('stepper', 'Stepper', 700, 400),
    createNode('grade', 'Final Grade', 1050, 465),
  ];

  const edges: Edge[] = [createEdge('Stepper', 'Final Grade')];

  for (let i = 0; i < NUM_SIMPLE_EXERCISES; i++) {
    nodes.push(createNode('attainment', `Exercise ${i + 1}`, 0, 15 + i * 100));
    edges.push(
      createEdge(
        `Exercise ${i + 1}`,
        useAverage ? 'Average' : 'Addition',
        undefined,
        i.toString()
      )
    );
  }

  const nodeSettings: AllNodeSettings = {
    stepper: useAverage
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
    average: {weights: {}},
  };

  if (useAverage) {
    nodes.push(createNode('average', 'Average', 300, 400));
    edges.push(createEdge('Average', 'Stepper'));
    for (let i = 0; i < NUM_SIMPLE_EXERCISES; i++) {
      const averageSettings = nodeSettings.average as AverageNodeSettings;
      averageSettings.weights[i.toString()] =
        Math.ceil(10 * Math.random()) / 10;
    }
  } else {
    nodes.push(createNode('addition', 'Addition', 300, 400));
    edges.push(createEdge('Addition', 'Stepper'));
  }

  const nodeValues = getInitNodeValues(nodes);

  return {nodes: nodes.toSorted(sortNodes), edges, nodeSettings, nodeValues};
};

export const createO1 = (): {
  nodes: Node[];
  edges: Edge[];
  nodeSettings: AllNodeSettings;
  nodeValues: NodeValues;
} => {
  const nodes = [
    createNode('attainment', 'Tier A', 0, 0),
    createNode('attainment', 'Tier B', 0, 100),
    createNode('attainment', 'Tier C', 0, 200),
    createNode('addition', 'Sum ABC', 100, 0),
    createNode('addition', 'Sum BC', 100, 100),
    createNode('addition', 'Sum C', 100, 200),
    createNode('max', 'Best Grade', 500, 0),
    createNode('grade', 'Final Grade', 600, 0),
  ];
  const edges: Edge[] = [
    createEdge('Tier A', 'Sum ABC', undefined, '0'),
    createEdge('Tier B', 'Sum ABC', undefined, '1'),
    createEdge('Tier C', 'Sum ABC', undefined, '2'),
    createEdge('Tier B', 'Sum BC', undefined, '0'),
    createEdge('Tier C', 'Sum BC', undefined, '1'),
    createEdge('Tier C', 'Sum C', undefined, '0'),
    createEdge('Best Grade', 'Final Grade'),
  ];
  const nodeSettings: AllNodeSettings = {'best-grade': {minValue: 'fail'}};

  const courseGrades = [
    [2000, 0, 0],
    [2100, 450, 0],
    [2100, 800, 0],
    [2100, 800, 450],
    [2100, 800, 625],
  ];
  for (let i = 0; i < courseGrades.length; i++) {
    const [a, b, c] = courseGrades[i];
    nodes.push(createNode('minpoints', `A Min Grade ${i + 1}`, 200, i * 300));
    nodes.push(
      createNode('minpoints', `B Min Grade ${i + 1}`, 200, i * 300 + 100)
    );
    nodes.push(
      createNode('minpoints', `C Min Grade ${i + 1}`, 200, i * 300 + 200)
    );
    edges.push(createEdge('Sum ABC', `A Min Grade ${i + 1}`));
    edges.push(createEdge('Sum BC', `B Min Grade ${i + 1}`));
    edges.push(createEdge('Sum C', `C Min Grade ${i + 1}`));
    nodeSettings[`a-min-grade-${i + 1}`] = {minPoints: a + b + c};
    nodeSettings[`b-min-grade-${i + 1}`] = {minPoints: b + c};
    nodeSettings[`c-min-grade-${i + 1}`] = {minPoints: c};

    nodes.push(
      createNode('require', `Require All 3 Grade ${i + 1}`, 300, i * 100)
    );
    edges.push(
      createEdge(
        `A Min Grade ${i + 1}`,
        `Require All 3 Grade ${i + 1}`,
        undefined,
        '0'
      )
    );
    edges.push(
      createEdge(
        `B Min Grade ${i + 1}`,
        `Require All 3 Grade ${i + 1}`,
        undefined,
        '1'
      )
    );
    edges.push(
      createEdge(
        `C Min Grade ${i + 1}`,
        `Require All 3 Grade ${i + 1}`,
        undefined,
        '2'
      )
    );
    nodeSettings[`require-all-3-grade-${i + 1}`] = {numMissing: 0};

    nodes.push(
      createNode('stepper', `Convert To Grade ${i + 1}`, 400, i * 100)
    );
    edges.push(
      createEdge(
        `Require All 3 Grade ${i + 1}`,
        `Convert To Grade ${i + 1}`,
        '0'
      )
    );
    nodeSettings[`convert-to-grade-${i + 1}`] = {
      numSteps: 2,
      middlePoints: [0],
      outputValues: [0, i + 1],
    };

    edges.push(
      createEdge(
        `Convert To Grade ${i + 1}`,
        'Best Grade',
        undefined,
        i.toString()
      )
    );
  }

  const nodeValues = getInitNodeValues(nodes);
  return {nodes: nodes.toSorted(sortNodes), edges, nodeSettings, nodeValues};
};

export const createY1 = (): {
  nodes: Node[];
  edges: Edge[];
  nodeSettings: AllNodeSettings;
  nodeValues: NodeValues;
} => {
  const nodes = [
    createNode('attainment', 'Bonus Round', 0, 0),
    createNode('require', 'Can fail 3', 100, 0),
  ];

  const edges: Edge[] = [];

  for (let i = 0; i < 8; i++) {
    nodes.push(createNode('attainment', `Round ${i + 1}`, 0, (i + 1) * 100));
    edges.push(
      createEdge(`Round ${i + 1}`, 'can-fail-3', undefined, i.toString())
    );
  }

  const nodeSettings: AllNodeSettings = {'can-fail-3': {numMissing: 3}};
  const nodeValues = getInitNodeValues(nodes);

  return {nodes: nodes.toSorted(sortNodes), edges, nodeSettings, nodeValues};
};
