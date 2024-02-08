// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {NodeValuesContext} from '../../context/GraphProvider';

const AdditionNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  return (
    <div
      style={{
        height: '50px',
        width: '70px',
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
        <h4 style={{margin: 0}}>{data.label}</h4>
        <p style={{margin: 0}}>{nodeValues[id].value}</p>
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

export default AdditionNode;
