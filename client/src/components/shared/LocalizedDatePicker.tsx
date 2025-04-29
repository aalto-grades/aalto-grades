// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import 'dayjs/locale/en';
import 'dayjs/locale/fi';
import 'dayjs/locale/sv';

import {
  DatePicker,
  type DatePickerProps,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

// Load correct translations to the x-date-pickers.
// ref. https://mui.com/x/react-date-pickers/adapters-locale/
const LocalizedDatePicker = (props: DatePickerProps): JSX.Element => {
  const {i18n} = useTranslation();
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={i18n.language}
      dateFormats={{
        month: 'MMM',
        fullDate: 'DD MMM YYYY',
        year: 'YYYY',
        normalDate: 'DD.MM.YYYY',
      }}
    >
      <DatePicker {...props} format="DD.MM.YYYY" />
    </LocalizationProvider>
  );
};

export default LocalizedDatePicker;
