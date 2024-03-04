// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {useMeasure} from '@uidotdev/usehooks';
import {PropsWithChildren, useContext, useEffect, useState} from 'react';
import 'reactflow/dist/style.css';
import WarningIcon from '@mui/icons-material/Warning';

import {CustomNodeTypes} from '@common/types/graph';
import {
  NodeDataContext,
  ExtraNodeDataContext,
} from '../../context/GraphProvider';
import {Tooltip} from '@mui/material';

const BaseNode: React.FC<
  PropsWithChildren<{
    id: string;
    type: CustomNodeTypes;
    error?: boolean;
    courseFail?: boolean;
  }>
> = ({id, type, error, courseFail, children}) => {
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

  return (
    <div
      ref={ref}
      style={{
        height: 'auto',
        width: 'auto',
        border: courseFail
          ? '2px solid #e00'
          : error
          ? '1px dashed #e00'
          : extraData?.warning
          ? '1px solid #ffb833'
          : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error
          ? '#fffafa'
          : extraData?.warning
          ? '#fff6e5'
          : 'white',
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
BaseNode.defaultProps = {error: false, courseFail: false};

export default BaseNode;
