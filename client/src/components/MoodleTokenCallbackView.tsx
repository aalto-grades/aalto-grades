// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, CircularProgress, Typography} from '@mui/material';
import type React from 'react';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const MoodleTokenCallbackView: React.FC = () => {
  const [status, setStatus] = useState<string>('Processing...');
  const navigate = useNavigate();

  useEffect(() => {
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
          setStatus('Token saved successfully!');
        //   setTimeout(() => {
        //     navigate('/');
        //   }, 2000);
        } else {
          setStatus('Token not found in decoded payload.');
        }
      } catch (err) {
        console.error('Failed to process token', err);
        setStatus('Error processing token.');
      }
    } else {
      setStatus('No token found in URL.');
    }
  }, [navigate]);

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
