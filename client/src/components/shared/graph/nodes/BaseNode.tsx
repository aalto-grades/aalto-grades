// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import WarningIcon from '@mui/icons-material/Warning';
import {Tooltip, useTheme} from '@mui/material';
import type {NodeProps} from '@xyflow/react';
import {type JSX, type PropsWithChildren, useContext} from 'react';
import {useTranslation} from 'react-i18next';

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
  const theme = useTheme();
  const {t} = useTranslation();
  const darkMode = theme.palette.mode === 'dark';
  const {nodeData, setNodeTitle} = useContext(NodeDataContext);
  const extraNodeData = useContext(ExtraNodeDataContext);

  const title = nodeData[id].title;
  const extraData = extraNodeData[id];

  const getBorderColor = (): string => {
    if (fullFail) return '3px solid #ee0000';
    if (error) return `1px dashed ${theme.palette.warning.dark}`;
    if (extraData?.warning) return theme.palette.warning.main;
    return '1px solid #eeeeee';
  };

  const getBackgroundColor = (): string => {
    if (error) return darkMode ? theme.palette.warning.main : '#fffafa';
    if (extraData?.warning)
      return darkMode ? theme.palette.warning.dark : '#fff6e5';
    return theme.palette.graph.light;
  };

  const getTranslation = (): string => {
    // Check separately for sink and source so the
    // trans-parse will not clean these automatically
    if (type === 'sink') {
      return t('shared.graph.node.sink');
    }
    if (type === 'source') {
      return t('shared.graph.node.source');
    }
    return t(`shared.graph.node.${type}`);
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
          style={{
            margin: 0,
            color: theme.palette.text.primary,
          }}
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
          color: theme.palette.text.secondary,
          fontSize: '12px',
        }}
      >
        {getTranslation()}
      </p>
    </div>
  );
};

export default BaseNode;
