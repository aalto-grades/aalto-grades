// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { State } from '../../types';
import { LoginCredentials, } from '../../types/auth';

function LoginForm(props: {
  loginUser: (userObject: LoginCredentials) => Promise<void>
}) {

  const [email, setEmail]: State<string> = useState('');
  const [password, setPassword]: State<string> = useState('');

  function handleSubmit(event: React.SyntheticEvent): void {
    event.preventDefault();
    try {
      const userObject: LoginCredentials = {
        email,
        password,
      };
      props.loginUser(userObject);
    } catch (exception) {
      console.log(exception);
    }
  }

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
}

LoginForm.propTypes = {
  loginUser: PropTypes.func
};

export default LoginForm;
