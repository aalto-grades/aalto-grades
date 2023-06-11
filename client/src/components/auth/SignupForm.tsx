// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid';
import { SystemRole } from 'aalto-grades-common/types/general';

const SignupForm = ({ addUser }) => {

  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [studentNumber, setStudentNumber] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<SystemRole>(SystemRole.User);

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const userObject = ({
        name,
        password,
        email,
        role,
        studentNumber
      });
      addUser(userObject);
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
            value={name}
            name='name'
            label='Name'
            onChange={({ target }) => setName(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
        </div>
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
            type='text'
            value={studentNumber}
            name='StudentNumber'
            label='Student Number (not required)'
            onChange={({ target }) => setStudentNumber(target.value)}
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
        <Grid
          container
          spacing={0}
          direction='column'
          alignItems='center'
          justifyContent='center'
        >
          <RadioGroup
            defaultValue={SystemRole.User}
            name='radio-buttons-group'
            onChange={({ target }) => setRole(target.value as SystemRole)}>
            <FormControlLabel value={SystemRole.User} control={<Radio />} label='User' />
            <FormControlLabel value={SystemRole.Admin} control={<Radio />} label='Admin' />
          </RadioGroup>
        </Grid>
        <Button type='submit'>sign up</Button>
      </form>
    </>
  );
};

SignupForm.propTypes = {
  addUser: PropTypes.func
};

export default SignupForm;
