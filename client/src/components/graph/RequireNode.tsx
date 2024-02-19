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

type LocalSettings = {numMissing: string};
const initialSettings = {numMissing: 0};

const nodeMinHeight = 78.683;
const handleStartHeight = 83 + 33.9;
const rowHeight = 33.9;
const calculateHeight = (handles: string[]) =>
  nodeMinHeight + (handles.length + 2) * rowHeight;

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
    setLocalSettings({numMissing: settings.numMissing.toString()});
    setNodeHeights(id, calculateHeight(handles));
    setError(false);
    setInit(true);
  }, [nodeSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let change = false;
    let numNew = 0;
    let newHandles = [...handles];
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      if (!newHandles.includes(key)) {
        numNew++;
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
      setNextFree(oldNextFree => oldNextFree + numNew);
      setNodeHeights(id, calculateHeight(newHandles));
    }
  }, [nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.numMissing = event.target.value;
    setLocalSettings(newLocalSettings);

    if (
      !/^\d+$/.test(event.target.value) ||
      parseInt(event.target.value) >= handles.length
    ) {
      setError(true);
      return;
    }
    setError(false);
    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {numMissing: parseInt(newLocalSettings.numMissing)});
  };

  return (
    <div
      style={{
        height: `${calculateHeight(handles)}px`,
        width: '90px',
        border: error ? '1px solid #e00' : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
      }}
    >
      <h4 style={{margin: 0}}>{data.label}</h4>
      {handles.map((key, index) => (
        <Handle
          key={`handle-${id}-${key}`}
          type="target"
          style={{
            height: '12px',
            width: '12px',
            top: `${handleStartHeight + index * rowHeight}px`,
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
          top: `${handleStartHeight + handles.length * rowHeight}px`,
        }}
        position={Position.Left}
        id={nextFree.toString()}
        isConnectable={isConnectable}
      />
      <table style={{width: '100%', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th>value</th>
          </tr>
          <tr style={{height: rowHeight}}>
            <td>
              <input
                style={{width: 'calc(100% - 20px)'}}
                type="number"
                onChange={handleChange}
                value={localSettings.numMissing}
              />
            </td>
          </tr>

          {Object.entries(nodeValue.sources).map(([key, source]) => (
            <tr
              key={`tr-${id}-${key}`}
              style={{
                height: rowHeight,
                backgroundColor: source.value === 'fail' ? '#f003' : '',
              }}
            >
              <td>{source.value}</td>
            </tr>
          ))}
          <tr style={{height: rowHeight}}>
            <td></td>
          </tr>
        </tbody>
      </table>
      {handles.map((key, index) => (
        <Handle
          key={`handle-${id}-${key}-source`}
          type="source"
          style={{
            height: '12px',
            width: '12px',
            top: `${handleStartHeight + index * rowHeight}px`,
          }}
          position={Position.Right}
          id={key}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
};

export default RequireNode;
