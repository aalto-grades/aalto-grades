// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, useTheme} from '@mui/material';
import type {JSX} from 'react';
import {Outlet} from 'react-router-dom';

import Footer from './app-container/Footer';
import Header from './app-container/Header';

const AppContainer = (): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'clip',

        display: 'grid',
        gridTemplateRows: '60px calc(100vh - 110px) 50px',
        gridTemplateColumns: '[content] 100%',
        gridTemplateAreas: `"header"
          "content"
          "footer"`,
        flexDirection: 'column',
        backgroundColor: theme.vars.palette.primary.light,
      }}
    >
      <Box
        sx={{
          gridArea: 'header',
        }}
      >
        <Header />
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          m: 0,
          px: 1,
          height: '100%',
          gridArea: 'content',
        }}
      >
        <Outlet />
      </Box>

      <div style={{gridArea: 'footer'}}>
        <Footer />
      </div>
    </Box>
  );
};

export default AppContainer;
