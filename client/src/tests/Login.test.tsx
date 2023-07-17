// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/auth/LoginForm';
import Login from '../components/auth/Login';
import userServices from '../services/user';
import { LoginResult } from 'aalto-grades-common/types';
import { LoginCredentials } from '../types';

describe('Tests for Login and LoginForm components', () => {

  test('Login should render the LoginForm and contain all of the appropriate components', () => {

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('Log in to Aalto Grades')).toBeDefined();
    expect(screen.getByText('Aalto University users')).toBeDefined();
    expect(screen.getByText('Local users')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByText('log in')).toBeDefined();
    expect(screen.getByText('Don\'t have an account yet?')).toBeDefined();
  });

  test('LoginForm should allow a user to submit their credentials', () => {
    const mockLoginUser: jest.SpyInstance<Promise<LoginResult>, [credentials: LoginCredentials]> =
      jest.spyOn(userServices, 'login');

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    act(() => userEvent.type(screen.getByLabelText('Email'), 'test@email.com'));
    act(() => userEvent.type(screen.getByLabelText('Password'), 'secret'));
    act(() => userEvent.click(screen.getByText('log in')));

    expect(mockLoginUser).toHaveBeenCalledTimes(1);
    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: 'secret'
    });
  });

});
