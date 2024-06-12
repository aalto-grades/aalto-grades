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
import AdditionNode from './AdditionNode';
import AverageNode from './AverageNode';
import CoursePartNode from './CoursePartNode';
import CoursePartValuesDialog from './CoursePartValuesDialog';
import GradeNode from './GradeNode';
import MaxNode from './MaxNode';
import MinPointsNode from './MinPointsNode';
import RequireNode from './RequireNode';
import RoundNode from './RoundNode';
import SelectCoursePartsDialog from './SelectCoursePartsDialog';
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
import {GradeSelectOption, findBestGrade} from '../../utils/bestGrade';
import SaveConfirmDialog from '../alerts/SaveConfirmDialog';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

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

const dragAndDropNodes: {type: DropInNodes; title: string}[] = [
  {type: 'addition', title: 'Addition'},
  {type: 'average', title: 'Average'},
  {type: 'stepper', title: 'Stepper'},
  {type: 'minpoints', title: 'Require Minimum Points'},
  {type: 'max', title: 'Maximum'},
  {type: 'require', title: 'Require Passing Values'},
  {type: 'round', title: 'Round'},
  {type: 'substitute', title: 'Substitute'},
];

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
  onSave,
  readOnly = false,
  modelHasFinalGrades = false,
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
  const [coursePartsSelectOpen, setCoursePartsSelectOpen] =
    useState<boolean>(false);
  const [coursePartValuesOpen, setCoursePartValuesOpen] =
    useState<boolean>(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState<boolean>(false);
  // Course part nodes that the user is allowed to delete
  const [delCourseParts, setDelCourseParts] = useState<string[]>([]);
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
              warning: 'Course part has been deleted',
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
              warning: 'Course part is archived',
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
      newNodes = newNodes.filter(nnode => nnode.id !== nodeId);
      newEdges = newEdges.filter(edge => edge.source !== nodeId);
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
      <UnsavedChangesDialog
        open={blocker.state === 'blocked'}
        onClose={blocker.reset ?? (() => {})}
        handleDiscard={blocker.proceed ?? (() => {})}
        dontCloseOnDiscard
      />
      <SelectCoursePartsDialog
        nodes={nodes}
        courseParts={courseParts}
        open={coursePartsSelectOpen}
        handleCoursePartSelect={handleCoursePartSelect}
        onClose={() => setCoursePartsSelectOpen(false)}
      />
      <SaveConfirmDialog
        open={saveConfirmOpen}
        onClose={() => setSaveConfirmOpen(false)}
        onSave={async () => {
          if (onSave === undefined) return;
          setSaveConfirmOpen(false);

          enqueueSnackbar('Saving model.', {
            variant: 'info',
          });
          await onSave({nodes, edges, nodeData});
          enqueueSnackbar('Model saved successfully.', {
            variant: 'success',
          });
          setOriginalGraphStructure(structuredClone({nodes, edges, nodeData}));
          setUnsaved(false);
        }}
        text={
          'There are final grades using this model. Editing it might cause ' +
          'accidentally overwriting old final grades.'
        }
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
          <Tooltip
            title={
              'There are final grades using this model. Editing it might cause ' +
              'accidentally overwriting old final grades.'
            }
          >
            <Alert
              sx={{
                position: 'absolute',
                top: 70,
                right: 10,
                zIndex: 1,
              }}
              severity="warning"
            >
              Model has final grades
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
            Course failed
          </Alert>
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
                  {dragAndDropNodes.map(dragAndDropNode => (
                    <div
                      key={dragAndDropNode.type}
                      className="dndnode"
                      onDragStart={event =>
                        onDragStart(event, dragAndDropNode.type)
                      }
                      draggable
                    >
                      {dragAndDropNode.title}
                    </div>
                  ))}
                </div>
                <Divider sx={{my: 1}} />
                <div style={{float: 'left'}}>
                  <Button
                    onClick={() => setCoursePartsSelectOpen(true)}
                    variant="outlined"
                  >
                    Select Course Parts
                  </Button>
                  <Button
                    onClick={() => setCoursePartValuesOpen(true)}
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
                      if (modelHasFinalGrades) {
                        setSaveConfirmOpen(true);
                        return;
                      }
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
