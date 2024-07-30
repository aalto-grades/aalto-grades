// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Grid, TextField, Typography} from '@mui/material';
import {JSX, SyntheticEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import ExternalAuth from './ExternalAuth';
import ShowPasswordButton from './ShowPasswordButton';
import {useLogIn} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';

const Login = (): JSX.Element => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {setAuth} = useAuth();
  const logIn = useLogIn();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (event: SyntheticEvent): Promise<void> => {
    event.preventDefault();
    const auth = await logIn.mutateAsync({email, password});

    if (auth.resetPassword)
      return navigate('/reset-password', {state: {email, password}});
    setAuth(auth);
    navigate('/', {replace: true});
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="h2">{t('login')}</Typography>
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
            onChange={e => setEmail(e.target.value)}
            InputLabelProps={{shrink: true}}
            margin="normal"
          />
          <TextField
            type={showPassword ? 'text' : 'password'}
            value={password}
            name="password"
            label="Password"
            fullWidth
            onChange={e => setPassword(e.target.value)}
            InputLabelProps={{shrink: true}}
            InputProps={{
              endAdornment: (
                <ShowPasswordButton
                  shown={showPassword}
                  onClick={() => setShowPassword(oldShow => !oldShow)}
                />
              ),
            }}
            margin="normal"
          />
          <Button
            id="ag-login-btn"
            variant="contained"
            type="submit"
            fullWidth
            sx={{mt: 1}}
            disabled={email === '' || password === ''}
          >
            Log in
          </Button>
        </form>
      </Box>
    </Grid>
  );
};
export default Login;
