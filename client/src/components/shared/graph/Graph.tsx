// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Alert, Button, Divider, Tooltip, Typography} from '@mui/material';
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
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker} from 'react-router-dom';
import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import './flow.scss'; // Import styles
import {CoursePartData, CoursePartGradesData} from '@/common/types';
import {
  CoursePartNodeValue,
  CustomNodeTypes,
  DropInNodes,
  FullNodeData,
  GraphStructure,
  NodeSettings,
  NodeValue,
  NodeValues,
} from '@/common/types/graph';
import {calculateNewNodeValues, initNode} from '@/common/util/calculateGraph';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {
  ExtraNodeData,
  ExtraNodeDataContext,
  NodeDataContext,
  NodeValuesContext,
} from '@/context/GraphProvider';
import {GradeSelectOption, findBestGrade} from '@/utils/bestGrade';
import CoursePartValuesDialog from './CoursePartValuesDialog';
import SelectCoursePartsDialog from './SelectCoursePartsDialog';
import {findDisconnectedEdges, formatGraph} from './graphUtil';
import AdditionNode from './nodes/AdditionNode';
import AverageNode from './nodes/AverageNode';
import CoursePartNode from './nodes/CoursePartNode';
import GradeNode from './nodes/GradeNode';
import MaxNode from './nodes/MaxNode';
import MinPointsNode from './nodes/MinPointsNode';
import RequireNode from './nodes/RequireNode';
import RoundNode from './nodes/RoundNode';
import StepperNode from './nodes/StepperNode';
import SubstituteNode from './nodes/SubstituteNode';

