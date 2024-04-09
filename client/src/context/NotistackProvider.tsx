// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {SnackbarOrigin} from '@mui/material';
import {SnackbarProvider} from 'notistack';

const MAX_SNACK = 1;
const AUTO_HIDE_DURATION = 3000;
const POSITION: SnackbarOrigin = {
  vertical: 'top',
  horizontal: 'center',
};

export default function NotistackWrapper() {
  return (
    <SnackbarProvider
      maxSnack={MAX_SNACK}
      autoHideDuration={AUTO_HIDE_DURATION}
      anchorOrigin={POSITION}
    />
  );
}
