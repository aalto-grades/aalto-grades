// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {JSX, useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position, useUpdateNodeInternals} from 'reactflow';

import {SubstituteNodeSettings, SubstituteNodeValue} from '@common/types/graph';
import {NodeDataContext, NodeValuesContext} from '../../context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {maxSubstitutions: string; substituteValues: string[]};
const initialSettings = {maxSubstitutions: '0', substituteValues: []};

const handleStartHeight = 110 + 33.9;
const handleMiddleHeight = 60 + 33.9;
const rowHeight = 33.9;

const checkError = (settings: LocalSettings): boolean => {
  if (!/^\d+$/.test(settings.maxSubstitutions)) return true;

  for (const value of settings.substituteValues) {
    if (!/^\d+(?:\.\d+?)?$/.test(value)) return true;
  }

  return false;
};

const convertToLocalSettings = (
  newSettings: SubstituteNodeSettings
): LocalSettings => ({
  maxSubstitutions: newSettings.maxSubstitutions.toString(),
  substituteValues: newSettings.substituteValues.map(value => value.toString()),
});
const convertFromLocalSettings = (
  newSettings: LocalSettings
): SubstituteNodeSettings => ({
  maxSubstitutions: parseInt(newSettings.maxSubstitutions),
  substituteValues: newSettings.substituteValues.map(value =>
    parseFloat(value)
  ),
});

