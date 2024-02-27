// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  CustomNodeTypes,
  GradeNodeValues,
  NodeValuesContext,
} from '../../context/GraphProvider';
import BaseNode from './BaseNode';

const GradeNode = ({id, type, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const nodeValue = nodeValues[id] as GradeNodeValues;

  return (
    <BaseNode id={id} type={type as CustomNodeTypes}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <p style={{margin: 0}}>{Math.round(nodeValue.value * 100) / 100}</p>
    </BaseNode>
  );
};

export default GradeNode;
