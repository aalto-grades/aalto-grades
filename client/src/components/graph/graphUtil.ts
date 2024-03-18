// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import ElkConstructor, {ElkNode} from 'elkjs/lib/elk.bundled';
import {Edge, Node} from 'reactflow';

import {NodeValues} from '@common/types/graph';
import {ExtraNodeData} from '../../context/GraphProvider';

export const findDisconnectedEdges = (
  oldNodeValues: NodeValues,
  nodes: Node[],
  edges: Edge[]
) => {
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

      nodeValue.sources[edge.targetHandle as string] = {
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

    const sourceHandle = (edge.sourceHandle as string).replace('-source', '');
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
  nodeDimensions: ExtraNodeData,
  nodeValues: NodeValues
): Promise<Node[]> => {
  const nodesForElk = nodes.map(node => ({
    type: node.type,
    id: node.id,
    width: nodeDimensions[node.id].dimensions.width,
    height: nodeDimensions[node.id].dimensions.height,
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
      if (nodeValue.type === 'attainment') {
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
            parseInt(key1.split('-').at(-1) as string) -
            parseInt(key2.split('-').at(-1) as string)
          );
        });
      } else {
        sortedKeys.sort(
          (key1, key2) =>
            parseInt(key1.split('-').at(-1) as string) -
            parseInt(key2.split('-').at(-1) as string)
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
      targets: [edge.targetHandle as string],
    })),
  };

  const newNodes = (await elk.layout(graph)).children as ElkNode[];
  return newNodes.map((node): Node => {
    return {
      ...(nodes.find(onode => onode.id === node.id) as Node),
      position: {x: node.x as number, y: node.y as number},
    };
  });
};
