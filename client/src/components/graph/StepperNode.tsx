// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  NodeSettingsContext,
  NodeValuesContext,
  StepperNodeIO,
  StepperNodeLocalSettings,
} from '../../context/GraphProvider';

const StepperNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeSettings, setNodeSettings} = useContext(NodeSettingsContext);
  const [localSettings, setLocalSettings] = useState<StepperNodeLocalSettings>({
    numSteps: 1,
    middlePoints: [],
    outputValues: ['0'],
  });
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setLocalSettings({
      numSteps: nodeSettings[id].numSteps,
      middlePoints: nodeSettings[id].middlePoints.map(val => val.toString()),
      outputValues: nodeSettings[id].outputValues.map(val => val.toString()),
    });
  }, [id, nodeSettings]);

  const handleChange = (
    type: 'middlepoint' | 'outputvalue',
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newLocalSettings = {...localSettings};
    if (type === 'middlepoint') {
      newLocalSettings.middlePoints[index] = event.target.value;
    } else {
      newLocalSettings.outputValues[index] = event.target.value;
    }
    setLocalSettings(newLocalSettings);

    let fail = false;
    for (const middleValue of newLocalSettings.middlePoints) {
      if (!/^\d*$/.test(middleValue) || middleValue.length === 0) fail = true;
    }
    for (const outputValue of newLocalSettings.outputValues) {
      if (!/^\d*$/.test(outputValue) || outputValue.length === 0) fail = true;
    }
    if (fail) {
      setError(true);
      return;
    }

    for (let i = 0; i < newLocalSettings.numSteps - 1; i++) {
      if (
        i + 1 < newLocalSettings.numSteps - 1 &&
        parseInt(newLocalSettings.middlePoints[i]) >=
          parseInt(newLocalSettings.middlePoints[i + 1])
      )
        fail = true;
      else if (
        i > 0 &&
        parseInt(newLocalSettings.middlePoints[i]) <=
          parseInt(newLocalSettings.middlePoints[i - 1])
      )
        fail = true;
    }
    if (fail) {
      setError(true);
      return;
    }
    setError(false);

    const newNodeSettings = {...nodeSettings};
    newNodeSettings[id] = {
      numSteps: newLocalSettings.numSteps,
      middlePoints: newLocalSettings.middlePoints.map(val => parseInt(val)),
      outputValues: newLocalSettings.outputValues.map(val => parseInt(val)),
    };
    setLocalSettings(newLocalSettings);
    setNodeSettings(newNodeSettings);
  };

  const isCurrentSlot = (index: number): boolean => {
    const nodeValue = nodeValues[id] as StepperNodeIO;
    if (
      index > 0 &&
      nodeValue.source <= parseInt(localSettings.middlePoints[index - 1])
    )
      return false;
    if (
      index < localSettings.numSteps - 1 &&
      nodeValue.source > parseInt(localSettings.middlePoints[index])
    )
      return false;
    return true;
  };

  return (
    <div
      style={{
        height: '280px',
        width: '270px',
        border: error ? '1px solid #e00' : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
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
          <tbody>
            <tr>
              <th>Range</th>
              <th>Output</th>
            </tr>
            {new Array(localSettings.numSteps).fill(0).map((_, index) => (
              <tr
                key={`${id}-${index}`}
                style={{
                  background: !error && isCurrentSlot(index) ? '#00f6' : '',
                }}
              >
                <td>
                  {index === 0 ? (
                    <input
                      style={{width: '40px'}}
                      type="text"
                      value="-∞"
                      disabled
                    />
                  ) : (
                    <input
                      style={{width: '40px'}}
                      type="number"
                      value={localSettings.middlePoints[index - 1]}
                      onChange={event =>
                        handleChange('middlepoint', index - 1, event)
                      }
                    />
                  )}
                  <p style={{display: 'inline'}}> {'< ... ≤'} </p>
                  {index + 1 === localSettings.numSteps ? (
                    <input
                      style={{width: '40px'}}
                      type="text"
                      value="∞"
                      disabled
                    />
                  ) : (
                    <input
                      style={{width: '40px'}}
                      type="number"
                      value={localSettings.middlePoints[index]}
                      onChange={event =>
                        handleChange('middlepoint', index, event)
                      }
                    />
                  )}
                </td>
                <td>
                  <input
                    style={{width: '40px'}}
                    type="number"
                    value={localSettings.outputValues[index]}
                    onChange={event =>
                      handleChange('outputvalue', index, event)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default StepperNode;
