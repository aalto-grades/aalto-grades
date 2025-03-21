// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Collapse,
  Grid2 as Grid,
  TextField,
  Typography,
} from '@mui/material';
import {MuiOtpInput} from 'mui-one-time-password-input';
import {type JSX, type SyntheticEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {useLogIn} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import ExternalAuth from './login/ExternalAuth';
import ResetPasswordDialog from './login/ResetPasswordDialog';
import OtpAuthDialog from './shared/auth/OtpAuthDialog';
import ShowPasswordButton from './shared/auth/ShowPasswordButton';

const LoginView = (): JSX.Element => {
  const {t} = useTranslation();
  const {setAuth} = useAuth();
  const navigate = useNavigate();
  const logIn = useLogIn();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showResetPasswordDialog, setShowResetPasswordDialog] =
    useState<boolean>(false);
  const [showMfaDialog, setShowMfaDialog] = useState<boolean>(false);
  const [otpAuth, setOtpAuth] = useState<string | null>(null);
  const [showOtpPrompt, setShowOtpPrompt] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');

  const handleSubmit = async (
    event: SyntheticEvent | null,
    fullOtp: string | null = null,
    newPassword: string | null = null
  ): Promise<void> => {
    if (event) event.preventDefault();
    const auth = await logIn.mutateAsync({
      email,
      password: newPassword ?? password,
      otp: fullOtp ?? (otp !== '' ? otp : null),
    });

    switch (auth.status) {
      case 'resetPassword':
        setShowResetPasswordDialog(true);
        break;
      case 'showMfa':
        setOtpAuth(auth.otpAuth);
        setShowMfaDialog(true);
        break;
      case 'enterMfa':
        setShowOtpPrompt(true);
        break;
      case 'ok':
        setAuth({
          id: auth.id,
          name: auth.name,
          email: auth.email,
          role: auth.role,
        });
        navigate('/');
        break;
    }
  };

  return (
    <>
      <ResetPasswordDialog
        open={showResetPasswordDialog}
        email={email}
        password={password}
        onCancel={() => {
          setShowResetPasswordDialog(false);
          setEmail('');
          setPassword('');
        }}
        onReset={newPassword => {
          setShowResetPasswordDialog(false);
          setPassword(newPassword);
          handleSubmit(null, null, newPassword);
        }}
      />
      <OtpAuthDialog
        open={showMfaDialog}
        otpAuth={otpAuth}
        onCancel={() => {
          setShowMfaDialog(false);
          setOtpAuth(null);
          setEmail('');
          setPassword('');
        }}
        onSubmit={async (fullOtp: string) => {
          await handleSubmit(null, fullOtp);
          return true;
        }}
      />
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{mt: 2}}
      >
        <Typography variant="h2">{t('login.title')}</Typography>
        <ExternalAuth />
        <Box
          sx={{
            width: {xs: '80%', sm: '60%', md: '40%'},
            border: 1,
            borderRadius: '8px',
            borderColor: 'gray',
            p: 2,
          }}
        >
          <Typography variant="h3" sx={{mb: 1}}>
            {t('login.local.title')}
          </Typography>
          <Typography variant="body2" sx={{mb: 1}}>
            {t('login.local.body')}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              type="email"
              value={email}
              name="email"
              label={t('general.email')}
              fullWidth
              onChange={e => setEmail(e.target.value)}
              slotProps={{inputLabel: {shrink: true}}}
              margin="normal"
            />
            <TextField
              type={showPassword ? 'text' : 'password'}
              value={password}
              name="password"
              label={t('general.password')}
              fullWidth
              onChange={e => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <ShowPasswordButton
                      shown={showPassword}
                      onClick={() => setShowPassword(oldShow => !oldShow)}
                    />
                  ),
                },
                inputLabel: {shrink: true},
              }}
              margin="normal"
            />
            <Collapse in={showOtpPrompt}>
              <Typography sx={{mt: 1}}>
                {t('shared.auth.enter-totp')}
              </Typography>
              {showOtpPrompt && (
                <MuiOtpInput
                  data-testid="mfa-input" // For e2e tests
                  title={t('login.local.mfa-code')}
                  sx={{my: 1}}
                  length={6}
                  value={otp}
                  autoFocus
                  onChange={newOtp => setOtp(newOtp)}
                  validateChar={(c: string) => /\d/.test(c)}
                  onComplete={async fullOtp => handleSubmit(null, fullOtp)}
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
              {t('login.local.button')}
            </Button>
          </form>
        </Box>
      </Grid>
    </>
  );
};
export default LoginView;
