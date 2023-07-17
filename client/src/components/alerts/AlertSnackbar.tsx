// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Alert as MuiAlert, Slide, Snackbar, Theme, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React, { SyntheticEvent } from 'react';

import { Message } from '../../types';

const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Alert: any = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref as any} variant='standard' {...props} />;
});

// TODO: Consider if the key attribute works properly of if something else should be used?
// position allows "stacked look", starts from 1 but really needed only from 2 onwards
export default function AlertSnackbar({ messageInfo, setMessageInfo, open, setOpen, position }: {
  messageInfo: Message | null,
  setMessageInfo: (messageInfo: Message | null) => void,
  open: boolean,
  setOpen: (open: boolean) => void,
  position?: number
}): JSX.Element {

  const margin: number = position ? (position - 1) * 7 : 0;

  function handleClose(event: Event | SyntheticEvent, reason: string): void {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  function handleExited(): void {
    setMessageInfo(null);
  }

  return (
    <div>
      <ThemeProvider theme={darkTheme}>
        <Snackbar
          key={messageInfo?.msg && !Array.isArray(messageInfo?.msg) ?
            messageInfo?.msg : messageInfo?.msg[0]}
          open={open}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={handleClose}
          TransitionComponent={Slide}
          TransitionProps={{ onExited: handleExited }}
          sx={{ mt: margin, maxWidth: '45vw', textAlign: 'left' }}
        >
          <Alert
            onClose={handleClose}
            severity={messageInfo?.severity ?? 'info'}
            sx={{ width: '100%' }}
          >
            {(messageInfo?.msg && !Array.isArray(messageInfo?.msg)) ?
              <>
                {messageInfo?.severity === 'error' &&
                <Typography variant='h5'>Error occurred:</Typography>}
                {messageInfo?.msg}
              </> :
              <>
                {messageInfo?.severity === 'error' &&
                <Typography variant='h5'>{messageInfo?.msg.length === 1 ?
                  'Error occurred:' :
                  'Multiple errors occurred:'}
                </Typography>}
                <ul>
                  {Array.isArray(messageInfo?.msg) && messageInfo?.msg.map((msg: string) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              </>
            }
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </div>
  );
}

AlertSnackbar.propTypes = {
  messageInfo: PropTypes.object,
  setMessageInfo: PropTypes.func,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  position: PropTypes.number
};
