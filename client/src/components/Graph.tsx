// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DragEventHandler, JSX, useCallback, useEffect, useState} from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlowInstance,
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

const NUM_EXERCISES = 10;
const nodeTypes = {
  addition: AdditionNode,
  attainment: AttanmentNode,
  average: AverageNode,
  grade: GradeNode,
  stepper: StepperNode,
};

const createInitValues = (): {
  nodes: Node[];
  edges: Edge[];
  nodeSettings: NodeSettings;
  nodeValues: NodeValues;
} => {
  const nodes = [
    {
      id: 'addition1',
      type: 'addition',
      position: {x: 300, y: 100},
      data: {label: 'Addition'},
    },
    {
      id: 'average1',
      type: 'average',
      position: {x: 300, y: 400},
      data: {label: 'Average'},
    },
    {
      id: 'stepper1',
      type: 'stepper',
      position: {x: 700, y: 100},
      data: {label: 'Stepper'},
    },
    {
      id: 'stepper2',
      type: 'stepper',
      position: {x: 700, y: 600},
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
    {id: 'addition1-stepper1', source: 'addition1', target: 'stepper1'},
    {id: 'average1-stepper2', source: 'average1', target: 'stepper2'},
    {id: 'stepper1-grade', source: 'stepper1', target: 'grade'},
  ];

  for (let i = 0; i < NUM_EXERCISES; i++) {
    nodes.push({
      id: `ex${i + 1}`,
      type: 'attainment',
      position: {x: 0, y: 15 + i * 100},
      data: {label: `Exercise ${i + 1}`},
    });
    edges.push({
      id: `ex${i + 1}-addition1`,
      source: `ex${i + 1}`,
      target: 'addition1',
    });
    edges.push({
      id: `ex${i + 1}-average1`,
      source: `ex${i + 1}`,
      target: 'average1',

      targetHandle: i.toString(),
    });
  }

  const nodeSettings: NodeSettings = {
    stepper1: {
      numSteps: 6,
      outputValues: [0, 1, 2, 3, 4, 5],
      middlePoints: [17, 33, 50, 67, 83],
    },
    stepper2: {
      numSteps: 6,
      outputValues: [0, 1, 2, 3, 4, 5],
      middlePoints: [1.7, 3.3, 5, 6.7, 8.3],
    },
    average1: {weights: {}, nextFree: 100},
  };
  for (let i = 0; i < NUM_EXERCISES; i++) {
    const averageSettings = nodeSettings.average1 as AverageNodeSettings;
    averageSettings.weights[i.toString()] = Math.ceil(10 * Math.random()) / 10;
  }

  const nodeValues = getInitNodeValues(nodes);

  return {nodes, edges, nodeSettings, nodeValues};
};

const Graph = (): JSX.Element => {
  const initValues = createInitValues();

  const [nodes, setNodes, onNodesChange] = useNodesState(initValues.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initValues.edges);
  const [nodeSettings, setNodeSettings] = useState<NodeSettings>(
    initValues.nodeSettings
  );
  const [nodeValues, setNodeValues] = useState<NodeValues>(
    initValues.nodeValues
  );
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Old values are strings to avoid problematic references
  const [oldNodeSettings, setOldNodeSettings] = useState<string>(
    JSON.stringify(initValues.nodeSettings)
  );
  const [oldNodeValues, setOldNodeValues] = useState<string>(
    JSON.stringify(initValues.nodeValues)
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

  type DropType = 'addition' | 'average' | 'stepper';
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: DropType
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback(event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  let id = 0;
  const getId = useCallback(() => `dndnode_${id++}`, [id]);
  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
    event => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        'application/reactflow'
      ) as DropType;

      if (typeof type === 'undefined' || !type || reactFlowInstance === null) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: `dnd-${type}-${getId()}`,
        type,
        position,
        data: {label: type},
      };

      const newValues = {...nodeValues};
      const newSettings = {...nodeSettings};
      switch (type) {
        case 'addition':
          newValues[newNode.id] = {type: 'addition', sources: [], value: 0};
          break;
        case 'average':
          newValues[newNode.id] = {type: 'average', sources: {}, value: 0};
          newSettings[newNode.id] = {weights: {}, nextFree: 100};
          break;
        case 'stepper':
          newValues[newNode.id] = {type: 'stepper', source: 0, value: 0};
          newSettings[newNode.id] = {
            numSteps: 1,
            middlePoints: [],
            outputValues: [0],
          };
          break;
      }

      setNodes(nodes => nodes.concat(newNode));
      setNodeValues(newValues);
      setNodeSettings(newSettings);
    },
    [getId, nodeSettings, nodeValues, reactFlowInstance, setNodes]
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
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
        <div
          className="dndnode"
          onDragStart={event => onDragStart(event, 'addition')}
          draggable
        >
          AdditionNode
        </div>
        <div
          className="dndnode"
          onDragStart={event => onDragStart(event, 'average')}
          draggable
        >
          AverageNode
        </div>
        <div
          className="dndnode"
          onDragStart={event => onDragStart(event, 'stepper')}
          draggable
        >
          StepperNode
        </div>
      </NodeSettingsContext.Provider>
    </NodeValuesContext.Provider>
  );
};

export default Graph;
