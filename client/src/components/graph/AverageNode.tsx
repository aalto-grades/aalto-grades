// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  AverageNodeIO,
  AverageNodeSettings,
  NodeHeightsContext,
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

const initHeight = 78;
const rowHeight = 34;

const convertSettingsToFloats = (
  settings: AverageNodeLocalSettings
): AverageNodeSettings => {
  const nodeSettings: AverageNodeSettings = {
    weights: {},
    nextFree: settings.nextFree,
  };
  for (const [key, value] of Object.entries(settings.weights))
    nodeSettings.weights[key] = parseFloat(value);
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
    if (!/^\d+(?:\.\d+?)?$/.test(weight)) return true;
  }
  return false;
};

const AverageNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeSettings, setNodeSettings} = useContext(NodeSettingsContext);
  const {setNodeHeights} = useContext(NodeHeightsContext);
  const [localSettings, setLocalSettings] = useState<AverageNodeLocalSettings>(
    JSON.parse(JSON.stringify(initialSettings))
  );
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as AverageNodeIO;

  useEffect(() => {
    if (init) return;
    const initSettings = nodeSettings[id] as AverageNodeSettings;
    setLocalSettings(convertSettingsToStrings(initSettings));

    setNodeHeights(nodeHeights => {
      const newNodeHeights = {...nodeHeights};
      const numRows = Object.keys(initSettings.weights).length + 1;
      newNodeHeights[id] = initHeight + numRows * rowHeight;
      return newNodeHeights;
    });

    setError(false);
    setInit(true);
  }, [nodeSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for new or removed
  useEffect(() => {
    if (!init) return;
    const newLocalSettings = {...localSettings};
    const sources = nodeValue.sources;
    for (const [key, source] of Object.entries(sources)) {
      if (!(key in localSettings.weights)) {
        newLocalSettings.weights[key] = '';
        newLocalSettings.nextFree++;
      }
      if (!source.isConnected) {
        delete sources[key];
        delete newLocalSettings.weights[key];
      }
    }

    setLocalSettings(newLocalSettings);
    const newError = checkError(newLocalSettings);
    if (newError) {
      setError(true);
      return;
    }
    setError(false);

    setNodeSettings(nodeSettings => {
      const newNodeSettings = {...nodeSettings};
      newNodeSettings[id] = convertSettingsToFloats(newLocalSettings);
      return newNodeSettings;
    });
    setNodeHeights(nodeHeights => {
      const newNodeHeights = {...nodeHeights};
      const numRows = Object.keys(newLocalSettings.weights).length + 1;
      newNodeHeights[id] = initHeight + numRows * rowHeight;
      return newNodeHeights;
    });
  }, [nodeValue, init]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setNodeSettings(nodeSettings => {
      const newNodeSettings = {...nodeSettings};
      newNodeSettings[id] = convertSettingsToFloats(newLocalSettings);
      return newNodeSettings;
    });
  };

  const sources = nodeValue.sources;
  const settings = nodeSettings[id] as AverageNodeSettings;
  let weightSum = 0;
  for (const key of Object.keys(settings.weights)) {
    if (nodeValue.sources[key].value !== 'fail')
      weightSum += settings.weights[key];
  }

  return (
    <div
      style={{
        height: `${
          initHeight +
          rowHeight * (Object.keys(localSettings.weights).length + 1)
        }px`,
        width: '200px',
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
              top: `${initHeight + 5 + index * rowHeight}px`,
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
            top: `${
              initHeight +
              5 +
              Object.keys(localSettings.weights).length * rowHeight
            }px`,
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
              <tr
                key={`tr-${id}-${key}`}
                style={{
                  backgroundColor: sources[key].value === 'fail' ? '#f003' : '',
                }}
              >
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
                    : sources[key].value === 'fail'
                    ? 'fail'
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
