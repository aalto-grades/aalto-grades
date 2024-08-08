// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ChangeEvent, JSX, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Handle, NodeProps, Position} from 'reactflow';

import {MinPointsNodeSettings, MinPointsNodeValue} from '@/common/types/graph';
import BaseNode from './BaseNode';
import {
  NodeDataContext,
  NodeValuesContext,
} from '../../../context/GraphProvider';

type OnFailSetting = 'coursefail' | 'fail';
type LocalSettings = {onFailSetting: OnFailSetting; minPoints: string};
const initialSettings: LocalSettings = {
  onFailSetting: 'coursefail',
  minPoints: '0',
};

const MinPointsNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {id, isConnectable} = props;

  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initialSettings);
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as MinPointsNodeValue;
  const settings = nodeData[id].settings as MinPointsNodeSettings;

  useEffect(() => {
    if (init) return;
    setLocalSettings({...settings, minPoints: settings.minPoints.toString()});
    setError(false);
    setInit(true);
  }, [nodeData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (localSettings.onFailSetting === event.target.value) return;

    const newLocalSettings = {
      ...localSettings,
      onFailSetting: event.target.value as OnFailSetting,
    };
    setLocalSettings(newLocalSettings);

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

    if (!/^\d+(?:\.\d+?)?$/.test(newLocalSettings.minPoints)) {
      setError(true);
      return;
    }
    setError(false);

    setNodeSettings(id, {
      ...newLocalSettings,
      minPoints: parseFloat(newLocalSettings.minPoints),
    });
  };

  return (
    <BaseNode {...props} error={error} courseFail={nodeValue.courseFail}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <div>
        <label>{t('graph.min-points')}: </label>
        <input
          style={{width: '70px'}}
          onChange={handleChange}
          type="number"
          value={localSettings.minPoints}
        />
      </div>
      <div style={{textAlign: 'left'}}>
        <label>{t('graph.on-fail')}: </label>
        <select
          onChange={handleSelectChange}
          value={localSettings.onFailSetting}
        >
          <option value="coursefail">{t('graph.fail-course')}</option>
          <option value="fail">{t('graph.output-fail')}</option>
        </select>
      </div>
      <p className="output-value">
        {t('graph.output')}:{' '}
        {nodeValue.value === 'fail'
          ? 'fail'
          : Math.round(nodeValue.value * 100) / 100}
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

export default MinPointsNode;
