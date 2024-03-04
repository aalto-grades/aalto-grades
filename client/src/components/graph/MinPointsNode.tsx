// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  CustomNodeTypes,
  MinPointsNodeSettings,
  MinPointsNodeValue,
} from '@common/types/graph';
import {NodeDataContext, NodeValuesContext} from '../../context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {
  minPoints: string;
};
const initialSettings = {
  minPoints: '',
};

const MinPointsNode = ({id, type, selected, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    JSON.parse(JSON.stringify(initialSettings))
  );
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as MinPointsNodeValue;
  const settings = nodeData[id].settings as MinPointsNodeSettings;

  useEffect(() => {
    if (init) return;
    setLocalSettings({minPoints: settings.minPoints.toString()});

    setError(false);
    setInit(true);
  }, [nodeData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.minPoints = event.target.value;
    setLocalSettings(newLocalSettings);

    if (!/^\d+(?:\.\d+?)?$/.test(event.target.value)) {
      setError(true);
      return;
    }
    setError(false);

    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {minPoints: parseFloat(newLocalSettings.minPoints)});
  };

  return (
    <BaseNode
      id={id}
      type={type as CustomNodeTypes}
      selected={selected}
      error={error}
    >
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div>
        <input
          style={{width: '100px'}}
          type="number"
          onChange={handleChange}
          value={localSettings.minPoints}
        />
      </div>
      <p style={{margin: 0, display: 'inline'}}>
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
