// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Grid, Typography } from '@mui/material';

import ExternalAuth from './ExternalAuth';
import LoginForm from './LoginForm';

export default function Login(): JSX.Element {
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant='h2'>
        Log in to Aalto Grades
      </Typography>
      <ExternalAuth />
      <LoginForm />
      <p>{'Don\'t have an account yet?'} <a href={'/Signup'}>Sign up</a></p>
    </Grid>
  );
}
