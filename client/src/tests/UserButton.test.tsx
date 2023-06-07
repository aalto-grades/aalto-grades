// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthContext from '../context/authProvider';
import UserButton from '../components/auth/UserButton';
import { UserRole } from '../types/general';

jest.mock('../services/courses');
afterEach(cleanup);

describe('Tests for button component displaying user data and logout', () => {

  const renderButton = async (auth) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ auth }}>
          <UserButton />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('User button should display the currently logged in users name', async () => {
    const auth = { id: 1, role: UserRole.User, name: 'John Doe' };
    renderButton(auth);
    await waitFor(() => expect(screen.queryByText('John Doe')).toBeInTheDocument());
  });

  test('User button should not display any name when not logged in', async () => {
    const auth = { id: null, role: null, name: null };
    renderButton(auth);
    await waitFor(() => expect(screen.getByTestId('not-logged-in')).toBeInTheDocument());
  });

  test('Clicking user button should display logout option', async () => {
    const auth = { id: 1, role: UserRole.User, name: 'John Doe' };
    renderButton(auth);

    const button = screen.getByText('John Doe');
    expect(button).toBeDefined();
    act(() => userEvent.click(button));

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeDefined();
  });
});
