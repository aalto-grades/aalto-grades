// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {JSX, useContext} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';

import {CustomNodeTypes, GradeNodeValue} from '@common/types/graph';
import {NodeValuesContext} from '../../context/GraphProvider';
import BaseNode from './BaseNode';

const GradeNode = ({
  id,
  type,
  selected,
  isConnectable,
}: NodeProps): JSX.Element => {
  const {nodeValues} = useContext(NodeValuesContext);
  const nodeValue = nodeValues[id] as GradeNodeValue;

  return (
    <BaseNode id={id} type={type as CustomNodeTypes} selected={selected}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <p className="outputvalue">
        Final grade: {Math.round(nodeValue.value * 100) / 100}
      </p>
    </BaseNode>
  );
};

export default GradeNode;
