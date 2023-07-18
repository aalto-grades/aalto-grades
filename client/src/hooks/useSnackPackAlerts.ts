// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Message, State } from '../types';

/*
 * custom hook for using back-to-back alerts
 * - use requires that AlertSnackbar is imported also
 *   (import AlertSnackbar from './alerts/AlertSnackbar')
 */

export interface SnackPackAlertState {
  push: (message: Message) => void,
  pop: () => void,
  messageInfo: Message | null,
  setMessageInfo: Dispatch<SetStateAction<Message | null>>,
  alertOpen: boolean,
  setAlertOpen: Dispatch<SetStateAction<boolean>>
}

export default function useSnackPackAlerts(): SnackPackAlertState {

  // state variables for alert messages
  const [alertOpen, setAlertOpen]: State<boolean> = useState(false);

  const [snackPack, setSnackPack]: State<Array<Message>> =
    useState<Array<Message>>([]);

  const [messageInfo, setMessageInfo]: State<Message | null> =
    useState<Message | null>(null);

  function push(message: Message): void {
    setSnackPack((prev: Array<Message>) => [...prev, message]);
  }

  function pop(): void {
    setSnackPack((prev) => prev.slice(1));
  }

  // useEffect in charge of handling the back-to-back alerts
  // the previous disappears before a new one is shown
  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      pop();
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      setAlertOpen(false);
    }
  }, [snackPack, messageInfo, alertOpen]);

  return {
    push, pop,
    messageInfo, setMessageInfo,
    alertOpen, setAlertOpen
  };
}
