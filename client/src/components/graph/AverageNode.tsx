// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  AverageNodeIO,
  AverageNodeSettings,
  NodeSettingsContext,
  NodeValuesContext,
} from '../../context/GraphProvider';

type AverageNodeLocalSettings = {
  weights: {[key: string]: string};
  nextFree: number;
};
const initialSettings = {
  weights: {},
  nextFree: 100,
};

const convertSettingsToInts = (
  settings: AverageNodeLocalSettings
): AverageNodeSettings => {
  const nodeSettings: AverageNodeSettings = {
    weights: {},
    nextFree: settings.nextFree,
  };
  for (const [key, value] of Object.entries(settings.weights))
    nodeSettings.weights[key] = parseInt(value);
  return nodeSettings;
};
const convertSettingsToStrings = (
  settings: AverageNodeSettings
): AverageNodeLocalSettings => {
  const nodeSettings: AverageNodeLocalSettings = {
    weights: {},
    nextFree: settings.nextFree,
  };
  for (const [key, value] of Object.entries(settings.weights))
    nodeSettings.weights[key] = value.toString();
  return nodeSettings;
};
const checkError = (settings: AverageNodeLocalSettings): boolean => {
  for (const weight of Object.values(settings.weights)) {
    if (!/^\d*$/.test(weight) || weight.length === 0) return true;
  }
  return false;
};

const AverageNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeSettings, setNodeSettings} = useContext(NodeSettingsContext);
  const [localSettings, setLocalSettings] =
    useState<AverageNodeLocalSettings>(initialSettings);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setLocalSettings(
      convertSettingsToStrings(nodeSettings[id] as AverageNodeSettings)
    );
    setError(false);
  }, [id, nodeSettings]);

  const handleChange = (
    key: string,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.weights[key] = event.target.value;
    setLocalSettings(newLocalSettings);

    if (checkError(newLocalSettings)) {
      setError(true);
      return;
    }
    setError(false);

    const newNodeSettings = {...nodeSettings};
    newNodeSettings[id] = convertSettingsToInts(newLocalSettings);
    setLocalSettings(newLocalSettings);
    setNodeSettings(newNodeSettings);
  };

  // Check for new or removed
  useEffect(() => {
    const sources = (nodeValues[id] as AverageNodeIO).sources;
    for (const key of Object.keys(sources)) {
      if (key in localSettings.weights) continue;

      const newLocalSettings = {...localSettings};
      newLocalSettings.weights[key] = '';
      newLocalSettings.nextFree++;
      setLocalSettings(newLocalSettings);
      setError(true);
    }
    for (const [key, source] of Object.entries(sources)) {
      if (source.num !== 0) continue;
      const newLocalSettings = {...localSettings};
      delete sources[key];
      delete newLocalSettings.weights[key];
      const newNodeSettings = {...nodeSettings};
      newNodeSettings[id] = convertSettingsToInts(newLocalSettings);

      const newError = checkError(newLocalSettings);
      if (newError) {
        setError(true);
        return;
      }
      setError(false);
      setNodeSettings(newNodeSettings);
      setLocalSettings(newLocalSettings);
      break;
    }
  }, [id, localSettings, nodeSettings, nodeValues, setNodeSettings]);

  const sources = (nodeValues[id] as AverageNodeIO).sources;
  const settings = nodeSettings[id] as AverageNodeSettings;
  let weightSum = 0;
  for (const key of Object.keys(settings.weights)) {
    weightSum += sources[key].num * settings.weights[key];
  }

  return (
    <div
      style={{
        height: `${
          87 + 33.35 * (Object.keys(localSettings.weights).length + 1)
        }px`,
        width: '270px',
        border: error ? '1px solid #e00' : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
      }}
    >
      <div>
        <h4 style={{margin: 0}}>{data.label}</h4>
        {Object.keys(localSettings.weights).map((key, index) => (
          <Handle
            key={`handle-${id}-${key}`}
            type="target"
            style={{
              height: '12px',
              width: '12px',
              top: `${82 + index * 33.351}px`,
            }}
            position={Position.Left}
            id={key}
            isConnectable={isConnectable}
          />
        ))}
        <Handle
          type="target"
          style={{
            height: '12px',
            width: '12px',
            top: `${82 + Object.keys(localSettings.weights).length * 33.351}px`,
          }}
          position={Position.Left}
          id={localSettings.nextFree.toString()}
          isConnectable={isConnectable}
        />

        <table style={{width: '100%', margin: '5px 0px'}}>
          <tbody>
            <tr>
              <th>Weight</th>
              <th>value</th>
            </tr>
            {Object.entries(localSettings.weights).map(([key, weight]) => (
              <tr key={`tr-${id}-${key}`}>
                <td>
                  <input
                    style={{width: '40px'}}
                    type="number"
                    value={weight}
                    onChange={event => handleChange(key, event)}
                  />
                </td>
                <td>
                  {key in sources && key in settings.weights
                    ? Math.round(
                        ((sources[key].sum * settings.weights[key]) /
                          weightSum) *
                          100
                      ) / 100
                    : 0}
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <input style={{width: '40px'}} type="number" disabled />
              </td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
        <p style={{margin: 0, display: 'inline'}}>
          {Math.round(nodeValues[id].value * 100) / 100}
        </p>
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

export default AverageNode;
