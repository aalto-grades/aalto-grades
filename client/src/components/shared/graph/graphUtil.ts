// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {Connection, Edge} from '@xyflow/react';
import ElkConstructor from 'elkjs/lib/elk.bundled';
import type {TFunction} from 'i18next';

import type {DropInNodes, NodeValues, TypedNode} from '@/common/types';

export const simplifyNode = (node: TypedNode): TypedNode => ({
  id: node.id,
  type: node.type,
  position: {
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
  },
  data: {},
});

export const getDragAndDropNodes = (
  t: TFunction
): {
  type: DropInNodes;
  title: string;
  tooltip: string;
}[] => [
  {
    type: 'addition',
    title: t('shared.graph.node.addition'),
    tooltip: t('shared.graph.node.addition-tooltip'),
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
    title: t('shared.graph.node.minpoints'),
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

export const isValidConnection = (
  connection: Edge | Connection,
  edges: Edge[]
): boolean => {
  // Check for conflicting edges
  for (const edge of edges) {
    // If connection doesn't have specific target handle and connection to the target already exists
    if (!connection.targetHandle && edge.target === connection.target)
      return false;

    // If connection to target handle already exists
    if (
      edge.target === connection.target
      && edge.targetHandle
      && edge.targetHandle === connection.targetHandle
    )
      return false;

    // If connection from source handle to target node already exists
    if (
      edge.source === connection.source
      && edge.sourceHandle === connection.sourceHandle
      && edge.target === connection.target
    ) {
      return false;
    }
  }

  // Helper map for finding cycles
  const nextNodes: {[key: string]: string[]} = {};
  for (const edge of edges) {
    if (!(edge.source in nextNodes)) nextNodes[edge.source] = [];
    nextNodes[edge.source].push(edge.target);
  }

  // Try to find route from target node back to source node
  const hasCycle = (nodeId: string, visited = new Set()): boolean => {
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);

    if (!(nodeId in nextNodes)) return false;
    for (const nextNode of nextNodes[nodeId]) {
      if (nextNode === connection.source) return true;
      if (hasCycle(nextNode, visited)) return true;
    }
    return false;
  };

  // Don't allow connections from a node back to itself
  if (connection.target === connection.source) return false;
  return !hasCycle(connection.target);
};

/** Find disconnected edges from require and substitute nodes */
export const findDisconnectedEdges = (
  oldNodeValues: NodeValues,
  nodes: TypedNode[],
  edges: Edge[]
): Edge[] => {
  const nodeTargets: {[key: string]: Edge[]} = {};
  for (const edge of edges) {
    if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
    nodeTargets[edge.source].push(edge);
  }

  // Set all isConnected values to false
  const newNodeValues = {...oldNodeValues};
  for (const node of nodes) {
    const nodeValue = newNodeValues[node.id];
    if (nodeValue.type !== 'require' && nodeValue.type !== 'substitute')
      continue;

    for (const value of Object.values(nodeValue.sources)) {
      value.isConnected = false;
    }
  }

  // Update isConnected values
  for (const node of nodes) {
    if (!(node.id in nodeTargets)) continue;
    for (const edge of nodeTargets[node.id]) {
      const nodeValue = newNodeValues[edge.target];
      if (nodeValue.type !== 'require' && nodeValue.type !== 'substitute')
        continue;

      nodeValue.sources[edge.targetHandle!] = {isConnected: true, value: 0};
    }
  }

  // Find disconnected edges
  const disconnectedEdges = [];
  for (const edge of edges) {
    const nodeValue = newNodeValues[edge.source];
    if (nodeValue.type !== 'require' && nodeValue.type !== 'substitute')
      continue;

    const sourceHandle = edge.sourceHandle!.replace('-source', '');
    if (
      !(sourceHandle in nodeValue.sources)
      || !nodeValue.sources[sourceHandle].isConnected
    ) {
      disconnectedEdges.push(edge);
    }
  }
  return disconnectedEdges;
};

const elk = new ElkConstructor();

export const formatGraph = async (
  nodes: TypedNode[],
  edges: Edge[],
  nodeValues: NodeValues
): Promise<TypedNode[]> => {
  const nodesForElk = nodes.map(node => ({
    type: node.type,
    id: node.id,
    width: node.measured?.width ?? 0,
    height: node.measured?.height ?? 0,
  }));
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'nodePlacement.strategy': 'SIMPLE',
      'elk.layered.spacing.nodeNodeBetweenLayers': '200',
      'elk.spacing.nodeNode': '60',
    },
    // Tell elk the node handle data (order and side)
    children: nodesForElk.map((node) => {
      const nodeValue = nodeValues[node.id];
      if (nodeValue.type === 'source') {
        return {
          ...node,
          ports: [{id: `${node.id}-source`, properties: {side: 'EAST'}}],
        };
      } else if (nodeValue.type === 'sink') {
        return {
          ...node,
          ports: [{id: node.id, properties: {side: 'WEST'}}],
        };
      } else if (
        nodeValue.type !== 'addition'
        && nodeValue.type !== 'average'
        && nodeValue.type !== 'max'
        && nodeValue.type !== 'require'
        && nodeValue.type !== 'substitute'
      ) {
        return {
          ...node,
          ports: [
            {id: node.id, properties: {side: 'WEST'}},
            {id: `${node.id}-source`, properties: {side: 'EAST'}},
          ],
        };
      }

      // Sort handles
      const sortedKeys: string[] = Object.keys(nodeValue.sources);
      if (nodeValue.type === 'substitute') {
        sortedKeys.sort((key1, key2) => {
          if (
            key1.split('-').at(-2) === 'exercise'
            && key2.split('-').at(-2) === 'substitute'
          )
            return 1;
          if (
            key2.split('-').at(-2) === 'exercise'
            && key1.split('-').at(-2) === 'substitute'
          )
            return -1;
          return (
            parseInt(key1.split('-').at(-1)!)
            - parseInt(key2.split('-').at(-1)!)
          );
        });
      } else {
        sortedKeys.sort(
          (key1, key2) =>
            parseInt(key1.split('-').at(-1)!)
            - parseInt(key2.split('-').at(-1)!)
        );
      }
      const sourcePorts = [...sortedKeys].reverse().map(key => ({
        id: key,
        properties: {side: 'WEST'},
      }));

      const targetPorts =
        nodeValue.type !== 'require' && nodeValue.type !== 'substitute'
          ? [{id: `${node.id}-source`, properties: {side: 'EAST'}}]
          : sortedKeys.map(key => ({
              id: `${key}-source`,
              properties: {side: 'EAST'},
            }));

      return {
        ...node,
        properties: {'org.eclipse.elk.portConstraints': 'FIXED_ORDER'},
        ports: [...sourcePorts, ...targetPorts],
      };
    }),
    edges: edges.map(edge => ({
      ...edge,
      sources: [edge.source],
      targets: [edge.targetHandle!],
    })),
  };
  console.log('ELK graph:', graph);
  // Return nodes with updated positions
  const newNodes = (await elk.layout(graph)).children!;
  return newNodes.map(newNode => ({
    ...nodes.find(node => node.id === newNode.id)!,
    position: {x: newNode.x!, y: newNode.y!},
  }));
};
