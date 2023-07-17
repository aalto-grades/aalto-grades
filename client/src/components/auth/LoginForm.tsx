// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LoginResult } from 'aalto-grades-common/types';
import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import userServices from '../../services/user';
import { State } from '../../types';

function LoginForm(): JSX.Element {

  const { setAuth }: { setAuth: (auth: LoginResult | null) => void } = useAuth();
  const navigate: NavigateFunction = useNavigate();

  const [email, setEmail]: State<string> = useState('');
  const [password, setPassword]: State<string> = useState('');
  const [errorMessage, setErrorMessage]: State<string> = useState<string>('');

  async function handleSubmit(event: React.SyntheticEvent): Promise<void> {
    event.preventDefault();
    try {
      const response: LoginResult = await userServices.login({
        email,
        password
      });
      // if login is successful, save user role to context
      setAuth({
        id: response.id,
        role: response.role,
        name: response.name
      });

      navigate('/', { replace: true });
    } catch (err: unknown) {
      console.log(err);
      setErrorMessage('Invalid email or password');
    }
  }

  return (
    <Box sx={{ width: 1/2, border: 1, borderRadius: '8px', borderColor: 'gray', p: 2 }}>
      <Typography variant='h3' sx={{ mb: 1 }}>
        Local users
      </Typography>
      <Typography variant='body2' sx={{ mb: 1 }}>
        If you have been provided with credentials specifically for Aalto Grades, use this login.
      </Typography>
      <p style={{ color: 'red' }}>{errorMessage}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <TextField
            type='email'
            value={email}
            name='email'
            label='Email'
            fullWidth
            onChange={(
              { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
            ): void => setEmail(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
        </div>
        <div>
          <TextField
            type='password'
            value={password}
            name='password'
            label='Password'
            fullWidth
            onChange={(
              { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
            ): void => setPassword(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
        </div>
        <Button
          id='ag_login_btn'
          variant='contained'
          type='submit'
          fullWidth
          sx={{ mt: 1 }}
          disabled={email == '' || password == ''}
        >
          log in
        </Button>
      </form>
    </Box>
  );
}

export default LoginForm;
