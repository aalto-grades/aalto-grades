// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {JSX, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Handle, NodeProps, Position, useUpdateNodeInternals} from 'reactflow';
import 'reactflow/dist/style.css';

import {AdditionNodeValue} from '@/common/types/graph';
import {NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

const handleStartHeight = 45.5 + 30;
const rowHeight = 30;

const AdditionNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const {id, isConnectable} = props;
  const updateNodeInternals = useUpdateNodeInternals();
  const {nodeValues} = useContext(NodeValuesContext);

  const [handles, setHandles] = useState<string[]>([]);
  const [nextFree, setNextFree] = useState<number>(0);

  const nodeValue = nodeValues[id] as AdditionNodeValue;

  const [oldSources, setOldSources] = useState<typeof nodeValue.sources>({});
  if (JSON.stringify(nodeValue.sources) !== JSON.stringify(oldSources)) {
    setOldSources(structuredClone(nodeValue.sources));

    let change = false;
    let maxId = 0;
    let newHandles = [...handles];
    for (const [key, source] of Object.entries(nodeValue.sources)) {
      maxId = Math.max(maxId, parseInt(key.split('-').at(-1)!));
      if (!handles.includes(key)) {
        newHandles.push(key);
        change = true;
      }
      if (!source.isConnected) {
        newHandles = newHandles.filter(handle => handle !== key);
        change = true;
      }
    }
    if (change) {
      setTimeout(() => updateNodeInternals(id), 0);
      setHandles(newHandles);
      setNextFree(maxId + 1);
    }
  }

  return (
    <BaseNode {...props}>
      {handles.map((key, index) => (
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
        id={`${id}-${nextFree}`}
        style={{
          height: '12px',
          width: '12px',
          top: `${handleStartHeight + handles.length * rowHeight}px`,
        }}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <table style={{width: '100%', minWidth: '60px'}}>
        <tbody>
          <tr>
            <th>{t('graph.inputs')}</th>
          </tr>
          {Object.entries(nodeValue.sources)
            .filter(([, source]) => source.isConnected)
            .map(([key, source]) => (
              <tr key={key}>
                <td>{Math.round(source.value * 100) / 100}</td>
              </tr>
            ))}
          <tr>
            <td style={{height: '20px'}}></td>
          </tr>
          <tr style={{background: '#ccf'}}>
            <td style={{height: '20px'}}>
              = {Math.round(nodeValue.value * 100) / 100}
            </td>
          </tr>
        </tbody>
      </table>

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

export default AdditionNode;
