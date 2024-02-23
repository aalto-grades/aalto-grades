// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useEffect, useState} from 'react';
import {Handle, NodeProps, Position} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  NodeHeightsContext,
  NodeSettingsContext,
  NodeValuesContext,
  SubstituteNodeSettings,
  SubstituteNodeValues,
} from '../../context/GraphProvider';

type LocalSettings = {
  maxSubstitutions: string;
  substituteValues: string[];
};
const initialSettings = {numSubstitute: '0', substituteValues: {}};

const nodeMinHeight = 85;
const handleStartHeight = nodeMinHeight + 25 + 33.9;
const handleMiddleHeight = 60 + 33.9;
const rowHeight = 33.9;
const calculateHeight = (
  substiteHandles: string[],
  exerciseHandles: string[]
) =>
  nodeMinHeight +
  handleMiddleHeight +
  (substiteHandles.length + exerciseHandles.length + 2) * rowHeight;

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

const SubstituteNode = ({id, data, isConnectable}: NodeProps) => {
  const {nodeValues} = useContext(NodeValuesContext);
  const {setNodeHeight: setNodeHeights} = useContext(NodeHeightsContext);
  const {nodeSettings, setNodeSettings} = useContext(NodeSettingsContext);

  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    JSON.parse(JSON.stringify(initialSettings))
  );
  const [nextFree, setNextFree] = useState<number>(0);
  const [substituteHandles, setSubstituteHandles] = useState<string[]>([]);
  const [exerciseHandles, setExerciseHandles] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as SubstituteNodeValues;
  const settings = nodeSettings[id] as SubstituteNodeSettings;

  useEffect(() => {
    if (init) return;
    setLocalSettings(convertToLocalSettings(settings));
    setNodeHeights(id, calculateHeight(substituteHandles, exerciseHandles));
    setError(false);
    setInit(true);
  }, [nodeSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let change = false;
    let maxId = 0;
    const newLocalSettings = {...localSettings};
    let newSubstituteHandles = [...substituteHandles];
    let newExerciseHandles = [...exerciseHandles];
    let exerciseIndex = -1;
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-').at(-1) as string));
      if (key.split('-').at(-2) === 'substitute') {
        if (!newSubstituteHandles.includes(key)) {
          newSubstituteHandles.push(key);
          change = true;
        }
        if (!source.isConnected) {
          newSubstituteHandles = newSubstituteHandles.filter(
            handle => handle !== key
          );
          change = true;
        }
      } else {
        exerciseIndex++;
        if (!newExerciseHandles.includes(key)) {
          newExerciseHandles.push(key);
          newLocalSettings.substituteValues.push('');
          change = true;
        }
        if (!source.isConnected) {
          newExerciseHandles = newExerciseHandles.filter(
            handle => handle !== key
          );
          newLocalSettings.substituteValues.splice(exerciseIndex, 1);
        }
      }
    }
    if (change) {
      setSubstituteHandles(newSubstituteHandles);
      setExerciseHandles(newExerciseHandles);
      setNextFree(maxId + 1);
      setNodeHeights(
        id,
        calculateHeight(newSubstituteHandles, newExerciseHandles)
      );
      setLocalSettings(newLocalSettings);

      const error = checkError(newLocalSettings);
      setError(error);
      if (!error) {
        setNodeSettings(id, convertFromLocalSettings(newLocalSettings));
      }
    }
  }, [nodeValues]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div
      style={{
        height: `${calculateHeight(substituteHandles, exerciseHandles)}px`,
        width: '130px',
        border: error ? '1px dashed #e00' : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
      }}
    >
      <h4 style={{margin: 0}}>{data.label}</h4>
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
      <label>NumSubstitutions</label>
      <input
        style={{width: 'calc(100% - 20px)'}}
        type="number"
        onChange={handleNumChange}
        value={localSettings.maxSubstitutions ?? ''}
      />
      <label>Substitutes</label>

      <table style={{width: '100%', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th style={{width: '50px'}}>in</th>
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
                      ? '#ff03'
                      : '',
                }}
              >
                <td>{nodeValue.sources[key].value}</td>
                <td>{nodeValue.values[key]}</td>
              </tr>
            ))}
          <tr style={{height: rowHeight}}>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <label>Exercises</label>
      <table style={{width: '100%', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th style={{width: '50px'}}>in</th>
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
                    nodeValue.sources[key].value === 'reqfail' &&
                    nodeValue.values[key] === 'reqfail'
                      ? '#f003'
                      : nodeValue.sources[key].value === 'reqfail' &&
                        nodeValue.values[key] !== 'reqfail'
                      ? '#0f03'
                      : '',
                }}
              >
                <td>{nodeValue.sources[key].value}</td>
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
    </div>
  );
};

export default SubstituteNode;
