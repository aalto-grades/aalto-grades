// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, {useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import userService from '../../services/user';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledText = styled.p` 
    color: red;
`;

const Login= () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await userService.login({
        username, password,
      });
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
      <form onSubmit={handleLogin}>
        <div>
          <TextField
            type='username'
            value={username}
            name='Username'
            label='Username'
            onChange={({ target }) => setUsername(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
        </div>
        <div>
          <TextField
            type='password'
            value={password}
            name='Password'
            label='Password'
            onChange={({ target }) => setPassword(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
        </div>
        <Button type='submit'>login</Button>
      </form>
    </div>
  );
};

export default Login;