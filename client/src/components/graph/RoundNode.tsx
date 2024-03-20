// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ChangeEvent, useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  CustomNodeTypes,
  RoundNodeSettings,
  RoundNodeValue,
} from '@common/types/graph';
import {NodeDataContext, NodeValuesContext} from '../../context/GraphProvider';
import BaseNode from './BaseNode';

type RoundSetting = 'round-up' | 'round-closest' | 'round-down';
type LocalSettings = {roundingSetting: RoundSetting};
const initialSettings = {roundingSetting: 'round-closest'};

const RoundNode = ({
  id,
  type,
  selected,
  isConnectable,
}: NodeProps): JSX.Element => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    JSON.parse(JSON.stringify(initialSettings)) as LocalSettings
  );
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
    <BaseNode id={id} type={type as CustomNodeTypes} selected={selected}>
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
        <option value="round-up">Round up</option>
        <option value="round-closest">Round to closest</option>
        <option value="round-down">Round down</option>
      </select>
      <Handle
        type="source"
        id={`${id}-source`}
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
      <p style={{margin: 0}}>{Math.round(nodeValue.value * 100) / 100}</p>
    </BaseNode>
  );
};

export default RoundNode;
