// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Card, CardContent, Typography} from '@mui/material';
import type {JSX} from 'react';

export interface StatCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon?: JSX.Element;
}

const StatCard = ({
  title,
  value,
  subtext,
  icon,
}: StatCardProps): JSX.Element => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      bgcolor: 'background.paper',
      borderRadius: 4,
      border: '1px solid',
      borderColor: 'divider',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      },
    }}
  >
    <CardContent>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
        <Typography variant="subtitle2" color="textSecondary" fontWeight="600">
          {title}
        </Typography>
        {icon && <Box sx={{color: 'primary.main', opacity: 0.8}}>{icon}</Box>}
      </Box>
      <Typography variant="h3" component="div" fontWeight="700" sx={{mb: 1}}>
        {value}
      </Typography>
      {subtext && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            bgcolor: 'action.hover',
            py: 0.5,
            px: 1,
            borderRadius: 2,
            display: 'inline-block',
            fontWeight: 500,
          }}
        >
          {subtext}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
