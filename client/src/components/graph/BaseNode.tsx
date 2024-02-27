// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {PropsWithChildren} from 'react';
import {useMeasure} from '@uidotdev/usehooks';
import {useContext, useEffect, useState} from 'react';
import 'reactflow/dist/style.css';
import {
  CustomNodeTypes,
  NodeDataContext,
  NodeDimensionsContext,
} from '../../context/GraphProvider';

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
  const {setNodeDimensions} = useContext(NodeDimensionsContext);
  const [init, setInit] = useState<boolean>(false);
  const [localTitle, setLocalTitle] = useState<string>('');

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
          : '1px solid #eee',
        padding: '10px',
        borderRadius: '5px',
        background: error ? '#fffafa' : 'white',
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
