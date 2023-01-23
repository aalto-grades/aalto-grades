// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const LoginForm = ({ loginUser }) => {

  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const userObject = ({
        username,
        password,
      });
      loginUser(userObject);
    } catch (exception) {
      console.log(exception);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <TextField
            type='text'
            value={username}
            name='username'
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
            name='password'
            label='Password'
            onChange={({ target }) => setPassword(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
        </div>
        <Button type='submit'>login</Button>
      </form>
    </>
  );
};

LoginForm.propTypes = {
  loginUser: PropTypes.func
};

export default LoginForm;