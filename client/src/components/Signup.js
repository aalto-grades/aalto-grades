// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, {useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import userService from '../services/user';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid';

const Signup = () => {
  

  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [studentID, setStudentID] = useState('');
  const [role, setRole] = useState('Teacher');

  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      const user = await userService.signup({
        username, password, email, studentID, role
      });
      console.log(user);
      setUsername('');
      setPassword('');
    } catch (exception) {
      console.log('Error: signup failed');
    }
  };

  return (
    <div>
      <h1>Sign up</h1>
      <form onSubmit={handleSignup}>
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
            type='email'
            value={email}
            name='Email'
            label='Email'
            onChange={({ target }) => setEmail(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
        </div>
        <div>
          <TextField
            type='studentID'
            value={studentID}
            name='StudentID'
            label='StudentID'
            onChange={({ target }) => setStudentID(target.value)}
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
        <Grid
          container
          spacing={0}
          direction='column'
          alignItems='center'
          justifyContent='center'
        >
          <RadioGroup
            defaultValue='teacher'
            name='radio-buttons-group'
            onChange={({ target }) => setRole(target.value)}>
            <FormControlLabel value='Teacher' control={<Radio />} label='Teacher' />
            <FormControlLabel value='Student' control={<Radio />} label='Student' />
            <FormControlLabel value='Admin' control={<Radio />} label='Admin' />
          </RadioGroup>
        </Grid>
        <Button type='submit' variant='contained'>Sign up</Button>
      </form>
    </div>
  );
};

export default Signup;