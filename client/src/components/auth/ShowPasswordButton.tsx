// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Visibility, VisibilityOff} from '@mui/icons-material';
import {IconButton, InputAdornment, Tooltip} from '@mui/material';
import {JSX} from 'react';

type ButtonPropsType = {shown: boolean; onClick: () => void};
const ShowPasswordButton = ({shown, onClick}: ButtonPropsType): JSX.Element => (
  <InputAdornment position="start">
    <IconButton
      aria-label="toggle password visibility"
      onClick={onClick}
      edge="end"
    >
      <Tooltip
        placement="top"
        title={
          shown ? 'Click to hide password from view' : 'Click to show password'
        }
      >
        {shown ? <VisibilityOff /> : <Visibility />}
      </Tooltip>
    </IconButton>
  </InputAdornment>
);

export default ShowPasswordButton;
