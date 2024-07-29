// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RenderResult, render, screen, waitFor} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {http} from 'msw';
import {BrowserRouter} from 'react-router-dom';

import {LoginResult, SystemRole} from '@/common/types';
import {mockPostSuccess, server} from './mock-data/server';
import Login from '../components/auth/Login';
import AuthContext from '../context/AuthProvider';

describe('Tests for Login and LoginForm components', () => {
  const renderLogin = (): RenderResult =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthContext.Provider
          value={{
            auth: null,
            setAuth: vi.fn(),
            isTeacherInCharge: false,
            setIsTeacherInCharge: vi.fn(),
            setIsAssistant: vi.fn(),
            isAssistant: false,
          }}
        >
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

  test('Login should render the appropriate components', () => {
    renderLogin();

    expect(screen.getByText('Log in to Aalto Grades')).toBeDefined();
    expect(screen.getByText('Aalto University users')).toBeDefined();
    expect(screen.getByText('Local users')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByText('Log in')).toBeDefined();
  });

  test('Login should allow a user to submit their credentials', async () => {
    renderLogin();

    const logIn = vi.fn();
    const loginData: LoginResult = {
      redirect: false,
      id: 5,
      name: 'Terry Tester',
      role: SystemRole.User,
    };
    server.use(http.post('*/v1/auth/login', mockPostSuccess(logIn, loginData)));

    await userEvent.type(screen.getByLabelText('Email'), 'test@email.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByText('Log in'));

    await waitFor(() => {
      expect(logIn).toHaveBeenCalledTimes(1);
      expect(logIn).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: 'secret',
      });
    });
  });
});
