// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Chip, Typography} from '@mui/material';
import type {JSX} from 'react';

interface DetailItemProps {
  label: string;
  value: string | number;
  warning?: boolean;
  subValue?: string;
}

const DetailItem = ({
  label,
  value,
  warning,
  subValue,
}: DetailItemProps): JSX.Element => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      fontWeight={500}
      sx={{pt: 0.5}}
    >
      {label}
    </Typography>
    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
      <Box sx={{textAlign: 'right'}}>
        <Typography
          variant="body1"
          fontWeight={600}
          color={warning ? 'warning.main' : 'text.primary'}
          sx={{lineHeight: 1.5}}
        >
          {value}
        </Typography>
        {subValue && (
          <Typography variant="caption" color="text.secondary" display="block">
            {subValue}
          </Typography>
        )}
      </Box>
      {warning && (
        <Chip
          label="!"
          size="small"
          color="warning"
          sx={{
            minWidth: 20,
            height: 20,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            mt: 0.5,
          }}
        />
      )}
    </Box>
  </Box>
);

export default DetailItem;
