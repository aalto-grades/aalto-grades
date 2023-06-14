// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '../components/auth/SignupForm';
import Signup from '../components/auth/Signup';
import { SystemRole } from 'aalto-grades-common/types/auth';

describe('Tests for Login component', () => {

  test('Signup should render the SignupForm and contain all of the appropriate components', () => {

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameField = screen.getByLabelText('Name');
    const passwordField = screen.getByLabelText('Password');
    const emailField = screen.getByLabelText('Email');
    const studentNumberField = screen.getByLabelText('Student Number (not required)');
    const signupButton = screen.getByText('sign up');
    const textElement = screen.getByText('Sign up');

    expect(nameField).toBeDefined();
    expect(passwordField).toBeDefined();
    expect(emailField).toBeDefined();
    expect(studentNumberField).toBeDefined();
    expect(signupButton).toBeDefined();
    expect(textElement).toBeDefined();

  });

  test('LoginForm should allow a user to submit their credentials', () => {

    const mockSignupUser = jest.fn();

    render(<SignupForm addUser={mockSignupUser}/>);

    const nameField = screen.getByLabelText('Name');
    const passwordField = screen.getByLabelText('Password');
    const emailField = screen.getByLabelText('Email');
    const studentNumberField = screen.getByLabelText('Student Number (not required)');
    const signupButton = screen.getByText('sign up');

    act(() => userEvent.type(nameField, 'Test User'));
    act(() => userEvent.type(passwordField, 'secret'));
    act(() => userEvent.type(emailField, 'test@email.com'));
    act(() => userEvent.type(studentNumberField, '010101'));
    act(() => userEvent.click(signupButton));

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
