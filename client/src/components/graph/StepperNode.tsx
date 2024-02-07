// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  NodeSettingsContext,
  NodeValuesContext,
  StepperNodeSettings,
  initStepperNodeSettings,
} from '../../context/GraphProvider';

const StepperNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeSettings} = useContext(NodeSettingsContext);
  const [localSettings, setLocalSettings] = useState<StepperNodeSettings>(
    initStepperNodeSettings
  );

  useEffect(() => {
    setLocalSettings(nodeSettings[id]);
  }, [id, nodeSettings]);

  return (
    <div
      style={{
        height: '270px',
        width: '170px',
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
        <table style={{width: '100%', margin: '5px 0px'}}>
          <thead>
            <tr>
              <td>Range</td>
              <td>Output</td>
            </tr>
          </thead>
          <tbody>
            {new Array(localSettings.numSteps).fill(0).map((_, index) => (
              <tr key={`${id}-${index}`}>
                <td>
                  {`${
                    index === 0 ? '-∞' : localSettings.middlePoints[index - 1]
                  } < ... ≤ ${
                    index + 1 === localSettings.numSteps
                      ? '∞'
                      : localSettings.middlePoints[index]
                  }`}
                </td>
                <td>{localSettings.outputValues[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{margin: 0}}>{nodeValues[id]}</p>
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

export default StepperNode;
