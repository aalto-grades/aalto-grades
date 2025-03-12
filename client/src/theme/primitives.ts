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
      graph: {
        light: '#FFFFFF',
        main: '#dbdbf0',
        dark: '#ccccff',
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
      graph: {
        light: '#777',
        main: '#504f4f',
        dark: '#292828',
      },
    },
  },
};

const font1 = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  lineHeight: 1.2,
};

const font2 = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
};

export const typography = {
  h1: {
    fontSize: defaultTheme.typography.pxToRem(32),
    ...font1,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(28),
    ...font1,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(24),
    ...font1,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    ...font1,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    ...font1,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(20),
    ...font1,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(18),
    ...font2,
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    ...font2,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(16),
    ...font2,
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    ...font2,
  },
  textInput: {
    fontSize: defaultTheme.typography.pxToRem(16),
    ...font2,
  },
  button: {
    fontSize: defaultTheme.typography.pxToRem(14),
    ...font2,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    ...font2,
  },
};

export const shape = {
  borderRadius: 4,
};
