// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Handle, type NodeProps, Position} from '@xyflow/react';
import {type ChangeEvent, type JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {MinPointsNodeSettings, MinPointsNodeValue} from '@/common/types';
import OutputValue from '@/components/shared/graph/nodes/parts/OutputValue';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type OnFailSetting = 'fullfail' | 'fail';
type LocalSettings = {onFailSetting: OnFailSetting; minPoints: string};

const MinPointsNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as MinPointsNodeSettings;
  const initSettings = {
    ...settings,
    minPoints: settings.minPoints.toString(),
  };
  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initSettings);
  const [error, setError] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as MinPointsNodeValue;

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
    <BaseNode {...props} error={error} fullFail={nodeValue.fullFail}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <div>
        <label>{t('shared.graph.min-points') + ':'}</label>
        <input
          style={{width: '70px'}}
          onChange={handleChange}
          type="number"
          value={localSettings.minPoints}
        />
      </div>
      <div style={{textAlign: 'left'}}>
        <label>{t('shared.graph.on-fail') + ':'}</label>
        <select
          onChange={handleSelectChange}
          value={localSettings.onFailSetting}
        >
          <option value="fullfail">{t('shared.graph.full-fail')}</option>
          <option value="fail">{t('shared.graph.output-fail')}</option>
        </select>
      </div>
      <OutputValue text={t('shared.graph.output')} value={nodeValue.value} />
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
