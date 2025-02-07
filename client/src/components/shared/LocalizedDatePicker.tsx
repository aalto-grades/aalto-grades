// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import 'dayjs/locale/en';
import 'dayjs/locale/fi';
import 'dayjs/locale/sv';

import {DatePicker, LocalizationProvider, DatePickerProps} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import {type JSX} from 'react';
import { useTranslation } from 'react-i18next';

// Load correct translations to the x-date-pickers.
// ref. https://mui.com/x/react-date-pickers/adapters-locale/
const LocalizedDatePicker = (props: DatePickerProps<Dayjs> ): JSX.Element => {
  const {i18n} = useTranslation();

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={i18n.language}
    >
      <DatePicker {...props} />
    </LocalizationProvider>
  );
};

export default LocalizedDatePicker;
