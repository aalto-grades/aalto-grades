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

import AdditionNode from '../components/graph/AdditionNode';
import AttanmentNode from '../components/graph/AttainmentNode';
import AverageNode from '../components/graph/AverageNode';
import GradeNode from '../components/graph/GradeNode';
import MaxNode from '../components/graph/MaxNode';
import MinPointsNode from '../components/graph/MinPointsNode';
import RequireNode from '../components/graph/RequireNode';
import StepperNode from '../components/graph/StepperNode';
import {
  AllNodeSettings,
  DropInNodes,
  NodeHeights,
  NodeHeightsContext,
  NodeSettings,
  NodeSettingsContext,
  CustomNodeTypes,
  NodeValues,
  NodeValuesContext,
} from '../context/GraphProvider';
import {createO1, createSimpleGraph, createY1} from './graph/createGraph';
import './graph/flow.css';
import {formatGraph} from './graph/formatGraph';
import {
  calculateNewNodeValues,
  findDisconnectedEdges,
  initNode,
} from './graph/graphUtil';

const nodeMap = {
  addition: AdditionNode,
  attainment: AttanmentNode,
  average: AverageNode,
  grade: GradeNode,
  max: MaxNode,
  minpoints: MinPointsNode,
  require: RequireNode,
  stepper: StepperNode,
};

const Graph = (): JSX.Element => {
  const initValues = createSimpleGraph();

  const [nodes, setNodes, onNodesChange] = useNodesState(initValues.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initValues.edges);
  const [nodeSettings, setNodeSettings] = useState<AllNodeSettings>(
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

  const setContextNodeSettings = (id: string, newSettings: NodeSettings) => {
    setNodeSettings(
      oldNodeSettings =>
        ({
          ...oldNodeSettings,
          [id]: newSettings,
        }) as AllNodeSettings
    );
  };
  const setContextNodeHeight = (id: string, newHeight: number) => {
    setNodeHeights(oldNodeHeights => ({
      ...oldNodeHeights,
      [id]: newHeight,
    }));
  };

  const updateValues = useCallback(
    (newEdges: Edge[] | null = null) => {
      console.log('Updating');
      const disconnectedEdges = findDisconnectedEdges(
        nodeValues,
        nodes,
        newEdges || edges
      );
      const filteredEdges = (newEdges || edges).filter(
        edge => !disconnectedEdges.includes(edge)
      );

      const newNodeValues = calculateNewNodeValues(
        nodeValues,
        nodeSettings,
        nodes,
        filteredEdges
      );
      setOldNodeValues(JSON.stringify(newNodeValues));
      setNodeValues(newNodeValues);
      if (disconnectedEdges.length > 0) setEdges(filteredEdges);
    },
    [edges, nodeSettings, nodeValues, nodes, setEdges]
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

  const isValidConnection = useCallback(
    (connection: Connection) => {
      const typeMap: {[key: string]: CustomNodeTypes} = {};
      for (const node of nodes) typeMap[node.id] = node.type as CustomNodeTypes;
      if (
        typeMap[connection.source as string] === 'minpoints' &&
        typeMap[connection.target as string] !== 'require'
      ) {
        return false;
      }

      const target = nodes.find(node => node.id === connection.target) as Node;
      const outgoers: {[key: string]: Node[]} = {};
      for (const edge of edges) {
        if (!(edge.source in outgoers)) outgoers[edge.source] = [];
        outgoers[edge.source].push(
          nodes.find(node => node.id === edge.target) as Node
        );

        if (!connection.targetHandle && edge.target === connection.target) {
          return false;
        }
        if (
          edge.source === connection.source &&
          edge.target === connection.target
        ) {
          return false;
        } else if (
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

  const format = async () => {
    setNodes(await formatGraph(nodes, edges, nodeHeights, nodeValues));
  };

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: DropInNodes
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
      ) as DropInNodes;

      if (typeof type === 'undefined' || !type || reactFlowInstance === null) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: `dnd-${type}-${getId()}`,
        type,
        position,
        data: {label: type},
      };

      const newValues = {...nodeValues, [newNode.id]: initNode(type).value};
      const newSettings = {
        ...nodeSettings,
        [newNode.id]: initNode(type).settings as NodeSettings,
      };

      setNodes(nodes => nodes.concat(newNode));
      setNodeValues(newValues);
      setNodeSettings(newSettings);
    },
    [getId, nodeSettings, nodeValues, reactFlowInstance, setNodes]
  );

  return (
    <NodeValuesContext.Provider value={{nodeValues, setNodeValues}}>
      <NodeSettingsContext.Provider
        value={{nodeSettings, setNodeSettings: setContextNodeSettings}}
      >
        <NodeHeightsContext.Provider
          value={{nodeHeights, setNodeHeight: setContextNodeHeight}}
        >
          <div style={{width: '100%', height: '80vh'}}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              nodeTypes={nodeMap}
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
          <div
            className="dndnode"
            onDragStart={event => onDragStart(event, 'require')}
            draggable
          >
            RequireNode
          </div>
          <button onClick={format}>Format</button>
          <button
            onClick={() => {
              const newInitvalues = createSimpleGraph(false);
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
              const newInitvalues = createSimpleGraph(true);
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
          <button
            onClick={() => {
              const newInitvalues = createY1();
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
            Load Y1 template
          </button>
          <button
            onClick={() => {
              const newInitvalues = createO1();
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
            Load O1 template
          </button>
        </NodeHeightsContext.Provider>
      </NodeSettingsContext.Provider>
    </NodeValuesContext.Provider>
  );
};

export default Graph;
