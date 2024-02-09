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
  StepperNodeSettings,
} from '../../context/GraphProvider';

type StepperNodeLocalSettings = {
  numSteps: number;
  outputValues: string[];
  middlePoints: string[];
};
const initialSettings = {
  numSteps: 1,
  middlePoints: [],
  outputValues: ['0'],
};
const checkError = (settings: StepperNodeLocalSettings): boolean => {
  for (const middleValue of settings.middlePoints) {
    if (!/^\d+(?:\.\d+?)?$/.test(middleValue)) return true;
  }
  for (const outputValue of settings.outputValues) {
    if (!/^\d+(?:\.\d+?)?$/.test(outputValue)) return true;
  }

  for (let i = 0; i < settings.numSteps - 1; i++) {
    if (
      i + 1 < settings.numSteps - 1 &&
      parseFloat(settings.middlePoints[i]) >=
        parseFloat(settings.middlePoints[i + 1])
    ) {
      return true;
    } else if (
      i > 0 &&
      parseFloat(settings.middlePoints[i]) <=
        parseFloat(settings.middlePoints[i - 1])
    ) {
      return true;
    }
  }
  return false;
};

const StepperNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeSettings, setNodeSettings} = useContext(NodeSettingsContext);
  const [localSettings, setLocalSettings] = useState<StepperNodeLocalSettings>(
    JSON.parse(JSON.stringify(initialSettings))
  );
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const stepperNodeSettings = nodeSettings[id] as StepperNodeSettings;
    setLocalSettings({
      numSteps: stepperNodeSettings.numSteps,
      middlePoints: stepperNodeSettings.middlePoints.map(val => val.toString()),
      outputValues: stepperNodeSettings.outputValues.map(val => val.toString()),
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

    if (checkError(newLocalSettings)) {
      setError(true);
      return;
    }
    setError(false);

    const newNodeSettings = {...nodeSettings};
    newNodeSettings[id] = {
      numSteps: newLocalSettings.numSteps,
      middlePoints: newLocalSettings.middlePoints.map(val => parseFloat(val)),
      outputValues: newLocalSettings.outputValues.map(val => parseFloat(val)),
    };
    setLocalSettings(newLocalSettings);
    setNodeSettings(newNodeSettings);
  };

  const isCurrentSlot = (index: number): boolean => {
    const nodeValue = nodeValues[id] as StepperNodeIO;
    if (
      index > 0 &&
      nodeValue.source <= parseFloat(localSettings.middlePoints[index - 1])
    )
      return false;
    if (
      index < localSettings.numSteps - 1 &&
      nodeValue.source > parseFloat(localSettings.middlePoints[index])
    )
      return false;
    return true;
  };

  const handleAdd = () => {
    const newLocalSettings = {
      numSteps: localSettings.numSteps + 1,
      middlePoints: localSettings.middlePoints.concat(''),
      outputValues: localSettings.outputValues.concat(''),
    };
    setLocalSettings(newLocalSettings);
    setError(true);
  };

  const handleRemove = () => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.numSteps -= 1;
    newLocalSettings.middlePoints.pop();
    newLocalSettings.outputValues.pop();
    setLocalSettings(newLocalSettings);

    if (checkError(newLocalSettings)) {
      setError(true);
      return;
    }
    setError(false);

    const newNodeSettings = {...nodeSettings};
    newNodeSettings[id] = {
      numSteps: newLocalSettings.numSteps,
      middlePoints: newLocalSettings.middlePoints.map(val => parseFloat(val)),
      outputValues: newLocalSettings.outputValues.map(val => parseFloat(val)),
    };
    setNodeSettings(newNodeSettings);
  };

  return (
    <div
      style={{
        height: `${87 + 33.35 * localSettings.numSteps}px`,
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
        <button
          style={{display: 'inline', marginRight: '30px'}}
          onClick={handleAdd}
        >
          New row
        </button>
        <p style={{margin: 0, display: 'inline'}}>
          {Math.round(nodeValues[id].value * 100) / 100}
        </p>
        <button
          style={{display: 'inline', marginLeft: '30px'}}
          disabled={localSettings.numSteps === 1}
          onClick={handleRemove}
        >
          Remove row
        </button>
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
