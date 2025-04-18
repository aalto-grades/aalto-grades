// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {useTheme} from '@mui/material';
import {type ChangeEvent, type JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Handle, type NodeProps, Position} from 'reactflow';

import type {StepperNodeSettings, StepperNodeValue} from '@/common/types';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {
  numSteps: number;
  outputValues: string[];
  middlePoints: string[];
};

const checkError = (settings: LocalSettings): boolean => {
  for (const middleValue of settings.middlePoints) {
    if (!/^\d+(?:\.\d+?)?$/.test(middleValue)) return true;
  }
  for (const outputValue of settings.outputValues) {
    if (!/^\d+(?:\.\d+?)?$/.test(outputValue) && outputValue !== 'same')
      return true;
  }

  for (let i = 0; i < settings.numSteps - 1; i++) {
    if (
      (i + 1 < settings.numSteps - 1 &&
        parseFloat(settings.middlePoints[i]) >=
          parseFloat(settings.middlePoints[i + 1])) ||
      (i > 0 &&
        parseFloat(settings.middlePoints[i]) <=
          parseFloat(settings.middlePoints[i - 1]))
    ) {
      return true;
    }
  }
  return false;
};

const StepperNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as StepperNodeSettings;
  const initSettings = {
    numSteps: settings.numSteps,
    middlePoints: settings.middlePoints.map(val => val.toString()),
    outputValues: settings.outputValues.map(val => val.toString()),
  };

  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initSettings);
  const [error, setError] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as StepperNodeValue;

  const handleChange = (
    type: 'middlePoint' | 'outputValue',
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const newLocalSettings = {...localSettings};
    if (type === 'middlePoint') {
      newLocalSettings.middlePoints[index] = event.target.value;
    } else {
      newLocalSettings.outputValues[index] = event.target.value;
    }
    setLocalSettings(newLocalSettings);

    if (checkError(newLocalSettings)) {
      setError(true);
      return;
    }
    setError(false);

    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {
      numSteps: newLocalSettings.numSteps,
      middlePoints: newLocalSettings.middlePoints.map(val => parseFloat(val)),
      outputValues: newLocalSettings.outputValues.map(val =>
        val === 'same' ? 'same' : parseFloat(val)
      ),
    });
  };

  const handleAdd = (): void => {
    const newLocalSettings = {
      numSteps: localSettings.numSteps + 1,
      middlePoints: localSettings.middlePoints.concat(''),
      outputValues: localSettings.outputValues.concat(''),
    };
    setLocalSettings(newLocalSettings);
    setError(true);
  };

  const handleRemove = (): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.numSteps -= 1;
    newLocalSettings.middlePoints.pop();
    newLocalSettings.outputValues.pop();
    setLocalSettings(newLocalSettings);

    if (checkError(newLocalSettings)) {
      setError(true);
      return;
    }
    setError(false);

    setNodeSettings(id, {
      numSteps: newLocalSettings.numSteps,
      middlePoints: newLocalSettings.middlePoints.map(val => parseFloat(val)),
      outputValues: newLocalSettings.outputValues.map(val =>
        val === 'same' ? 'same' : parseFloat(val)
      ),
    });
  };

  const isCurrentSlot = (index: number): boolean => {
    if (
      index > 0 &&
      nodeValue.source <= parseFloat(localSettings.middlePoints[index - 1])
    )
      return false;
    if (
      index < localSettings.numSteps - 1 &&
      nodeValue.source > parseFloat(localSettings.middlePoints[index])
    )
      return false;
    return true;
  };

  return (
    <BaseNode {...props} error={error}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <table
        style={{
          width: '100%',
          margin: '5px 0px',
          backgroundColor: theme.palette.graph.light,
        }}
      >
        <tbody>
          <tr>
            <th>{t('shared.graph.range')}</th>
            <th>{t('shared.graph.output')}</th>
          </tr>
          {new Array(localSettings.numSteps).fill(0).map((_, index) => (
            <tr
              key={index}
              style={{
                background:
                  !error && isCurrentSlot(index)
                    ? theme.palette.graph.dark
                    : '',
              }}
            >
              <td>
                <p style={{display: 'inline'}}>≤ </p>
                {index + 1 === localSettings.numSteps ? (
                  <input
                    style={{width: '40px'}}
                    type="text"
                    value="∞"
                    disabled
                  />
                ) : (
                  <input
                    style={{width: '40px'}}
                    type="number"
                    value={localSettings.middlePoints[index]}
                    onChange={event =>
                      handleChange('middlePoint', index, event)
                    }
                  />
                )}
              </td>
              <td>
                <input
                  style={{width: '40px'}}
                  value={localSettings.outputValues[index]}
                  onChange={event => handleChange('outputValue', index, event)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        style={{float: 'left', marginRight: '5px'}}
        onClick={handleAdd}
      >
        {t('shared.graph.new-row')}
      </button>
      <button
        type="button"
        style={{float: 'right'}}
        disabled={localSettings.numSteps === 1}
        onClick={handleRemove}
      >
        {t('shared.graph.remove-row')}
      </button>

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

export default StepperNode;