const nodeTypesMap = {
  addition: AdditionNode,
  coursepart: CoursePartNode,
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
  courseParts: {id: number; name: string; archived: boolean}[];
  userGrades: CoursePartGradesData[] | null;
  gradeSelectOption?: GradeSelectOption;
  onSave?: (graphStructure: GraphStructure) => Promise<void>;
  readOnly?: boolean;
  modelHasFinalGrades?: boolean;
};
const Graph = ({
  initGraph,
  courseParts,
  userGrades,
  gradeSelectOption,
  onSave: onParentSave,
  readOnly = false,
  modelHasFinalGrades = false,
}: GraphProps): JSX.Element => {
  const {t} = useTranslation();
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
  const [selected, setSelected] = useState<Node[]>([]);
  const [coursePartsSelectOpen, setCoursePartsSelectOpen] =
    useState<boolean>(false);
  const [coursePartValuesOpen, setCoursePartValuesOpen] =
    useState<boolean>(false);
  // Course part nodes that the user is allowed to delete
  const [delCourseParts, setDelCourseParts] = useState<string[]>([]);
  const [originalGraphStructure, setOriginalGraphStructure] =
    useState<GraphStructure>({nodes: [], edges: [], nodeData: {}});

  const dragAndDropNodes: {
    type: DropInNodes;
    title: string;
    tooltip: string;
  }[] = [
    {
      type: 'addition',
      title: t('shared.graph.node.add'),
      tooltip: t('shared.graph.node.add-tooltip'),
    },
    {
      type: 'average',
      title: t('shared.graph.node.average'),
      tooltip: t('shared.graph.node.average-tooltip'),
    },
    {
      type: 'stepper',
      title: t('shared.graph.node.stepper'),
      tooltip: t('shared.graph.node.stepper-tooltip'),
    },
    {
      type: 'minpoints',
      title: t('shared.graph.node.min'),
      tooltip: t('shared.graph.node.min-tooltip'),
    },
    {
      type: 'max',
      title: t('shared.graph.node.max'),
      tooltip: t('shared.graph.node.max-tooltip'),
    },
    {
      type: 'require',
      title: t('shared.graph.node.require'),
      tooltip: t('shared.graph.node.require-tooltip'),
    },
    {
      type: 'round',
      title: t('shared.graph.node.round'),
      tooltip: t('shared.graph.node.round-tooltip'),
    },
    {
      type: 'substitute',
      title: t('shared.graph.node.substitute'),
      tooltip: t('shared.graph.node.substitute-tooltip'),
    },
  ];

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
        newEdges ?? edges
      );
      const filteredEdges = (newEdges ?? edges).filter(
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
      // Check for deleted & archived course parts (edit extra data)
      for (const node of initGraph.nodes) {
        if (node.type !== 'coursepart') continue;
        const coursePartId = parseInt(node.id.split('-')[1]);

        const nodeCoursePart = courseParts.find(
          coursePart => coursePart.id === coursePartId
        );
        if (nodeCoursePart === undefined) {
          setExtraNodeData(oldExtraNodeData => ({
            ...oldExtraNodeData,
            [node.id]: {
              ...oldExtraNodeData[node.id],
              warning: t('shared.graph.part-deleted'),
            },
          }));
          setDelCourseParts(oldDelCourseParts =>
            oldDelCourseParts.concat(node.id)
          );
        } else if (nodeCoursePart.archived) {
          setExtraNodeData(oldExtraNodeData => ({
            ...oldExtraNodeData,
            [node.id]: {
              ...oldExtraNodeData[node.id],
              warning: t('shared.graph.part-archived'),
            },
          }));
          setDelCourseParts(oldArchivedCourseParts =>
            oldArchivedCourseParts.concat(node.id)
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

    for (const coursePart of userGrades) {
      const coursePartId = `coursepart-${coursePart.coursePartId}`;
      if (!(coursePartId in newNodeValues)) continue;

      const newValue = newNodeValues[coursePartId] as CoursePartNodeValue;
      const bestGrade =
        coursePart.grades.length === 0
          ? 0
          : findBestGrade(coursePart.grades, {gradeSelectOption})!.grade;
      if (newValue.value !== bestGrade) {
        newValue.source = bestGrade;
        change = true;
      }
    }
    if (change) setNodeValues(newNodeValues);
  }, [gradeSelectOption, loading, nodeValues, userGrades]);

  const onSave = async (): Promise<void> => {
    if (onParentSave === undefined) return;

    let confirmation = true;
    if (modelHasFinalGrades) {
      confirmation = await AsyncConfirmationModal({
        title: t('shared.graph.saving'),
        message: t('shared.graph.has-final-grades-message'),
      });
    }
    if (confirmation) {
      enqueueSnackbar(t('graph.saving'), {variant: 'info'});
      await onParentSave({nodes, edges, nodeData});
      enqueueSnackbar(t('shared.graph.saved'), {variant: 'success'});
      setOriginalGraphStructure(structuredClone({nodes, edges, nodeData}));
      setUnsaved(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(oldEdges => addEdge(params, oldEdges));
      updateValues(addEdge(params, edges));
    },
    [edges, setEdges, updateValues]
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Check for conflicting edges
      for (const edge of edges) {
        // If connection doesn't have specific target handle and connection to the target already exists
        if (!connection.targetHandle && edge.target === connection.target)
          return false;

        // If connection to target handle already exists
        if (
          edge.target === connection.target &&
          edge.targetHandle &&
          edge.targetHandle === connection.targetHandle
        )
          return false;

        // If connection from source handle to target node already exists
        if (
          edge.source === connection.source &&
          edge.sourceHandle === connection.sourceHandle &&
          edge.target === connection.target
        ) {
          return false;
        }
      }

      // Helper map for finding cycles
      const nextNodes: {[key: string]: Node[]} = {};
      for (const edge of edges) {
        if (!(edge.source in nextNodes)) nextNodes[edge.source] = [];
        nextNodes[edge.source].push(
          nodes.find(node => node.id === edge.target) as Node
        );
      }

      // Try to find route from target node back to source node
      const hasCycle = (node: Node, visited = new Set()): boolean => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);

        if (!(node.id in nextNodes)) return false;
        for (const nextNode of nextNodes[node.id]) {
          if (nextNode.id === connection.source) return true;
          if (hasCycle(nextNode, visited)) return true;
        }
        return false;
      };

      const targetNode = nodes.find(node => node.id === connection.target)!;

      // Don't allow connections from a node back to itself
      if (targetNode.id === connection.source) return false;
      return !hasCycle(targetNode);
    },
    [nodes, edges]
  );

  const format = async (): Promise<void> => {
    setNodes(await formatGraph(nodes, edges, nodeValues));
  };

  const handleCoursePartSelect = (
    newCourseParts: CoursePartData[],
    removedCourseParts: CoursePartData[]
  ): void => {
    setCoursePartsSelectOpen(false);

    let newNodes = [...nodes];
    let newEdges = [...edges];
    const newNodeValues = {...nodeValues};
    const newNodeData = {...nodeData};

    for (const coursePart of newCourseParts) {
      newNodes.push({
        id: `coursepart-${coursePart.id}`,
        type: 'coursepart',
        position: {x: 0, y: 100 * newNodes.length},
        data: {},
      });
      newNodeData[`coursepart-${coursePart.id}`] = {
        title: coursePart.name,
        settings: {minPoints: 0, onFailSetting: 'coursefail'},
      };
      newNodeValues[`coursepart-${coursePart.id}`] =
        initNode('coursepart').value;
    }

    for (const coursePart of removedCourseParts) {
      const nodeId = `coursepart-${coursePart.id}`;
      newNodes = newNodes.filter(newNode => newNode.id !== nodeId);
      newEdges = newEdges.filter(newEdge => newEdge.source !== nodeId);
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setNodeData(newNodeData);
    setNodeValues(newNodeValues);
    if (newCourseParts.length > 0) {
      setTimeout(() => {
        reactFlowInstance?.fitView();
      }, 0);
    }
  };

  const handleSetCoursePartValues = (coursePartValues: {
    [key: number]: number;
  }): void => {
    const newNodeValues = {...nodeValues};
    for (const [coursePartId, value] of Object.entries(coursePartValues)) {
      const nodeValue = newNodeValues[`coursepart-${coursePartId}`];
      if (nodeValue.type === 'coursepart') nodeValue.source = value;
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
      <UnsavedChangesDialog blocker={blocker} />
      <SelectCoursePartsDialog
        nodes={nodes}
        courseParts={courseParts}
        open={coursePartsSelectOpen}
        handleCoursePartSelect={handleCoursePartSelect}
        onClose={() => setCoursePartsSelectOpen(false)}
      />
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
        {unsaved && modelHasFinalGrades && (
          <Tooltip title={t('shared.graph.has-final-grades-message')}>
            <Alert
              sx={{
                position: 'absolute',
                top: 70,
                right: 10,
                zIndex: 1,
              }}
              severity="warning"
            >
              {t('graph.has-final-grades')}
            </Alert>
          </Tooltip>
        )}
        {courseFail && (
          <Alert
            sx={{
              position: 'absolute',
              top:
                Number(unsaved) * 60 +
                Number(unsaved && modelHasFinalGrades) * 60 +
                10,
              right: 10,
              zIndex: 1,
            }}
            severity="warning"
            // variant="outlined"
          >
            {t('shared.graph.course-failed')}
          </Alert>
        )}
      </div>
      <div style={{position: 'relative'}}>
        {selected.length > 0 && (
          <Button
            onClick={() => {
              onNodesChange(
                selected.map(node => ({type: 'remove', id: node.id}))
              );
            }}
            variant="contained"
            color="error"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1,
            }}
          >
            {t('shared.graph.delete-node', {count: selected.length})}
          </Button>
        )}
      </div>
      <CoursePartValuesDialog
        nodes={nodes}
        nodeValues={nodeValues}
        courseParts={courseParts}
        open={coursePartValuesOpen}
        onClose={() => setCoursePartValuesOpen(false)}
        handleSetCoursePartValues={handleSetCoursePartValues}
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
                        delCourseParts.includes(change.id) ||
                        (nodeMap[change.id].type !== 'coursepart' &&
                          nodeMap[change.id].type !== 'grade')
                    )
                  )
                }
                onSelectionChange={changes => setSelected(changes.nodes)}
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
                deleteKeyCode={['Backspace', 'Delete']}
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
            {!readOnly && onParentSave !== undefined && (
              <>
                <div style={{marginBottom: '5px'}}>
                  {dragAndDropNodes.map(dragAndDropNode => (
                    <Tooltip title={dragAndDropNode.tooltip} placement="top">
                      <div
                        key={dragAndDropNode.type}
                        className="dnd-node"
                        onDragStart={event =>
                          onDragStart(event, dragAndDropNode.type)
                        }
                        draggable
                      >
                        {dragAndDropNode.title}
                      </div>
                    </Tooltip>
                  ))}
                </div>
                <Divider sx={{my: 1}} />
                <div style={{float: 'left'}}>
                  <Button
                    onClick={() => setCoursePartsSelectOpen(true)}
                    variant="outlined"
                  >
                    {t('general.select-course-parts')}
                  </Button>
                  <Button
                    onClick={() => setCoursePartValuesOpen(true)}
                    variant="outlined"
                    sx={{ml: 1}}
                  >
                    {t('shared.graph.test-values')}
                  </Button>
                  <Button onClick={format} variant="outlined" sx={{ml: 1}}>
                    {t('shared.graph.format')}
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
                      {t('general.unsaved-changes')}
                    </Typography>
                  )}
                  <Button
                    variant={unsaved ? 'contained' : 'text'}
                    onClick={onSave}
                    sx={{float: 'right'}}
                  >
                    {t('general.save')}
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
