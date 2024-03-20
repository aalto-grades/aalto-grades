// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ChangeEvent, useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  AttainmentNodeSettings,
  AttainmentNodeValue,
  CustomNodeTypes,
} from '@common/types/graph';
import {NodeDataContext, NodeValuesContext} from '../../context/GraphProvider';
import BaseNode from './BaseNode';

type OnFailSetting = 'coursefail' | 'fail';
type LocalSettings = {onFailSetting: OnFailSetting; minPoints: string};
const initialSettings = {onFailSetting: 'coursefail', minPoints: '0'};

const AttanmentNode = ({
  id,
  type,
  isConnectable,
  selected,
}: NodeProps): JSX.Element => {
  const {nodeValues, setNodeValue} = useContext(NodeValuesContext);
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    JSON.parse(JSON.stringify(initialSettings)) as LocalSettings
  );
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as AttainmentNodeValue;
  const settings = nodeData[id].settings as AttainmentNodeSettings;

  useEffect(() => {
    if (init) return;
    setLocalSettings({...settings, minPoints: settings.minPoints.toString()});
    setInit(true);
  }, [nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const newLocalSettings = {
      ...localSettings,
      minPoints: event.target.value,
    };
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
    <BaseNode
      id={id}
      type={type as CustomNodeTypes}
      selected={selected}
      error={error}
      courseFail={nodeValue.courseFail}
    >
      <div>
        <label>On fail:</label>
        <select
          onChange={handleSelectChange}
          value={localSettings.onFailSetting}
        >
          <option value="coursefail">Fail course</option>
          <option value="fail">Output fail</option>
        </select>
      </div>
      <div>
        <label>Minimum points</label>
        <input
          style={{width: '70px'}}
          onChange={handleChange}
          type="number"
          value={localSettings.minPoints}
        />
      </div>

      <div>
        <label>DEBUG value</label>
        <input
          style={{width: '20px'}}
          onChange={e => {
            const val = e.target.value;
            if (!isNaN(parseFloat(val)))
              setNodeValue(id, {...nodeValue, source: parseFloat(val)});
          }}
        />
      </div>

      <Handle
        type="source"
        id={`${id}-source`}
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
      <p style={{margin: 0}}>
        {nodeValue.value === 'fail'
          ? nodeValue.value
          : Math.round(nodeValue.value * 100) / 100}
      </p>
    </BaseNode>
  );
};

export default AttanmentNode;
