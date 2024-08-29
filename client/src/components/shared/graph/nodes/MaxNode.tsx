// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {type JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Handle,
  type NodeProps,
  Position,
  useUpdateNodeInternals,
} from 'reactflow';

import type {MaxNodeSettings, MaxNodeValue} from '@/common/types';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {minValue: string};
const handleStartHeight = 83 + 33.9;
const rowHeight = 33.9;

const MaxNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {id, isConnectable} = props;

  const updateNodeInternals = useUpdateNodeInternals();
  const nodeValues = useContext(NodeValuesContext);
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);

  const settings = nodeData[id].settings as MaxNodeSettings;
  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    minValue: settings.minValue.toString(),
  });
  const [nextFree, setNextFree] = useState<number>(0);
  const [handles, setHandles] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as MaxNodeValue;

  const [oldSources, setOldSources] = useState<typeof nodeValue.sources>({});
  if (JSON.stringify(nodeValue.sources) !== JSON.stringify(oldSources)) {
    setOldSources(structuredClone(nodeValue.sources));

    let change = false;
    let maxId = 0;
    let newHandles = [...handles];
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-').at(-1)!));
      if (!handles.includes(key)) {
        newHandles.push(key);
        change = true;
      }
      if (!source.isConnected) {
        newHandles = newHandles.filter(handle => handle !== key);
        change = true;
      }
    }
    if (change) {
      setTimeout(() => updateNodeInternals(id), 0);
      setHandles(newHandles);
      setNextFree(maxId + 1);
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.minValue = event.target.value;
    setLocalSettings(newLocalSettings);

    if (!/^\d+(?:\.\d+?)?$/.test(event.target.value)) {
      setError(true);
      return;
    }
    setError(false);

    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {minValue: parseFloat(newLocalSettings.minValue)});
  };

  let selectedIndex = -1;
  let i = -1;
  for (const value of Object.values(nodeValue.sources)) {
    i++;
    if (value.value === nodeValue.value) {
      selectedIndex = i;
      break;
    }
  }

  return (
    <BaseNode {...props} error={error}>
      {handles.map((key, index) => (
        <Handle
          key={key}
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

      <table style={{width: '100%', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th>{t('shared.graph.value')}</th>
          </tr>
          <tr
            style={{
              height: rowHeight,
              background: selectedIndex === -1 ? '#ccf' : '',
            }}
          >
            <td>
              <input
                style={{width: '50px'}}
                onChange={handleChange}
                type="number"
                value={localSettings.minValue}
              />
            </td>
          </tr>

          {Object.entries(nodeValue.sources)
            .filter(([, source]) => source.isConnected)
            .map(([key, source], index) => (
              <tr
                key={key}
                style={{
                  height: rowHeight,
                  backgroundColor: index === selectedIndex ? '#ccf' : '',
                }}
              >
                <td>{Math.round(source.value * 100) / 100}</td>
              </tr>
            ))}
          <tr style={{height: rowHeight}}>
            <td />
          </tr>
        </tbody>
      </table>

      <Handle
        type="source"
        id={`${id}-source`}
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
};

export default MaxNode;
