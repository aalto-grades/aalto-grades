// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Grid, Typography } from '@mui/material';
import LoginForm from './LoginForm';
import ExternalAuth from './ExternalAuth';

function Login(): JSX.Element {
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

export default Login;
