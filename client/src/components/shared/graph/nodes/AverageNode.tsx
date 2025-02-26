// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type ChangeEvent,
  type JSX,
  useContext,
  useEffect,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Handle,
  type NodeProps,
  Position,
  useUpdateNodeInternals,
} from 'reactflow';

import type {AverageNodeSettings, AverageNodeValue} from '@/common/types';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {
  weights: {[key: string]: string};
  percentageMode: boolean;
};
const handleStartHeight = 103;
const rowHeight = 33.9;

const convertSettingsToFloats = (
  settings: LocalSettings
): AverageNodeSettings => ({
  ...settings,
  weights: Object.fromEntries(
    Object.entries(settings.weights).map(([key, value]) => [
      key,
      parseFloat(value),
    ])
  ),
});
const convertSettingsToStrings = (
  settings: AverageNodeSettings
): LocalSettings => ({
  ...settings,
  weights: Object.fromEntries(
    Object.entries(settings.weights).map(([key, value]) => [
      key,
      value.toString(),
    ])
  ),
});

const checkError = (settings: LocalSettings): boolean => {
  for (const weight of Object.values(settings.weights)) {
    if (!/^\d+(?:\.\d+?)?$/.test(weight)) return true;
  }
  return false;
};

const AverageNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as AverageNodeSettings;

  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    convertSettingsToStrings(settings)
  );
  const [handles, setHandles] = useState<string[]>([]);
  const [nextFree, setNextFree] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as AverageNodeValue;

  // Unoptimal useEffect, but we must update parent state (settings) when
  // The node inputs change...
  useEffect(() => {
    let change = false;
    let maxId = 0;
    let newHandles = [...handles];
    const newLocalSettings = {...localSettings};
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-').at(-1)!));
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
      setTimeout(() => updateNodeInternals(id), 0);
      setHandles(newHandles);
      setLocalSettings(newLocalSettings);
      setNextFree(maxId + 1);

      if (checkError(newLocalSettings)) {
        setError(true);
        return;
      }
      setError(false);
      setNodeSettings(id, convertSettingsToFloats(newLocalSettings));
    }
    // The JSON.stringify() is a hacky solution to get React to realize that the sources updated
  }, [JSON.stringify(nodeValue.sources)]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheck = (event: ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {
      ...localSettings,
      percentageMode: event.target.checked,
    };

    setLocalSettings(newLocalSettings);
    setError(checkError(newLocalSettings));
  };

  const handleChange = (
    key: string,
    event: ChangeEvent<HTMLInputElement>
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
  let weightSum = 0;
  for (const key of Object.keys(settings.weights)) {
    weightSum += settings.weights[key];
  }

  let percentageSum = 0;
  for (const key of Object.keys(localSettings.weights)) {
    // Check if is valid float
    if (/^\d+(?:\.\d+?)?$/.test(localSettings.weights[key])) {
      percentageSum += parseFloat(localSettings.weights[key]);
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
          top: `${
            handleStartHeight +
            Object.keys(localSettings.weights).length * rowHeight
          }px`,
        }}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <input
        type="checkbox"
        id={`percentage-${id}`}
        onChange={handleCheck}
        checked={localSettings.percentageMode}
      />
      <label htmlFor={`percentage-${id}`}>
        {t('shared.graph.percentage-mode')}
      </label>

      <table style={{width: '100%', margin: '5px 0px 0px 0px'}}>
        <tbody>
          <tr>
            <th>{t('shared.graph.weight')}</th>
            <th>{t('shared.graph.value')}</th>
          </tr>
          {Object.entries(localSettings.weights).map(([key, weight]) => (
            <tr key={key}>
              <td>
                <input
                  style={{width: '40px'}}
                  type="number"
                  value={weight}
                  onChange={event => handleChange(key, event)}
                />
                {localSettings.percentageMode && ' %'}
              </td>
              <td>
                {!(key in sources) ||
                !(key in settings.weights) ||
                weightSum === 0
                  ? 0
                  : Math.round(
                      ((sources[key].value * settings.weights[key]) /
                        weightSum) *
                        100
                    ) / 100}
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input style={{width: '40px'}} type="number" disabled />
              {localSettings.percentageMode && ' %'}
            </td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
      {localSettings.percentageMode && (
        <p
          style={{
            margin: '2px 0px -2px 0px',
            color: Math.abs(percentageSum - 100) >= 1 ? 'red' : '',
          }}
        >
          Sum {Math.round(percentageSum * 10) / 10} %
        </p>
      )}
      <p className="output-value" style={{marginTop: '5px'}}>
        {t('shared.graph.node.average')}:{' '}
        {Math.round(nodeValue.value * 100) / 100}
      </p>

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

export default AverageNode;
