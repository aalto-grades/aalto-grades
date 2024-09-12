// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Link, Tooltip, Typography} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {Link as RouterLink} from 'react-router-dom';

const Footer = (): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.light',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        textAlign: 'left',
        marginTop: 'auto',
      }}
    >
      <Link
        component={RouterLink}
        to="/privacy-notice"
        underline="none"
        sx={{mx: 3}}
      >
        {t('app.footer.privacy')}
      </Link>
      <Link
        component={RouterLink}
        to="/accessibility-statement"
        underline="none"
        sx={{mr: 3}}
      >
        {t('app.footer.accessibility')}
      </Link>
      <Link component={RouterLink} to="/support" underline="none" sx={{mr: 3}}>
        {t('app.footer.support')}
      </Link>
      <Link component={RouterLink} to="/licenses" underline="none" sx={{mr: 3}}>
        {t('app.footer.licenses')}
      </Link>
      <Tooltip title={t('app.footer.source.tooltip')}>
        <Link
          // TODO: Once we have releases and employ a versioning scheme, link the version tag
          // to={`https://github.com/aalto-grades/aalto-grades/tree/${AALTO_GRADES_VERSION}`}
          href="https://github.com/aalto-grades/aalto-grades"
          target="_blank"
          rel="noreferrer"
          underline="none"
          sx={{mr: 3}}
        >
          {t('app.footer.source.text')}
        </Link>
      </Tooltip>
      <Tooltip title={t('app.footer.feedback.tooltip')}>
        <Link
          href="https://link.webropolsurveys.com/S/E358C6E5E7690C72"
          target="_blank"
          rel="noreferrer"
          underline="none"
          sx={{mr: 3}}
        >
          {t('app.footer.feedback.text')}
        </Link>
      </Tooltip>
      <Typography>Aalto Grades {AALTO_GRADES_VERSION}</Typography>
    </Box>
  );
};

export default Footer;
