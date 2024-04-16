// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Container, useTheme} from '@mui/material';
import {JSX} from 'react';
import {Outlet} from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

export default function SectionTitle(): JSX.Element {
  const theme = useTheme();

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'clip',

          display: 'grid',
          gridTemplateRows: '60px calc(100vh - 110px) 50px',
          gridTemplateColumns: '100%',
          gridTemplateAreas: `"header" 
          "content" 
          "footer"`,
          flexDirection: 'column',
          backgroundColor: theme.vars.palette.primary.light,
        }}
      >
        <div style={{gridArea: 'header'}}>
          <Header />
        </div>
        <div
          style={{
            gridArea: 'content',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.vars.palette.primary.light,
          }}
        >
          <Container
            sx={{textAlign: 'center', m: 0, px: 1, height: '100%'}}
            maxWidth={false}
            disableGutters
          >
            <>
              <Outlet />
            </>
          </Container>
        </div>
        <div style={{gridArea: 'footer'}}>
          <Footer />
        </div>
      </div>
    </>
  );
}
