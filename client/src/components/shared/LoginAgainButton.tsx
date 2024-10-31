// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Button} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

const LoginAgainButton = (): JSX.Element => {
  const {t} = useTranslation();
  const openLoginWindow = (): void => {
    const loginWindow = window.open(
      '/login',
      '_blank',
      'height=720, width=1024'
    );
    if (loginWindow) {
      loginWindow.onload = () => {
        setInterval(() => {
          if (loginWindow.location.pathname === '/') {
            loginWindow.close();
          }
        }, 500);
      };
    }
  };
  return (
    <Button
      variant="outlined"
      onClick={openLoginWindow}
      style={{color: 'white', borderColor: 'white'}}
    >
      {t('login.login-again')}
    </Button>
  );
};

export default LoginAgainButton;
