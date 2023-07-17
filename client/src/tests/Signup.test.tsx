// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SystemRole } from 'aalto-grades-common/types';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SignupForm from '../components/auth/SignupForm';
import Signup from '../components/auth/Signup';

describe('Tests for Login component', () => {

  test('Signup should render the SignupForm and contain all of the appropriate components', () => {

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Student Number (not required)')).toBeDefined();
    expect(screen.getByText('sign up')).toBeDefined();
    expect(screen.getByText('Sign up')).toBeDefined();

  });

  test('LoginForm should allow a user to submit their credentials', () => {

    const mockSignupUser = jest.fn();

    render(<SignupForm addUser={mockSignupUser}/>);

    act(() => userEvent.type(screen.getByLabelText('Name'), 'Test User'));
    act(() => userEvent.type(screen.getByLabelText('Password'), 'secret'));
    act(() => userEvent.type(screen.getByLabelText('Email'), 'test@email.com'));
    act(() => userEvent.type(screen.getByLabelText('Student Number (not required)'), '010101'));
    act(() => userEvent.click(screen.getByText('sign up')));

    // Role "User" should be the default role if no role has been specified.

    expect(mockSignupUser).toHaveBeenCalledTimes(1);
    expect(mockSignupUser).toHaveBeenCalledWith({
      name: 'Test User',
      password: 'secret',
      email: 'test@email.com',
      studentNumber: '010101',
      role: SystemRole.User
    });
  });

});
