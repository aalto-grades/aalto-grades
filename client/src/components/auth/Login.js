// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, {useState} from 'react';
import userService from '../../services/user';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LoginForm from './LoginForm';

const StyledText = styled.p` 
    color: red;
`;

const Login= () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const addUser = async (userObject) => {
    try {
      const user = await userService.login(userObject);
      console.log(user);
      window.localStorage.setItem(
        'loggedUser', JSON.stringify(user)
      );
      navigate('/', {replace: true});
    } catch (exception) {
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <p>{'Don\'t have an account yet?'} <a href={'/Signup'}>Sign up</a></p>
      <StyledText>{errorMessage}</StyledText>
      <LoginForm addUser={addUser}/>
    </div>
  );
};

export default Login;