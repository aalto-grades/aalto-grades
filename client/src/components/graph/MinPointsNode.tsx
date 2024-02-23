// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import {useMeasure} from '@uidotdev/usehooks';
import 'reactflow/dist/style.css';
import {
  NodeSettingsContext,
  NodeValuesContext,
  MinPointsNodeSettings,
  MinPointsNodeValues,
  NodeDimensionsContext,
} from '../../context/GraphProvider';

type LocalSettings = {
  minPoints: string;
};
const initialSettings = {
  minPoints: '',
};

const MinPointsNode = ({id, data, isConnectable}: NodeProps) => {
  const [ref, {width, height}] = useMeasure();
  const {setNodeDimensions} = useContext(NodeDimensionsContext);
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeSettings, setNodeSettings} = useContext(NodeSettingsContext);
  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    JSON.parse(JSON.stringify(initialSettings))
  );
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as MinPointsNodeValues;

  useEffect(() => {
    setNodeDimensions(id, {width: width as number, height: height as number});
  }, [width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (init) return;
    const initSettings = nodeSettings[id] as MinPointsNodeSettings;
    setLocalSettings({minPoints: initSettings.minPoints.toString()});

    setError(false);
    setInit(true);
  }, [nodeSettings]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div
      ref={ref}
      style={{
        height: 'auto',
        width: 'auto',
        border: error ? '1px dashed #e00' : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
      }}
    >
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div>
        <h4 style={{margin: 0}}>{data.label}</h4>
        <input
          style={{width: '100px'}}
          type="number"
          onChange={handleChange}
          value={localSettings.minPoints}
        />
      </div>
      <p style={{margin: 0, display: 'inline'}}>
        {nodeValue.value === 'reqfail'
          ? 'reqfail'
          : Math.round(nodeValue.value * 100) / 100}
      </p>
      <Handle
        type="source"
        id={`${id}-source`}
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default MinPointsNode;
