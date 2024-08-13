// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ChangeEvent, JSX, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Handle, NodeProps, Position} from 'reactflow';

import {RoundNodeSettings, RoundNodeValue} from '@/common/types/graph';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type RoundSetting = 'round-up' | 'round-closest' | 'round-down';
type LocalSettings = {roundingSetting: RoundSetting};
const initialSettings: LocalSettings = {roundingSetting: 'round-closest'};

const RoundNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {id, isConnectable} = props;

  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initialSettings);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as RoundNodeValue;
  const settings = nodeData[id].settings as RoundNodeSettings;

  useEffect(() => {
    if (init) return;
    setLocalSettings({...settings});
    setInit(true);
  }, [nodeData]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <p className="output-value">
        {t('shared.graph.output')}: {Math.round(nodeValue.value * 100) / 100}
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

export default RoundNode;
