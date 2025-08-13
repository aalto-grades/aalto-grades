// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Link, Typography} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {Link as RouterLink} from 'react-router-dom';

import ExternalLink from '@/components/shared/ExternalLink';

const Footer = (): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: 2,
        gap: 3,
        textAlign: 'center',
        marginTop: 'auto',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <Link component={RouterLink} to="/privacy-notice">
        {t('app.footer.privacy')}
      </Link>
      <Link component={RouterLink} to="/accessibility-statement">
        {t('app.footer.accessibility')}
      </Link>
      <Link component={RouterLink} to="/support">
        {t('app.footer.support')}
      </Link>
      <Link component={RouterLink} to="/licenses">
        {t('app.footer.licenses')}
      </Link>
      <ExternalLink
        href={`https://github.com/aalto-grades/aalto-grades/tree/v${AALTO_GRADES_VERSION}`}
      >
        {t('app.footer.source-text')}
      </ExternalLink>
      <ExternalLink href="https://link.webropolsurveys.com/S/E358C6E5E7690C72">
        {t('app.footer.feedback-text')}
      </ExternalLink>
      <Typography sx={{color: 'text.secondary'}}>
        {'Ossi v' + AALTO_GRADES_VERSION}
      </Typography>
    </Box>
  );
};

export default Footer;
