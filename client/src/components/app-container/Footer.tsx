// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import LaunchIcon from '@mui/icons-material/Launch';
import {Box, Link, Typography} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {Link as RouterLink} from 'react-router-dom';

const Footer = (): JSX.Element => {
  const {t} = useTranslation();

  return (
    <div style={{gridArea: 'footer'}}>
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
        <Link
          href={`https://github.com/aalto-grades/aalto-grades/tree/v${AALTO_GRADES_VERSION}`}
          target="_blank"
          rel="noreferrer"
          style={{display: 'inline-flex', alignItems: 'center', gap: '2px'}}
        >
          {t('app.footer.source-text')}
          <LaunchIcon fontSize="small" />
        </Link>
        <Link
          href="https://link.webropolsurveys.com/S/E358C6E5E7690C72"
          target="_blank"
          rel="noreferrer"
          style={{display: 'inline-flex', alignItems: 'center', gap: '2px'}}
        >
          {t('app.footer.feedback-text')}
          <LaunchIcon fontSize="small" />
        </Link>
        <Typography sx={{color: 'text.secondary'}}>
          Ossi v{AALTO_GRADES_VERSION}
        </Typography>
      </Box>
    </div>
  );
};

export default Footer;
