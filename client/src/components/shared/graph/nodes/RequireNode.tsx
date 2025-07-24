// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {useTheme} from '@mui/material';
import {
  Handle,
  type NodeProps,
  Position,
  useUpdateNodeInternals,
} from '@xyflow/react';
import {type ChangeEvent, type JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {RequireNodeSettings, RequireNodeValue} from '@/common/types';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {numFail: string; onFailSetting: 'fullfail' | 'fail'};
const handleStartHeight = 128.5;
const rowHeight = 33.9;

const RequireNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as RequireNodeSettings;
  const initSettings = {...settings, numFail: settings.numFail.toString()};

  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initSettings);
  const [nextFree, setNextFree] = useState<number>(0);
  const [handles, setHandles] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as RequireNodeValue;

  const [oldSources, setOldSources] = useState<typeof nodeValue.sources>({});
  if (JSON.stringify(nodeValue.sources) !== JSON.stringify(oldSources)) {
    setOldSources(structuredClone(nodeValue.sources));

    let change = false;
    let maxId = 0;
    let newHandles = [...handles];
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-').at(-1)!));
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
      setTimeout(() => updateNodeInternals(id), 0);
      setHandles(newHandles);
      setNextFree(maxId + 1);
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
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

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (localSettings.onFailSetting === event.target.value) return;
    const newLocalSettings = {
      ...localSettings,
      onFailSetting: event.target.value as 'fullfail' | 'fail',
    };
    setLocalSettings(newLocalSettings);

    // Update global settings if local setting are valid
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
      source.isConnected && source.value === 'fail' ? sum + 1 : sum,
    0
  );

  return (
    <BaseNode {...props} error={error} fullFail={nodeValue.fullFail}>
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

      <div>
        <label>{t('shared.graph.on-fail')} </label>
        <select
          onChange={handleSelectChange}
          value={localSettings.onFailSetting}
        >
          <option value="fullfail">{t('shared.graph.full-fail')}</option>
          <option value="fail">{t('shared.graph.output-fail')}</option>
        </select>
      </div>
      <div>
        <label>{t('shared.graph.allowed-fails')} </label>
        <input
          style={{width: '90px'}}
          type="number"
          onChange={handleChange}
          value={localSettings.numFail}
        />
      </div>
      <table
        style={{
          width: '200px',
          margin: '5px 0px',
          backgroundColor: theme.palette.graph.light,
        }}
      >
        <tbody>
          <tr>
            <th style={{width: '50%'}}>{t('shared.graph.in')}</th>
            <th>{t('shared.graph.out')}</th>
          </tr>
          {Object.entries(nodeValue.sources)
            .filter(([, source]) => source.isConnected)
            .map(([key, source]) => (
              <tr
                key={key}
                style={{
                  height: rowHeight,
                  backgroundColor: source.value === 'fail' ? '#fcc' : '',
                }}
              >
                <td>
                  {source.value === 'fail'
                    ? source.value
                    : Math.round(source.value * 100) / 100}
                </td>
                <td>
                  {!(key in nodeValue.values)
                    ? '' // Happens sometimes when loading graph for the first time
                    : numFail > settings.numFail ||
                        nodeValue.values[key] === 'fail'
                      ? nodeValue.values[key]
                      : Math.round(
                          (nodeValue.values[key]) * 100  
                        ) / 100}
                </td>
              </tr>
            ))}
          <tr style={{height: rowHeight}}>
            <td />
            <td />
          </tr>
        </tbody>
      </table>

      {handles.map((key, index) => (
        <Handle
          key={key}
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
    </BaseNode>
  );
};

export default RequireNode;
