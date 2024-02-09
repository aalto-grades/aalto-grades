// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {JSX, useCallback, useEffect, useState} from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  AverageNodeSettings,
  NodeSettings,
  NodeSettingsContext,
  NodeValues,
  NodeValuesContext,
} from '../context/GraphProvider';
import AdditionNode from './graph/AdditionNode';
import AttanmentNode from './graph/AttainmentNode';
import GradeNode from './graph/GradeNode';
import StepperNode from './graph/StepperNode';
import './graph/flow.css';
import {calculateNewNodeValues, getInitNodeValues} from './graph/graphUtil';
import AverageNode from './graph/AverageNode';

const nodeTypes = {
  addition: AdditionNode,
  attainment: AttanmentNode,
  average: AverageNode,
  grade: GradeNode,
  stepper: StepperNode,
};

const NUM_EXERCISES = 5;
const Graph = (): JSX.Element => {
  const initialNodes = [
    {
      id: 'plus1',
      type: 'addition',
      position: {x: 300, y: 100},
      data: {label: 'Addition'},
    },
    {
      id: 'stepper1',
      type: 'stepper',
      position: {x: 500, y: 350},
      data: {label: 'Stepper'},
    },
    {
      id: 'average1',
      type: 'average',
      position: {x: 300, y: 400},
      data: {label: 'Average'},
    },
    {
      id: 'grade',
      type: 'grade',
      position: {x: 900, y: 465},
      data: {label: 'Final grade'},
    },
  ];
  const initialEdges: Edge[] = [
    {id: 'plus1-stepper1', source: 'plus1', target: 'stepper1'},
    {id: 'stepper1-grade', source: 'stepper1', target: 'grade'},
  ];
  for (let i = 0; i < NUM_EXERCISES; i++) {
    initialNodes.push({
      id: `ex${i + 1}`,
      type: 'attainment',
      position: {x: 0, y: 15 + i * 100},
      data: {label: `Exercise ${i + 1}`},
    });
    initialEdges.push({
      id: `ex${i + 1}-plus1`,
      source: `ex${i + 1}`,
      target: 'plus1',
    });
    initialEdges.push({
      id: `ex${i + 1}-average1`,
      source: `ex${i + 1}`,
      target: 'average1',
      targetHandle: i.toString(),
    });
  }

  const initNodeSettings: NodeSettings = {
    stepper1: {
      numSteps: 6,
      outputValues: [0, 1, 2, 3, 4, 5],
      middlePoints: [17, 33, 50, 67, 83],
    },
    average1: {weights: {}, nextFree: 100},
  };
  for (let i = 0; i < NUM_EXERCISES; i++) {
    const averageSettings = initNodeSettings.average1 as AverageNodeSettings;
    averageSettings.weights[i.toString()] = 1;
  }

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [nodeSettings, setNodeSettings] =
    useState<NodeSettings>(initNodeSettings);
  const [nodeValues, setNodeValues] = useState<NodeValues>(
    getInitNodeValues(nodes)
  );

  // Old values are strings to avoid problematic references
  const [oldNodeSettings, setOldNodeSettings] = useState<string>(
    JSON.stringify(initNodeSettings)
  );
  const [oldNodeValues, setOldNodeValues] = useState<string>(
    JSON.stringify(getInitNodeValues(nodes))
  );
  const [oldEdges, setOldEdges] = useState<Edge[]>(edges);

  const updateValues = useCallback(
    (newEdges: Edge[] | null = null) => {
      console.log('Updating');
      const newNodeValues = calculateNewNodeValues(
        nodeValues,
        nodeSettings,
        nodes,
        newEdges || edges
      );
      setOldNodeValues(JSON.stringify(newNodeValues));
      setNodeValues(newNodeValues);
    },
    [edges, nodeSettings, nodeValues, nodes]
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      const target = nodes.find(node => node.id === connection.target) as Node;
      const outgoers: {[key: string]: Node[]} = {};
      for (const edge of edges) {
        if (!(edge.source in outgoers)) outgoers[edge.source] = [];
        outgoers[edge.source].push(
          nodes.find(node => node.id === edge.target) as Node
        );

        if (
          edge.target === target.id &&
          target.type !== 'addition' &&
          target.type !== 'average'
        ) {
          return false;
        } else if (
          edge.targetHandle &&
          edge.targetHandle === connection.targetHandle &&
          target.type === 'average'
        ) {
          return false;
        }
      }

      const hasCycle = (node: Node, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        if (!(node.id in outgoers)) return false;
        for (const outgoer of outgoers[node.id]) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target.id === connection.source) return false;
      return !hasCycle(target);
    },
    [nodes, edges]
  );

  useEffect(() => {
    updateValues();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      oldNodeValues !== JSON.stringify(nodeValues) ||
      oldNodeSettings !== JSON.stringify(nodeSettings) ||
      oldEdges.length !== edges.length
    ) {
      setOldNodeValues(JSON.stringify(nodeValues));
      setOldNodeSettings(JSON.stringify(nodeSettings));
      setOldEdges(edges);
      updateValues();
    }
  }, [
    edges,
    nodeSettings,
    nodeValues,
    oldEdges,
    oldNodeSettings,
    oldNodeValues,
    updateValues,
  ]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(edges => addEdge(params, edges));
      updateValues(addEdge(params, edges));
    },
    [edges, setEdges, updateValues]
  );

  return (
    <NodeValuesContext.Provider value={{nodeValues, setNodeValues}}>
      <NodeSettingsContext.Provider value={{nodeSettings, setNodeSettings}}>
        <div style={{width: '100%', height: '80vh'}}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </NodeSettingsContext.Provider>
    </NodeValuesContext.Provider>
  );
};

export default Graph;
