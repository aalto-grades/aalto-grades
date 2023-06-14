// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import LoginForm from './LoginForm';
import userService from '../../services/user';
import useAuth from '../../hooks/useAuth';
import { SystemRole } from 'aalto-grades-common/types/auth';
import { LoginCredentials } from '../../types/auth';

const Login = (): JSX.Element => {

  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const theme = useTheme();

  async function loginUser(userObject: LoginCredentials): Promise<void> {
    try {
      const response = await userService.login(userObject);
      // if login is successful, save user role to context
      setAuth({
        id: response.data!.id,
        role: response.data!.role,
        name: response.data!.name
      });

      console.log(`${response.data!.role}`);
      if (response.data!.role === SystemRole.Admin) {
        navigate('/course-view', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (exception) {
      console.log(exception);
      setErrorMessage('Invalid email or password');
    }
  }

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
