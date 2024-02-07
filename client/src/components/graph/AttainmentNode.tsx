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
    nodeValues[id].toString()
  );
  useEffect(() => {
    setLocalValue(nodeValues[id].toString());
  }, [id, nodeValues]);

  return (
    <div
      style={{
        height: '50px',
        border: '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: 'white',
      }}
    >
      <div>
        <h4 style={{margin: 0}}>{data.label}</h4>
        <input
          id="text"
          name="text"
          type="number"
          onChange={event => {
            if (
              /^\d*$/.test(event.target.value) &&
              event.target.value.length > 0
            ) {
              const newNodeValues = {...nodeValues};
              newNodeValues[id] = parseInt(event.target.value);
              setNodeValues(newNodeValues);
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
