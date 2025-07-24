// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Handle, type NodeProps, Position} from '@xyflow/react';
import {type ChangeEvent, type JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {RoundNodeSettings, RoundNodeValue} from '@/common/types';
import OutputValue from '@/components/shared/graph/nodes/parts/OutputValue';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type RoundSetting = 'round-up' | 'round-closest' | 'round-down';
type LocalSettings = {roundingSetting: RoundSetting};

const RoundNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as RoundNodeSettings;

  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    ...settings,
  });

  const nodeValue = nodeValues[id] as RoundNodeValue;

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (localSettings.roundingSetting === event.target.value) return;

    const newLocalSettings = {
      roundingSetting: event.target.value as RoundSetting,
    };
    setLocalSettings(newLocalSettings);
    setNodeSettings(id, newLocalSettings);
  };

  return (
    <BaseNode {...props}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <select
        onChange={handleSelectChange}
        value={localSettings.roundingSetting}
      >
        <option value="round-up">{t('shared.graph.round-up')}</option>
        <option value="round-closest">{t('shared.graph.round-closest')}</option>
        <option value="round-down">{t('shared.graph.round-down')}</option>
      </select>
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

export default RoundNode;
