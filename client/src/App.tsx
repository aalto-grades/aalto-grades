// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import 'react-global-modal/dist/style.css';

import {
  Experimental_CssVarsProvider as CssVarsProvider,
  type CssVarsTheme,
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
import {type CSSProperties, type JSX, type Ref, useEffect} from 'react';
import {GlobalModal, GlobalModalWrapper} from 'react-global-modal';
import {RouterProvider, createBrowserRouter} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import AppContainer from './components/AppContainer';
import FrontPageView from './components/FrontPageView';
import LoginView from './components/LoginView';
import ManageStudentsView from './components/ManageStudentsView';
import NotFoundView from './components/NotFoundView';
import PrivateRoute from './components/PrivateRoute';
import StaticPageView from './components/StaticPageView';
import StudentsView from './components/StudentsView';
import CourseContainer from './components/course/CourseContainer';
import CoursePartsView from './components/course/CoursePartsView';
import CourseResultsView from './components/course/CourseResultsView';
import EditCourseView from './components/course/EditCourseView';
import ModelsView from './components/course/ModelsView';
import ConfirmDialog from './components/shared/ConfirmDialog';
import NotistackWrapper from './context/NotistackWrapper';

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

let globalModalRef: GlobalModalWrapper | null = null;

const Root = (): JSX.Element => {
  // const {enqueueSnackbar} = useSnackbar();
  useEffect(() => {
    GlobalModal.setUpModal(globalModalRef as Ref<GlobalModalWrapper | null>);
  }, []);

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
      <GlobalModalWrapper
        customModal={ConfirmDialog}
        ref={el => (globalModalRef = el)}
      />
      <QueryClientProvider client={queryClient}>
        <AppContainer />
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
      {path: '/login', element: <LoginView />},
      {
        path: '/licenses',
        element: <StaticPageView url="/javascript.html" title="Licenses" />,
      },
      {
        path: '/accessibility-statement',
        element: <StaticPageView url="/accessibility-statement.html" />,
      },
      {
        path: '/privacy-notice',
        element: <StaticPageView url="/PrivacyNotice.html" />,
      },
      {
        path: '/support',
        element: (
          <StaticPageView url="/support.html" title="FAQ, Help and Support" />
        ),
      },
      {
        path: '/',
        element: (
          <PrivateRoute roles={[SystemRole.User, SystemRole.Admin]}>
            <CourseContainer />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            path: '/',
            element: <FrontPageView />,
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
        element: <NotFoundView />,
      },
    ],
  },
]);

const App = (): JSX.Element => <RouterProvider router={router} />;

export default App;
