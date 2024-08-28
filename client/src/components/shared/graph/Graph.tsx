// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Alert, Button, Divider, Tooltip, Typography} from '@mui/material';
import type {TFunction} from 'i18next';
import {enqueueSnackbar} from 'notistack';
import {
  type Dispatch,
  type DragEvent,
  type DragEventHandler,
  type JSX,
  type SetStateAction,
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
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeChange,
  type NodeProps,
  ReactFlow,
  type ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type {
  CustomNodeTypes,
  DropInNodes,
  FullNodeData,
  GraphStructure,
  NodeSettings,
  NodeValues,
  SourceNodeValue,
} from '@/common/types';
import {calculateNewNodeValues, initNode} from '@/common/util';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {
  type ExtraNodeData,
  ExtraNodeDataContext,
  NodeDataContext,
  NodeValuesContext,
} from '@/context/GraphProvider';
import type {GradeSelectOption} from '@/utils';
import SelectSourcesDialog from './SelectSourcesDialog';
import SourceValuesDialog from './SourceValuesDialog';
import './flow.scss'; // Import styles
import {
  findDisconnectedEdges,
  formatGraph,
  getDragAndDropNodes,
  isValidConnection,
  simplifyNode,
} from './graphUtil';
import AdditionNode from './nodes/AdditionNode';
import AverageNode from './nodes/AverageNode';
import MaxNode from './nodes/MaxNode';
import MinPointsNode from './nodes/MinPointsNode';
import RequireNode from './nodes/RequireNode';
import RoundNode from './nodes/RoundNode';
import SinkNode from './nodes/SinkNode';
import SourceNode from './nodes/SourceNode';
import StepperNode from './nodes/StepperNode';
import SubstituteNode from './nodes/SubstituteNode';

// TODO: Don't show word 'source' to user?
// Instead we could check if is course part model or not
// And show course task / course part

type NodeState = [
  Node<object, CustomNodeTypes>[],
  Dispatch<SetStateAction<Node<object, CustomNodeTypes>[]>>,
  (changes: NodeChange[]) => void,
];

const nodeTypesMap: {
  [key in CustomNodeTypes]: (props: NodeProps) => JSX.Element;
} = {
  addition: AdditionNode,
  average: AverageNode,
  max: MaxNode,
  minpoints: MinPointsNode,
  require: RequireNode,
  round: RoundNode,
  sink: SinkNode,
  source: SourceNode,
  stepper: StepperNode,
  substitute: SubstituteNode,
};

export type GraphSource = {id: number; name: string; archived: boolean};

// Load graph for the first time
const initGraphFn = (
  initGraph: GraphStructure,
  sources: GraphSource[],
  t: TFunction
): {initNodeValues: NodeValues; extraNodeData: ExtraNodeData} => {
  // Check for deleted & archived sources (edit extra data)
  const extraNodeData: ExtraNodeData = {};
  for (const node of initGraph.nodes) {
    if (node.type !== 'source') continue;
    const sourceId = parseInt(node.id.split('-')[1]);

    console.log(JSON.stringify({sources, id: node.id}, null, 4));
    const nodeSource = sources.find(source => source.id === sourceId);
    if (nodeSource === undefined) {
      extraNodeData[node.id] = {warning: t('shared.graph.source-deleted')};
    } else if (nodeSource.archived) {
      extraNodeData[node.id] = {warning: t('shared.graph.source-archived')};
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
  sources: GraphSource[];
  sourceValues: {sourceId: number; sourceValue: number}[] | null;
  gradeSelectOption?: GradeSelectOption;
  onSave?: (graphStructure: GraphStructure) => Promise<void>;
  readOnly?: boolean;
  modelHasFinalGrades?: boolean;
};
const Graph = ({
  initGraph,
  sources,
  sourceValues,
  gradeSelectOption,
  onSave: onParentSave,
  readOnly = false,
  modelHasFinalGrades = false,
}: GraphProps): JSX.Element => {
  const {t} = useTranslation();

  const {initNodeValues, extraNodeData} = useMemo(
    () => initGraphFn(initGraph, sources, t),
    [sources, initGraph, t]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initGraph.nodes
  ) as NodeState;
  const [edges, setEdges, onEdgesChange] = useEdgesState(initGraph.edges);
  const [nodeData, setNodeData] = useState<FullNodeData>(initGraph.nodeData);
  const [nodeValues, setNodeValues] = useState<NodeValues>(initNodeValues);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Used to check for changes
  const [lastState, setLastState] = useState<{
    nodes: Node<object, CustomNodeTypes>[];
    edges: Edge[];
    nodeSettings: {[key: string]: NodeSettings | undefined};
    nodeValues: NodeValues;
  } | null>(null);

  const [selected, setSelected] = useState<Node[]>([]);
  const [sourcesSelectOpen, setSourcesSelectOpen] = useState<boolean>(false);
  const [sourceValuesOpen, setSourceValuesOpen] = useState<boolean>(false);
  const [originalGraphStructure, setOriginalGraphStructure] =
    useState<GraphStructure>(initGraph);

  const unsaved =
    JSON.stringify(originalGraphStructure.nodes.map(simplifyNode)) !==
      JSON.stringify(nodes.map(simplifyNode)) ||
    JSON.stringify(originalGraphStructure.edges) !== JSON.stringify(edges) ||
    JSON.stringify(originalGraphStructure.nodeData) !==
      JSON.stringify(nodeData);

  // Source nodes that the user is allowed to delete
  const delSources = useMemo(
    () =>
      initGraph.nodes
        .filter(node => {
          if (node.type !== 'source') return false;
          const sourceId = parseInt(node.id.split('-')[1]);

          const nodeSource = sources.find(source => source.id === sourceId);
          return nodeSource === undefined || nodeSource.archived;
        })
        .map(node => node.id),
    [sources, initGraph.nodes]
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
    if (sourceValues === null) return;
    const newNodeValues = {...nodeValues};
    let change = false;

    for (const sourceValue of sourceValues) {
      const sourceId = `source-${sourceValue.sourceId}`;
      if (!(sourceId in newNodeValues)) continue;

      const newValue = newNodeValues[sourceId] as SourceNodeValue;
      if (newValue.value !== sourceValue.sourceValue) {
        newValue.source = sourceValue.sourceValue;
        change = true;
      }
    }
    if (change) setNodeValues(newNodeValues);
  }, [gradeSelectOption, nodeValues, sourceValues]);

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
      enqueueSnackbar(t('shared.graph.saving'), {variant: 'info'});
      await onParentSave({nodes, edges, nodeData});
      enqueueSnackbar(t('shared.graph.saved'), {variant: 'success'});
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

  const handleSourceSelect = (
    newSources: GraphSource[],
    removedSources: GraphSource[]
  ): void => {
    setSourcesSelectOpen(false);

    let newNodes = [...nodes];
    let newEdges = [...edges];
    const newNodeValues = {...nodeValues};
    const newNodeData = {...nodeData};

    for (const source of newSources) {
      newNodes.push({
        id: `source-${source.id}`,
        type: 'source',
        position: {x: 0, y: 100 * newNodes.length},
        data: {},
      });
      newNodeData[`source-${source.id}`] = {
        title: source.name,
        settings: {minPoints: null, onFailSetting: 'fullfail'},
      };
      newNodeValues[`source-${source.id}`] = initNode('source').value;
    }

    for (const source of removedSources) {
      const nodeId = `source-${source.id}`;
      newNodes = newNodes.filter(newNode => newNode.id !== nodeId);
      newEdges = newEdges.filter(newEdge => newEdge.source !== nodeId);
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setNodeData(newNodeData);
    setNodeValues(newNodeValues);
    if (newSources.length > 0) {
      setTimeout(() => {
        reactFlowInstance?.fitView();
      }, 0);
    }
  };

  const handleSetSourceValues = (newSourceValues: {
    [key: number]: number;
  }): void => {
    const newNodeValues = structuredClone(nodeValues);
    for (const [sourceId, value] of Object.entries(newSourceValues)) {
      const nodeValue = newNodeValues[`source-${sourceId}`];
      if (nodeValue.type === 'source') nodeValue.source = value;
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
      const newNode: Node<object, CustomNodeTypes> = {
        id: nodeId,
        type,
        position,
        data: {},
      };

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
      <SelectSourcesDialog
        nodes={nodes}
        sources={sources}
        open={sourcesSelectOpen}
        handleSourceSelect={handleSourceSelect}
        onClose={() => setSourcesSelectOpen(false)}
      />
      <SourceValuesDialog
        nodes={nodes}
        nodeValues={nodeValues}
        sources={sources}
        open={sourceValuesOpen}
        onClose={() => setSourceValuesOpen(false)}
        handleSetSourceValues={handleSetSourceValues}
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
            {t('general.unsaved-changes')}
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
              {t('shared.graph.has-final-grades')}
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
                selected
                  .filter(
                    node =>
                      delSources.includes(node.id) ||
                      (node.type !== 'source' && node.type !== 'sink')
                  )
                  .map(node => ({type: 'remove', id: node.id}))
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
      <NodeValuesContext.Provider value={nodeValues}>
        <ExtraNodeDataContext.Provider value={extraNodeData}>
          <NodeDataContext.Provider
            value={useMemo(
              () => ({nodeData, setNodeTitle, setNodeSettings}),
              [nodeData]
            )}
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
                        delSources.includes(change.id) ||
                        (nodeTypeMap[change.id] !== 'source' &&
                          nodeTypeMap[change.id] !== 'sink')
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
                    onClick={() => setSourcesSelectOpen(true)}
                    variant="outlined"
                  >
                    {t('shared.graph.select-sources')}
                  </Button>
                  <Button
                    onClick={() => setSourceValuesOpen(true)}
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
