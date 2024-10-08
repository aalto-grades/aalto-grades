// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import WarningIcon from '@mui/icons-material/Warning';
import {Tooltip} from '@mui/material';
import {type JSX, type PropsWithChildren, useContext} from 'react';
import type {NodeProps} from 'reactflow';

import {ExtraNodeDataContext, NodeDataContext} from '@/context/GraphProvider';

type PropsType = NodeProps & {
  error?: boolean;
  fullFail?: boolean;
} & PropsWithChildren;
const BaseNode = ({
  id,
  type,
  selected,
  error = false,
  fullFail = false,
  children,
}: PropsType): JSX.Element => {
  const {nodeData, setNodeTitle} = useContext(NodeDataContext);
  const extraNodeData = useContext(ExtraNodeDataContext);

  const title = nodeData[id].title;
  const extraData = extraNodeData[id];

  const getBorderColor = (): string => {
    if (fullFail) return '2px solid #e00';
    if (error) return '1px dashed #e00';
    if (extraData?.warning) return '1px solid #ffb833';
    return '1px solid #eee';
  };
  const getBackgroundColor = (): string => {
    if (error) return '#fffafa';
    if (extraData?.warning) return '#fff6e5';
    return 'white';
  };

  return (
    <div
      style={{
        height: 'auto',
        width: 'auto',
        border: getBorderColor(),
        padding: '10px',
        borderRadius: '5px',
        background: getBackgroundColor(),
        filter: selected ? 'brightness(95%)' : '',
      }}
    >
      <div>
        <h4
          style={{margin: 0}}
          contentEditable={type !== 'coursepart'}
          suppressContentEditableWarning
          onBlur={e => setNodeTitle(id, e.target.textContent!)}
        >
          {title}
        </h4>
        {extraData?.warning !== undefined && (
          <div style={{position: 'absolute', top: '5px', right: '5px'}}>
            <Tooltip title={extraData.warning} placement="top">
              <WarningIcon color="warning" sx={{fontSize: '16px'}} />
            </Tooltip>
          </div>
        )}
        {children}
      </div>
      <p
        style={{
          margin: 0,
          marginTop: '1px',
          marginBottom: '-5px',
          padding: 0,
          textAlign: 'left',
          color: 'gray',
          fontSize: '9px',
        }}
      >
        {type}
      </p>
    </div>
  );
};

export default BaseNode;
