// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Button} from '@mui/material';
import {
  DragEventHandler,
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  CustomNodeTypes,
  DropInNodes,
  FullNodeData,
  GraphStructure,
  NodeSettings,
  NodeValue,
  NodeValues,
} from '@common/types/graph';
import {calculateNewNodeValues} from '@common/util/calculateGraph';
import {
  NodeDataContext,
  NodeDimensions,
  NodeDimensionsContext,
  NodeValuesContext,
} from '../../context/GraphProvider';
import AdditionNode from './AdditionNode';
import AttanmentNode from './AttainmentNode';
import AverageNode from './AverageNode';
import GradeNode from './GradeNode';
import MaxNode from './MaxNode';
import MinPointsNode from './MinPointsNode';
import RequireNode from './RequireNode';
import StepperNode from './StepperNode';
import SubstituteNode from './SubstituteNode';
import './flow.css';
import {findDisconnectedEdges, formatGraph, initNode} from './graphUtil';

const nodeTypesMap = {
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

const Graph = ({
  initGraph,
  onSave,
}: {
  initGraph: GraphStructure;
  onSave: (graphStructure: GraphStructure) => void;
}): JSX.Element => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeData, setNodeData] = useState<FullNodeData>({});
  const [nodeDimensions, setNodeContextDimensions] = useState<NodeDimensions>(
    {}
  );
  const [nodeValues, setNodeValues] = useState<NodeValues>({});
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Old values are strings to avoid problematic references
  const [oldNodes, setOldNodes] = useState<Node[]>([]);
  const [oldEdges, setOldEdges] = useState<Edge[]>([]);
  const [oldNodeSettings, setOldNodeSettings] = useState<string>('{}');
  const [oldNodeValues, setOldNodeValues] = useState<string>('{}');

  const [unsaved, setUnsaved] = useState<boolean>(false);
  const [originalGraphStructure, setOriginalGraphStructure] =
    useState<GraphStructure>({
      nodes: [],
      edges: [],
      nodeData: {},
      nodeValues: {},
    });

  const nodeMap = useMemo<{[key: string]: Node}>(() => {
    const newMap: {[key: string]: Node} = {};
    for (const node of nodes) newMap[node.id] = node;
    return newMap;
  }, [nodes]);

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
  const setNodeValue = (id: string, nodeValue: NodeValue) => {
    setNodeValues(oldNodeValues => ({
      ...oldNodeValues,
      [id]: nodeValue,
    }));
  };

  const updateValues = useCallback(
    (newEdges: Edge[] | null = null) => {
      console.debug('Updating');
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
    [nodeValues, nodes, edges, nodeData, setEdges]
  );

  useEffect(() => {
    const nodeSettings: {[key: string]: NodeSettings | undefined} = {};
    for (const [key, value] of Object.entries(nodeData))
      nodeSettings[key] = value.settings;

    if (
      !loading &&
      (oldNodes.length !== nodes.length ||
        oldEdges.length !== edges.length ||
        oldNodeValues !== JSON.stringify(nodeValues) ||
        oldNodeSettings !== JSON.stringify(nodeSettings))
    ) {
      setOldNodes(nodes);
      setOldEdges(edges);
      setOldNodeValues(JSON.stringify(nodeValues));
      setOldNodeSettings(JSON.stringify(nodeSettings));
      updateValues();
    }

    const simplifyNodes = (node: Node): Node => ({
      id: node.id,
      type: node.type,
      position: {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      },
      data: {},
    });

    if (
      !loading &&
      (JSON.stringify(originalGraphStructure.nodes.map(simplifyNodes)) !==
        JSON.stringify(nodes.map(simplifyNodes)) ||
        JSON.stringify(originalGraphStructure.edges) !==
          JSON.stringify(edges) ||
        JSON.stringify(originalGraphStructure.nodeData) !==
          JSON.stringify(nodeData) ||
        JSON.stringify(originalGraphStructure.nodeValues) !==
          JSON.stringify(nodeValues))
    ) {
      setUnsaved(true);
    } else if (!loading) {
      setUnsaved(false);
    }
  }, [loading, nodes, edges, nodeData, nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGraph = (initGraph: {
    nodes: Node[];
    edges: Edge[];
    nodeData: FullNodeData;
    nodeValues: NodeValues;
  }) => {
    console.debug('Loading graph');
    setLoading(true);
    for (const node of nodes) onNodesChange([{id: node.id, type: 'remove'}]);
    // Timeout to prevent nodes updating with missing data
    setTimeout(() => {
      setNodes(initGraph.nodes);
      setEdges(initGraph.edges);
      setNodeData(initGraph.nodeData);
      setNodeValues(initGraph.nodeValues);
      setOriginalGraphStructure(initGraph);
      setUnsaved(false);
      setLoading(false);
    }, 0);
  };

  useEffect(() => loadGraph(initGraph), [initGraph]); // eslint-disable-line react-hooks/exhaustive-deps

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
          typeMap[connection.source as string] === 'substitute') &&
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

  // Handle drop-in nodes
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
      let id = `dnd-${type}-${getId()}`;
      while (id in nodeMap) id = `dnd-${type}-${getId()}`; // To prevent duplicates from loading existing graph

      const initState = initNode(type);
      const newNode: Node = {id, type, position, data: {label: type}};

      setNodes(nodes => nodes.concat(newNode));
      setNodeValue(id, initState.value);
      setNodeTitle(id, initState.data.title);
      if (initState.data.settings) setNodeSettings(id, initState.data.settings);
    },
    [getId, nodeMap, reactFlowInstance, setNodes]
  );

  return (
    <NodeValuesContext.Provider value={{nodeValues, setNodeValue}}>
      <NodeDimensionsContext.Provider
        value={{nodeDimensions, setNodeDimensions}}
      >
        <NodeDataContext.Provider
          value={{nodeData, setNodeTitle, setNodeSettings}}
        >
          <div style={{width: '100%', height: '60vh'}}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={changes =>
                onNodesChange(
                  changes.filter(
                    change =>
                      change.type !== 'remove' ||
                      (nodeMap[change.id].type !== 'attainment' &&
                        nodeMap[change.id].type !== 'grade')
                  )
                )
              }
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              nodeTypes={nodeTypesMap}
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
          <Button onClick={format}>Format</Button>
          {unsaved && <p style={{display: 'inline'}}>Unsaved progress</p>}
          <Button
            variant={unsaved ? 'contained' : 'text'}
            onClick={() => {
              onSave({nodes, edges, nodeData, nodeValues});
              setOriginalGraphStructure({nodes, edges, nodeData, nodeValues});
              setUnsaved(false);
            }}
          >
            Save
          </Button>
        </NodeDataContext.Provider>
      </NodeDimensionsContext.Provider>
    </NodeValuesContext.Provider>
  );
};

export default Graph;
