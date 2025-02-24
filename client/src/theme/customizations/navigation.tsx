// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Components, Theme} from '@mui/material/styles';

import {gray} from '@/theme/themePrimitives';

export const navigationCustomizations: Components<Theme> = {
  MuiAppBar: {
    styleOverrides: {
      root: ({theme}) => ({
        boxShadow: 'none',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        color: 'black',
        backgroundColor: theme.palette.primary.light,
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
        }),
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '8px',
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: '48px',
      },
    },
  },
};
