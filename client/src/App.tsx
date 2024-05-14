// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

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
import {enqueueSnackbar} from 'notistack';
import {CSSProperties, JSX} from 'react';
import {Outlet, RouterProvider, createBrowserRouter} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import AppView from './components/AppView';
import CourseResultsView from './components/CourseResultsView';
import CourseView from './components/CourseView';
import FrontPage from './components/FrontPage';
import NotFound from './components/NotFound';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import AttainmentsView from './components/course-view/AttainmentsView';
import EditCourseView from './components/course-view/EditCourseView';
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
        // info: {
        //   light: '#FFC046',
        //   main: '#FF8F00',
        //   dark: '#C56000',
        //   contrastText: '#000',
        // },
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

const Root = (): JSX.Element => {
  // const {enqueueSnackbar} = useSnackbar();

  const handleError = (error: Error): void => {
    enqueueSnackbar(error.message, {variant: 'error'});
  };

  const queryClient = new QueryClient({
    queryCache: new QueryCache({onError: handleError}),
    mutationCache: new MutationCache({onError: handleError}),
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
        <AppView />
        {/* Query Debug Tool */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </CssVarsProvider>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {path: '/login', element: <Login />},
      {
        // All Roles
        path: '/',
        element: (
          <PrivateRoute roles={[SystemRole.User, SystemRole.Admin]}>
            <CourseView />
          </PrivateRoute>
        ),
        children: [
          {path: '/', index: true, element: <FrontPage />},
          {
            path: '/:courseId',
            element: (
              <>
                <Outlet />
              </>
            ),
            children: [
              {
                // Temporary default view
                index: true,
                element: <CourseResultsView />,
              },
              {
                path: '/:courseId/course-results',
                element: <CourseResultsView />,
              },
              {
                path: '/:courseId/models/:modelId?/:userId?',
                element: <ModelsView />,
              },
              {
                path: '/:courseId/attainments',
                element: <AttainmentsView />,
              },
              {
                path: '/:courseId/edit',
                element: (
                  <PrivateRoute roles={[SystemRole.Admin]}>
                    <EditCourseView />
                  </PrivateRoute>
                ),
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

const App = (): JSX.Element => <RouterProvider router={router} />;

export default App;
