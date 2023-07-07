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

    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByText('login')).toBeDefined();
    expect(screen.getByText('Don\'t have an account yet?')).toBeDefined();
  });

  test('LoginForm should allow a user to submit their credentials', () => {

    const mockLoginUser: jest.Mock = jest.fn();

    render(<LoginForm loginUser={mockLoginUser}/>);

    act(() => userEvent.type(screen.getByLabelText('Email'), 'test@email.com'));
    act(() => userEvent.type(screen.getByLabelText('Password'), 'secret'));
    act(() => userEvent.click(screen.getByText('login')));

    expect(mockLoginUser).toHaveBeenCalledTimes(1);
    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: 'secret'
    });
  });

});

