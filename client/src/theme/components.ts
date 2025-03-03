// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Components, Theme} from '@mui/material/styles';

export const components: Components<Theme> = {
  MuiAppBar: {
    styleOverrides: {
      root: ({theme}) => ({
        boxShadow: 'none',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: theme.palette.primary.light,
        ...theme.applyStyles('light', {
          color: 'black',
        }),
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: '8px',
      },
    },
    variants: [
      {
        props: {variant: 'elevated'},
        style: {
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        },
      },
      {
        props: {variant: 'tonal', color: 'secondary'},
        style: ({theme}) => ({
          backgroundColor: theme.palette.secondary.light,
          color: theme.palette.secondary.main,
        }),
      },
      {
        props: {variant: 'tonal', color: 'primary'},
        style: ({theme}) => ({
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.main,
        }),
      },
    ],
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        borderColor: 'black',
        height: '32px',
        fontSize: '14px',
      },
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
