// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Box, Link, Tooltip } from '@mui/material';

export default function Footer(): JSX.Element {
  return (
    <Box
      component='footer'
      sx={{
        backgroundColor: 'primary.light',
        padding: 2,
        textAlign: 'left',
        marginTop: 'auto'
      }}
    >
      <Link href='/privacy-notice' underline='none' sx={{ mx: 3 }}>
        Privacy Notice
      </Link>
      <Link href='/accessibility-statement' underline='none' sx={{ mr: 3 }}>
        Accessibility Statement
      </Link>
      <Link href='/support' underline='none' sx={{ mr: 3 }}>
        Support
      </Link>
      <Link href='/javascript.html' underline='none' sx={{ mr: 3 }}>
        JavaScript Licenses
      </Link>
      <Tooltip title='Source code opens in a new tab'>
        <Link
          /*
           * TODO: Linking the repository directly is helpful, but not enough
           * because the code in the main branch may not be the corresponding
           * source to the actual software being ran.
           *
           * Include a direct download button or link a release tag?
           */
          href='https://github.com/aalto-grades/base-repository'
          rel='noreferrer'
          target='_blank'
          underline='none'
          sx={{ mr: 3 }}
        >
          Source Code
        </Link>
      </Tooltip>
      <Tooltip title='Feedback form opens in a new tab'>
        <Link
          href='https://link.webropolsurveys.com'
          rel='noreferrer'
          target='_blank'
          underline='none'
        >
          Feedback
        </Link>
      </Tooltip>
    </Box>
  );
}
