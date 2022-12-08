// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import SignupForm from '../components/auth/SignupForm';
import Signup from '../components/auth/Signup';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

describe('Tests for Login component', () => {

  test('Signup should render the SignupForm and contain all of the appropriate components', () => {

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const usernameField = screen.getByLabelText('Username');
    const passwordField = screen.getByLabelText('Password');
    const emailField = screen.getByLabelText('Email');
    const studentIdField = screen.getByLabelText('Student ID');
    const signupButton = screen.getByText('sign up');
    const textElement = screen.getByText('Sign up');

    expect(usernameField).toBeDefined();
    expect(passwordField).toBeDefined();
    expect(emailField).toBeDefined();
    expect(studentIdField).toBeDefined();
    expect(signupButton).toBeDefined();
    expect(textElement).toBeDefined();
    
  });

  test('LoginForm should allow a user to submit their credentials', () => {

    const mockSignupUser = jest.fn();

    render(<SignupForm addUser={mockSignupUser}/>);

    const usernameField = screen.getByLabelText('Username');
    const passwordField = screen.getByLabelText('Password');
    const emailField = screen.getByLabelText('Email');
    const studentIdField = screen.getByLabelText('Student ID');
    const signupButton = screen.getByText('sign up');

    userEvent.type(usernameField, 'TestUser');
    userEvent.type(passwordField, 'secret');
    userEvent.type(emailField, 'test@email.com');
    userEvent.type(studentIdField, '010101');
    userEvent.click(signupButton);

    // Teacher should be the default role if no role has been specified
    
    expect(mockSignupUser).toHaveBeenCalledTimes(1);
    expect(mockSignupUser).toHaveBeenCalledWith({
      username: 'TestUser',
      password: 'secret',
      email: 'test@email.com',
      studentID: '010101',
      role: 'Teacher'
    });
  });

});