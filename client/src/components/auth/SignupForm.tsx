// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SystemRole } from 'aalto-grades-common/types';
import { Button, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { SignupCredentials, State } from '../../types';

export default function SignupForm(props: {
  addUser: (userObject: SignupCredentials) => Promise<void>
}): JSX.Element {

  const [name, setName]: State<string> = useState('');
  const [password, setPassword]: State<string> = useState('');
  const [email, setEmail]: State<string> = useState('');
  const [studentNumber, setStudentNumber]: State<string> = useState<string>('');
  const [role, setRole]: State<SystemRole> = useState<SystemRole>(SystemRole.User);

  function handleSubmit(event: React.SyntheticEvent): void {
    event.preventDefault();
    try {
      const userObject: SignupCredentials = {
        name,
        password,
        email,
        role,
        studentNumber: studentNumber.length > 0 ? studentNumber : undefined
      };
      props.addUser(userObject);
    } catch (exception) {
      console.log(exception);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <TextField
            type='text'
            value={name}
            name='name'
            label='Name'
            onChange={(
              { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
            ): void => setName(target.value)}
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
            onChange={(
              { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
            ): void => setEmail(target.value)}
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
            onChange={(
              { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
            ): void => setStudentNumber(target.value)}
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
            onChange={(
              { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
            ): void => setPassword(target.value)}
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
            onChange={(
              { target }: { target: EventTarget & HTMLInputElement }
            ): void => setRole(target.value as SystemRole)}>
            <FormControlLabel value={SystemRole.User} control={<Radio />} label='User' />
            <FormControlLabel value={SystemRole.Admin} control={<Radio />} label='Admin' />
          </RadioGroup>
        </Grid>
        <Button type='submit'>sign up</Button>
      </form>
    </>
  );
}

SignupForm.propTypes = {
  addUser: PropTypes.func
};