const SubstituteNode = (props: NodeProps): JSX.Element => {
  const {id, isConnectable} = props;

  const updateNodeInternals = useUpdateNodeInternals();
  const {nodeValues} = useContext(NodeValuesContext);
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);

  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initialSettings);
  const [nextFree, setNextFree] = useState<number>(0);
  const [substituteHandles, setSubstituteHandles] = useState<string[]>([]);
  const [exerciseHandles, setExerciseHandles] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as SubstituteNodeValue;
  const settings = nodeData[id].settings as SubstituteNodeSettings;

  useEffect(() => {
    if (init) return;
    setLocalSettings(convertToLocalSettings(settings));
    setError(false);
    setInit(true);
  }, [nodeData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!init) return;
    let change = false;
    let maxId = 0;
    const newLocalSettings = {...localSettings};
    let newSubstituteHandles = [...substituteHandles];
    let newExerciseHandles = [...exerciseHandles];
    let exerciseIndex = -1;
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-').at(-1) as string));
      if (key.split('-').at(-2) === 'substitute') {
        if (source.isConnected && !newSubstituteHandles.includes(key)) {
          newSubstituteHandles.push(key);
          change = true;
        } else if (!source.isConnected && newSubstituteHandles.includes(key)) {
          newSubstituteHandles = newSubstituteHandles.filter(
            handle => handle !== key
          );
          change = true;
        }
      } else {
        if (source.isConnected) exerciseIndex++;
        if (source.isConnected && !newExerciseHandles.includes(key)) {
          newExerciseHandles.push(key);
          if (exerciseIndex >= newLocalSettings.substituteValues.length)
            newLocalSettings.substituteValues.push('');
          change = true;
        } else if (!source.isConnected && newExerciseHandles.includes(key)) {
          newExerciseHandles = newExerciseHandles.filter(
            handle => handle !== key
          );
          newLocalSettings.substituteValues.splice(exerciseIndex + 1, 1);
          change = true;
        }
      }
    }
    if (change) {
      setTimeout(() => updateNodeInternals(id), 0);
      setSubstituteHandles(newSubstituteHandles);
      setExerciseHandles(newExerciseHandles);
      setNextFree(maxId + 1);
      setLocalSettings(newLocalSettings);

      if (checkError(newLocalSettings)) {
        setError(true);
        return;
      }
      setError(false);
      setNodeSettings(id, convertFromLocalSettings(newLocalSettings));
    }
  }, [nodeValues, init]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNumChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.maxSubstitutions = event.target.value;
    setLocalSettings(newLocalSettings);
    if (checkError(newLocalSettings)) {
      setError(true);
      return;
    }
    setError(false);
    setNodeSettings(id, convertFromLocalSettings(newLocalSettings));
  };

  const handleValueChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newLocalSettings = {...localSettings};
    newLocalSettings.substituteValues[index] = event.target.value;
    setLocalSettings(newLocalSettings);
    if (checkError(newLocalSettings)) {
      setError(true);
      return;
    }
    setError(false);
    setNodeSettings(id, convertFromLocalSettings(newLocalSettings));
  };

  return (
    <BaseNode {...props} error={error}>
      {substituteHandles.map((key, index) => (
        <Handle
          key={`handle-${key}`}
          type="target"
          id={key}
          style={{
            height: '12px',
            width: '12px',
            top: `${handleStartHeight + index * rowHeight}px`,
          }}
          position={Position.Left}
          isConnectable={isConnectable}
        />
      ))}
      <Handle
        type="target"
        id={`${id}-substitute-${nextFree}`}
        style={{
          height: '12px',
          width: '12px',
          top: `${handleStartHeight + substituteHandles.length * rowHeight}px`,
        }}
        position={Position.Left}
        isConnectable={isConnectable}
      />
      {exerciseHandles.map((key, index) => (
        <Handle
          key={`handle-${key}`}
          type="target"
          id={key}
          style={{
            height: '12px',
            width: '12px',
            top: `${
              handleStartHeight +
              handleMiddleHeight +
              (index + substituteHandles.length) * rowHeight
            }px`,
          }}
          position={Position.Left}
          isConnectable={isConnectable}
        />
      ))}
      <Handle
        type="target"
        id={`${id}-exercise-${nextFree}`}
        style={{
          height: '12px',
          width: '12px',
          top: `${
            handleStartHeight +
            handleMiddleHeight +
            (substituteHandles.length + exerciseHandles.length) * rowHeight
          }px`,
        }}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <label>Number of substitutions</label>
      <input
        style={{width: '180px', display: 'block'}}
        type="number"
        onChange={handleNumChange}
        value={localSettings.maxSubstitutions ?? ''}
      />
      <label>Substitutes</label>

      <table style={{width: '200px', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th style={{width: '50%'}}>in</th>
            <th>out</th>
          </tr>
          {substituteHandles
            .filter(key => nodeValue.sources[key].isConnected)
            .map(key => (
              <tr
                key={`tr-${key}`}
                style={{
                  height: rowHeight,
                  backgroundColor:
                    nodeValue.sources[key].value !== nodeValue.values[key]
                      ? '#ffc'
                      : '',
                }}
              >
                <td>
                  {nodeValue.sources[key].value === 'fail'
                    ? nodeValue.sources[key].value
                    : Math.round(
                        (nodeValue.sources[key].value as number) * 100
                      ) / 100}
                </td>
                <td>
                  {nodeValue.values[key] === 'fail'
                    ? nodeValue.values[key]
                    : Math.round((nodeValue.values[key] as number) * 100) / 100}
                </td>
              </tr>
            ))}
          <tr style={{height: rowHeight}}>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <label>Exercises</label>
      <table style={{width: '200px', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th style={{width: '50%'}}>in</th>
            <th>subval</th>
          </tr>
          {exerciseHandles
            .filter(key => nodeValue.sources[key].isConnected)
            .map((key, index) => (
              <tr
                key={`tr-${key}`}
                style={{
                  height: rowHeight,
                  backgroundColor:
                    nodeValue.sources[key].value === 'fail' &&
                    nodeValue.values[key] === 'fail'
                      ? '#fcc'
                      : nodeValue.sources[key].value === 'fail' &&
                        nodeValue.values[key] !== 'fail'
                      ? '#cfc'
                      : '',
                }}
              >
                <td>
                  {nodeValue.sources[key].value === 'fail'
                    ? nodeValue.sources[key].value
                    : Math.round(
                        (nodeValue.sources[key].value as number) * 100
                      ) / 100}
                </td>
                <td>
                  <input
                    style={{width: '50px'}}
                    onChange={event => handleValueChange(index, event)}
                    value={localSettings.substituteValues[index]}
                  />
                </td>
              </tr>
            ))}
          <tr style={{height: rowHeight}}>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {substituteHandles.map((key, index) => (
        <Handle
          key={`handle-${key}-source`}
          type="source"
          id={`${key}-source`}
          style={{
            height: '12px',
            width: '12px',
            top: `${handleStartHeight + index * rowHeight}px`,
          }}
          position={Position.Right}
          isConnectable={isConnectable}
        />
      ))}
      {exerciseHandles.map((key, index) => (
        <Handle
          key={`handle-${key}-source`}
          type="source"
          id={`${key}-source`}
          style={{
            height: '12px',
            width: '12px',
            top: `${
              handleStartHeight +
              handleMiddleHeight +
              (index + substituteHandles.length) * rowHeight
            }px`,
          }}
          position={Position.Right}
          isConnectable={isConnectable}
        />
      ))}
    </BaseNode>
  );
};

export default SubstituteNode;
