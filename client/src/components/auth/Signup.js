// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import userService from '../../services/user';
import { useNavigate } from 'react-router-dom';
import SignupForm from './SignupForm';

const Signup = () => {
  
  const navigate = useNavigate();

  const addUser = async (userObject) => {
    try {
      const user = await userService.signup(userObject);
      console.log(user);
      window.localStorage.setItem(
        'loggedUser', JSON.stringify(user)
      );
      navigate('/', { replace: true });
    } catch (exception) {
      console.log('Error: signup failed');
    }
  };

  return (
    <div>
      <h1>Sign up</h1>
      <SignupForm addUser={addUser} />
    </div>
  );
};

export default Signup;