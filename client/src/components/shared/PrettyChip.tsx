// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, ButtonProps} from '@mui/material';
import {FC} from 'react';

type PropsType = {
  children: JSX.Element;
  position?: 'first' | 'middle' | 'last';
};

const PrettyChip: FC<PropsType & ButtonProps> = props => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        // borderRight: '1px black solid',
        // borderLeft: '1px black solid',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Button
        style={{
          backgroundColor: 'white',
          border: '1px solid lightgray',
          borderLeft: `${
            props.position === 'first' ? '1px solid lightgray' : '0px'
          }`,
          //   borderRadius: '50px',
          borderRadius: `${
            props.position === 'first'
              ? '50px 0px 0px 50px'
              : props.position === 'last'
              ? '0px 50px 50px 0px'
              : '0px'
          }`,

          width: '100%',
          height: '90%',
        }}
        {...props}
      >
        {props.children}
      </Button>
    </Box>
  );
};
export default PrettyChip;
