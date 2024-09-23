// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type ChangeEvent,
  type JSX,
  useContext,
  useEffect,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Handle,
  type NodeProps,
  Position,
  useUpdateNodeInternals,
} from 'reactflow';

import type {SubstituteNodeSettings, SubstituteNodeValue} from '@/common/types';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {maxSubstitutions: string; substituteValues: string[]};
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
  const {t} = useTranslation();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as SubstituteNodeSettings;

  const [localSettings, setLocalSettings] = useState<LocalSettings>(
    convertToLocalSettings(settings)
  );
  const [nextFree, setNextFree] = useState<number>(0);
  const [substituteHandles, setSubstituteHandles] = useState<string[]>([]);
  const [exerciseHandles, setExerciseHandles] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);

  const nodeValue = nodeValues[id] as SubstituteNodeValue;

  // Unoptimal useEffect, but we must update parent state (settings) when
  // The node inputs change...
  useEffect(() => {
    let change = false;
    let maxId = 0;
    const newLocalSettings = {...localSettings};
    let newSubstituteHandles = [...substituteHandles];
    let newExerciseHandles = [...exerciseHandles];
    let exerciseIndex = -1;
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-').at(-1)!));

      // Check if source is pointint to substitutes or exercises
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
    // The JSON.stringify() is a hacky solution to get React to realize that the sources updated
  }, [JSON.stringify(nodeValue.sources)]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNumChange = (event: ChangeEvent<HTMLInputElement>): void => {
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
    event: ChangeEvent<HTMLInputElement>
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
          key={key}
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
          key={key}
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

      <label>{t('shared.graph.substitution-num')}</label>
      <input
        style={{width: '180px', display: 'block'}}
        type="number"
        onChange={handleNumChange}
        value={localSettings.maxSubstitutions}
      />
      <label>{t('shared.graph.substitutes')}</label>

      <table style={{width: '200px', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th style={{width: '50%'}}>{t('shared.graph.in')}</th>
            <th>{t('shared.graph.out')}</th>
          </tr>
          {substituteHandles
            .filter(key => nodeValue.sources[key].isConnected)
            .map(key => (
              <tr
                key={key}
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
                        (nodeValue.sources[key].value as number) * 100 // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
                      ) / 100}
                </td>
                <td>
                  {nodeValue.values[key] === 'fail'
                    ? nodeValue.values[key]
                    : Math.round(
                        (nodeValue.values[key] as number) * 100 // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
                      ) / 100}
                </td>
              </tr>
            ))}
          <tr style={{height: rowHeight}}>
            <td />
            <td />
          </tr>
        </tbody>
      </table>
      <label>{t('general.exercises')}</label>
      <table style={{width: '200px', margin: '5px 0px'}}>
        <tbody>
          <tr>
            <th style={{width: '50%'}}>{t('shared.graph.in')}</th>
            <th>{t('shared.graph.substitution-value')}</th>
          </tr>
          {exerciseHandles
            .filter(key => nodeValue.sources[key].isConnected)
            .map((key, index) => (
              <tr
                key={key}
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
                        (nodeValue.sources[key].value as number) * 100 // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
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
            <td />
            <td />
          </tr>
        </tbody>
      </table>

      {substituteHandles.map((key, index) => (
        <Handle
          key={key}
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
          key={key}
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
