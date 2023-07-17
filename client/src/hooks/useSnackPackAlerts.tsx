// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Message, State } from '../types';

/*
 * custom hook for using back-to-back alerts
 * - use requires that AlertSnackbar is imported also
 *   (import AlertSnackbar from './alerts/AlertSnackbar')
 *
 * In component:
 *   const [
 *     setSnackPack, messageInfo, setMessageInfo, alertOpen, setAlertOpen
 *   ] = useSnackPackAlerts();
 *
 * To display an alert:
 *   setSnackPack((prev) => [...prev, errorMsgInstance]);
 *
 * In render:
 *   <AlertSnackbar
 *     messageInfo={messageInfo}
 *     setMessageInfo={setMessageInfo}
 *     open={alertOpen}
 *     setOpen={setAlertOpen}
 *   />
 */

export type SnackPackAlertState = [
  Dispatch<SetStateAction<Array<Message>>>,
  Message | null,
  Dispatch<SetStateAction<Message | null>>,
  boolean,
  Dispatch<SetStateAction<boolean>>
];

function useSnackPackAlerts(): SnackPackAlertState {

  // state variables for alert messages
  const [alertOpen, setAlertOpen]: State<boolean> = useState(false);

  const [snackPack, setSnackPack]: State<Array<Message>> =
    useState<Array<Message>>([]);

  const [messageInfo, setMessageInfo]: State<Message | null> =
    useState<Message | null>(null);

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
}

export default useSnackPackAlerts;
