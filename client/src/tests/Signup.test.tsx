// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {SystemRole} from 'aalto-grades-common/types';
import {rest} from 'msw';
import {BrowserRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Signup from '../components/auth/Signup';

import AuthContext from '../context/AuthProvider';
import {mockPostSuccess, server} from './mock-data/server';

describe('Tests for Signup component', () => {
  function renderSignup(): void {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthContext.Provider
          value={{
            auth: null,
            setAuth: vi.fn(),
            isTeacherInCharge: false,
            setIsTeacherInCharge: vi.fn(),
          }}
        >
          <BrowserRouter>
            <Signup />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  test('Signup should render the appropriate components', () => {
    renderSignup();

    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(
      screen.getByLabelText('Student Number (not required)')
    ).toBeDefined();
    expect(screen.getByText('sign up')).toBeDefined();
    expect(screen.getByText('Sign up')).toBeDefined();
  });

  test('Signup should allow a user to submit their credentials', async () => {
    renderSignup();

    const signUp: vi.Mock = vi.fn();
    server.use(rest.post('*/v1/auth/signup', mockPostSuccess(signUp, null)));

    act(() => userEvent.type(screen.getByLabelText('Name'), 'Test User'));
    act(() => userEvent.type(screen.getByLabelText('Password'), 'secret'));
    act(() => userEvent.type(screen.getByLabelText('Email'), 'test@email.com'));
    act(() =>
      userEvent.type(
        screen.getByLabelText('Student Number (not required)'),
        '010101'
      )
    );
    act(() => userEvent.click(screen.getByText('sign up')));

    // Role "User" should be the default role if no role has been specified.

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledTimes(1);
      expect(signUp).toHaveBeenCalledWith({
        name: 'Test User',
        password: 'secret',
        email: 'test@email.com',
        studentNumber: '010101',
        role: SystemRole.User,
      });
    });
  });
});
