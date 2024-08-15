// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {JSX, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {Handle, NodeProps, Position} from 'reactflow';

import {GradeNodeValue} from '@/common/types';
import {NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

const GradeNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {id, isConnectable} = props;

  const {nodeValues} = useContext(NodeValuesContext);
  const nodeValue = nodeValues[id] as GradeNodeValue;

  return (
    <BaseNode {...props} courseFail={nodeValue.courseFail}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <p className="output-value">
        {t('general.final-grade')}: {Math.round(nodeValue.value * 100) / 100}
      </p>
    </BaseNode>
  );
};

export default GradeNode;
