// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {type ChangeEvent, type JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Handle, type NodeProps, Position} from 'reactflow';

import type {SourceNodeSettings, SourceNodeValue} from '@/common/types';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type OnFailSetting = 'fullfail' | 'fail';
type LocalSettings = {onFailSetting: OnFailSetting; minPoints: string};

const SourceNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as SourceNodeSettings;
  const initSettings = {
    ...settings,
    minPoints: settings.minPoints !== null ? settings.minPoints.toString() : '',
  };

  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initSettings);
  const [error, setError] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as SourceNodeValue;

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (localSettings.onFailSetting === event.target.value) return;

    const newLocalSettings = {
      ...localSettings,
      onFailSetting: event.target.value as OnFailSetting,
    };
    setLocalSettings(newLocalSettings);

    // Check if is not valid float
    if (!/^\d+(?:\.\d+?)?$/.test(newLocalSettings.minPoints)) {
      return;
    }
    setNodeSettings(id, {
      ...newLocalSettings,
      minPoints: parseFloat(newLocalSettings.minPoints),
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {...localSettings, minPoints: event.target.value};
    setLocalSettings(newLocalSettings);

    // Check if is not valid float
    if (
      newLocalSettings.minPoints !== '' &&
      !/^\d+(?:\.\d+?)?$/.test(newLocalSettings.minPoints)
    ) {
      setError(true);
      return;
    }
    setError(false);

    setNodeSettings(id, {
      ...newLocalSettings,
      minPoints:
        newLocalSettings.minPoints === ''
          ? null
          : parseFloat(newLocalSettings.minPoints),
    });
  };

  return (
    <BaseNode {...props} error={error} fullFail={nodeValue.fullFail}>
      <div>
        <label>{t('shared.graph.min-points')}: </label>
        <input
          style={{width: '70px'}}
          onChange={handleChange}
          type="number"
          value={localSettings.minPoints}
        />
      </div>
      {settings.minPoints !== null && (
        <div style={{textAlign: 'left'}}>
          <label>{t('shared.graph.on-fail')}: </label>
          <select
            onChange={handleSelectChange}
            value={localSettings.onFailSetting}
          >
            <option value="fullfail">{t('shared.graph.full-fail')}</option>
            <option value="fail">{t('shared.graph.output-fail')}</option>
          </select>
        </div>
      )}

      <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
        <p className="output-value" style={{margin: '5px 0px 0px 0px'}}>
          {t('shared.graph.value')}: {Math.round(nodeValue.source * 100) / 100}
        </p>
        <p className="output-value" style={{margin: '5px 0px 0px 0px'}}>
          {t('shared.graph.output')}:{' '}
          {nodeValue.value === 'fail'
            ? 'fail'
            : Math.round(nodeValue.value * 100) / 100}
        </p>
      </div>

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

export default SourceNode;
