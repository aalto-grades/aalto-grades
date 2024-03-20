// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AppBar, Box, Container, Toolbar, Typography} from '@mui/material';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  CssVarsTheme,
  experimental_extendTheme as extendTheme,
} from '@mui/material/styles';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'; // For debugging
import {CSSProperties, JSX} from 'react';
import {Link, Route, Routes} from 'react-router-dom';

import {SystemRole} from '@common/types';
import CourseResultsView from './components/CourseResultsView';
import CourseView from './components/CourseView';
import EditCourseView from './components/EditCourseView';
import Footer from './components/Footer';
import FrontPage from './components/FrontPage';
import NotFound from './components/NotFound';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import Signup from './components/auth/Signup';
import UserButton from './components/auth/UserButton';
import AddUserView from './components/front-page/users-view/AddUserView';

import {enqueueSnackbar} from 'notistack';
import AttainmentsView from './components/course-view/AttainmentsView';
import ModelsView from './components/course-view/ModelsView';
import NotistackWrapper from './context/NotistackProvider';

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

const theme: CssVarsTheme = extendTheme({
  colorSchemes: {
    light: {
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
        contrastThreshold: 4.5,
      },
    },
  },
  typography: {
    h1: {
      fontSize: '48px',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400',
    },
    h2: {
      fontSize: '34px',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400',
    },
    h3: {
      fontSize: '20px',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400',
    },
    body1: {
      fontSize: '16px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400',
    },
    body2: {
      fontSize: '14px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400',
    },
    textInput: {
      fontSize: '16px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400',
    },
    button: {
      fontSize: '14px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '500',
    },
    caption: {
      fontSize: '12px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400',
    },
  },
});

export default function App(): JSX.Element {
  // const {enqueueSnackbar} = useSnackbar();

  function handleError(error: Error): void {
    enqueueSnackbar(error.message, {variant: 'error'});
  }

  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: handleError,
    }),
    mutationCache: new MutationCache({
      onError: handleError,
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
      },
    },
  });

  return (
    <CssVarsProvider theme={theme}>
      <NotistackWrapper />
      <QueryClientProvider client={queryClient}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AppBar position="static">
            <Toolbar>
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'white',
                  mr: 2,
                  flexGrow: 1,
                }}
              >
                Aalto Grades
              </Typography>
              <UserButton />
            </Toolbar>
          </AppBar>
          {/* <Button
            onClick={() => enqueueSnackbar('Hello', {variant: 'success'})}
          >
            Hello
          </Button> */}
          <Container sx={{textAlign: 'center', m: 0}} maxWidth={false}>
            <Box>
              <Routes>
                {/* Add nested routes when needed */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* All roles are authorised to access the front page, conditional
                     rendering is done inside the component */}
                <Route
                  element={<PrivateRoute roles={Object.values(SystemRole)} />}
                >
                  <Route path="/" element={<FrontPage />} />
                  <Route
                    path="/course-view/:courseId"
                    element={<CourseView />}
                  />
                </Route>
                {/* Pages that are only authorised for admin */}
                <Route element={<PrivateRoute roles={[SystemRole.Admin]} />}>
                  <Route
                    path="/course/:modification/:courseId?"
                    element={<EditCourseView />}
                  />
                  <Route path="/user/add/" element={<AddUserView />} />
                </Route>
                <Route
                  element={
                    <PrivateRoute roles={[SystemRole.User, SystemRole.Admin]} />
                  }
                >
                  {/* All roles are authorised to access the front page, conditional
                     rendering is done inside the component */}

                  <Route path="/" element={<FrontPage />} />
                  <Route path="/:courseId" element={<CourseView />}>
                    <Route
                      path="/:courseId/course-results"
                      element={<CourseResultsView />}
                    />
                    <Route path="/:courseId/models" element={<ModelsView />} />
                    <Route
                      path="/:courseId/attainments"
                      element={<AttainmentsView />}
                    />
                  </Route>
                </Route>
                {/* Not found route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </Container>
          <Footer />
        </div>
        {/* Query Debug Tool */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </CssVarsProvider>
  );
}
