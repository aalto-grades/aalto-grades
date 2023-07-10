// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useTheme, Theme } from '@mui/material/styles';
import SignupForm from './SignupForm';
import userService from '../../services/user';
import useAuth, { AuthContextType } from '../../hooks/useAuth';
import { State } from '../../types';
import { SignupCredentials } from '../../types/auth';

function Signup(): JSX.Element {

  const navigate: NavigateFunction = useNavigate();
  const { setAuth }: AuthContextType = useAuth();
  const theme: Theme = useTheme();
  const [errorMessage, setErrorMessage]: State<string> = useState('');

  async function addUser(userObject: SignupCredentials): Promise<void> {
    try {
      // if signup successfull, save user role to context
      setAuth(await userService.signup(userObject));

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
