// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {LoginResult, SystemRole} from '@common/types';
import {BrowserRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {
  cleanup,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';

import FrontPage from '../components/FrontPage';

import AuthContext from '../context/AuthProvider';

afterEach(cleanup);

describe('Test FrontPage with courses of user', () => {
  function renderFrontPage(auth: LoginResult): RenderResult {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <AuthContext.Provider
            value={{
              auth: auth,
              setAuth: vi.fn(),
              isTeacherInCharge: false,
              setIsTeacherInCharge: vi.fn(),
            }}
          >
            <FrontPage />
          </AuthContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  test("FrontPage should render user's courses and all courses", async () => {
    const auth: LoginResult = {
      id: 2,
      name: 'User',
      role: SystemRole.User,
    };

    renderFrontPage(auth);

    await waitFor(() => {
      expect(screen.queryByText('Your Courses')).toBeInTheDocument();
      expect(screen.queryByText('Courses')).toBeInTheDocument();
    });
  });

  test('FrontPage should render create new course button for admins', async () => {
    const auth: LoginResult = {
      id: 1,
      name: 'Admin',
      role: SystemRole.Admin,
    };

    renderFrontPage(auth);

    await waitFor(() => {
      expect(screen.queryByText('Create New Course')).toBeInTheDocument();
    });
  });

  test('FrontPage should not render create new course button for users', async () => {
    const auth: LoginResult = {
      id: 2,
      name: 'User',
      role: SystemRole.User,
    };

    renderFrontPage(auth);

    await waitFor(() => {
      expect(screen.queryByText('Create New Course')).not.toBeInTheDocument();
    });
  });
});

describe('Test FrontPage without courses of user', () => {
  function renderFrontPage(auth: LoginResult): RenderResult {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <AuthContext.Provider
            value={{
              auth: auth,
              setAuth: vi.fn(),
              isTeacherInCharge: false,
              setIsTeacherInCharge: vi.fn(),
            }}
          >
            <FrontPage />
          </AuthContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  test(
    'FrontPage should render a message saying the user has no courses' +
      ' and a list of all courses',
    async () => {
      const auth: LoginResult = {
        id: 2,
        name: 'User',
        role: SystemRole.User,
      };

      renderFrontPage(auth);

      await waitFor(() => {
        expect(screen.getByText('Your Courses')).toBeInTheDocument();
        expect(screen.getByText('You have no courses.')).toBeInTheDocument();
        expect(screen.getByText('Courses')).toBeInTheDocument();
      });
    }
  );
});
