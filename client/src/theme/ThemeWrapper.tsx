// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CssBaseline} from '@mui/material';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import type {ThemeOptions} from '@mui/material/styles';
import type {JSX} from 'react';

import {inputsCustomizations} from '@/theme/customizations/inputs';
import {navigationCustomizations} from '@/theme/customizations/navigation';
import {colorSchemes, shadows, shape, typography} from './themePrimitives';

interface AppThemeProps {
  children: React.ReactNode;
  themeComponents?: ThemeOptions['components'];
}

const ThemeWrapper = (props: AppThemeProps): JSX.Element => {
  const {children, themeComponents} = props;

  const theme = createTheme({
    // For more details about CSS variables configuration
    // see https://mui.com/material-ui/customization/css-theme-variables/configuration/
    cssVariables: {
      colorSchemeSelector: 'data-mui-color-scheme',
      cssVarPrefix: 'vars',
    },
    // Recently added in v6 for building light & dark mode app
    // see https://mui.com/material-ui/customization/palette/#color-schemes
    colorSchemes,
    typography,
    shadows,
    shape,
    // https://mui.com/material-ui/customization/palette/#accessibility
    palette: {
      contrastThreshold: 4.5,
    },
    components: {
      ...inputsCustomizations,
      ...navigationCustomizations,
      ...themeComponents,
    },
  });

  return (
    <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};

export default ThemeWrapper;
