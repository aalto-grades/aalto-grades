// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {type Shadows, alpha, createTheme} from '@mui/material/styles';
import type {CSSProperties} from 'react';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    black?: string;
    hoverGrey1?: string;
    hoverGrey2?: string;
    hoverGrey3?: string;
    infoGrey?: string;
  }

  interface Palette {
    black: string;
    hoverGrey1: string;
    hoverGrey2: string;
    hoverGrey3: string;
    infoGrey: string;
  }

  interface TypographyVariantsOptions {
    textInput?: CSSProperties;
  }
}

declare module '@mui/material/Button' {
  export interface ButtonPropsVariantOverrides {
    elevated: true;
    tonal: true;
  }
}

declare module '@mui/material/styles/createPalette' {
  interface ColorRange {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  interface PaletteColor extends ColorRange {
    none?: boolean;
  }

  interface Palette {
    baseShadow: string;
  }
}

const defaultTheme = createTheme();

export const brand = {
  50: '#eef2ff',
  100: '#dae2ff',
  200: '#bcccff',
  300: '#8eabff',
  400: '#597eff',
  500: '#3d5afe',
  600: '#1d2ff3',
  700: '#151be0',
  800: '#1819b5',
  900: '#141557',
};

export const gray = {
  50: 'hsl(220, 35%, 97%)',
  100: 'hsl(220, 30%, 94%)',
  200: 'hsl(220, 20%, 88%)',
  300: 'hsl(220, 20%, 80%)',
  400: 'hsl(220, 20%, 65%)',
  500: 'hsl(220, 20%, 42%)',
  600: 'hsl(220, 20%, 35%)',
  700: 'hsl(220, 20%, 25%)',
  800: 'hsl(220, 30%, 6%)',
  900: 'hsl(220, 35%, 3%)',
};

export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)',
};

export const orange = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 92%, 90%)',
  200: 'hsl(45, 94%, 80%)',
  300: 'hsl(45, 90%, 65%)',
  400: 'hsl(45, 90%, 40%)',
  500: 'hsl(45, 90%, 35%)',
  600: 'hsl(45, 91%, 25%)',
  700: 'hsl(45, 94%, 20%)',
  800: 'hsl(45, 95%, 16%)',
  900: 'hsl(45, 93%, 12%)',
};

export const red = {
  50: 'hsl(0, 100%, 97%)',
  100: 'hsl(0, 92%, 90%)',
  200: 'hsl(0, 94%, 80%)',
  300: 'hsl(0, 90%, 65%)',
  400: 'hsl(0, 90%, 40%)',
  500: 'hsl(0, 90%, 30%)',
  600: 'hsl(0, 91%, 25%)',
  700: 'hsl(0, 94%, 18%)',
  800: 'hsl(0, 95%, 12%)',
  900: 'hsl(0, 93%, 6%)',
};

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        contrastText: brand[50],
        light: brand[100],
        main: brand[500],
        dark: brand[700],
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
      },
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
      },
      grey: {...gray},
      divider: alpha(gray[300], 0.4),
      background: {
        default: 'hsl(0, 0%, 99%)',
        paper: 'hsl(220, 35%, 97%)',
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: orange[400],
      },
      action: {
        hover: alpha(gray[200], 0.2),
        selected: alpha(gray[200], 0.3),
      },
      hoverGrey1: '#EAEAEA',
      hoverGrey2: '#F4F4F4',
      hoverGrey3: '#6E6E6E',
      infoGrey: '#545454',
      contrastThreshold: 4.5,
      baseShadow:
        'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
    },
  },
  dark: {
    palette: {
      primary: {
        contrastText: gray[50],
        light: gray[700],
        main: gray[400],
        dark: gray[400],
      },
      info: {
        contrastText: brand[300],
        light: brand[500],
        main: brand[700],
        dark: brand[900],
      },
      warning: {
        light: orange[400],
        main: orange[500],
        dark: orange[700],
      },
      success: {
        light: green[400],
        main: green[500],
        dark: green[700],
      },
      grey: {...gray},
      divider: alpha(gray[700], 0.6),
      background: {
        default: gray[900],
        paper: 'hsl(220, 30%, 7%)',
      },
      text: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: gray[400],
      },
      action: {
        hover: alpha(gray[600], 0.2),
        selected: alpha(gray[600], 0.3),
      },
      hoverGrey1: '#EAEAEA',
      hoverGrey2: '#F4F4F4',
      hoverGrey3: '#6E6E6E',
      infoGrey: '#545454',
      contrastThreshold: 4.5,
      baseShadow:
        'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
    },
  },
};

export const typography = {
  h1: {
    fontSize: defaultTheme.typography.pxToRem(32),
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(28),
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    lineHeight: 1.2,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(16),
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(16),
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(16),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
  },
  textInput: {
    fontSize: defaultTheme.typography.pxToRem(16),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
  },
  button: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
  },
};

export const shape = {
  borderRadius: 4,
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const defaultShadows: Shadows = [
  'none',
  'var(--template-palette-baseShadow)',
  ...defaultTheme.shadows.slice(2),
];

export const shadows = defaultShadows;
