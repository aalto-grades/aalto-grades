// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import 'react-global-modal/dist/react-global-modal.css';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'; // For debugging
import {enqueueSnackbar} from 'notistack';
import {type JSX, type Ref, useEffect} from 'react';
import {GlobalModal, GlobalModalWrapper} from 'react-global-modal';
import {RouterProvider, createBrowserRouter} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import ThemeProvider from '@/theme/ThemeProvider';
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
import CourseRedirect from './components/course/CourseRedirect';
import EditCourseView from './components/course/EditCourseView';
import GradesView from './components/course/GradesView';
import ModelsView from './components/course/ModelsView';
import ConfirmDialog from './components/shared/ConfirmDialog';
import NotistackWrapper from './context/NotistackWrapper';
import type {CustomError} from './types';

let globalModalRef: GlobalModalWrapper | null = null;

const Root = (): JSX.Element => {
  useEffect(() => {
    GlobalModal.setUpModal(globalModalRef as Ref<GlobalModalWrapper | null>);
  }, []);

  const handleError = (error: CustomError): void => {
    enqueueSnackbar(error.message, {
      variant: 'error',
      action: error.action,
    });
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
    <ThemeProvider>
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
    </ThemeProvider>
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
        element: (
          <StaticPageView url="/privacy-notice.html" title="Privacy Notice" />
        ),
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
                index: true,
                element: <CourseRedirect />,
              },
              {
                path: '/:courseId/course-results',
                element: <GradesView />,
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
