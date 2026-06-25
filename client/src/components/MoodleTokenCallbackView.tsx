// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, CircularProgress, Typography} from '@mui/material';
import type React from 'react';

const MoodleTokenCallbackView: React.FC = () => {
  let status = 'Processing...';

  const params = new URLSearchParams(window.location.search);
  const rawData = params.get('token') || params.get('data');

  if (rawData) {
    try {
      // If the data is a nested protocol URL like web://ossidev://token=...
      let base64Payload = rawData;
      if (rawData.includes('token=')) {
        base64Payload = rawData.split('token=')[1]?.split('&')[0] || '';
      }

      // Decode the base64 payload
      const decoded = atob(base64Payload);
      // The script expects PRIVATE_KEY:::TOKEN
      const parts = decoded.split(':::');
      const token = parts[1];

      if (token) {
        localStorage.setItem('mycourses', token);
        status = 'Token saved successfully! You can close this tab.';
        //   setTimeout(() => {
        //     navigate('/');
        //   }, 2000);
      } else {
        status = 'Token not found in decoded payload.';
      }
    } catch (err) {
      console.error('Failed to process token', err);
      status = 'Error processing token.';
    }
  } else {
    status = 'No token found in URL.';
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
      <CircularProgress size={4} />
      <Typography variant="h6" sx={{mt: 2}}>
        {status}
      </Typography>
    </Box>
  );
};

export default MoodleTokenCallbackView;
