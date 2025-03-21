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
import type {Dayjs} from 'dayjs';
import type {JSX} from 'react';

// Load correct translations to the x-date-pickers.
// ref. https://mui.com/x/react-date-pickers/adapters-locale/
const LocalizedDatePicker = (props: DatePickerProps<Dayjs>): JSX.Element => (
  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
    <DatePicker {...props} />
  </LocalizationProvider>
);

export default LocalizedDatePicker;
