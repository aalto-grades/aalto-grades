// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  AttainmentNodeValues,
  CustomNodeTypes,
  NodeValuesContext,
} from '../../context/GraphProvider';
import BaseNode from './BaseNode';

const AttanmentNode = ({id, type, isConnectable}: NodeProps) => {
  const {nodeValues, setNodeValues} = useContext(NodeValuesContext);
  const [localValue, setLocalValue] = useState<string>('0');
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as AttainmentNodeValues;

  useEffect(() => {
    if (init) return;
    setLocalValue(nodeValue.value.toString());
    setInit(true);
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
    <BaseNode id={id} type={type as CustomNodeTypes} error={error}>
      <input
        style={{width: '70px'}}
        onChange={handleChange}
        type="number"
        value={localValue}
      />
      <Handle
        type="source"
        id={`${id}-source`}
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
};

export default AttanmentNode;
