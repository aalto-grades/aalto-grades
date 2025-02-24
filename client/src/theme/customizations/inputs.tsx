// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Components, Theme} from '@mui/material/styles';

export const inputsCustomizations: Components<Theme> = {
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
          backgroundColor: theme.vars.palette.secondary.light,
          color: theme.vars.palette.secondary.main,
        }),
      },
      {
        props: {variant: 'tonal', color: 'primary'},
        style: ({theme}) => ({
          backgroundColor: theme.vars.palette.primary.light,
          color: theme.vars.palette.primary.main,
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
};
