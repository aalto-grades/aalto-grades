// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Box, Button, Typography } from '@mui/material';
import React, { JSX } from 'react';

export default function ExternalAuth(): JSX.Element {

  function handleSubmit(event: React.SyntheticEvent): void {
    event.preventDefault();
    alert('functionality not implemented');
  }

  return (
    <Box sx={{ width: 1 / 2, border: 1, borderRadius: '8px', borderColor: 'gray', p: 2, my: 3 }}>
      <Typography variant='h3' sx={{ mb: 1 }}>
        Aalto University users
      </Typography>
      <Typography variant='body2' sx={{ mb: 1 }}>
        Log in with your Aalto University user account by clicking on the button below.
      </Typography>
      <Button
        id='ag_sso_login_btn'
        variant='contained'
        type='submit'
        fullWidth
        sx={{ mt: 1 }}
        onClick={handleSubmit}
      >
        Log in with Aalto account
      </Button>
    </Box>
  );
}
