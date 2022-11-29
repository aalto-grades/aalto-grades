// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, {useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import userService from '../services/user';

const Login= () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await userService.login({
        username, password,
      });
      console.log(user);
      setUsername('');
      setPassword('');
    } catch (exception) {
      console.log('Error: wrong credentials');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <p>{'Don\'t have an account yet?'} <a href={'/Signup'}>Sign up</a></p>
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