// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {NodeValuesContext} from '../../context/GraphProvider';

const AttanmentNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues, setNodeValues} = useContext(NodeValuesContext);
  const [localValue, setLocalValue] = useState<string>(
    nodeValues[id].value.toString()
  );
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setLocalValue(nodeValues[id].value.toString());
  }, [id, nodeValues]);

  return (
    <div
      style={{
        height: '50px',
        width: '90px',
        border: error ? '1px solid #e00' : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
      }}
    >
      <div>
        <h4 style={{margin: 0}}>{data.label}</h4>
        <input
          style={{width: 'calc(90px - 20px)'}}
          id="text"
          name="text"
          type="number"
          onChange={event => {
            if (
              /^\d*$/.test(event.target.value) &&
              event.target.value.length > 0
            ) {
              setError(false);
              const newNodeValues = {...nodeValues};
              newNodeValues[id].value = parseInt(event.target.value);
              setNodeValues(newNodeValues);
            } else {
              setError(true);
            }
            setLocalValue(event.target.value);
          }}
          value={localValue}
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

export default AttanmentNode;
