// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {CssBaseline} from '@mui/material';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import type {
  PaletteColor,
  SimplePaletteColorOptions,
  ThemeOptions,
} from '@mui/material/styles';
import type {JSX} from 'react';

import {components} from '@/theme/components';
import {colorSchemes, shape, typography} from './primitives';

declare module '@mui/material/Button' {
  export interface ButtonPropsVariantOverrides {
    elevated: true;
    tonal: true;
  }
}

declare module '@mui/material/styles' {
  interface Palette {
    graph: PaletteColor;
  }

  interface PaletteOptions {
    graph?: SimplePaletteColorOptions;
  }
}

interface PropsType {
  children: React.ReactNode;
  themeComponents?: ThemeOptions['components'];
}

const ThemeProvider = (props: PropsType): JSX.Element => {
  const {children, themeComponents} = props;

  const theme = createTheme({
    colorSchemes,
    typography,
    shape,
    components: {
      ...components,
      ...themeComponents,
    },
  });

  return (
    <MuiThemeProvider
      theme={theme}
      defaultMode="system"
      disableTransitionOnChange
      noSsr
    >
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
