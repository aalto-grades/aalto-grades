// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {createTheme} from '@mui/material/styles';

const defaultTheme = createTheme();

export const colorSchemes = {
  light: {
    palette: {
      contrastThreshold: 4.5,
      black: '#000000',
      primary: {
        light: '#EFF3FB',
        main: '#3D5AFE',
        dark: '#0031CA',
        contrastText: '#FFF',
        staticBg: 'white',
      },
      secondary: {
        light: '#F1F8F0',
        main: '#96CF99',
        dark: '#519657',
        contrastText: '#000',
      },
    },
  },
  dark: {
    palette: {
      contrastThreshold: 4.5,
      primary: {
        light: 'hsl(0, 0.00%, 11.80%)',
        main: 'hsl(0, 0.00%, 46.70%)',
        dark: 'hsl(0, 1.20%, 15.90%)',
        contrastText: '#FFF',
        staticBg: '#121212',
      },
    },
  },
};

const h = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  lineHeight: 1.2,
};

const t = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
};

export const typography = {
  h1: {
    fontSize: defaultTheme.typography.pxToRem(32),
    ...h,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(28),
    ...h,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(24),
    ...h,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    ...h,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    ...h,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(20),
    ...h,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(18),
    ...t,
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    ...t,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(16),
    ...t,
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    ...t,
  },
  textInput: {
    fontSize: defaultTheme.typography.pxToRem(16),
    ...t,
  },
  button: {
    fontSize: defaultTheme.typography.pxToRem(14),
    ...t,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    ...t,
  },
};

export const shape = {
  borderRadius: 4,
};
