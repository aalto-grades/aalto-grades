// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import userService from '../../services/user';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import { useTheme } from '@mui/material/styles';
import useAuth from '../../hooks/useAuth';

const Login = () => {

  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();

  const addUser = async (userObject) => {
    try {
      const response = await userService.login(userObject);

      console.log(response);

      setAuth({ userId: response.id, role: response.role });

      navigate('/', { replace: true });

    } catch (exception) {
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <p>{'Don\'t have an account yet?'} <a href={'/Signup'}>Sign up</a></p>
      <p style={{ color: `${theme.palette.primary.dark}` }}>{errorMessage}</p>
      <LoginForm addUser={addUser}/>
    </div>
  );
};

export default Login;