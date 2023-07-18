// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LoginResult } from 'aalto-grades-common/types';
import { useTheme, Theme } from '@mui/material/styles';
import { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import SignupForm from './SignupForm';

import { useSignUp, UseSignUpResult } from '../../hooks/useApi';
import useAuth, { AuthContextType } from '../../hooks/useAuth';
import { SignupCredentials, State } from '../../types';

export default function Signup(): JSX.Element {

  const navigate: NavigateFunction = useNavigate();
  const { setAuth }: AuthContextType = useAuth();
  const theme: Theme = useTheme();
  const [errorMessage, setErrorMessage]: State<string> = useState('');

  const signUp: UseSignUpResult = useSignUp({
    onSuccess: (auth: LoginResult | null) => {
      // If signup successful, save user role to context
      setAuth(auth ?? null);
      navigate('/', { replace: true });
    }
  });

  return (
    <div>
      <h1>Sign up</h1>
      <p style={{ color: `${theme.palette.primary.dark}` }}>{errorMessage}</p>
      <SignupForm
        addUser={(credentials: SignupCredentials) => signUp.mutate(credentials)}
      />
    </div>
  );
}
