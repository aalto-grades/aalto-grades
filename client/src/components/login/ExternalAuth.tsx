// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

const ExternalAuth = (): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Box
      sx={{
        width: {xs: '80%', sm: '60%', md: '40%'},
        border: 1,
        borderRadius: '8px',
        borderColor: 'gray',
        p: 2,
        my: 3,
      }}
    >
      <Typography variant="h3" sx={{mb: 1}}>
        {t('login.external.title')}
      </Typography>
      <Typography variant="body2" sx={{mb: 1}}>
        {t('login.external.body')}
      </Typography>
      <Button
        variant="contained"
        type="submit"
        fullWidth
        sx={{mt: 1}}
        href="/api/v1/auth/login-idp"
      >
        {t('login.external.button')}
      </Button>
    </Box>
  );
};

export default ExternalAuth;
