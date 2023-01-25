// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState }  from 'react';
import userService from '../../services/user';
import { useNavigate } from 'react-router-dom';
import SignupForm from './SignupForm';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '@mui/material/styles';

const Signup = () => {
  
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = useState('');

  const addUser = async (userObject) => {
    try {
      const user = await userService.signup(userObject);

      // if signup successfull, save user role to context
      setAuth({ role: user.role });

      navigate('/', { replace: true });
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