// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography} from '@mui/material';
import {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';

const NotFound = (): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" sx={{my: 4}}>
        {t('not-found.title')}
      </Typography>
      <Typography variant="body1" sx={{mb: 5}}>
        {t('not-found.body')}
      </Typography>
      <Link to="/">{t('not-found.back')}</Link>
    </Box>
  );
};

export default NotFound;
