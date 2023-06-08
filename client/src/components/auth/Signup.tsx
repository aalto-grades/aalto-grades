// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import SignupForm from './SignupForm';
import userService from '../../services/user';
import useAuth from '../../hooks/useAuth';
import { SystemRole } from 'aalto-grades-common/types/general';

const Signup = () => {

  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = useState<any>('');

  const addUser = async (userObject) => {
    try {
      const user = await userService.signup(userObject);
      // if signup successfull, save user role to context
      setAuth({
        id: user.data.id,
        role: user.data.role,
        name: user.data.name
      });

      console.log(`${user.data.role}`);
      if (user.data.role === SystemRole.Admin) {
        navigate('/course-view', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (exception) {
      console.log(exception);
      setErrorMessage('Error: signup failed');
    }
  };

  return (
    <div>
      <h1>Sign up</h1>
      <p style={{ color: `${theme.palette.primary.dark}` }}>{errorMessage}</p>
      <SignupForm addUser={addUser} />
    </div>
  );
};

export default Signup;
