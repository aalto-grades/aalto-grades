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
import { UserRole } from '../../types/general';

const SignupForm = ({ addUser }) => {

  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [studentID, setStudentID] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<UserRole>(UserRole.User);

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const userObject = ({
        name,
        password,
        email,
        role,
        studentID
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
            value={studentID}
            name='StudentID'
            label='Student ID (not required)'
            onChange={({ target }) => setStudentID(target.value)}
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
            defaultValue={UserRole.User}
            name='radio-buttons-group'
            onChange={({ target }) => setRole(target.value as UserRole)}>
            <FormControlLabel value={UserRole.User} control={<Radio />} label='User' />
            <FormControlLabel value={UserRole.Admin} control={<Radio />} label='Admin' />
          </RadioGroup>
        </Grid>
        <Button type='submit'>Sign up</Button>
      </form>
    </>
  );
};

SignupForm.propTypes = {
  addUser: PropTypes.func
};

export default SignupForm;