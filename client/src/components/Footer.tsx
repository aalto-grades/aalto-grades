// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Link, Tooltip, Typography} from '@mui/material';
import {JSX} from 'react';

const Footer = (): JSX.Element => {
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
      <Link href="/privacy-notice" underline="none" sx={{mx: 3}}>
        Privacy notice
      </Link>
      <Link href="/accessibility-statement" underline="none" sx={{mr: 3}}>
        Accessibility statement
      </Link>
      <Link href="/support" underline="none" sx={{mr: 3}}>
        Support
      </Link>
      <Link href="/javascript.html" underline="none" sx={{mr: 3}}>
        JavaScript licenses
      </Link>
      <Tooltip title="Source code opens in a new tab">
        <Link
          // TODO: Once we have releases and employ a versioning scheme, link the version tag
          // href={`https://github.com/aalto-grades/aalto-grades/tree/${AALTO_GRADES_VERSION}`}
          href="https://github.com/aalto-grades/aalto-grades"
          rel="noreferrer"
          target="_blank"
          underline="none"
          sx={{mr: 3}}
        >
          Source code
        </Link>
      </Tooltip>
      <Tooltip title="Feedback form opens in a new tab">
        <Link
          href="https://link.webropolsurveys.com/S/E358C6E5E7690C72"
          rel="noreferrer"
          target="_blank"
          underline="none"
          sx={{mr: 3}}
        >
          Feedback
        </Link>
      </Tooltip>
      <Typography>Aalto Grades {AALTO_GRADES_VERSION}</Typography>
    </Box>
  );
};

export default Footer;
