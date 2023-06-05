// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';

/* custom hook for using back-to-back alerts
  - use requires that AlertSnackbar is imported also (import AlertSnackbar from './alerts/AlertSnackbar')

In component:
  const [setSnackPack, messageInfo, setMessageInfo, alertOpen, setAlertOpen] = useSnackPackAlerts();

To display an alert:
  setSnackPack((prev) => [...prev, errorMsgInstance]);

In render:
  <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
*/ 

const useSnackPackAlerts = () => {

  // state variables for alert messages
  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);  // format is { msg: 'Message here', severity: 'info/success/error' }

  // useEffect in charge of handling the back-to-back alerts
  // the previous disappears before a new one is shown
  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      setAlertOpen(false);
    }
  }, [snackPack, messageInfo, alertOpen]);

  return [setSnackPack, messageInfo, setMessageInfo, alertOpen, setAlertOpen];
};

export default useSnackPackAlerts;