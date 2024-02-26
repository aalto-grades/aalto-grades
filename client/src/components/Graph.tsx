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
  DropInNodes,
  NodeSettings,
  CustomNodeTypes,
  NodeValues,
  NodeValuesContext,
  FullNodeData,
  NodeDataContext,
  NodeDimensions,
  NodeDimensionsContext,
} from '../context/GraphProvider';
import {createO1, createSimpleGraph, createY1} from './graph/createGraph';
import './graph/flow.css';
import {formatGraph} from './graph/formatGraph';
import {
  calculateNewNodeValues,
  findDisconnectedEdges,
  initNode,
} from './graph/graphUtil';
import SubstituteNode from './graph/SubstituteNode';

const nodeMap = {
  addition: AdditionNode,
  attainment: AttanmentNode,
  average: AverageNode,
  grade: GradeNode,
  max: MaxNode,
  minpoints: MinPointsNode,
  require: RequireNode,
  stepper: StepperNode,
  substitute: SubstituteNode,
};

const Graph = (): JSX.Element => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [initEdges, setInitEdges] = useState<Edge[]>([]);
  const [nodeData, setNodeData] = useState<FullNodeData>({});
  const [nodeDimensions, setNodeContextDimensions] = useState<NodeDimensions>(
    {}
  );
  const [nodeValues, setNodeValues] = useState<NodeValues>({});
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Old values are strings to avoid problematic references
  const [oldNodeSettings, setOldNodeSettings] = useState<string>('{}');
  const [oldNodeValues, setOldNodeValues] = useState<string>('{}');
  const [oldEdges, setOldEdges] = useState<Edge[]>(edges);

  const setNodeTitle = (id: string, title: string) => {
    setNodeData(oldNodeData => ({
      ...oldNodeData,
      [id]: {
        ...oldNodeData[id],
        title,
      },
    }));
  };
  const setNodeDimensions = (id: string, width: number, height: number) => {
    setNodeContextDimensions(oldNodeDimensions => ({
      ...oldNodeDimensions,
      [id]: {width, height},
    }));
  };
  const setNodeSettings = (id: string, settings: NodeSettings) => {
    setNodeData(oldNodeSettings => ({
      ...oldNodeSettings,
      [id]: {
        ...oldNodeSettings[id],
        settings,
      },
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
        nodeData,
        nodes,
        filteredEdges
      );
      setOldNodeValues(JSON.stringify(newNodeValues));
      setNodeValues(newNodeValues);
      if (disconnectedEdges.length > 0) setEdges(filteredEdges);
    },
    [edges, nodeData, nodeValues, nodes, setEdges]
  );

  useEffect(() => {
    loadGraph(createSimpleGraph());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const nodeSettings: {[key: string]: NodeSettings | undefined} = {};
    for (const [key, value] of Object.entries(nodeData))
      nodeSettings[key] = value.settings;

    if (
      initEdges.length === 0 &&
      (oldNodeValues !== JSON.stringify(nodeValues) ||
        oldNodeSettings !== JSON.stringify(nodeSettings) ||
        oldEdges.length !== edges.length)
    ) {
      setOldNodeValues(JSON.stringify(nodeValues));
      setOldNodeSettings(JSON.stringify(nodeSettings));
      setOldEdges(edges);
      updateValues();
    }
  }, [
    edges,
    initEdges.length,
    nodeData,
    nodeValues,
    oldEdges,
    oldNodeSettings,
    oldNodeValues,
    updateValues,
  ]);

  const loadGraph = (initGraph: {
    nodes: Node[];
    edges: Edge[];
    nodeData: FullNodeData;
    nodeValues: NodeValues;
  }) => {
    for (const node of nodes) {
      onNodesChange([{id: node.id, type: 'remove'}]);
    }
    setTimeout(() => {
      setNodes(initGraph.nodes);
      setInitEdges(initGraph.edges);
      setNodeData(initGraph.nodeData);
      setNodeValues(initGraph.nodeValues);
    }, 0);
  };
  useEffect(() => {
    if (initEdges.length > 0) {
      formatGraph(nodes, initEdges, nodeDimensions, nodeValues).then(
        newNodes => {
          setEdges(initEdges);
          setNodes(newNodes); // TODO: remove auto formatting on load in production
          setInitEdges([]);
        }
      );
    }
  }, [initEdges]); // eslint-disable-line react-hooks/exhaustive-deps

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
        (typeMap[connection.source as string] === 'minpoints' ||
          typeMap[connection.target as string] === 'substitute') &&
        typeMap[connection.target as string] !== 'require' &&
        typeMap[connection.target as string] !== 'substitute'
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
        } else if (
          edge.target === connection.target &&
          edge.targetHandle &&
          edge.targetHandle === connection.targetHandle
        ) {
          return false;
        } else if (
          edge.source === connection.source &&
          edge.sourceHandle === connection.sourceHandle &&
          edge.target === connection.target
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
    setNodes(await formatGraph(nodes, edges, nodeDimensions, nodeValues));
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
  const getId = useCallback(() => `dndnode-${id++}`, [id]);
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
      const newData: FullNodeData = {
        ...nodeData,
        [newNode.id]: initNode(type).data,
      };

      setNodes(nodes => nodes.concat(newNode));
      setNodeValues(newValues);
      setNodeData(newData);
    },
    [getId, nodeData, nodeValues, reactFlowInstance, setNodes]
  );

  return (
    <NodeValuesContext.Provider value={{nodeValues, setNodeValues}}>
      <NodeDimensionsContext.Provider
        value={{nodeDimensions, setNodeDimensions}}
      >
        <NodeDataContext.Provider
          value={{nodeData, setNodeTitle, setNodeSettings}}
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
            RequirePointsNode
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
          <div
            className="dndnode"
            onDragStart={event => onDragStart(event, 'substitute')}
            draggable
          >
            SubstituteNode
          </div>
          <button onClick={format}>Format</button>
          <button onClick={() => loadGraph(createSimpleGraph(false))}>
            Load addition template
          </button>
          <button onClick={() => loadGraph(createSimpleGraph(true))}>
            Load average template
          </button>
          <button onClick={() => loadGraph(createY1())}>
            Load Y1 template
          </button>
          <button onClick={() => loadGraph(createO1())}>
            Load O1 template
          </button>
        </NodeDataContext.Provider>
      </NodeDimensionsContext.Provider>
    </NodeValuesContext.Provider>
  );
};

export default Graph;
