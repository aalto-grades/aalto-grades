// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import type {Dayjs} from 'dayjs';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

interface TimelineBulkActionProps {
  selectedCount: number;
  bulkDate: Dayjs | null;
  setBulkDate: (date: Dayjs | null) => void;
  handleBulkUpdate: () => void;
}

const TimelineBulkAction = ({
  selectedCount,
  bulkDate,
  setBulkDate,
  handleBulkUpdate,
}: TimelineBulkActionProps): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'auto',
        minWidth: 600,
        p: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Typography variant="body2" sx={{fontWeight: 500}}>
        {t('course.timeline.selected-count', {count: selectedCount})}
      </Typography>
      <Box sx={{flex: 1}} />
      <Typography variant="body2" color="text.secondary">
        {t('course.timeline.select-multiple-hint')}
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={t('course.timeline.new-expiry-date')}
          value={bulkDate}
          onChange={newValue => setBulkDate(newValue)}
          slotProps={{textField: {size: 'small'}}}
        />
      </LocalizationProvider>

      <Button
        variant="contained"
        onClick={handleBulkUpdate}
        disabled={!bulkDate}
        disableElevation
      >
        {t('course.timeline.update')}
      </Button>
    </Paper>
  );
};

export default TimelineBulkAction;
