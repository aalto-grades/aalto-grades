// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import MuiAlert from '@mui/material/Alert';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='standard' {...props} />;
});

// TODO: Consider if the key attribute works properly of if something else should be used?
const AlertSnackbar = ({ messageInfo, setMessageInfo, open, setOpen }) => {

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  return (
    <div>
      <ThemeProvider theme={darkTheme}>
        <Snackbar
          key={messageInfo?.msg}
          open={open}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={handleClose}
          TransitionComponent={Slide}
          TransitionProps={{ onExited: handleExited }}
        >
          <Alert onClose={handleClose} severity={messageInfo?.severity} sx={{ width: '100%' }}>
            {messageInfo?.msg}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </div>
  );
};

AlertSnackbar.propTypes = {
  messageInfo: PropTypes.object,
  setMessageInfo: PropTypes.func,
  open: PropTypes.bool,
  setOpen: PropTypes.func
};

export default AlertSnackbar;