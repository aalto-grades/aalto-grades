// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import LoginForm from './LoginForm';
import userService from '../../services/user';
import useAuth from '../../hooks/useAuth';

const Login = () => {

  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<any>('');
  const theme = useTheme();

  const loginUser = async (userObject) => {
    try {
      const response = await userService.login(userObject);
      // if login is successful, save user role to context
      setAuth({
        id: response.data.id,
        role: response.data.role,
        name: response.data.name
      });
      navigate('/', { replace: true });
    } catch (exception) {
      console.log(exception);
      setErrorMessage('Invalid email or password');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <p>{'Don\'t have an account yet?'} <a href={'/Signup'}>Sign up</a></p>
      <p style={{ color: `${theme.palette.primary.dark}` }}>{errorMessage}</p>
      <LoginForm loginUser={loginUser}/>
    </div>
  );
};

export default Login;
