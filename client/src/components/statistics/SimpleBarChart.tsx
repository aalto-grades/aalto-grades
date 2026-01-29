// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Tooltip, Typography} from '@mui/material';
import type {JSX} from 'react';

type SimpleBarChartProps = {
  data: {label: string; value: number}[];
};

const SimpleBarChart = ({data}: SimpleBarChartProps): JSX.Element => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        height: '100%',
        gap: 0.5,
        mt: 2,
        position: 'relative',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {data.map(d => (
        <Tooltip key={d.label} title={`${d.label}: ${d.value}`} arrow>
          <Box
            sx={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
              cursor: 'pointer',
              '&:hover .bar': {
                opacity: 0.8,
                transform: 'scaleY(1.05)',
              },
            }}
          >
            <Box
              className="bar"
              sx={{
                width: '100%',
                bgcolor: '#556cd6', // Match main stats view
                height: `${(d.value / maxValue) * 100}%`,
                borderRadius: '8px 8px 0 0', // More rounded
                minHeight: 6,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transformOrigin: 'bottom',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="bold"
              sx={{
                position: 'absolute',
                bottom: -22,
                fontSize: '0.7rem',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {d.label}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default SimpleBarChart;
