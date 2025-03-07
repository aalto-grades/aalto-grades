// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, ButtonBase, type ButtonProps} from '@mui/material';
import type {JSX} from 'react';

type PropsType = ButtonProps & {
  children: JSX.Element;
  position?: 'first' | 'middle' | 'last';
};

const PrettyChip = ({children, ...props}: PropsType): JSX.Element => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      ...props.sx,
    }}
  >
    <ButtonBase
      {...props}
      disableRipple={props.onClick === undefined}
      style={{
        cursor: props.onClick === undefined ? 'default' : 'pointer',
        textTransform: 'none',
        color: 'inherit',
        backgroundColor: 'white',
        width: '100%',
        height: '90%',
        ...props.style,
      }}
    >
      {children}
    </ButtonBase>
  </Box>
);

export default PrettyChip;
