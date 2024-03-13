// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import WarningIcon from '@mui/icons-material/Warning';
import {Tooltip} from '@mui/material';
import {useMeasure} from '@uidotdev/usehooks';
import {PropsWithChildren, useContext, useEffect, useState} from 'react';
import 'reactflow/dist/style.css';

import {CustomNodeTypes} from '@common/types/graph';
import {
  ExtraNodeDataContext,
  NodeDataContext,
} from '../../context/GraphProvider';

type PropsType = PropsWithChildren<{
  id: string;
  type: CustomNodeTypes;
  selected: boolean;
  error?: boolean;
  courseFail?: boolean;
}>;

const BaseNode = ({
  id,
  type,
  error = false,
  selected,
  courseFail = false,
  children,
}: PropsType) => {
  const [ref, {width, height}] = useMeasure();
  const {nodeData, setNodeTitle} = useContext(NodeDataContext);
  const {setNodeDimensions, extraNodeData} = useContext(ExtraNodeDataContext);
  const [init, setInit] = useState<boolean>(false);
  const [localTitle, setLocalTitle] = useState<string>('');

  const extraData = extraNodeData[id];

  useEffect(() => {
    setNodeDimensions(id, width as number, height as number);
  }, [width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (init) return;
    setLocalTitle(nodeData[id].title);
    setInit(true);
  }, [nodeData]); // eslint-disable-line react-hooks/exhaustive-deps

  const getBorderColor = (): string => {
    if (courseFail) return '2px solid #e00';
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
      ref={ref}
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
          contentEditable
          suppressContentEditableWarning
          onBlur={e => setNodeTitle(id, e.target.innerText)}
        >
          {localTitle}
        </h4>
        {extraData?.warning && (
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
