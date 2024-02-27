// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Edge, Node} from 'reactflow';
import {
  AttainmentNodeValues,
  AverageNodeSettings,
  CustomNodeTypes,
  FullNodeData,
  NodeSettings,
  NodeValues,
} from '../../context/GraphProvider';

export const getInitNodeValues = (nodes: Node[], edges: Edge[]) => {
  const nodeSources: {[key: string]: Edge[]} = {};
  const nodeTargets: {[key: string]: Edge[]} = {};
  for (const edge of edges) {
    if (!(edge.target in nodeSources)) nodeSources[edge.target] = [];
    if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
    nodeSources[edge.target].push(edge);
    nodeTargets[edge.source].push(edge);
  }

  const nodeValues: NodeValues = {};
  for (const node of nodes) {
    const nodeValueSources: {
      [key: string]: {isConnected: boolean; value: number};
    } = {};
    const nodeTargetValues: {
      [key: string]: number;
    } = {};
    if (node.id in nodeSources) {
      for (const edge of nodeSources[node.id]) {
        nodeValueSources[edge.targetHandle as string] = {
          isConnected: true,
          value: 0,
        };
      }
    }
    if (node.id in nodeTargets) {
      for (const edge of nodeTargets[node.id])
        nodeTargetValues[edge.sourceHandle as string] = 0;
    }

    const type = node.type as CustomNodeTypes;
    switch (type) {
      case 'attainment':
        nodeValues[node.id] = {
          type,
          value: Math.floor(Math.random() * 10),
        };
        break;
      case 'grade':
      case 'stepper':
      case 'minpoints':
        nodeValues[node.id] = {type, source: 0, value: 0};
        break;
      case 'addition':
      case 'average':
      case 'max':
        nodeValues[node.id] = {
          type,
          sources: nodeValueSources,
          value: 0,
        };
        break;
      case 'require':
      case 'substitute':
        nodeValues[node.id] = {
          type,
          sources: nodeValueSources,
          values: nodeTargetValues,
          courseFail: false,
        };
        break;
    }
  }
  return nodeValues;
};

const createNode = (type: CustomNodeTypes, label: string): Node => ({
  id: label.toLowerCase().replaceAll(' ', '-'),
  type,
  position: {x: 0, y: 0},
  data: {label},
});

const createEdge = (
  sourceLabel: string,
  targetLabel: string,
  sourceHandle?: string | number,
  targetHandle?: string | number
): Edge => {
  const source = sourceLabel.toLowerCase().replaceAll(' ', '-');
  const target = targetLabel.toLowerCase().replaceAll(' ', '-');
  return {
    id: `${source}:${sourceHandle ?? ''}-${target}:${targetHandle ?? ''}`,
    source,
    target,
    sourceHandle:
      sourceHandle !== undefined
        ? `${source}-${sourceHandle}-source`
        : `${source}-source`,
    targetHandle:
      targetHandle !== undefined ? `${target}-${targetHandle}` : target,
  };
};

const getNodeData = (
  nodes: Node[],
  settings: {[key: string]: NodeSettings}
): FullNodeData => {
  const nodeData: FullNodeData = {};
  for (const node of nodes) {
    nodeData[node.id] = {title: node.data.label, settings: settings[node.id]};
  }
  return nodeData;
};

const NUM_SIMPLE_EXERCISES = 10;
export const createSimpleGraph = (
  useAverage = false
): {
  nodes: Node[];
  edges: Edge[];
  nodeData: FullNodeData;
  nodeValues: NodeValues;
} => {
  const nodes = [
    createNode('stepper', 'Stepper'),
    createNode('grade', 'Final Grade'),
  ];

  const edges: Edge[] = [createEdge('Stepper', 'Final Grade')];

  for (let i = 0; i < NUM_SIMPLE_EXERCISES; i++) {
    nodes.push(createNode('attainment', `Exercise ${i + 1}`));
    edges.push(
      createEdge(
        `Exercise ${i + 1}`,
        useAverage ? 'Average' : 'Addition',
        undefined,
        i
      )
    );
  }

  const nodeSettings: {[key: string]: NodeSettings} = {
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
    nodes.push(createNode('average', 'Average'));
    edges.push(createEdge('Average', 'Stepper'));
    for (let i = 0; i < NUM_SIMPLE_EXERCISES; i++) {
      const averageSettings = nodeSettings.average as AverageNodeSettings;
      averageSettings.weights[`average-${i}`] =
        Math.ceil(10 * Math.random()) / 10;
    }
  } else {
    nodes.push(createNode('addition', 'Addition'));
    edges.push(createEdge('Addition', 'Stepper'));
  }

  const nodeValues = getInitNodeValues(nodes, edges);
  return {nodes, edges, nodeData: getNodeData(nodes, nodeSettings), nodeValues};
};

