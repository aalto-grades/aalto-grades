// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {useTheme} from '@mui/material';
import type {JSX} from 'react';

import type {NumberOrFail} from '@/common/types';

type PropsType = {
  text: string;
  value: NumberOrFail;
};

const OutputValue = ({text, value}: PropsType): JSX.Element => {
  const theme = useTheme();
  return (
    <p
      className="output-value"
      style={{
        marginTop: '5px',
        backgroundColor: theme.palette.graph.dark,
      }}
    >
      {text}: {value === 'fail' ? 'fail' : Math.round(value * 100) / 100}
    </p>
  );
};

export default OutputValue;
