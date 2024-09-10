// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {SnackbarOrigin} from '@mui/material';
import {SnackbarProvider} from 'notistack';
import type {JSX} from 'react';

const MAX_SNACK = 1;
const AUTO_HIDE_DURATION = 3000;
const POSITION: SnackbarOrigin = {vertical: 'top', horizontal: 'center'};

const NotistackWrapper = (): JSX.Element => (
  <SnackbarProvider
    maxSnack={MAX_SNACK}
    autoHideDuration={AUTO_HIDE_DURATION}
    anchorOrigin={POSITION}
  />
);

export default NotistackWrapper;
