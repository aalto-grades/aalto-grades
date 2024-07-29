// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Visibility, VisibilityOff} from '@mui/icons-material';
import {IconButton, InputAdornment, Tooltip} from '@mui/material';
import {JSX} from 'react';

type ButtonPropsType = {shown: boolean; onClick: () => void};
const ShowPasswordButton = ({shown, onClick}: ButtonPropsType): JSX.Element => (
  <InputAdornment position="start">
    <Tooltip
      placement="top"
      slotProps={{
        popper: {modifiers: [{name: 'offset', options: {offset: [0, -8]}}]},
      }}
      title={
        shown ? 'Click to hide password from view' : 'Click to show password'
      }
    >
      <IconButton
        aria-label="toggle password visibility"
        onClick={onClick}
        edge="end"
      >
        {shown ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </Tooltip>
  </InputAdornment>
);

export default ShowPasswordButton;
