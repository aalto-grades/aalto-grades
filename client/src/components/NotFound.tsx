// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography} from '@mui/material';
import {JSX} from 'react';
import {Link} from 'react-router-dom';

const NotFound = (): JSX.Element => {
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
        404 - Not Found
      </Typography>
      <Typography variant="body1" sx={{mb: 5}}>
        The page you’re looking for doesn’t exist.
      </Typography>
      <Link to="/">Go back to main page</Link>
    </Box>
  );
};

export default NotFound;
