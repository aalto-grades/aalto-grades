// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Chip, List} from '@mui/material';
import type {ReactNode} from 'react';

type EntriesProps = {
  label: string;
  color?: 'success' | 'warning' | 'default';
  children: ReactNode;
  alignItems?: 'start' | 'center' | 'end';
  chipWidth?: string | number;
  listWidth?: string | number;
};

const ListEntries = ({
  label,
  color = 'default',
  children,
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
      <Chip label={label} color={color} sx={{width: chipWidth}} />
      <List sx={{width: listWidth}} disablePadding>
        {children}
      </List>
    </Box>
  );
};

export default ListEntries;
