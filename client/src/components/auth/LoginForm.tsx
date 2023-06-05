// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const LoginForm = ({ loginUser }) => {

  const [email, setEmail] = useState<any>(''); 
  const [password, setPassword] = useState<any>('');

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const userObject = ({
        email,
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
            type='email'
            value={email}
            name='email'
            label='Email'
            onChange={({ target }) => setEmail(target.value)}
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
        <Button id='ag_login_btn' type='submit'>login</Button>
      </form>
    </>
  );
};

LoginForm.propTypes = {
  loginUser: PropTypes.func
};

export default LoginForm;