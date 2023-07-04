// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/auth/LoginForm';
import Login from '../components/auth/Login';

describe('Tests for Login and LoginForm components', () => {

  test('Login should render the LoginForm and contain all of the appropriate components', () => {

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailField: HTMLElement = screen.getByLabelText('Email');
    const passwordField: HTMLElement = screen.getByLabelText('Password');
    const loginButton: HTMLElement = screen.getByText('login');
    const textElement: HTMLElement = screen.getByText('Don\'t have an account yet?');

    expect(emailField).toBeDefined();
    expect(passwordField).toBeDefined();
    expect(loginButton).toBeDefined();
    expect(textElement).toBeDefined();
  });

  test('LoginForm should allow a user to submit their credentials', () => {

    const mockLoginUser: jest.Mock = jest.fn();

    render(<LoginForm loginUser={mockLoginUser}/>);

    const emailField: HTMLElement = screen.getByLabelText('Email');
    const passwordField: HTMLElement = screen.getByLabelText('Password');
    const loginButton: HTMLElement = screen.getByText('login');

    act(() => userEvent.type(emailField, 'test@email.com'));
    act(() => userEvent.type(passwordField, 'secret'));
    act(() => userEvent.click(loginButton));

    expect(mockLoginUser).toHaveBeenCalledTimes(1);
    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: 'secret'
    });
  });

});

