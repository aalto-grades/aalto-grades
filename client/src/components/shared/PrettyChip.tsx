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
      sx={{
        cursor: props.onClick === undefined ? 'default' : 'pointer',
        textTransform: 'none',
        color: 'inherit',
        backgroundColor: theme => theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'white',
        width: '100%',
        height: '90%',
        ...props.sx,
      }}
      style={props.style}
    >
      {children}
    </ButtonBase>
  </Box>
);

export default PrettyChip;
