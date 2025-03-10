// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Chip, List} from '@mui/material';
import type {ReactNode} from 'react';

type EntriesProps = {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  alignItems?: 'start' | 'center' | 'end';
  chipWidth?: string | number;
  listWidth?: string | number;
};

const ListEntries = ({
  label,
  icon,
  children,
  color = 'default',
  alignItems = 'start',
  chipWidth = 'auto',
  listWidth = 400,
}: EntriesProps): JSX.Element => {
  return (
    <Box
      sx={{
        backgroundColor: 'primary.light',
        p: 1,
        borderRadius: '5px',
        display: 'flex',
        gap: 2,
        flexDirection: 'column',
        alignItems: alignItems,
      }}
    >
      <Chip
        label={
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            {icon}
            {label}
          </Box>
        }
        color={color}
        sx={{
          width: chipWidth,
        }}
      />
      <List sx={{width: listWidth}} disablePadding>
        {children}
      </List>
    </Box>
  );
};

export default ListEntries;
