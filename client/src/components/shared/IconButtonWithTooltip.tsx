// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {IconButton, type IconButtonProps, Tooltip} from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import type {JSX} from 'react';

type PropsType = {
  title: string;
  defaultVisible?: boolean;
  children?: JSX.Element;
} & IconButtonProps;

/**
 * To control the "hovering area" where this component becomes visible, set the
 * parent element's className to "hoverable-container".
 */
const IconButtonWithTooltip = ({
  title,
  defaultVisible = true,
  children,
  onClick,
  ...props
}: PropsType): JSX.Element => (
  <Tooltip placement="top" title={title} disableInteractive>
    <IconButton
      className={defaultVisible ? '' : 'hoverable-icon'}
      color="primary"
      sx={{
        position: 'absolute',
        right: '0px',
        top: 'calc(50% - 20px)',
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </IconButton>
  </Tooltip>
);

export default IconButtonWithTooltip;
