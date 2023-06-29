// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import SignupForm from './SignupForm';
import userService from '../../services/user';
import useAuth from '../../hooks/useAuth';
import { SignupCredentials } from '../../types/auth';

function Signup(): JSX.Element {

  const navigate: NavigateFunction = useNavigate();
  const { setAuth } = useAuth();
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function addUser(userObject: SignupCredentials): Promise<void> {
    try {
      const response = await userService.signup(userObject);
      // if signup successfull, save user role to context
      setAuth({
        id: response.id,
        role: response.role,
        name: response.name
      });

      navigate('/', { replace: true });
    } catch (exception) {
      console.log(exception);
      setErrorMessage('Error: signup failed');
    }
  }

  return (
    <div>
      <h1>Sign up</h1>
      <p style={{ color: `${theme.palette.primary.dark}` }}>{errorMessage}</p>
      <SignupForm addUser={addUser} />
    </div>
  );
}

export default Signup;