export const createO1 = (): {
  nodes: Node[];
  edges: Edge[];
  nodeData: FullNodeData;
  nodeValues: NodeValues;
} => {
  const nodes = [
    createNode('attainment', 'Tier A'),
    createNode('attainment', 'Tier B'),
    createNode('attainment', 'Tier C'),
    createNode('addition', 'Sum ABC'),
    createNode('addition', 'Sum BC'),
    createNode('addition', 'Sum C'),
    createNode('max', 'Best Grade'),
    createNode('grade', 'Final Grade'),
  ];
  const edges: Edge[] = [
    createEdge('Tier A', 'Sum ABC', undefined, 0),
    createEdge('Tier B', 'Sum ABC', undefined, 1),
    createEdge('Tier C', 'Sum ABC', undefined, 2),
    createEdge('Tier B', 'Sum BC', undefined, 0),
    createEdge('Tier C', 'Sum BC', undefined, 1),
    createEdge('Tier C', 'Sum C', undefined, 0),
    createEdge('Best Grade', 'Final Grade'),
  ];
  const nodeSettings: {[key: string]: NodeSettings} = {
    'best-grade': {minValue: 0},
  };

  const courseGrades = [
    [2000, 0, 0],
    [2100, 450, 0],
    [2100, 800, 0],
    [2100, 800, 450],
    [2100, 800, 625],
  ];
  for (let i = 0; i < courseGrades.length; i++) {
    const [a, b, c] = courseGrades[i];
    nodes.push(createNode('minpoints', `A Min Grade ${i + 1}`));
    nodes.push(createNode('minpoints', `B Min Grade ${i + 1}`));
    nodes.push(createNode('minpoints', `C Min Grade ${i + 1}`));
    edges.push(createEdge('Sum ABC', `A Min Grade ${i + 1}`));
    edges.push(createEdge('Sum BC', `B Min Grade ${i + 1}`));
    edges.push(createEdge('Sum C', `C Min Grade ${i + 1}`));
    nodeSettings[`a-min-grade-${i + 1}`] = {minPoints: a + b + c};
    nodeSettings[`b-min-grade-${i + 1}`] = {minPoints: b + c};
    nodeSettings[`c-min-grade-${i + 1}`] = {minPoints: c};

    nodes.push(createNode('require', `Require All 3 Grade ${i + 1}`));
    edges.push(
      createEdge(
        `A Min Grade ${i + 1}`,
        `Require All 3 Grade ${i + 1}`,
        undefined,
        0
      )
    );
    edges.push(
      createEdge(
        `B Min Grade ${i + 1}`,
        `Require All 3 Grade ${i + 1}`,
        undefined,
        1
      )
    );
    edges.push(
      createEdge(
        `C Min Grade ${i + 1}`,
        `Require All 3 Grade ${i + 1}`,
        undefined,
        2
      )
    );
    nodeSettings[`require-all-3-grade-${i + 1}`] = {
      numFail: 0,
      failSetting: 'ignore',
    };

    nodes.push(createNode('stepper', `Convert To Grade ${i + 1}`));
    edges.push(
      createEdge(`Require All 3 Grade ${i + 1}`, `Convert To Grade ${i + 1}`, 0)
    );
    nodeSettings[`convert-to-grade-${i + 1}`] = {
      numSteps: 2,
      middlePoints: [0],
      outputValues: [0, i + 1],
    };

    edges.push(
      createEdge(`Convert To Grade ${i + 1}`, 'Best Grade', undefined, i)
    );
  }

  const nodeValues = getInitNodeValues(nodes, edges);
  const RoundMaxPoints = [2205, 900, 725];
  for (const node of nodes) {
    if (node.type === 'attainment') {
      const val = RoundMaxPoints.shift() as number;
      (nodeValues[node.id] as AttainmentNodeValues).value = Math.floor(
        Math.min(val, Math.random() * (val * 1.5))
      );
    }
  }
  return {nodes, edges, nodeData: getNodeData(nodes, nodeSettings), nodeValues};
};

