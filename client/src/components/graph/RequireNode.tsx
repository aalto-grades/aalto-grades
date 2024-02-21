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
  RequireNodeSettings,
  RequireNodeValues,
} from '../../context/GraphProvider';

type LocalSettings = {numFail: string; failSetting: 'ignore' | 'coursefail'};
const initialSettings = {numFail: 0, failSetting: 'courseFail'};

const nodeMinHeight = 180.93 - 33.9;
const handleStartHeight = nodeMinHeight - 10 + 33.9;
const rowHeight = 33.9;
const calculateHeight = (handles: string[]) =>
  nodeMinHeight + (handles.length + 1) * rowHeight;

const RequireNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {setNodeHeight: setNodeHeights} = useContext(NodeHeightsContext);
  const {nodeSettings, setNodeSettings} = useContext(NodeSettingsContext);

  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    JSON.parse(JSON.stringify(initialSettings))
  );
  const [nextFree, setNextFree] = useState<number>(0);
  const [handles, setHandles] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as RequireNodeValues;
  const settings = nodeSettings[id] as RequireNodeSettings;

  useEffect(() => {
    if (init) return;
    setLocalSettings({...settings, numFail: settings.numFail.toString()});
    setNodeHeights(id, calculateHeight(handles));
    setError(false);
    setInit(true);
  }, [nodeSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let change = false;
    let maxId = 0;
    let newHandles = [...handles];
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-')[1]));
      if (!newHandles.includes(key)) {
        newHandles.push(key);
        change = true;
      }
      if (!source.isConnected) {
        newHandles = newHandles.filter(handle => handle !== key);
        change = true;
      }
    }
    if (change) {
      setHandles(newHandles);
      setNextFree(maxId + 1);
      setNodeHeights(id, calculateHeight(newHandles));
    }
  }, [nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.numFail = event.target.value;
    setLocalSettings(newLocalSettings);

    if (
      !/^\d+$/.test(event.target.value) ||
      parseInt(event.target.value) > handles.length
    ) {
      setError(true);
      return;
    }
    setError(false);
    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {
      ...newLocalSettings,
      numFail: parseInt(newLocalSettings.numFail),
    });
  };

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    if (localSettings.failSetting === event.target.value) return;
    const newLocalSettings = {
      ...localSettings,
      failSetting: event.target.value as 'ignore' | 'coursefail',
    };
    setLocalSettings(newLocalSettings);
    if (
      /^\d+$/.test(newLocalSettings.numFail) &&
      parseInt(newLocalSettings.numFail) <= handles.length
    ) {
      setNodeSettings(id, {
        ...newLocalSettings,
        numFail: parseInt(newLocalSettings.numFail),
      });
    }
  };

  const numFail = Object.values(nodeValue.sources).reduce(
    (sum, source) =>
      source.isConnected && source.value === 'reqfail' ? sum + 1 : sum,
    0
  );

  return (
    <div
      style={{
        height: `${calculateHeight(handles)}px`,
        width: '130px',
        border: nodeValue.courseFail
          ? '2px solid #e00'
          : error
          ? '1px dashed #e00'
          : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: nodeValue.courseFail || error ? '#fffafa' : 'white',
      }}
    >
      <h4 style={{margin: 0}}>{data.label}</h4>
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
      <label>On fail</label>
      <select onChange={handleSelectChange} value={localSettings.failSetting}>
        <option value="zeroes">Output zeroes</option>
        <option value="coursefail">Fail course</option>
      </select>
      <label>Allowed Fails</label>
      <input
        style={{width: 'calc(100% - 20px)'}}
        type="number"
        onChange={handleChange}
        value={localSettings.numFail}
      />
      <table style={{width: '100%', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th>in</th>
            <th>out</th>
          </tr>
          {Object.entries(nodeValue.sources)
            .filter(([_, source]) => source.isConnected)
            .map(([key, source]) => (
              <tr
                key={`tr-${key}`}
                style={{
                  height: rowHeight,
                  backgroundColor: source.value === 'reqfail' ? '#f003' : '',
                }}
              >
                <td>{source.value}</td>
                <td>
                  {numFail > settings.numFail || source.value === 'reqfail'
                    ? 0
                    : source.value}
                </td>
              </tr>
            ))}
          <tr style={{height: rowHeight}}>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      {handles.map((key, index) => (
        <Handle
          key={`handle-${key}-source`}
          type="source"
          id={`${key}-source`}
          style={{
            height: '12px',
            width: '12px',
            top: `${handleStartHeight + index * rowHeight}px`,
          }}
          position={Position.Right}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
};

export default RequireNode;
