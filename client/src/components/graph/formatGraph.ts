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
    switch (node.type as CustomNodeTypes) {
      case 'addition':
        width = 70;
        height = nodeHeights[node.id];
        break;
      case 'attainment':
        width = 90;
        height = 50;
        break;
      case 'average':
        width = 200;
        height = nodeHeights[node.id];
        break;
      case 'grade':
        width = 100;
        height = 50;
        break;
      case 'max':
        width = 90;
        height = nodeHeights[node.id];
        break;
      case 'minpoints':
        width = 90;
        height = 50;
        break;
      case 'require':
        width = 90;
        height = nodeHeights[node.id];
        break;
      case 'stepper':
        width = 270;
        height = nodeHeights[node.id];
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
      const nodevalue = nodeValues[node.id];
      if (
        nodevalue.type !== 'addition' &&
        nodevalue.type !== 'average' &&
        nodevalue.type !== 'max' &&
        nodevalue.type !== 'require'
      ) {
        return {
          ...node,
          ports: [{id: node.id}],
        };
      }

      const sourcePorts = Object.keys(nodevalue.sources)
        .toReversed()
        .map(key => ({
          id: `${node.id}-${key}`,
          properties: {side: 'WEST'},
        }));

      const targetPortsPorts =
        nodevalue.type !== 'require'
          ? []
          : Object.keys(nodevalue.values)
              .toReversed()
              .map(key => ({
                id: `${node.id}-${key}-source`,
                properties: {side: 'WEST'},
              }));

      return {
        ...node,
        properties: {'org.eclipse.elk.portConstraints': 'FIXED_ORDER'},
        ports: [{id: node.id}, ...sourcePorts, ...targetPortsPorts],
      };
    }),
    edges: edges.map(edge => ({
      ...edge,
      sources: [edge.source],
      targets: [
        edge.targetHandle ? `${edge.target}-${edge.targetHandle}` : edge.target,
      ],
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
