// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Collapse,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import {MuiOtpInput} from 'mui-one-time-password-input';
import {JSX, SyntheticEvent, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import ExternalAuth from './ExternalAuth';
import OtpAuthDialog from './OtpAuthDialog';
import ShowPasswordButton from './ShowPasswordButton';
import {useLogIn} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';

const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const {setAuth} = useAuth();
  const logIn = useLogIn();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpAuth, setOtpAuth] = useState<string | null>(null);
  const [showOtpPrompt, setShowMfaPrompt] = useState<boolean>(false);

  const handleSubmit = async (
    event: SyntheticEvent | null,
    fullOtp: string | null = null
  ): Promise<void> => {
    if (event) event.preventDefault();
    const auth = await logIn.mutateAsync({
      email,
      password,
      otp: fullOtp ?? (otp !== '' ? otp : null),
    });

    switch (auth.status) {
      case 'resetMfa':
        setOtpAuth(auth.otpAuth);
        break;
      case 'resetPassword':
        navigate('/reset-password', {
          state: {
            email,
            password,
            resetPassword: auth.resetPassword,
            resetMfa: auth.resetMfa,
          },
        });
        break;
      case 'enterMfa':
        setShowMfaPrompt(true);
        break;
      case 'ok':
        setAuth({id: auth.id, name: auth.name, role: auth.role});
        navigate('/', {replace: true});
        break;
    }
  };

  return (
    <>
      <OtpAuthDialog
        otpAuth={otpAuth}
        onClose={() => {
          setOtpAuth(null);
          setShowMfaPrompt(true);
        }}
      />
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
            <Collapse in={showOtpPrompt}>
              <Typography sx={{mt: 1}}>Enter otp</Typography>
              {showOtpPrompt && (
                <MuiOtpInput
                  title="Mfa code"
                  sx={{my: 1}}
                  length={6}
                  value={otp}
                  autoFocus
                  onChange={newOtp => setOtp(newOtp)}
                  validateChar={(c: string) => /\d/.test(c)}
                  onComplete={fullOtp => handleSubmit(null, fullOtp)}
                />
              )}
            </Collapse>
            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={{mt: 1}}
              disabled={email === '' || password === ''}
            >
              Log in
            </Button>
          </form>
        </Box>
      </Grid>
    </>
  );
};
export default Login;
