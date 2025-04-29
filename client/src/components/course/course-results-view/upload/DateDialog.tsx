// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import 'dayjs/locale/en-gb';

import {Clear} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DateCalendar} from '@mui/x-date-pickers/DateCalendar';
import dayjs, {type Dayjs} from 'dayjs';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

type PropsType = {
  open: boolean;
  submit: (date: Dayjs | null) => void;
  close: () => void;
};

const DateDialog = ({open, submit, close}: PropsType): JSX.Element => {
  const {t, i18n} = useTranslation();
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  return (
    <Dialog open={open} onClose={close} maxWidth="sm">
      <DialogTitle>
        {t('course.results.upload.bulk-edit-dialog-title')}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Button
          onClick={() => setDate(null)}
          variant="text"
          startIcon={<Clear />}
        >
          {t('general.clear')}
        </Button>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={i18n.language}
        >
          <DateCalendar value={date} onChange={setDate} />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <DialogActions>
          <Button variant="outlined" onClick={close} sx={{mr: 'auto'}}>
            {t('general.cancel')}
          </Button>
          <Button onClick={() => submit(date)} variant="contained">
            {t('general.done')}
          </Button>
        </DialogActions>
      </DialogActions>
    </Dialog>
  );
};

export default DateDialog;
