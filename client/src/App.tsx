// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SystemRole } from 'aalto-grades-common/types';
import { AppBar, Box, Container, Link, Toolbar } from '@mui/material';
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles';
import { CSSProperties, JSX } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  QueryCache, QueryClient, QueryClientProvider, MutationCache
} from '@tanstack/react-query';

import AlertSnackbar from './components/alerts/AlertSnackbar';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import Signup from './components/auth/Signup';
import UserButton from './components/auth/UserButton';
import CourseView from './components/CourseView';
import CourseResultsView from './components/CourseResultsView';
import CreateCourseView from './components/CreateCourseView';
import EditAttainmentView from './components/EditAttainmentView';
import EditInstanceView from './components/EditInstanceView';
import FetchInstancesView from './components/FetchInstancesView';
import Footer from './components/Footer';
import FrontPage from './components/FrontPage';

import useSnackPackAlerts, { SnackPackAlertState } from './hooks/useSnackPackAlerts';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    black?: string,
    hoverGrey1?: string,
    hoverGrey2?: string,
    hoverGrey3?: string
    infoGrey?: string
  }

  interface Palette {
    black: string,
    hoverGrey1: string,
    hoverGrey2: string,
    hoverGrey3: string
    infoGrey: string
  }

  interface TypographyVariantsOptions {
    textInput?: CSSProperties;
  }
}

const theme: Theme = createTheme({
  palette: {
    black: '#000000',
    primary: {
      light: '#EFF3FB',
      main: '#3D5AFE',
      dark: '#0031CA',
      contrastText: '#FFF',
    },
    secondary: {
      light: '#F1F8F0',
      main: '#96CF99',
      dark: '#519657',
      contrastText: '#000',
    },
    info: {
      light: '#FFC046',
      main: '#FF8F00',
      dark: '#C56000',
      contrastText: '#000',
    },
    hoverGrey1: '#EAEAEA',
    hoverGrey2: '#F4F4F4',
    hoverGrey3: '#6E6E6E',
    infoGrey: '#545454',
    contrastThreshold: 4.5
  },
  typography: {
    h1: {
      fontSize: '48px',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400'
    },
    h2: {
      fontSize: '34px',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400'
    },
    h3: {
      fontSize: '20px',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400'
    },
    body1: {
      fontSize: '16px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400'
    },
    body2: {
      fontSize: '14px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400'
    },
    textInput: {
      fontSize: '16px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400'
    },
    button: {
      fontSize: '14px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '500'
    },
    caption: {
      fontSize: '12px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400'
    },
  }
});

export default function App(): JSX.Element {

  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  function handleError(error: unknown) {
    snackPack.push({
      msg: (error as Error).message,
      severity: 'error'
    });
  }

  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: handleError
    }),
    mutationCache: new MutationCache({
      onError: handleError
    })
  });

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppBar position="static">
            <Toolbar>
              <Link
                href="/"
                underline="none"
                color="white"
                variant="h5"
                align="left"
                sx={{ mr: 2, flexGrow: 1 }}
              >
                Aalto Grades
              </Link>
              <UserButton />
            </Toolbar>
          </AppBar>
          <Container sx={{ textAlign: 'center' }} maxWidth="lg">
            <Box mx={5} my={5}>
              <AlertSnackbar snackPack={snackPack} />
              <Routes> { /* Add nested routes when needed */}
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                {
                  /* All roles are authorised to access the front page, conditional
                     rendering is done inside the component */
                }
                <Route element={<PrivateRoute roles={Object.values(SystemRole)} />}>
                  <Route
                    path='/'
                    element={<FrontPage />}
                  />
                  <Route
                    path='/course-view/:courseId'
                    element={<CourseView />}
                  />
                </Route>
                { /* Pages that are only authorised for admin */}
                <Route element={<PrivateRoute roles={[SystemRole.Admin]} />}>
                  <Route
                    path='/create-course'
                    element={<CreateCourseView />}
                  />
                </Route>
                { /* Pages that are authorised for admin and teachers in charge */}
                <Route element={<PrivateRoute roles={[SystemRole.Admin]} />}>
                  <Route
                    path='/:courseId/fetch-instances/:courseCode'
                    element={<FetchInstancesView />}
                  />
                  <Route
                    path='/:courseId/course-results/:assessmentModelId'
                    element={<CourseResultsView />}
                  />
                  <Route
                    path='/:courseId/edit-instance'
                    element={<EditInstanceView />}
                  />
                  <Route
                    path='/:courseId/edit-instance/:sisuInstanceId'
                    element={<EditInstanceView />}
                  />
                  <Route
                    path='/:courseId/attainment/:modification/:assessmentModelId/:attainmentId'
                    element={<EditAttainmentView />}
                  />
                </Route>
              </Routes>
            </Box>
          </Container>
          <Footer />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
