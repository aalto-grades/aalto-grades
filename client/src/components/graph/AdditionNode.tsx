// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useMeasure} from '@uidotdev/usehooks';
import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position, useUpdateNodeInternals} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  AdditionNodeValues,
  NodeDimensionsContext,
  NodeValuesContext,
} from '../../context/GraphProvider';

const handleStartHeight = 45.5 + 30;
const rowHeight = 30;

const AdditionNode = ({id, data, isConnectable}: NodeProps) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const [ref, {width, height}] = useMeasure();
  const {setNodeDimensions} = useContext(NodeDimensionsContext);
  const {nodeValues} = useContext(NodeValuesContext);
  const [handles, setHandles] = useState<string[]>([]);
  const [nextFree, setNextFree] = useState<number>(0);

  const nodeValue = nodeValues[id] as AdditionNodeValues;

  useEffect(() => {
    setNodeDimensions(id, {width: width as number, height: height as number});
  }, [width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let change = false;
    let maxId = 0;
    let newHandles = [...handles];
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-').at(-1) as string));
      if (!handles.includes(key)) {
        newHandles.push(key);
        change = true;
      }
      if (!source.isConnected) {
        newHandles = newHandles.filter(handle => handle !== key);
        change = true;
      }
    }
    if (change) {
      setTimeout(() => updateNodeInternals(id), 0);
      setHandles(newHandles);
      setNextFree(maxId + 1);
    }
  }, [nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={ref}
      style={{
        height: 'auto',
        width: 'auto',
        border: '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: 'white',
      }}
    >
      {handles.map((key, index) => (
        <Handle
          key={`handle-${key}`}
          type="target"
          id={key}
          style={{
            height: '12px',
            width: '12px',
            top: `${handleStartHeight + index * rowHeight}px`,
          }}
          position={Position.Left}
          isConnectable={isConnectable}
        />
      ))}
      <Handle
        type="target"
        id={`${id}-${nextFree}`}
        style={{
          height: '12px',
          width: '12px',
          top: `${handleStartHeight + handles.length * rowHeight}px`,
        }}
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div>
        <h4 style={{margin: 0}}>{data.label}</h4>
        <table style={{width: '100%'}}>
          <tbody>
            <tr>
              <th>In</th>
            </tr>
            {Object.entries(nodeValue.sources).map(([key, source]) => (
              <tr key={`tr-${key}`}>
                <td>{source.value}</td>
              </tr>
            ))}
            <tr>
              <td style={{height: '20px'}}></td>
            </tr>
          </tbody>
        </table>
        <p style={{margin: 0}}>{Math.round(nodeValue.value * 100) / 100}</p>
      </div>
      <Handle
        type="source"
        id={`${id}-source`}
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default AdditionNode;
