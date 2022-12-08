// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/auth/LoginForm';
import Login from '../components/auth/Login';
import { BrowserRouter } from 'react-router-dom';

describe('Tests for Login and LoginForm components', () => {

  test('Login should render the LoginForm and contain all of the appropriate components', () => {

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameField = screen.getByLabelText('Username');
    const passwordField = screen.getByLabelText('Password');
    const loginButton = screen.getByText('login');
    const textElement = screen.getByText('Don\'t have an account yet?');

    expect(usernameField).toBeDefined();
    expect(passwordField).toBeDefined();
    expect(loginButton).toBeDefined();
    expect(textElement).toBeDefined();
  });

  test('LoginForm should allow a user to submit their credentials', () => {

    const mockLoginUser = jest.fn();

    render(<LoginForm addUser={mockLoginUser}/>);

    const usernameField = screen.getByLabelText('Username');
    const passwordField = screen.getByLabelText('Password');
    const loginButton = screen.getByText('login');

    userEvent.type(usernameField, 'TestUser');
    userEvent.type(passwordField, 'secret');
    userEvent.click(loginButton);
    
    expect(mockLoginUser).toHaveBeenCalledTimes(1);
    expect(mockLoginUser).toHaveBeenCalledWith({
      username: 'TestUser',
      password: 'secret'
    });
  });

});

