// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type JSX, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {Handle, type NodeProps, Position} from 'reactflow';

import type {SinkNodeValue} from '@/common/types';
import OutputValue from '@/components/shared/graph/nodes/parts/OutputValue';
import {NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

const SinkNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {id, isConnectable} = props;
  const nodeValues = useContext(NodeValuesContext);

  const nodeValue = nodeValues[id] as SinkNodeValue;

  return (
    <BaseNode {...props} fullFail={nodeValue.fullFail}>
      <Handle
        type="target"
        id={id}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <OutputValue
        text={t('shared.graph.node.value')}
        value={nodeValue.value}
      />
    </BaseNode>
  );
};

export default SinkNode;
