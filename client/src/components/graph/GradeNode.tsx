// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {JSX, useContext} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';

import {GradeNodeValue} from '@/common/types/graph';
import BaseNode from './BaseNode';
import {NodeValuesContext} from '../../context/GraphProvider';

const GradeNode = (props: NodeProps): JSX.Element => {
  const {id, isConnectable} = props;

  const {nodeValues} = useContext(NodeValuesContext);
  const nodeValue = nodeValues[id] as GradeNodeValue;

  return (
    <BaseNode {...props} courseFail={nodeValue.courseFail}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <p className="output-value">
        Final grade: {Math.round(nodeValue.value * 100) / 100}
      </p>
    </BaseNode>
  );
};

export default GradeNode;
