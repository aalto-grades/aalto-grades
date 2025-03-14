// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import CloseIcon from '@mui/icons-material/Close';
import {IconButton, type SnackbarOrigin} from '@mui/material';
import {SnackbarProvider, closeSnackbar} from 'notistack';
import type {JSX} from 'react';

const MAX_SNACK = 1;
const AUTO_HIDE_DURATION = 3000;
const POSITION: SnackbarOrigin = {vertical: 'top', horizontal: 'center'};

const NotistackWrapper = (): JSX.Element => {
  return (
    <SnackbarProvider
      maxSnack={MAX_SNACK}
      autoHideDuration={AUTO_HIDE_DURATION}
      anchorOrigin={POSITION}
      preventDuplicate
      action={key => (
        <IconButton onClick={() => closeSnackbar(key)}>
          <CloseIcon />
        </IconButton>
      )}
    />
  );
};

export default NotistackWrapper;
