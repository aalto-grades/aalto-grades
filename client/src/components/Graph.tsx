// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Dispatch,
  JSX,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import './flow.css';

type NodeValues = {[key: string]: number};
type NodeValuesContext = {
  nodeValues: NodeValues;
  setNodeValues: Dispatch<SetStateAction<NodeValues>>;
};
const NodeValuesContext = createContext<NodeValuesContext>(
  {} as NodeValuesContext
);

const AttanmentNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues, setNodeValues} = useContext(NodeValuesContext);
  const [value, setValue] = useState<string>(nodeValues[id].toString());
  useEffect(() => {
    setValue(nodeValues[id].toString());
  }, [id, nodeValues]);

  return (
    <div
      style={{
        height: '50px',
        border: '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: 'white',
      }}
    >
      <div>
        <label htmlFor="text">{data.label}</label>
        <br />
        <input
          id="text"
          name="text"
          type="number"
          onChange={event => {
            if (parseInt(event.target.value)) {
              const newNodeValues = {...nodeValues};
              newNodeValues[id] = parseInt(event.target.value);
              setNodeValues(newNodeValues);
            }
            setValue(event.target.value);
          }}
          value={value}
          className="nodrag"
        />
      </div>
      <Handle
        type="source"
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
};
const PlusNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  return (
    <div
      style={{
        height: '50px',
        width: '50px',
        border: '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: 'white',
      }}
    >
      <Handle
        type="target"
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div>
        <p style={{margin: 0}}>{data.label}</p>
        <p style={{margin: 0}}>{nodeValues[id]}</p>
      </div>
      <Handle
        type="source"
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        id="b"
        isConnectable={isConnectable}
      />
    </div>
  );
};
const GradeNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  return (
    <div
      style={{
        height: '50px',
        width: '50px',
        border: '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: 'white',
      }}
    >
      <Handle
        type="target"
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <div>
        <p style={{margin: 0}}>{data.label}</p>
        <p style={{margin: 0}}>{nodeValues[id]}</p>
      </div>
    </div>
  );
};

const nodeTypes = {
  attainment: AttanmentNode,
  addition: PlusNode,
  grade: GradeNode,
};

const Graph = (): JSX.Element => {
  const initialNodes = [
    {
      id: 'plus1',
      type: 'addition',
      position: {x: 500, y: 500},
      data: {label: 'Addition'},
    },
    {
      id: 'grade',
      type: 'grade',
      position: {x: 900, y: 500},
      data: {label: 'Final grade'},
    },
  ];
  const initialEdges = [{id: 'plus1-grade', source: 'plus1', target: 'grade'}];

  for (let i = 0; i < 10; i++) {
    initialNodes.push({
      id: `ex${i + 1}`,
      type: 'attainment',
      position: {x: 0, y: i * 100},
      data: {label: `Exercise ${i + 1}`},
    });
    initialEdges.push({
      id: `ex${i + 1}-plus1`,
      source: `ex${i + 1}`,
      target: 'plus1',
    });
  }
  const newValues: NodeValues = {};
  for (const node of initialNodes) {
    newValues[node.id] =
      node.type === 'attainment' ? Math.floor(Math.random() * 20) : 0;
  }

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [nodeValues, setNodeValues] = useState<NodeValues>(newValues);
  const [oldNodeValues, setOldNodeValues] = useState<NodeValues>(newValues);
  const [oldEdges, setOldEdges] = useState<Edge[]>(edges);

  const updateValues = useCallback(
    // From manual
    // we are using getNodes and getEdges helpers here
    // to make sure we create isValidConnection function only once

    (newEdges: Edge[] | null = null) => {
      console.log('Updating');
      const nodeSources: {[key: string]: Set<string>} = {};
      const nodeTargets: {[key: string]: string[]} = {};
      for (const edge of newEdges || edges) {
        if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
        nodeTargets[edge.source].push(edge.target);
        if (!(edge.target in nodeSources)) nodeSources[edge.target] = new Set();
        nodeSources[edge.target].add(edge.source);
      }

      type NodeTypes = 'attainment' | 'addition' | 'grade';
      const nodeTypes: {[key: string]: NodeTypes} = {};
      const noSources = [];
      for (const node of nodes) {
        if (!(node.id in nodeSources)) noSources.push(node.id);
        nodeTypes[node.id] = node.type as NodeTypes;
      }

      const newNodeValues = {...nodeValues};
      for (const node of nodes) {
        if (node.type !== 'attainment') newNodeValues[node.id] = 0;
      }

      while (noSources.length > 0) {
        const sourceId = noSources.pop() as string;
        const sourceValue = newNodeValues[sourceId];

        if (!(sourceId in nodeTargets)) continue;

        for (const targetId of nodeTargets[sourceId]) {
          nodeSources[targetId].delete(sourceId);
          if (nodeSources[targetId].size === 0) noSources.push(targetId);

          switch (nodeTypes[targetId]) {
            case 'addition':
              newNodeValues[targetId] += sourceValue;
              break;
            case 'grade':
              newNodeValues[targetId] += sourceValue;
              break;
          }
        }
      }
      console.log('Finished Updating');
      setOldNodeValues(nodeValues);
      setNodeValues(newNodeValues);
    },
    [edges, nodeValues, nodes]
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const target = nodes.find(node => node.id === connection.target) as Node;
      const outgoers: {[key: string]: Node[]} = {};
      for (const edge of edges) {
        if (!(edge.source in outgoers)) outgoers[edge.source] = [];
        outgoers[edge.source].push(
          nodes.find(node => node.id === edge.target) as Node
        );
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
      JSON.stringify(oldNodeValues) !== JSON.stringify(nodeValues) ||
      oldEdges.length !== edges.length
    ) {
      setOldNodeValues(nodeValues);
      setOldEdges(edges);
      updateValues();
    }
  }, [edges, nodeValues, oldEdges, oldNodeValues, updateValues]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(edges => addEdge(params, edges));
      updateValues(addEdge(params, edges));
    },
    [edges, setEdges, updateValues]
  );

  return (
    <NodeValuesContext.Provider value={{nodeValues, setNodeValues}}>
      <div style={{width: '100%', height: '80vh'}}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </NodeValuesContext.Provider>
  );
};

export default Graph;
