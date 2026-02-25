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

import type {MaxNodeSettings, MaxNodeValue} from '@/common/types';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {minValue: string; mode: MaxNodeSettings['mode']};
const handleStartHeight = 83 + 33.9;
const rowHeight = 33.9;

const MaxNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as MaxNodeSettings;

  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    minValue: settings.minValue === null ? '' : settings.minValue.toString(),
    mode: settings.mode ?? 'max',
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
      maxId = Math.max(maxId, Number.parseInt(key.split('-').at(-1)!));
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.minValue = event.target.value;
    setLocalSettings(newLocalSettings);

    // Allow empty (means null baseline) or a signed float
    if (event.target.value !== '' && !/^-?\d+(?:\.\d+)?$/.test(event.target.value)) {
      setError(true);
      return;
    }
    setError(false);

    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {
      minValue: newLocalSettings.minValue === '' ? null : Number.parseFloat(newLocalSettings.minValue),
      mode: newLocalSettings.mode,
    });
  };

  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const newMode = event.target.value;
    const newLocalSettings = {...localSettings, mode: newMode as MaxNodeSettings['mode']};
    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {
      minValue:
        newLocalSettings.minValue === ''
          ? null
          : Number.parseFloat(newLocalSettings.minValue),
      mode: newMode as MaxNodeSettings['mode'],
    });
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

      <table
        style={{
          width: '100%',
          margin: '5px 0px',
          backgroundColor: theme.palette.graph.light,
        }}
      >
        <tbody>
          <tr>
            <th>{t('shared.graph.value')}</th>
          </tr>
          <tr
            style={{
              height: rowHeight,
              background: selectedIndex === -1 ? theme.palette.graph.dark : '',
            }}
          >
            <td>
              <div
                style={{display: 'flex', gap: '6px', alignItems: 'center'}}
              >
                <select value={localSettings.mode} onChange={handleModeChange}>
                  <option value="max">{t('shared.graph.node.mode.max')}</option>
                  <option value="min">{t('shared.graph.node.mode.min')}</option>
                  <option value="sum">{t('shared.graph.node.mode.sum')}</option>
                  <option value="average">{t('shared.graph.node.mode.average')}</option>
                  <option value="median">{t('shared.graph.node.mode.median')}</option>
                  <option value="product">{t('shared.graph.node.mode.product')}</option>
                  <option value="count">{t('shared.graph.node.mode.count')}</option>
                  <option value="stdev">{t('shared.graph.node.mode.stdev')}</option>
                </select>
                {['min', 'sum', 'count', 'max'].includes(localSettings.mode ?? 'max') && (
                  <input
                    title={t('shared.graph.node.baseline-tooltip')}
                    placeholder=""
                    style={{width: '50px'}}
                    onChange={handleChange}
                    type="number"
                    value={localSettings.minValue}
                  />
                )}
              </div>
            </td>
          </tr>

          {Object.entries(nodeValue.sources)
            .filter(([, source]) => source.isConnected)
            .map(([key, source], index) => (
              <tr
                key={key}
                style={{
                  height: rowHeight,
                  backgroundColor:
                    index === selectedIndex ? theme.palette.graph.dark : '',
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
