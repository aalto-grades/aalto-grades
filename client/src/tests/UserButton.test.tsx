// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable no-restricted-imports */

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  RenderResult,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {BrowserRouter} from 'react-router-dom';

import {AuthData, SystemRole} from '@/common/types';
import UserButton from '@/components/app-container/UserButton';
import AuthContext from '@/context/AuthProvider';

afterEach(cleanup);

describe('Tests for button component displaying user data and logout', () => {
  const renderButton = (auth: AuthData | null): RenderResult =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <AuthContext.Provider
            value={{
              auth: auth,
              setAuth: vi.fn(),
              isTeacherInCharge: false,
              setIsTeacherInCharge: vi.fn(),
              setIsAssistant: vi.fn(),
              isAssistant: false,
            }}
          >
            <UserButton />
          </AuthContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
    );

  test('User button should display the currently logged in users name', async () => {
    const auth: AuthData = {
      id: 1,
      role: SystemRole.User,
      name: 'John Doe',
    };
    renderButton(auth);
    await waitFor(() =>
      expect(screen.queryByText('John Doe')).toBeInTheDocument()
    );
  });

  test('User button should not display any name when not logged in', async () => {
    renderButton(null);
    await waitFor(() =>
      expect(screen.getByTestId('not-logged-in')).toBeInTheDocument()
    );
  });

  test('Clicking user button should display logout option', async () => {
    const auth: AuthData = {
      id: 1,
      role: SystemRole.User,
      name: 'John Doe',
    };
    renderButton(auth);

    const button: HTMLElement = screen.getByText('John Doe');
    expect(button).toBeDefined();
    await userEvent.click(button);

    const logoutButton: HTMLElement = screen.getByText('Logout');
    expect(logoutButton).toBeDefined();
  });
});
