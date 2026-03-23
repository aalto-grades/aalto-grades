// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Handle, type NodeProps, Position} from '@xyflow/react';
import {type ChangeEvent, type JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {MathNodeSettings, MathNodeValue} from '@/common/types';
import OutputValue from '@/components/shared/graph/nodes/parts/OutputValue';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {operand: string; operator: MathNodeSettings['operator']};

const MathNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const nodeValues = useContext(NodeValuesContext);

  const settings = nodeData[id].settings as MathNodeSettings;

  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    operator: settings.operator,
    operand: settings.operand.toString(),
  });

  const outputValue = (nodeValues[id] as MathNodeValue).value;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newLocalSettings = {
      ...localSettings,
      operand: event.target.value,
    };
    setLocalSettings(newLocalSettings);

    const value = Number.parseFloat(event.target.value);
    if (Number.isNaN(value) || settings?.operand === value) return;

    setNodeSettings(id, {
      ...newLocalSettings,
      operand: value,
    });
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value as MathNodeSettings['operator'];
    if (localSettings.operator === value) return;

    const newLocalSettings = {
      ...localSettings,
      operator: value,
    };
    setLocalSettings(newLocalSettings);
    setNodeSettings(id, {
      ...newLocalSettings,
      operand: Number.parseFloat(newLocalSettings.operand),
    });
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

      <div style={{textAlign: 'left'}}>
        <label
          htmlFor={`${id}-operator`}
          style={{display: 'block', fontSize: '10px', marginBottom: '2px'}}
        >
          {t('shared.graph.operator')}
        </label>
        <select
          id={`${id}-operator`}
          value={localSettings.operator}
          onChange={handleSelectChange}
          style={{width: '100px', marginBottom: '5px'}}
        >
          <option value="add">{t('shared.graph.math-operators.add')}</option>
          <option value="sub">{t('shared.graph.math-operators.sub')}</option>
          <option value="mul">{t('shared.graph.math-operators.mul')}</option>
          <option value="div">{t('shared.graph.math-operators.div')}</option>
          <option value="rem">{t('shared.graph.math-operators.rem')}</option>
          <option value="pow">{t('shared.graph.math-operators.pow')}</option>
        </select>
      </div>

      <div style={{textAlign: 'left'}}>
        <label
          htmlFor={`${id}-operand`}
          style={{display: 'block', fontSize: '10px', marginBottom: '2px'}}
        >
          {t('shared.graph.operand')}
        </label>
        <input
          id={`${id}-operand`}
          type="number"
          step="any"
          value={localSettings.operand}
          onChange={handleInputChange}
          style={{width: '60px'}}
        />
      </div>

      <OutputValue text={t('shared.graph.output')} value={outputValue} />
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

export default MathNode;
