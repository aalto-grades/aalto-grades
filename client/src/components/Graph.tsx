// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import ELK, {ElkNode} from 'elkjs/lib/elk.bundled.js';
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
  NodeHeights,
  NodeHeightsContext,
  NodeSettings,
  NodeSettingsContext,
  NodeValues,
  NodeValuesContext,
} from '../context/GraphProvider';
import AdditionNode from './graph/AdditionNode';
import AttanmentNode from './graph/AttainmentNode';
import AverageNode from './graph/AverageNode';
import GradeNode from './graph/GradeNode';
import MaxNode from './graph/MaxNode';
import MinPointsNode from './graph/MinPointsNode';
import StepperNode from './graph/StepperNode';
import './graph/flow.css';
import {
  NodeTypes,
  calculateNewNodeValues,
  getInitNodeValues,
} from './graph/graphUtil';

const NUM_EXERCISES = 10;
const nodeTypes = {
  addition: AdditionNode,
  attainment: AttanmentNode,
  average: AverageNode,
  grade: GradeNode,
  max: MaxNode,
  minpoints: MinPointsNode,
  stepper: StepperNode,
};
const elk = new ELK();

const createInitValues = (
  useAverage = false
): {
  nodes: Node[];
  edges: Edge[];
  nodeSettings: NodeSettings;
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

  for (let i = 0; i < NUM_EXERCISES; i++) {
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

  const nodeSettings: NodeSettings = {
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
    for (let i = 0; i < NUM_EXERCISES; i++) {
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
  const [nodeHeights, setNodeHeights] = useState<NodeHeights>({});
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

        if (target.type === 'addition') continue; // TODO: change in the future

        if (!connection.targetHandle && edge.target === connection.target) {
          return false;
        }
        if (
          edge.target === connection.target &&
          edge.targetHandle &&
          edge.targetHandle === connection.targetHandle
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

  const format = async () => {
    const nodesForElk = nodes.map(node => {
      let width = 0;
      let height = 0;
      switch (node.type as NodeTypes) {
        case 'addition':
          width = 70;
          height = 50;
          break;
        case 'attainment':
          width = 90;
          height = 50;
          break;
        case 'average':
          width = 200;
          height = nodeHeights[node.id];
          break;
        case 'grade':
          width = 100;
          height = 50;
          break;
        case 'max':
          width = 90;
          height = nodeHeights[node.id];
          break;
        case 'minpoints':
          width = 90;
          height = 50;
          break;
        case 'stepper':
          width = 270;
          height = nodeHeights[node.id];
      }
      return {
        type: node.type,
        id: node.id,
        width,
        height,
      };
    });
    const graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'RIGHT',
        'nodePlacement.strategy': 'SIMPLE',
        'elk.layered.spacing.nodeNodeBetweenLayers': '200',
        'elk.spacing.nodeNode': '60',
      },
      children: nodesForElk.map(node => {
        if (node.type !== 'average') {
          return {
            ...node,
            ports: [{id: node.id}],
          };
        }
        const settings = nodeSettings[node.id] as AverageNodeSettings;
        const sourcePorts = Object.keys(settings.weights)
          .toReversed()
          .map(key => ({
            id: `${node.id}-${key}`,
            properties: {side: 'WEST'},
          }));

        return {
          ...node,
          properties: {'org.eclipse.elk.portConstraints': 'FIXED_ORDER'},
          ports: [{id: node.id}, ...sourcePorts],
        };
      }),
      edges: edges.map(edge => ({
        ...edge,
        sources: [edge.source],
        targets: [
          edge.targetHandle
            ? `${edge.target}-${edge.targetHandle}`
            : edge.target,
        ],
      })),
    };

    const newNodes = (await elk.layout(graph)).children as ElkNode[];
    setNodes(
      newNodes.map((node): Node => {
        return {
          ...(nodes.find(onode => onode.id === node.id) as Node),
          position: {x: node.x as number, y: node.y as number},
        };
      })
    );
  };

  type DropType = 'addition' | 'average' | 'stepper' | 'max' | 'minpoints';
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
          newValues[newNode.id] = {type: 'addition', sourceSum: 0, value: 0};
          break;
        case 'average':
          newValues[newNode.id] = {type: 'average', sources: {}, value: 0};
          newSettings[newNode.id] = {weights: {}, nextFree: 100};
          break;
        case 'max':
          newValues[newNode.id] = {type: 'max', sources: {}, value: 0};
          break;
        case 'minpoints':
          newValues[newNode.id] = {type: 'minpoints', source: 0, value: 0};
          newSettings[newNode.id] = {minPoints: 0};
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
        <NodeHeightsContext.Provider value={{nodeHeights, setNodeHeights}}>
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
          <div
            className="dndnode"
            onDragStart={event => onDragStart(event, 'minpoints')}
            draggable
          >
            MinPointsNode
          </div>
          <div
            className="dndnode"
            onDragStart={event => onDragStart(event, 'max')}
            draggable
          >
            MaxNode
          </div>
          <button onClick={format}>Format</button>
          <button
            onClick={() => {
              const newInitvalues = createInitValues(false);
              for (const node of nodes) {
                onNodesChange([{id: node.id, type: 'remove'}]);
              }
              setTimeout(() => {
                setNodes(newInitvalues.nodes);
                setEdges(newInitvalues.edges);
                setNodeSettings(newInitvalues.nodeSettings);
                setNodeValues(newInitvalues.nodeValues);
              }, 0);
            }}
          >
            Load addition template
          </button>
          <button
            onClick={() => {
              const newInitvalues = createInitValues(true);
              for (const node of nodes) {
                onNodesChange([{id: node.id, type: 'remove'}]);
              }
              setTimeout(() => {
                setNodes(newInitvalues.nodes);
                setEdges(newInitvalues.edges);
                setNodeSettings(newInitvalues.nodeSettings);
                setNodeValues(newInitvalues.nodeValues);
              }, 0);
            }}
          >
            Load average template
          </button>
        </NodeHeightsContext.Provider>
      </NodeSettingsContext.Provider>
    </NodeValuesContext.Provider>
  );
};

export default Graph;
