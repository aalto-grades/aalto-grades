// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Edge, Node} from 'reactflow';
import {CustomNodeTypes, NodeValues} from '../../context/GraphProvider';
import ElkConstructor, {ElkNode} from 'elkjs/lib/elk.bundled';

const elk = new ElkConstructor();

export const formatGraph = async (
  nodes: Node[],
  edges: Edge[],
  nodeHeights: {[key: string]: number},
  nodeValues: NodeValues
): Promise<Node[]> => {
  const nodesForElk = nodes.map(node => {
    let width = 0;
    let height = 0;
    // TODO: remove the ?? 100 when format on load is removed
    switch (node.type as CustomNodeTypes) {
      case 'addition':
        width = 70;
        height = nodeHeights[node.id] ?? 100;
        break;
      case 'attainment':
        width = 90;
        height = 50;
        break;
      case 'average':
        width = 200;
        height = nodeHeights[node.id] ?? 100;
        break;
      case 'grade':
        width = 100;
        height = 50;
        break;
      case 'max':
        width = 90;
        height = nodeHeights[node.id] ?? 100;
        break;
      case 'minpoints':
        width = 90;
        height = 50;
        break;
      case 'require':
        width = 90;
        height = nodeHeights[node.id] ?? 100;
        break;
      case 'stepper':
        width = 270;
        height = nodeHeights[node.id] ?? 100;
        break;
      case 'substitute':
        width = 130;
        height = nodeHeights[node.id] ?? 100;
    }
    return {
      type: node.type,
      id: node.id,
      width,
      height,
    };
  });
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
