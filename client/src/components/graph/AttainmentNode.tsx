// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  AttainmentNodeValues,
  NodeValuesContext,
} from '../../context/GraphProvider';

const AttanmentNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues, setNodeValues} = useContext(NodeValuesContext);
  const nodeValue = nodeValues[id] as AttainmentNodeValues;

  const [localValue, setLocalValue] = useState<string>(
    nodeValue.value.toString()
  );
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setLocalValue(nodeValue.value.toString());
  }, [nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);

    if (!/^\d+(?:\.\d+?)?$/.test(event.target.value)) {
      setError(true);
      return;
    }
    setError(false);

    const newNodeValues = {...nodeValues};
    (newNodeValues[id] as AttainmentNodeValues).value = parseFloat(
      event.target.value
    );
    setNodeValues(newNodeValues);
    setLocalValue(event.target.value);
  };

  return (
    <div
      style={{
        height: '50px',
        width: '90px',
        border: error ? '1px dashed #e00' : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
      }}
    >
      <div>
        <h4 style={{margin: 0}}>{data.label}</h4>
        <input
          style={{width: 'calc(90px - 20px)'}}
          onChange={handleChange}
          type="number"
          value={localValue}
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
