// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LoginResult, SystemRole } from 'aalto-grades-common/types';
import { Button, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import { JSX, SyntheticEvent, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { useSignUp, UseSignUpResult } from '../../hooks/useApi';
import useAuth, { AuthContextType } from '../../hooks/useAuth';
import { State } from '../../types';

export default function Signup(): JSX.Element {

  const navigate: NavigateFunction = useNavigate();
  const { setAuth }: AuthContextType = useAuth();

  const [name, setName]: State<string> = useState('');
  const [password, setPassword]: State<string> = useState('');
  const [email, setEmail]: State<string> = useState('');
  const [studentNumber, setStudentNumber]: State<string> = useState<string>('');
  const [role, setRole]: State<SystemRole> = useState<SystemRole>(SystemRole.User);

  const signUp: UseSignUpResult = useSignUp({
    onSuccess: (auth: LoginResult | null) => {
      // If signup successful, save user role to context
      setAuth(auth ?? null);
      navigate('/', { replace: true });
    }
  });

  function handleSubmit(event: SyntheticEvent): void {
    event.preventDefault();

    signUp.mutate({
      name: name,
      password: password,
      email: email,
      role: role,
      studentNumber: studentNumber.length > 0 ? studentNumber : undefined
    });
  }

  return (
    <div>
      <h1>Sign up</h1>
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
    </div>
  );
}
