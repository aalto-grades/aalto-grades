// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Alert as MuiAlert, Slide, Snackbar, Theme, Typography } from '@mui/material';
import { AlertProps } from '@mui/material/Alert';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {
  ForwardedRef, forwardRef, ForwardRefExoticComponent, RefAttributes, SyntheticEvent
} from 'react';

import { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';

const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Alert: ForwardRefExoticComponent<
  Omit<AlertProps, 'ref'> & RefAttributes<HTMLDivElement>
> = forwardRef(
  function Alert(props: AlertProps, ref: ForwardedRef<HTMLDivElement>) {
    return (
      <MuiAlert
        elevation={6}
        ref={ref}
        variant='standard'
        {...props}
      />
    );
  }
);

// TODO: Consider if the key attribute works properly of if something else should be used?
// position allows "stacked look", starts from 1 but really needed only from 2 onwards
export default function AlertSnackbar(props: {
  snackPack: SnackPackAlertState,
  position?: number
}): JSX.Element {

  const margin: number = props.position ? (props.position - 1) * 7 : 0;

  const {
    messageInfo, setMessageInfo,
    alertOpen, setAlertOpen
  }: SnackPackAlertState = props.snackPack;

  function handleClose(event: Event | SyntheticEvent, reason?: string): void {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  }

  return (
    <div>
      <ThemeProvider theme={darkTheme}>
        <Snackbar
          key={
            (messageInfo?.msg && !Array.isArray(messageInfo?.msg))
              ? messageInfo?.msg
              : messageInfo?.msg[0]
          }
          open={alertOpen}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={handleClose}
          TransitionComponent={Slide}
          TransitionProps={{ onExited: () => setMessageInfo(null) }}
          sx={{ mt: margin, maxWidth: '45vw', textAlign: 'left' }}
        >
          <Alert
            onClose={handleClose}
            severity={messageInfo?.severity ?? 'info'}
            sx={{ width: '100%' }}
          >
            {(messageInfo?.msg && !Array.isArray(messageInfo?.msg)) ? (
              <>
                {messageInfo?.severity === 'error' &&
                  <Typography variant='h5'>Error occurred:</Typography>}
                {messageInfo?.msg}
              </>
            ) : (
              <>
                {(messageInfo?.severity === 'error') && (
                  <Typography variant='h5'>{messageInfo?.msg.length === 1 ?
                    'Error occurred:' :
                    'Multiple errors occurred:'}
                  </Typography>
                )}
                <ul>
                  {Array.isArray(messageInfo?.msg) && messageInfo?.msg.map((msg: string) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              </>
            )}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </div>
  );
}

AlertSnackbar.propTypes = {
  snackPack: PropTypes.object,
  position: PropTypes.number
};
