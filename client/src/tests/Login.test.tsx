// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {rest} from 'msw';
import {BrowserRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Login from '../components/auth/Login';

import AuthContext from '../context/AuthProvider';
import {mockPostSuccess, server} from './mock-data/server';

describe('Tests for Login and LoginForm components', () => {
  function renderLogin(): void {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthContext.Provider
          value={{
            auth: null,
            setAuth: jest.fn(),
            isTeacherInCharge: false,
            setIsTeacherInCharge: jest.fn(),
          }}
        >
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  test('Login should render the appropriate components', () => {
    renderLogin();

    expect(screen.getByText('Log in to Aalto Grades')).toBeDefined();
    expect(screen.getByText('Aalto University users')).toBeDefined();
    expect(screen.getByText('Local users')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByText('log in')).toBeDefined();
    expect(screen.getByText("Don't have an account yet?")).toBeDefined();
  });

  test('Login should allow a user to submit their credentials', async () => {
    renderLogin();

    const logIn: jest.Mock = jest.fn();
    server.use(rest.post('*/v1/auth/login', mockPostSuccess(logIn, null)));

    act(() => userEvent.type(screen.getByLabelText('Email'), 'test@email.com'));
    act(() => userEvent.type(screen.getByLabelText('Password'), 'secret'));
    act(() => userEvent.click(screen.getByText('log in')));

    await waitFor(() => {
      expect(logIn).toHaveBeenCalledTimes(1);
      expect(logIn).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: 'secret',
      });
    });
  });
});