export const createY1 = (): {
  nodes: Node[];
  edges: Edge[];
  nodeData: FullNodeData;
  nodeValues: NodeValues;
} => {
  const nodes = [
    createNode('attainment', 'Bonus Round'),
    createNode('minpoints', 'Minpoints bonus'),
    createNode('substitute', 'Substitute rounds'),
    createNode('require', 'No fails'),
    createNode('substitute', 'Substitute bonus'),
    createNode('addition', 'Sum bonus'),
    createNode('addition', 'Sum nobonus'),
    createNode('require', 'Bonus require'),
    createNode('stepper', 'Stepper bonus'),
    createNode('stepper', 'Stepper nobonus'),
    createNode('max', 'Max grade'),
    createNode('grade', 'Final grade'),
  ];
  const edges: Edge[] = [
    createEdge('Bonus Round', 'Minpoints bonus'),
    createEdge('Minpoints bonus', 'Substitute bonus', undefined, 'exercise-0'),
    createEdge('Sum bonus', 'Stepper bonus'),
    createEdge('Sum nobonus', 'Stepper nobonus'),
    createEdge('Stepper nobonus', 'Max grade', undefined, 0),
    createEdge('Stepper bonus', 'Max grade', undefined, 1),
    createEdge('Max grade', 'Final grade'),
  ];
  const nodeSettings: {[key: string]: NodeSettings} = {
    'minpoints-bonus': {minPoints: 600},
    'substitute-rounds': {
      maxSubstitutions: 3,
      substituteValues: [360, 295, 325, 360, 335, 400, 370, 385],
    },
    'substitute-bonus': {
      maxSubstitutions: 1,
      substituteValues: [600],
    },
    'no-fails': {numFail: 0, failSetting: 'coursefail'},
    'bonus-require': {numFail: 0, failSetting: 'ignore'},
    'stepper-bonus': {
      numSteps: 6,
      middlePoints: [2829, 3699, 4499, 5349, 6049],
      outputValues: [0, 1, 2, 3, 4, 5],
    },
    'stepper-nobonus': {
      numSteps: 3,
      middlePoints: [2829, 3699],
      outputValues: [0, 1, 2],
    },

    'max-grade': {minValue: 0},
  };

  const minPoints = [360, 295, 325, 360, 335, 400, 370, 385];
  for (let i = 0; i < 8; i++) {
    nodes.push(createNode('attainment', `Round ${i + 1}`));

    nodes.push(createNode('minpoints', `Minpoints ${i + 1}`));
    edges.push(createEdge(`Round ${i + 1}`, `Minpoints ${i + 1}`));
    nodeSettings[`minpoints-${i + 1}`] = {minPoints: minPoints[i]};

    edges.push(
      createEdge(
        `Minpoints ${i + 1}`,
        'Substitute rounds',
        undefined,
        `exercise-${i}`
      )
    );
    edges.push(createEdge('Substitute rounds', 'No fails', `exercise-${i}`, i));
    edges.push(createEdge('No fails', 'Sum nobonus', i, i));
    edges.push(createEdge('No fails', 'Bonus require', i, i));
    edges.push(createEdge('Bonus require', 'Sum bonus', i, i));
  }
  for (let i = 0; i < 4; i++) {
    nodes.push(createNode('attainment', `Substitute ${i + 1}`));
    edges.push(createEdge(`Substitute ${i + 1}`, `Minpoints sub ${i + 1}`));

    nodes.push(createNode('minpoints', `Minpoints sub ${i + 1}`));
    edges.push(
      createEdge(
        `Minpoints sub ${i + 1}`,
        'Substitute rounds',
        undefined,
        `substitute-${i}`
      )
    );
    nodeSettings[`minpoints-sub-${i + 1}`] = {minPoints: 200};

    edges.push(
      createEdge(
        'Substitute rounds',
        'Substitute bonus',
        `substitute-${i}`,
        `substitute-${i}`
      )
    );
  }
  edges.push(createEdge('Substitute bonus', 'Bonus require', 'exercise-0', 8));
  edges.push(createEdge('Bonus require', 'Sum bonus', 8, 8));

  const nodeValues = getInitNodeValues(nodes, edges);
  const RoundMaxPoints = [
    1017, 522, 590, 650, 720, 670, 714, 673, 700, 300, 300, 300, 300,
  ];
  for (const node of nodes) {
    if (node.type === 'attainment') {
      const val = RoundMaxPoints.shift() as number;
      (nodeValues[node.id] as AttainmentNodeValues).value = Math.floor(
        Math.min(val, Math.random() * (val * 1.3))
      );
    }
  }
  return {nodes, edges, nodeData: getNodeData(nodes, nodeSettings), nodeValues};
};
