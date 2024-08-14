// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ChangeEvent, JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Handle, NodeProps, Position} from 'reactflow';

import {
  CoursePartNodeSettings,
  CoursePartNodeValue,
} from '@/common/types/graph';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type OnFailSetting = 'coursefail' | 'fail';
type LocalSettings = {onFailSetting: OnFailSetting; minPoints: string};

const CoursePartNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {id, isConnectable} = props;

  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);

  const settings = nodeData[id].settings as CoursePartNodeSettings;
  const initSettings = {
    ...settings,
    minPoints: settings.minPoints !== null ? settings.minPoints.toString() : '',
  };
  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initSettings);
  const [error, setError] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as CoursePartNodeValue;

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
    <BaseNode {...props} error={error} courseFail={nodeValue.courseFail}>
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
          <label>On fail: </label>
          <select
            onChange={handleSelectChange}
            value={localSettings.onFailSetting}
          >
            <option value="coursefail">{t('shared.graph.fail-course')}</option>
            <option value="fail">{t('shared.graph.output-fail')}</option>
          </select>
        </div>
      )}
      <p className="output-value">
        {t('shared.graph.output')}:{' '}
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

export default CoursePartNode;
