// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import ElkConstructor from 'elkjs/lib/elk.bundled';
import type {TFunction} from 'i18next';
import type {Connection, Edge, Node} from 'reactflow';

import type {DropInNodes, NodeValues} from '@/common/types';

export const simplifyNode = (node: Node): Node => ({
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

export const isValidConnection = (
  connection: Connection,
  edges: Edge[]
): boolean => {
  if (connection.source === null || connection.target === null) return false;

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

export const findDisconnectedEdges = (
  oldNodeValues: NodeValues,
  nodes: Node[],
  edges: Edge[]
): Edge[] => {
  const nodeSources: {[key: string]: Set<string>} = {};
  const nodeTargets: {[key: string]: Edge[]} = {};
  for (const edge of edges) {
    if (!(edge.source in nodeTargets)) nodeTargets[edge.source] = [];
    nodeTargets[edge.source].push(edge);
    if (!(edge.target in nodeSources)) nodeSources[edge.target] = new Set();
    nodeSources[edge.target].add(edge.source);
  }

  const newNodeValues = {...oldNodeValues};
  for (const node of nodes) {
    const sourceNodeValue = newNodeValues[node.id];
    if (
      sourceNodeValue.type === 'require' ||
      sourceNodeValue.type === 'substitute'
    ) {
      for (const value of Object.values(sourceNodeValue.sources)) {
        value.value = 0;
        value.isConnected = false;
      }
    }
  }

  for (const node of nodes) {
    if (!(node.id in nodeTargets)) continue;
    for (const edge of nodeTargets[node.id]) {
      const nodeValue = newNodeValues[edge.target];
      if (nodeValue.type !== 'require' && nodeValue.type !== 'substitute')
        continue;

      nodeValue.sources[edge.targetHandle!] = {
        value: 0,
        isConnected: true,
      };
    }
  }

  const badEdges = [];
  for (const edge of edges) {
    const sourceNodeValues = newNodeValues[edge.source];

    if (
      sourceNodeValues.type !== 'require' &&
      sourceNodeValues.type !== 'substitute'
    )
      continue;

    const sourceHandle = edge.sourceHandle!.replace('-source', '');
    if (
      !(sourceHandle in sourceNodeValues.sources) ||
      !sourceNodeValues.sources[sourceHandle].isConnected
    ) {
      badEdges.push(edge);
    }
  }
  return badEdges;
};

const elk = new ElkConstructor();

export const formatGraph = async (
  nodes: Node[],
  edges: Edge[],
  nodeValues: NodeValues
): Promise<Node[]> => {
  const nodesForElk = nodes.map(node => ({
    type: node.type,
    id: node.id,
    width: node.width!,
    height: node.height!,
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
    children: nodesForElk.map(node => {
      const nodeValue = nodeValues[node.id];
      if (nodeValue.type === 'coursepart') {
        return {
          ...node,
          ports: [{id: `${node.id}-source`, properties: {side: 'EAST'}}],
        };
      } else if (nodeValue.type === 'grade') {
        return {
          ...node,
          ports: [{id: node.id, properties: {side: 'WEST'}}],
        };
      } else if (
        nodeValue.type !== 'addition' &&
        nodeValue.type !== 'average' &&
        nodeValue.type !== 'max' &&
        nodeValue.type !== 'require' &&
        nodeValue.type !== 'substitute'
      ) {
        return {
          ...node,
          ports: [
            {id: node.id, properties: {side: 'WEST'}},
            {id: `${node.id}-source`, properties: {side: 'EAST'}},
          ],
        };
      }

      const sortedKeys: string[] = Object.keys(nodeValue.sources);
      if (nodeValue.type === 'substitute') {
        sortedKeys.sort((key1, key2) => {
          if (
            key1.split('-').at(-2) === 'exercise' &&
            key2.split('-').at(-2) === 'substitute'
          )
            return 1;
          if (
            key2.split('-').at(-2) === 'exercise' &&
            key1.split('-').at(-2) === 'substitute'
          )
            return -1;
          return (
            parseInt(key1.split('-').at(-1)!) -
            parseInt(key2.split('-').at(-1)!)
          );
        });
      } else {
        sortedKeys.sort(
          (key1, key2) =>
            parseInt(key1.split('-').at(-1)!) -
            parseInt(key2.split('-').at(-1)!)
        );
      }
      const sourcePorts = sortedKeys.toReversed().map(key => ({
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

  const newNodes = (await elk.layout(graph)).children!;
  return newNodes.map(newNode => ({
    ...nodes.find(node => node.id === newNode.id)!,
    position: {x: newNode.x!, y: newNode.y!},
  }));
};
