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
import {RouterProvider, createBrowserRouter} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import AppView from './components/AppView';
import CourseResultsView from './components/CourseResultsView';
import CourseView from './components/CourseView';
import FrontPage from './components/FrontPage';
import ManageStudentsView from './components/ManageStudentsView';
import NotFound from './components/NotFound';
import StudentsView from './components/StudentsView';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import ResetPassword from './components/auth/ResetPassword';
import CoursePartsView from './components/course-view/CoursePartsView';
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

declare module '@mui/material/Button' {
  export interface ButtonPropsVariantOverrides {
    elevated: true;
    tonal: true;
  }
}

const muiTheme: CssVarsTheme = extendTheme({
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
        // error: {
        //   light: '#FFEBEE',
        //   main: '#F44336',
        //   dark: '#D32F2F',
        //   contrastText: '#FFF',
        // },
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
      variants: [
        {
          props: {variant: 'elevated'},
          style: {
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          },
        },
        {
          props: {variant: 'tonal', color: 'secondary'},
          style: ({theme}) => ({
            backgroundColor: theme.vars.palette.secondary.light,
            color: theme.vars.palette.secondary.main,
          }),
        },
        {
          props: {variant: 'tonal', color: 'primary'},
          style: ({theme}) => ({
            backgroundColor: theme.vars.palette.primary.light,
            color: theme.vars.palette.primary.main,
          }),
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          borderColor: 'black',
          height: '32px',
          fontSize: '14px',
          // boxSizing: 'border-box',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '48px',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
        },
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
      fontSize: '28px',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: '400',
      // lineHeight: '1.2',
    },
    h3: {
      fontSize: '24px',
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
    <CssVarsProvider theme={muiTheme}>
      <NotistackWrapper />
      <QueryClientProvider client={queryClient}>
        <AppView />
        {/* Query debug tool */}
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
      {path: '/reset-password', element: <ResetPassword />},
      {
        path: '/',
        element: (
          <PrivateRoute roles={[SystemRole.User, SystemRole.Admin]}>
            <CourseView />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            path: '/',
            element: <FrontPage />,
          },
          {
            path: '/students/:userId?',
            element: <StudentsView />,
          },
          {
            path: '/manage-students',
            element: (
              <PrivateRoute roles={[SystemRole.Admin]}>
                <ManageStudentsView />
              </PrivateRoute>
            ),
          },

          {
            path: '/:courseId',
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
                path: '/:courseId/course-parts',
                element: <CoursePartsView />,
              },
              {
                path: '/:courseId/edit',
                element: <EditCourseView />,
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
