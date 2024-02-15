// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  NodeValuesContext,
  MaxNodeValues,
  NodeHeightsContext,
  NodeSettingsContext,
  MaxNodeSettings,
} from '../../context/GraphProvider';

type LocalSettings = {minValue: string};
const initialSettings = {minValue: 'fail'};

const nodeMinHeight = 78.683;
const handleStartHeight = 83 + 33.9;
const rowHeight = 33.9;
const calculateHeight = (handles: string[]) =>
  nodeMinHeight + (handles.length + 2) * rowHeight;

const MaxNode = ({id, data, isConnectable}: NodeProps) => {
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

  const nodeValue = nodeValues[id] as MaxNodeValues;

  useEffect(() => {
    if (init) return;
    const initSettings = nodeSettings[id] as MaxNodeSettings;
    setLocalSettings({minValue: initSettings.minValue.toString()});
    setNodeHeights(id, calculateHeight(handles));
    setError(false);
    setInit(true);
  }, [nodeSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let change = false;
    let newHandles = [...handles];
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      if (!(key in handles)) {
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
      setNextFree(nextFree + 1);
      setNodeHeights(id, calculateHeight(handles));
    }
  }, [nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.minValue = event.target.value;
    setLocalSettings(newLocalSettings);

    if (
      !/^\d+(?:\.\d+?)?$/.test(event.target.value) &&
      event.target.value !== 'fail'
    ) {
      setError(true);
      return;
    }
    setError(false);

    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {
      minValue:
        newLocalSettings.minValue === 'fail'
          ? 'fail'
          : parseFloat(newLocalSettings.minValue),
    });
  };

  let selectedIndex = -1;
  for (const value of Object.values(nodeValue.sources)) {
    selectedIndex++;
    if (value.value === nodeValue.value) break;
  }
  if (nodeValue.value === 'fail') selectedIndex = -1;

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
                onChange={handleChange}
                value={localSettings.minValue}
              />
            </td>
          </tr>

          {Object.entries(nodeValue.sources).map(([key, source], index) => (
            <tr
              key={`tr-${id}-${key}`}
              style={{
                height: rowHeight,
                backgroundColor:
                  source.value === 'fail'
                    ? '#f003'
                    : index === selectedIndex
                    ? '#00f6'
                    : '',
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

      <p style={{margin: 0, display: 'inline'}}>
        {nodeValue.value === 'fail'
          ? 'fail'
          : Math.round(nodeValue.value * 100) / 100}
      </p>
      <Handle
        type="source"
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default MaxNode;
