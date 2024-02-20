// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  AverageNodeValues,
  AverageNodeSettings,
  NodeHeightsContext,
  NodeSettingsContext,
  NodeValuesContext,
} from '../../context/GraphProvider';

type LocalSettings = {weights: {[key: string]: string}};

const nodeMinHeight = 78.683;
const handleStartHeight = 83;
const rowHeight = 33.9;
const calculateHeight = (handles: string[]) =>
  nodeMinHeight + (handles.length + 1) * rowHeight;

const convertSettingsToFloats = (
  settings: LocalSettings
): AverageNodeSettings => {
  const nodeSettings: AverageNodeSettings = {weights: {}};
  for (const [key, value] of Object.entries(settings.weights))
    nodeSettings.weights[key] = parseFloat(value);
  return nodeSettings;
};
const convertSettingsToStrings = (
  settings: AverageNodeSettings
): LocalSettings => {
  const nodeSettings: LocalSettings = {weights: {}};
  for (const [key, value] of Object.entries(settings.weights))
    nodeSettings.weights[key] = value.toString();
  return nodeSettings;
};
const checkError = (settings: LocalSettings): boolean => {
  for (const weight of Object.values(settings.weights)) {
    if (!/^\d+(?:\.\d+?)?$/.test(weight)) return true;
  }
  return false;
};

const AverageNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeSettings, setNodeSettings} = useContext(NodeSettingsContext);
  const {setNodeHeight} = useContext(NodeHeightsContext);

  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    weights: {},
  });

  const [handles, setHandles] = useState<string[]>([]);
  const [nextFree, setNextFree] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as AverageNodeValues;

  useEffect(() => {
    if (init) return;
    const initSettings = nodeSettings[id] as AverageNodeSettings;
    setLocalSettings(convertSettingsToStrings(initSettings));
    setError(false);
    setInit(true);
  }, [nodeSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!init) return;
    let change = false;
    let maxId = 0;
    let newHandles = [...handles];
    const newLocalSettings = {...localSettings};
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key));
      if (!handles.includes(key)) {
        if (!(key in newLocalSettings.weights))
          newLocalSettings.weights[key] = '';
        newHandles.push(key);
        change = true;
      }
      if (!source.isConnected) {
        newHandles = newHandles.filter(handle => handle !== key);
        delete newLocalSettings.weights[key];
        change = true;
      }
    }
    if (change) {
      setHandles(newHandles);
      setLocalSettings(newLocalSettings);
      setError(checkError(newLocalSettings));
      setNodeSettings(id, convertSettingsToFloats(newLocalSettings));
      setNextFree(maxId + 1);
      setNodeHeight(id, calculateHeight(newHandles));
    }
  }, [nodeValues, init]); // eslint-disable-line react-hooks/exhaustive-deps

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

    setLocalSettings(newLocalSettings);
    setNodeSettings(id, convertSettingsToFloats(newLocalSettings));
  };

  const sources = nodeValue.sources;
  const settings = nodeSettings[id] as AverageNodeSettings;
  let weightSum = 0;
  for (const key of Object.keys(settings.weights)) {
    weightSum += settings.weights[key];
  }

  return (
    <div
      style={{
        height: `${calculateHeight(handles)}px`,
        width: '200px',
        border: error ? '1px dashed #e00' : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
      }}
    >
      <div>
        <h4 style={{margin: 0}}>{data.label}</h4>
        {handles.map((handleId, index) => (
          <Handle
            key={`handle-${id}-${handleId}`}
            type="target"
            style={{
              height: '12px',
              width: '12px',
              top: `${handleStartHeight + index * rowHeight}px`,
            }}
            position={Position.Left}
            id={handleId}
            isConnectable={isConnectable}
          />
        ))}
        <Handle
          type="target"
          style={{
            height: '12px',
            width: '12px',
            top: `${
              handleStartHeight +
              Object.keys(localSettings.weights).length * rowHeight
            }px`,
          }}
          position={Position.Left}
          id={nextFree.toString()}
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
                  {!(key in sources) ||
                  !(key in settings.weights) ||
                  weightSum === 0
                    ? 0
                    : Math.round(
                        (((sources[key].value as number) *
                          settings.weights[key]) /
                          weightSum) *
                          100
                      ) / 100}
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
          {Math.round(nodeValue.value * 100) / 100}
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
