// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, ButtonBase, type ButtonProps} from '@mui/material';
import type {JSX} from 'react';

type PropsType = ButtonProps & {
  children: JSX.Element;
  position?: 'first' | 'middle' | 'last';
};

const PrettyChip = ({
  children,
  // position,
  ...props
}: PropsType): JSX.Element => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      // borderRight: '1px black solid',
      // borderLeft: '1px black solid',
      display: 'flex',
      alignItems: 'center',
      // overflow: 'hidden',
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
        // border: '1px solid lightgray',
        // borderLeft: `${
        //   position === 'first' || !position
        //     ? '1px solid lightgray'
        //     : '0px'
        // }`,
        // borderRadius: `${
        //   !position
        //     ? '50px 50px 50px 50px'
        //     : position === 'first'
        //       ? '50px 0px 0px 50px'
        //       : position === 'last'
        //         ? '0px 50px 50px 0px'
        //         : '0px'
        // }`,

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
