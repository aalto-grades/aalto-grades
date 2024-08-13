// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Alert, Button, Divider, Tooltip, Typography} from '@mui/material';
import {TFunction} from 'i18next';
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
import {
  findDisconnectedEdges,
  formatGraph,
  getDragAndDropNodes,
  isValidConnection,
  simplifyNode,
} from './graphUtil';
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

// Load graph for the first time
const initGraphFn = (
  initGraph: GraphStructure,
  courseParts: {id: number; name: string; archived: boolean}[],
  t: TFunction<'translation', undefined>
): {initNodeValues: NodeValues; extraNodeData: ExtraNodeData} => {
  // Check for deleted & archived course parts (edit extra data)
  const extraNodeData: ExtraNodeData = {};
  for (const node of initGraph.nodes) {
    if (node.type !== 'coursepart') continue;
    const coursePartId = parseInt(node.id.split('-')[1]);

    const nodeCoursePart = courseParts.find(
      coursePart => coursePart.id === coursePartId
    );
    if (nodeCoursePart === undefined) {
      extraNodeData[node.id] = {warning: t('graph.part-deleted')};
    } else if (nodeCoursePart.archived) {
      extraNodeData[node.id] = {warning: t('graph.part-archived')};
    }
  }

  // Load initGraph
  const initNodeValues = Object.fromEntries(
    initGraph.nodes.map(node => [
      node.id,
      initNode(node.type as CustomNodeTypes, node.id, initGraph.edges).value,
    ])
  );

  return {initNodeValues, extraNodeData};
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

  const {initNodeValues, extraNodeData} = useMemo(
    () => initGraphFn(initGraph, courseParts, t),
    [courseParts, initGraph, t]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initGraph.edges);
  const [nodeData, setNodeData] = useState<FullNodeData>(initGraph.nodeData);
  const [nodeValues, setNodeValues] = useState<NodeValues>(initNodeValues);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Used to check for changes
  const [lastState, setLastState] = useState<{
    nodes: Node[];
    edges: Edge[];
    nodeSettings: {[key: string]: NodeSettings | undefined};
    nodeValues: NodeValues;
  } | null>(null);

  const [selected, setSelected] = useState<Node[]>([]);
  const [coursePartsSelectOpen, setCoursePartsSelectOpen] =
    useState<boolean>(false);
  const [coursePartValuesOpen, setCoursePartValuesOpen] =
    useState<boolean>(false);
  const [originalGraphStructure, setOriginalGraphStructure] =
    useState<GraphStructure>(initGraph);

  const unsaved =
    JSON.stringify(originalGraphStructure.nodes.map(simplifyNode)) !==
      JSON.stringify(nodes.map(simplifyNode)) ||
    JSON.stringify(originalGraphStructure.edges) !== JSON.stringify(edges) ||
    JSON.stringify(originalGraphStructure.nodeData) !==
      JSON.stringify(nodeData);

  // Course part nodes that the user is allowed to delete
  const delCourseParts = useMemo(
    () =>
      initGraph.nodes
        .filter(node => {
          if (node.type !== 'coursepart') return false;
          const coursePartId = parseInt(node.id.split('-')[1]);

          const nodeCoursePart = courseParts.find(
            coursePart => coursePart.id === coursePartId
          );
          return nodeCoursePart === undefined || nodeCoursePart.archived;
        })
        .map(node => node.id),
    [courseParts, initGraph.nodes]
  );

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

      const newNodeValues: NodeValues = calculateNewNodeValues(
        nodeValues,
        nodeData,
        nodes,
        filteredEdges
      );
      setLastState(oldLastState => ({
        ...oldLastState!,
        nodeValues: newNodeValues,
      }));
      setNodeValues(newNodeValues);
      if (disconnectedEdges.length > 0) setEdges(filteredEdges);
    },
    [nodeValues, nodes, edges, nodeData, setEdges]
  );

  // Update node values when nodes/edges/values/settings change
  useEffect(() => {
    const nodeSettings = Object.fromEntries(
      Object.entries(nodeData).map(([key, {settings}]) => [key, settings])
    );

    if (
      lastState === null ||
      lastState.nodes.length !== nodes.length ||
      lastState.edges.length !== edges.length ||
      JSON.stringify(lastState.nodeValues) !== JSON.stringify(nodeValues) ||
      JSON.stringify(lastState.nodeSettings) !== JSON.stringify(nodeSettings)
    ) {
      setLastState(structuredClone({nodes, edges, nodeValues, nodeSettings}));
      updateValues();
    }
  }, [nodes, edges, nodeData, nodeValues, updateValues, lastState]);

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

  useEffect(() => {
    if (userGrades === null) return;
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
  }, [gradeSelectOption, nodeValues, userGrades]);

  const onSave = async (): Promise<void> => {
    if (onParentSave === undefined) return;

    let confirmation = true;
    if (modelHasFinalGrades) {
      confirmation = await AsyncConfirmationModal({
        title: t('graph.saving'),
        message: t('graph.has-final-grades-message'),
      });
    }
    if (confirmation) {
      enqueueSnackbar(t('graph.saving'), {variant: 'info'});
      await onParentSave({nodes, edges, nodeData});
      enqueueSnackbar(t('graph.saved'), {variant: 'success'});
      setOriginalGraphStructure(structuredClone({nodes, edges, nodeData}));
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(oldEdges => addEdge(params, oldEdges));
      updateValues(addEdge(params, edges));
    },
    [edges, setEdges, updateValues]
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
        settings: {minPoints: null, onFailSetting: 'coursefail'},
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
    const newNodeValues = structuredClone(nodeValues);
    for (const [coursePartId, value] of Object.entries(coursePartValues)) {
      const nodeValue = newNodeValues[`coursepart-${coursePartId}`];
      if (nodeValue.type === 'coursepart') nodeValue.source = value;
    }
    setNodeValues(newNodeValues);
  };

  const nodeTypeMap = Object.fromEntries(
    nodes.map(node => [node.id, node.type])
  );

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

      if (!type || reactFlowInstance === null) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      let nodeId = `dnd-${type}-${getId()}`;
      while (nodeId in nodeTypeMap) nodeId = `dnd-${type}-${getId()}`; // To prevent duplicates from loading existing graph

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
    [getId, nodeTypeMap, reactFlowInstance, setNodes]
  );

  const dragAndDropNodes = getDragAndDropNodes(t);
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
      <CoursePartValuesDialog
        nodes={nodes}
        nodeValues={nodeValues}
        courseParts={courseParts}
        open={coursePartValuesOpen}
        onClose={() => setCoursePartValuesOpen(false)}
        handleSetCoursePartValues={handleSetCoursePartValues}
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
          <Tooltip title={t('graph.has-final-grades-message')}>
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
            {t('graph.course-failed')}
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
            {selected.length > 1
              ? t('graph.delete-node.plural')
              : t('graph.delete-node.singular')}
          </Button>
        )}
      </div>
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
                        (nodeTypeMap[change.id] !== 'coursepart' &&
                          nodeTypeMap[change.id] !== 'grade')
                    )
                  )
                }
                onSelectionChange={changes => setSelected(changes.nodes)}
                minZoom={0.25}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={connection =>
                  isValidConnection(connection, edges)
                }
                nodeTypes={nodeTypesMap}
                onInit={flowInstance => {
                  setReactFlowInstance(flowInstance);
                  reactFlowInstance?.fitView();
                }}
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
                    <Tooltip
                      key={dragAndDropNode.type}
                      title={dragAndDropNode.tooltip}
                      placement="top"
                    >
                      <div
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
                    {t('graph.select-parts')}
                  </Button>
                  <Button
                    onClick={() => setCoursePartValuesOpen(true)}
                    variant="outlined"
                    sx={{ml: 1}}
                  >
                    {t('graph.test-values')}
                  </Button>
                  <Button onClick={format} variant="outlined" sx={{ml: 1}}>
                    {t('graph.format')}
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
