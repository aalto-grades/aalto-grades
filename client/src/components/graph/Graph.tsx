// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Alert, Button, Divider, Typography} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {
  DragEvent,
  DragEventHandler,
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useBlocker} from 'react-router-dom';
import {
  ReactFlow,
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

import {AttainmentData, AttainmentGradesData} from '@/common/types';
import {
  AttainmentNodeValue,
  CustomNodeTypes,
  DropInNodes,
  FullNodeData,
  GraphStructure,
  NodeSettings,
  NodeValue,
  NodeValues,
} from '@/common/types/graph';
import {calculateNewNodeValues, initNode} from '@/common/util/calculateGraph';
import AdditionNode from './AdditionNode';
import AttanmentNode from './AttainmentNode';
import AttainmentValuesDialog from './AttainmentValuesDialog';
import AverageNode from './AverageNode';
import GradeNode from './GradeNode';
import MaxNode from './MaxNode';
import MinPointsNode from './MinPointsNode';
import RequireNode from './RequireNode';
import RoundNode from './RoundNode';
import SelectAttainmentsDialog from './SelectAttainmentsDialog';
import StepperNode from './StepperNode';
import SubstituteNode from './SubstituteNode';
import './flow.scss';
import {findDisconnectedEdges, formatGraph} from './graphUtil';
import {
  ExtraNodeData,
  ExtraNodeDataContext,
  NodeDataContext,
  NodeValuesContext,
} from '../../context/GraphProvider';
import {GradeSelectOption, findBestGrade} from '../../utils';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

const nodeTypesMap = {
  addition: AdditionNode,
  attainment: AttanmentNode,
  average: AverageNode,
  grade: GradeNode,
  max: MaxNode,
  minpoints: MinPointsNode,
  require: RequireNode,
  round: RoundNode,
  stepper: StepperNode,
  substitute: SubstituteNode,
};

type GraphProps = {
  initGraph: GraphStructure;
  attainments: {id: number; name: string; archived: boolean}[];
  userGrades: AttainmentGradesData[] | null;
  gradeSelectOption?: GradeSelectOption;
  onSave?: (graphStructure: GraphStructure) => Promise<void>;
  readOnly?: boolean;
};
const Graph = ({
  initGraph,
  attainments,
  userGrades,
  gradeSelectOption,
  onSave,
  readOnly = false,
}: GraphProps): JSX.Element => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeData, setNodeData] = useState<FullNodeData>({});
  const [extraNodeData, setExtraNodeData] = useState<ExtraNodeData>({});
  const [nodeValues, setNodeValues] = useState<NodeValues>({});
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [savedNodes, setSavedNodes] = useState<Node[] | null>(null);
  const [savedEdges, setSavedEdges] = useState<Edge[] | null>(null);
  const [savedNodeSettings, setSavedNodeSettings] = useState<{
    [key: string]: NodeSettings | undefined;
  } | null>(null);
  const [savedNodeValues, setSavedNodeValues] = useState<NodeValues | null>(
    null
  );

  const [unsaved, setUnsaved] = useState<boolean>(false);
  const [attainmentsSelectOpen, setAttainmentsSelectOpen] =
    useState<boolean>(false);
  const [attainmentValuesOpen, setAttainmentValuesOpen] =
    useState<boolean>(false);
  const [delAttainments, setDelAttainments] = useState<string[]>([]); // Attainment nodes that the user is allowed to delete
  const [originalGraphStructure, setOriginalGraphStructure] =
    useState<GraphStructure>({nodes: [], edges: [], nodeData: {}});

  const nodeMap = useMemo<{[key: string]: Node}>(() => {
    const newMap: {[key: string]: Node} = {};
    for (const node of nodes) newMap[node.id] = node;
    return newMap;
  }, [nodes]);

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      unsaved && currentLocation.pathname !== nextLocation.pathname
  );

  const setNodeTitle = (id: string, title: string): void => {
    setNodeData(oldNodeData => ({
      ...oldNodeData,
      [id]: {
        ...oldNodeData[id],
        title,
      },
    }));
  };
  const setNodeSettings = (id: string, settings: NodeSettings): void => {
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
      setSavedNodeValues(structuredClone(newNodeValues));
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
      (savedNodes?.length !== nodes.length ||
        savedEdges?.length !== edges.length ||
        JSON.stringify(savedNodeValues) !== JSON.stringify(nodeValues) ||
        JSON.stringify(savedNodeSettings) !== JSON.stringify(nodeSettings))
    ) {
      setSavedNodes(structuredClone(nodes));
      setSavedEdges(structuredClone(edges));
      setSavedNodeValues(structuredClone(nodeValues));
      setSavedNodeSettings(structuredClone(nodeSettings));
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
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsaved]);

  // Load graph for the first time
  useEffect(() => {
    console.debug('Loading graph');
    setLoading(true);

    for (const node of nodes) onNodesChange([{id: node.id, type: 'remove'}]);

    // Timeout to prevent nodes updating with missing data
    setTimeout(() => {
      // Check for deleted & archived attainments (edit extra data)
      for (const node of initGraph.nodes) {
        if (node.type !== 'attainment') continue;
        const attainmentId = parseInt(node.id.split('-')[1]);

        const attainment = attainments.find(att => att.id === attainmentId);
        if (attainment === undefined) {
          setExtraNodeData(oldExtraNodeData => ({
            ...oldExtraNodeData,
            [node.id]: {
              ...oldExtraNodeData[node.id],
              warning: 'Attainment has been deleted',
            },
          }));
          setDelAttainments(oldDelAttainments =>
            oldDelAttainments.concat(node.id)
          );
        } else if (attainment.archived) {
          setExtraNodeData(oldExtraNodeData => ({
            ...oldExtraNodeData,
            [node.id]: {
              ...oldExtraNodeData[node.id],
              warning: 'Attainment is archived',
            },
          }));
          setDelAttainments(oldArchivedAttainments =>
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

      setOriginalGraphStructure(structuredClone(initGraph));
      setUnsaved(false);
      setLoading(false);
      reactFlowInstance?.fitView();
    }, 50);
  }, [initGraph]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading || userGrades === null) return;
    const newNodeValues = {...nodeValues};
    let change = false;

    for (const attainment of userGrades) {
      const attId = `attainment-${attainment.attainmentId}`;
      if (!(attId in newNodeValues)) continue;

      const newValue = newNodeValues[attId] as AttainmentNodeValue;
      const bestGrade =
        attainment.grades.length === 0
          ? 0
          : findBestGrade(attainment.grades, {gradeSelectOption})!.grade;
      if (newValue.value !== bestGrade) {
        newValue.source = bestGrade;
        change = true;
      }
    }
    if (change) setNodeValues(newNodeValues);
  }, [gradeSelectOption, loading, nodeValues, userGrades]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(oldEdges => addEdge(params, oldEdges));
      updateValues(addEdge(params, edges));
    },
    [edges, setEdges, updateValues]
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

      const hasCycle = (node: Node, visited = new Set()): boolean => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);

        if (!(node.id in outgoers)) return false;
        for (const outgoer of outgoers[node.id]) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
        return false;
      };

      if (target.id === connection.source) return false;
      return !hasCycle(target);
    },
    [nodes, edges]
  );

  const format = async (): Promise<void> => {
    setNodes(await formatGraph(nodes, edges, extraNodeData, nodeValues));
  };

  const handleAttainmentSelect = (
    newAttainments: AttainmentData[],
    removedAttainments: AttainmentData[]
  ): void => {
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
        settings: {minPoints: 0, onFailSetting: 'coursefail'},
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

  const handleSetAttainmentValues = (attainmentValues: {
    [key: number]: number;
  }): void => {
    const newNodeValues = {...nodeValues};
    for (const [attId, value] of Object.entries(attainmentValues)) {
      const nodeValue = newNodeValues[`attainment-${attId}`];
      if (nodeValue.type === 'attainment') nodeValue.source = value;
    }
    setNodeValues(newNodeValues);
  };

  // Handle drop-in nodes
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: DropInNodes
  ): void => {
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

      const type = event.dataTransfer.getData('application/reactflow') as
        | DropInNodes
        | '';

      if (typeof type === 'undefined' || !type || reactFlowInstance === null) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      let nodeId = `dnd-${type}-${getId()}`;
      while (nodeId in nodeMap) nodeId = `dnd-${type}-${getId()}`; // To prevent duplicates from loading existing graph

      const initState = initNode(type);
      const newNode: Node = {id: nodeId, type, position, data: {}};

      setNodes(oldNodes => oldNodes.concat(newNode));
      setNodeValues(oldNodeValues => ({
        ...oldNodeValues,
        [nodeId]: initState.value,
      }));
      setNodeTitle(nodeId, initState.data.title);
      if (initState.data.settings)
        setNodeSettings(nodeId, initState.data.settings);
    },
    [getId, nodeMap, reactFlowInstance, setNodes]
  );

  const courseFail = Object.values(nodeValues).find(
    nodeVal => 'courseFail' in nodeVal && nodeVal.courseFail
  );
  return (
    <>
      <div style={{position: 'relative'}}>
        {unsaved && (
          <Alert
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1,
            }}
            severity="info"
            // variant="outlined"
          >
            Unsaved changes
          </Alert>
        )}
        {courseFail && (
          <Alert
            sx={{
              position: 'absolute',
              top: unsaved ? 70 : 10,
              right: 10,
              zIndex: 1,
            }}
            severity="warning"
            // variant="outlined"
          >
            Course failed
          </Alert>
        )}
      </div>
      <UnsavedChangesDialog
        open={blocker.state === 'blocked'}
        onClose={blocker.reset ?? (() => {})}
        handleDiscard={blocker.proceed ?? (() => {})}
        dontCloseOnDiscard
      />
      <SelectAttainmentsDialog
        nodes={nodes}
        attainments={attainments}
        open={attainmentsSelectOpen}
        handleAttainmentSelect={handleAttainmentSelect}
        onClose={() => setAttainmentsSelectOpen(false)}
      />
      <AttainmentValuesDialog
        nodes={nodes}
        nodeValues={nodeValues}
        attainments={attainments}
        open={attainmentValuesOpen}
        onClose={() => setAttainmentValuesOpen(false)}
        handleSetAttainmentValues={handleSetAttainmentValues}
      />
      <NodeValuesContext.Provider value={{nodeValues}}>
        <ExtraNodeDataContext.Provider value={{extraNodeData}}>
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
                        delAttainments.includes(change.id) ||
                        (nodeMap[change.id].type !== 'attainment' &&
                          nodeMap[change.id].type !== 'grade')
                    )
                  )
                }
                minZoom={0.25}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                nodeTypes={nodeTypesMap}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onError={(i, m) => i !== '008' && console.warn(m)} // Ignore "couldn't create edge" warnings
                fitView
                elementsSelectable={!readOnly}
                nodesConnectable={!readOnly}
                nodesDraggable={!readOnly}
              >
                {!readOnly && <Controls />}
                <MiniMap />
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={12}
                  size={1}
                />
              </ReactFlow>
            </div>
            {!readOnly && onSave !== undefined && (
              <>
                <div style={{marginBottom: '5px'}}>
                  <div
                    className="dndnode"
                    onDragStart={event => onDragStart(event, 'addition')}
                    draggable
                  >
                    Addition
                  </div>
                  <div
                    className="dndnode"
                    onDragStart={event => onDragStart(event, 'average')}
                    draggable
                  >
                    Average
                  </div>
                  <div
                    className="dndnode"
                    onDragStart={event => onDragStart(event, 'stepper')}
                    draggable
                  >
                    Stepper
                  </div>
                  <div
                    className="dndnode"
                    onDragStart={event => onDragStart(event, 'minpoints')}
                    draggable
                  >
                    Require Minimum Points
                  </div>
                  <div
                    className="dndnode"
                    onDragStart={event => onDragStart(event, 'max')}
                    draggable
                  >
                    Maximum
                  </div>
                  <div
                    className="dndnode"
                    onDragStart={event => onDragStart(event, 'require')}
                    draggable
                  >
                    Require Passing Values
                  </div>
                  <div
                    className="dndnode"
                    onDragStart={event => onDragStart(event, 'round')}
                    draggable
                  >
                    Round
                  </div>
                  <div
                    className="dndnode"
                    onDragStart={event => onDragStart(event, 'substitute')}
                    draggable
                  >
                    Substitute
                  </div>
                </div>
                <Divider sx={{my: 1}} />
                <div style={{float: 'left'}}>
                  <Button
                    onClick={() => setAttainmentsSelectOpen(true)}
                    variant="outlined"
                  >
                    Select Attainments
                  </Button>
                  <Button
                    onClick={() => setAttainmentValuesOpen(true)}
                    variant="outlined"
                    sx={{ml: 1}}
                  >
                    Test values
                  </Button>
                  <Button onClick={format} variant="outlined" sx={{ml: 1}}>
                    Format
                  </Button>
                </div>
                <div
                  style={{
                    float: 'right',
                    display: 'flex',
                    marginTop: '5px',
                  }}
                >
                  {unsaved && (
                    <Typography
                      sx={{display: 'inline', alignSelf: 'center', mr: 1}}
                    >
                      Unsaved changes
                    </Typography>
                  )}
                  <Button
                    variant={unsaved ? 'contained' : 'text'}
                    onClick={async () => {
                      enqueueSnackbar('Saving model.', {
                        variant: 'info',
                      });
                      await onSave({nodes, edges, nodeData});
                      enqueueSnackbar('Model saved successfully.', {
                        variant: 'success',
                      });
                      setOriginalGraphStructure(
                        structuredClone({nodes, edges, nodeData})
                      );
                      setUnsaved(false);
                    }}
                    sx={{float: 'right'}}
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </NodeDataContext.Provider>
        </ExtraNodeDataContext.Provider>
      </NodeValuesContext.Provider>
    </>
  );
};

export default Graph;
