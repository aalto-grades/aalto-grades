// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useMeasure} from '@uidotdev/usehooks';
import {useContext, useEffect} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  GradeNodeValues,
  NodeDimensionsContext,
  NodeValuesContext,
} from '../../context/GraphProvider';

const GradeNode = ({id, data, isConnectable}: NodeProps) => {
  const [ref, {width, height}] = useMeasure();
  const {setNodeDimensions} = useContext(NodeDimensionsContext);
  const {nodeValues} = useContext(NodeValuesContext);
  const nodeValue = nodeValues[id] as GradeNodeValues;

  useEffect(() => {
    setNodeDimensions(id, {width: width as number, height: height as number});
  }, [width, height]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <div>
        <h4 style={{margin: 0}}>{data.label}</h4>
        <p style={{margin: 0}}>{Math.round(nodeValue.value * 100) / 100}</p>
      </div>
    </div>
  );
};

export default GradeNode;
