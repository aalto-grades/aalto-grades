// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  NodeHeightsContext,
  NodeSettingsContext,
  NodeValuesContext,
  StepperNodeValues,
  StepperNodeSettings,
} from '../../context/GraphProvider';

type LocalSettings = {
  numSteps: number;
  outputValues: string[];
  middlePoints: string[];
};
const initialSettings = {
  numSteps: 1,
  middlePoints: [],
  outputValues: ['0'],
};

const nodeMinHeight = 78.683 + 4;
const rowHeight = 33.9;
const calculateHeight = (localSettings: LocalSettings | StepperNodeSettings) =>
  nodeMinHeight + (localSettings.numSteps + 2) * rowHeight;

const checkError = (settings: LocalSettings): boolean => {
  for (const middleValue of settings.middlePoints) {
    if (!/^\d+(?:\.\d+?)?$/.test(middleValue)) return true;
  }
  for (const outputValue of settings.outputValues) {
    if (!/^\d+(?:\.\d+?)?$/.test(outputValue) && outputValue !== 'same')
      return true;
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
  const {setNodeHeight: setNodeHeights} = useContext(NodeHeightsContext);
  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    JSON.parse(JSON.stringify(initialSettings))
  );
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as StepperNodeValues;

  useEffect(() => {
    if (init) return;
    const initSettings = nodeSettings[id] as StepperNodeSettings;
    setLocalSettings({
      numSteps: initSettings.numSteps,
      middlePoints: initSettings.middlePoints.map(val => val.toString()),
      outputValues: initSettings.outputValues.map(val => val.toString()),
    });
    setNodeHeights(id, calculateHeight(initSettings));
    setInit(true);
    setError(false);
  }, [nodeSettings]); // eslint-disable-line react-hooks/exhaustive-deps

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

    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {
      numSteps: newLocalSettings.numSteps,
      middlePoints: newLocalSettings.middlePoints.map(val => parseFloat(val)),
      outputValues: newLocalSettings.outputValues.map(val =>
        val === 'same' ? 'same' : parseFloat(val)
      ),
    });
  };

  const handleAdd = () => {
    const newLocalSettings = {
      numSteps: localSettings.numSteps + 1,
      middlePoints: localSettings.middlePoints.concat(''),
      outputValues: localSettings.outputValues.concat(''),
    };
    setLocalSettings(newLocalSettings);
    setNodeHeights(id, calculateHeight(newLocalSettings));
    setError(true);
  };

  const handleRemove = () => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.numSteps -= 1;
    newLocalSettings.middlePoints.pop();
    newLocalSettings.outputValues.pop();
    setLocalSettings(newLocalSettings);
    setNodeHeights(id, calculateHeight(newLocalSettings));

    if (checkError(newLocalSettings)) {
      setError(true);
      return;
    }
    setError(false);

    setNodeSettings(id, {
      numSteps: newLocalSettings.numSteps,
      middlePoints: newLocalSettings.middlePoints.map(val => parseFloat(val)),
      outputValues: newLocalSettings.outputValues.map(val =>
        val === 'same' ? 'same' : parseFloat(val)
      ),
    });
  };

  const isCurrentSlot = (index: number): boolean => {
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

  return (
    <div
      style={{
        height: `${nodeMinHeight + rowHeight * localSettings.numSteps}px`,
        width: '270px',
        border: error ? '1px dashed #e00' : '1px solid #eee',
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
          {Math.round(nodeValue.value * 100) / 100}
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
