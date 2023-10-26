// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {LoginResult} from 'aalto-grades-common/types';
import {VisibilityOff, Visibility} from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {JSX, SyntheticEvent, useState} from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';

import ExternalAuth from './ExternalAuth';

import {useLogIn, UseLogInResult} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {State} from '../../types';

export default function Login(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const {setAuth}: {setAuth: (auth: LoginResult | null) => void} = useAuth();
  const [showPassword, setShowPassword]: State<boolean> = useState(false);

  function handleClickShowPassword(): void {
    setShowPassword(!showPassword);
  }

  function handleMouseDownPassword(
    event: React.MouseEvent<HTMLButtonElement>
  ): void {
    event.preventDefault();
  }

  const [email, setEmail]: State<string> = useState('');
  const [password, setPassword]: State<string> = useState('');

  const logIn: UseLogInResult = useLogIn({
    onSuccess: (auth: LoginResult | null) => {
      setAuth(auth ?? null);
      navigate('/', {replace: true});
    },
  });

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();

    logIn.mutate({
      email: email,
      password: password,
    });
  }

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="h2">Log in to Aalto Grades</Typography>
      <ExternalAuth />
      <Box
        sx={{
          width: 1 / 2,
          border: 1,
          borderRadius: '8px',
          borderColor: 'gray',
          p: 2,
        }}
      >
        <Typography variant="h3" sx={{mb: 1}}>
          Local users
        </Typography>
        <Typography variant="body2" sx={{mb: 1}}>
          If you have been provided with credentials specifically for Aalto
          Grades, use this login.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            type="email"
            value={email}
            name="email"
            label="Email"
            fullWidth
            onChange={({
              target,
            }: {
              target: EventTarget & (HTMLInputElement | HTMLTextAreaElement);
            }): void => setEmail(target.value)}
            InputLabelProps={{shrink: true}}
            margin="normal"
          />
          <TextField
            type={showPassword ? 'text' : 'password'}
            value={password}
            name="password"
            label="Password"
            fullWidth
            onChange={({
              target,
            }: {
              target: EventTarget & (HTMLInputElement | HTMLTextAreaElement);
            }): void => setPassword(target.value)}
            InputLabelProps={{shrink: true}}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    <Tooltip
                      placement="top"
                      title={
                        showPassword
                          ? 'Click to hide password from view'
                          : 'Click to show password'
                      }
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Tooltip>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            margin="normal"
          />
          <Button
            id="ag_login_btn"
            variant="contained"
            type="submit"
            fullWidth
            sx={{mt: 1}}
            disabled={email == '' || password == ''}
          >
            log in
          </Button>
        </form>
      </Box>
      <p>
        {"Don't have an account yet?"} <a href={'/Signup'}>Sign up</a>
      </p>
    </Grid>
  );
}
