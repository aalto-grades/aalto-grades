// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography} from '@mui/material';
import {JSX} from 'react';
import {useTranslation} from 'react-i18next';

const ExternalAuth = (): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Box
      sx={{
        width: 1 / 2,
        border: 1,
        borderRadius: '8px',
        borderColor: 'gray',
        p: 2,
        my: 3,
      }}
    >
      <Typography variant="h3" sx={{mb: 1}}>
        {t('auth.external.title')}
      </Typography>
      <Typography variant="body2" sx={{mb: 1}}>
        {t('auth.external.body')}
      </Typography>
      <Button
        id="ag-sso-login-btn"
        variant="contained"
        type="submit"
        fullWidth
        sx={{mt: 1}}
        href="/v1/auth/login-idp"
      >
        {t('auth.external.button')}
      </Button>
    </Box>
  );
};

export default ExternalAuth;
