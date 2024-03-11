// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Button, Divider, Typography} from '@mui/material';
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

import {AttainmentData} from '@common/types';
import {
  CustomNodeTypes,
  DropInNodes,
  FullNodeData,
  GraphStructure,
  NodeSettings,
  NodeValue,
  NodeValues,
} from '@common/types/graph';
import {calculateNewNodeValues, initNode} from '@common/util/calculateGraph';
import {
  ExtraNodeData,
  ExtraNodeDataContext,
  NodeDataContext,
  NodeValuesContext,
} from '../../context/GraphProvider';
import AdditionNode from './AdditionNode';
import AttanmentNode from './AttainmentNode';
import AverageNode from './AverageNode';
import GradeNode from './GradeNode';
import MaxNode from './MaxNode';
import MinPointsNode from './MinPointsNode';
import RequireNode from './RequireNode';
import SelectAttainmentsDialog from './SelectAttainmentsDialog';
import StepperNode from './StepperNode';
import SubstituteNode from './SubstituteNode';
import './flow.css';
import {findDisconnectedEdges, formatGraph} from './graphUtil';

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
  attainments,
  onSave,
}: {
  initGraph: GraphStructure;
  attainments: AttainmentData[];
  onSave: (graphStructure: GraphStructure) => void;
}): JSX.Element => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeData, setNodeData] = useState<FullNodeData>({});
  const [extraNodeData, setExtraNodeData] = useState<ExtraNodeData>({});
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
  const [attainmentsSelectOpen, setAttainmentsSelectOpen] =
    useState<boolean>(false);
  const [archivedAttainments, setArchivedAttainments] = useState<string[]>([]);
  const [originalGraphStructure, setOriginalGraphStructure] =
    useState<GraphStructure>({nodes: [], edges: [], nodeData: {}});

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
    setExtraNodeData(oldExtraNodeData => ({
      ...oldExtraNodeData,
      [id]: {...oldExtraNodeData[id], dimensions: {width, height}},
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
          JSON.stringify(nodeData))
    ) {
      setUnsaved(true);
    } else if (!loading) {
      setUnsaved(false);
    }
  }, [loading, nodes, edges, nodeData, nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warning if leaving with unsaved
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsaved]);

  useEffect(() => {
    console.debug('Loading graph');
    setLoading(true);

    for (const node of nodes) onNodesChange([{id: node.id, type: 'remove'}]);

    // Timeout to prevent nodes updating with missing data
    setTimeout(() => {
      // Check for archived attainments
      const attainmentIds = attainments.map(attainment => attainment.id);
      for (const node of initGraph.nodes) {
        if (node.type !== 'attainment') continue;
        const attainmentId = parseInt(node.id.split('-')[1]);

        if (!attainmentIds.includes(attainmentId)) {
          setExtraNodeData(oldExtraNodeData => ({
            ...oldExtraNodeData,
            [node.id]: {
              ...oldExtraNodeData[node.id],
              warning: 'Attainment has been deleted',
            },
          }));
          setArchivedAttainments(oldArchivedAttainments =>
            oldArchivedAttainments.concat(node.id)
          );
        }
      }

      // Load initGraph
      const initNodeValues: {[key: string]: NodeValue} = {};
      for (const node of initGraph.nodes)
        initNodeValues[node.id] = initNode(
          node.type as CustomNodeTypes,
          node.id,
          initGraph.edges
        ).value;

      setNodes(initGraph.nodes);
      setEdges(initGraph.edges);
      setNodeData(initGraph.nodeData);
      setNodeValues(initNodeValues);

      setOriginalGraphStructure(initGraph);
      setUnsaved(false);
      setLoading(false);
      reactFlowInstance?.fitView();
    }, 0);
  }, [initGraph]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setNodes(await formatGraph(nodes, edges, extraNodeData, nodeValues));
  };

  const handleAttainmentSelect = (
    newAttainments: AttainmentData[],
    removedAttainments: AttainmentData[]
  ) => {
    setAttainmentsSelectOpen(false);

    let newNodes = [...nodes];
    let newEdges = [...edges];
    const newNodeValues = {...nodeValues};
    const newNodeData = {...nodeData};

    for (const attainment of newAttainments) {
      newNodes.push({
        id: `attainment-${attainment.id}`,
        type: 'attainment',
        position: {x: 0, y: 100 * newNodes.length},
        data: {},
      });
      newNodeData[`attainment-${attainment.id}`] = {
        title: attainment.name,
      };
      newNodeValues[`attainment-${attainment.id}`] =
        initNode('attainment').value;
    }

    for (const attainment of removedAttainments) {
      const nodeId = `attainment-${attainment.id}`;
      newNodes = newNodes.filter(nnode => nnode.id !== nodeId);
      newEdges = newEdges.filter(edge => edge.source !== nodeId);
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setNodeData(newNodeData);
    setNodeValues(newNodeValues);
    if (newAttainments.length > 0) {
      setTimeout(() => {
        reactFlowInstance?.fitView();
      }, 0);
    }
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
      const newNode: Node = {id, type, position, data: {}};

      setNodes(nodes => nodes.concat(newNode));
      setNodeValue(id, initState.value);
      setNodeTitle(id, initState.data.title);
      if (initState.data.settings) setNodeSettings(id, initState.data.settings);
    },
    [getId, nodeMap, reactFlowInstance, setNodes]
  );

  return (
    <>
      <SelectAttainmentsDialog
        nodes={nodes}
        attainments={attainments}
        open={attainmentsSelectOpen}
        onClose={handleAttainmentSelect}
      />
      <NodeValuesContext.Provider value={{nodeValues, setNodeValue}}>
        <ExtraNodeDataContext.Provider
          value={{extraNodeData, setNodeDimensions}}
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
                        archivedAttainments.includes(change.id) ||
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
                onError={(i, m) => i !== '008' && console.warn(m)} // Ignore couldn't create edge warnings
                fitView
              >
                <Controls />
                <MiniMap />
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={12}
                  size={1}
                />
              </ReactFlow>
            </div>
            <Divider />
            <div style={{marginBottom: '5px'}}>
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
            </div>
            <div style={{float: 'left', marginLeft: '5px'}}>
              <Button onClick={() => setAttainmentsSelectOpen(true)}>
                Select Attainments
              </Button>
              <Button onClick={format}>Format</Button>
            </div>
            <div
              style={{
                float: 'right',
                marginBottom: '5px',
                marginRight: '5px',
                display: 'flex',
              }}
            >
              {unsaved && (
                <Typography
                  sx={{display: 'inline', alignSelf: 'center', mr: 1}}
                >
                  Unsaved progress
                </Typography>
              )}
              <Button
                variant={unsaved ? 'contained' : 'text'}
                onClick={() => {
                  onSave({nodes, edges, nodeData});
                  setOriginalGraphStructure({nodes, edges, nodeData});
                  setUnsaved(false);
                }}
                sx={{float: 'right'}}
              >
                Save
              </Button>
            </div>
          </NodeDataContext.Provider>
        </ExtraNodeDataContext.Provider>
      </NodeValuesContext.Provider>
    </>
  );
};

export default Graph;
