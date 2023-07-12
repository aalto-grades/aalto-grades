// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Box, Link, Tooltip } from '@mui/material';

function Footer(): JSX.Element {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.light',
        padding: 2,
        textAlign: 'left',
        marginTop: 'auto'
      }}
    >
      <Link href="/privacy-notice" underline="none" sx={{ mx: 3 }}>
        Privacy Notice
      </Link>
      <Link href="/accessibility-statement" underline="none" sx={{ mr: 3 }}>
        Accessibility Statement
      </Link>
      <Link href="/support" underline="none" sx={{ mr: 3 }}>
        Support
      </Link>
      <Tooltip title="Feedback form opens in a new tab">
        <Link
          href="https://link.webropolsurveys.com"
          rel="noreferrer"
          target='_blank'
          underline="none"
        >
          Feedback
        </Link>
      </Tooltip>
    </Box>
  );
}

export default Footer;
