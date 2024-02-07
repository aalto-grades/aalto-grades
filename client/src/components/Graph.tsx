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
  NodeSettings,
  NodeSettingsContext,
  NodeValues,
  NodeValuesContext,
} from '../context/GraphProvider';
import './flow.css';
import AdditionNode from './graph/AdditionNode';
import AttanmentNode from './graph/AttainmentNode';
import GradeNode from './graph/GradeNode';
import StepperNode from './graph/StepperNode';

const nodeTypes = {
  attainment: AttanmentNode,
  addition: AdditionNode,
  grade: GradeNode,
  stepper: StepperNode,
};

const Graph = (): JSX.Element => {
  const initialNodes = [
    {
      id: 'plus1',
      type: 'addition',
      position: {x: 500, y: 500},
      data: {label: 'Addition'},
    },
    {
      id: 'stepper1',
      type: 'stepper',
      position: {x: 700, y: 500},
      data: {label: 'Stepper'},
    },
    {
      id: 'grade',
      type: 'grade',
      position: {x: 900, y: 500},
      data: {label: 'Final grade'},
    },
  ];
  const initialEdges = [
    {id: 'plus1-stepper1', source: 'plus1', target: 'stepper1'},
    {id: 'stepper1-grade', source: 'stepper1', target: 'grade'},
  ];
  for (let i = 0; i < 10; i++) {
    initialNodes.push({
      id: `ex${i + 1}`,
      type: 'attainment',
      position: {x: 0, y: i * 100},
      data: {label: `Exercise ${i + 1}`},
    });
    initialEdges.push({
      id: `ex${i + 1}-plus1`,
      source: `ex${i + 1}`,
      target: 'plus1',
    });
  }

  const initNodeValues: NodeValues = {};
  for (const node of initialNodes) {
    initNodeValues[node.id] =
      node.type === 'attainment' ? Math.round(Math.random() * 10) : 0;
  }
  const initNodeSettings = {
    stepper1: {
      numSteps: 6,
      outputValues: [0, 1, 2, 3, 4, 5],
      middlePoints: [17, 33, 50, 67, 83],
    },
  };

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [nodeSettings, setNodeSettings] =
    useState<NodeSettings>(initNodeSettings);
  const [nodeValues, setNodeValues] = useState<NodeValues>(initNodeValues);
  const [oldNodeSettings, setOldNodeSettings] =
    useState<NodeSettings>(initNodeSettings);
  const [oldNodeValues, setOldNodeValues] =
    useState<NodeValues>(initNodeValues);
  const [oldEdges, setOldEdges] = useState<Edge[]>(edges);

  const updateValues = useCallback(
    (newEdges: Edge[] | null = null) => {
      console.log('Updating');
      const nodeSources: {[key: string]: Set<string>} = {};
      const nodeTargets: {[key: string]: string[]} = {};
      for (const edge of newEdges || edges) {
        if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
        nodeTargets[edge.source].push(edge.target);
        if (!(edge.target in nodeSources)) nodeSources[edge.target] = new Set();
        nodeSources[edge.target].add(edge.source);
      }

      type NodeTypes = 'attainment' | 'addition' | 'stepper' | 'grade';
      const nodeTypes: {[key: string]: NodeTypes} = {};
      const noSources = [];
      for (const node of nodes) {
        if (!(node.id in nodeSources)) noSources.push(node.id);
        nodeTypes[node.id] = node.type as NodeTypes;
      }

      const newNodeValues = {...nodeValues};
      for (const node of nodes) {
        if (node.type !== 'attainment') newNodeValues[node.id] = 0;
      }

      while (noSources.length > 0) {
        const sourceId = noSources.pop() as string;
        let sourceValue = newNodeValues[sourceId];
        if (nodeTypes[sourceId] === 'stepper') {
          const settings = nodeSettings[sourceId];
          for (let i = 0; i < settings.numSteps; i++) {
            if (
              i + 1 !== settings.numSteps &&
              sourceValue > settings.middlePoints[i]
            )
              continue;
            sourceValue = settings.outputValues[i];
            break;
          }
          newNodeValues[sourceId] = sourceValue;
        }

        if (!(sourceId in nodeTargets)) continue;

        for (const targetId of nodeTargets[sourceId]) {
          nodeSources[targetId].delete(sourceId);
          if (nodeSources[targetId].size === 0) noSources.push(targetId);

          switch (nodeTypes[targetId]) {
            case 'addition':
              newNodeValues[targetId] += sourceValue;
              break;
            case 'stepper':
              newNodeValues[targetId] += sourceValue;
              break;
            case 'grade':
              newNodeValues[targetId] += sourceValue;
              break;
          }
        }
      }
      console.log('Finished Updating');
      setOldNodeValues(nodeValues);
      setNodeValues(newNodeValues);
    },
    [edges, nodeSettings, nodeValues, nodes]
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const target = nodes.find(node => node.id === connection.target) as Node;
      const outgoers: {[key: string]: Node[]} = {};
      for (const edge of edges) {
        if (!(edge.source in outgoers)) outgoers[edge.source] = [];
        outgoers[edge.source].push(
          nodes.find(node => node.id === edge.target) as Node
        );
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
      JSON.stringify(oldNodeValues) !== JSON.stringify(nodeValues) ||
      JSON.stringify(oldNodeSettings) !== JSON.stringify(nodeSettings) ||
      oldEdges.length !== edges.length
    ) {
      setOldNodeValues(nodeValues);
      setOldNodeSettings(nodeSettings);
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
