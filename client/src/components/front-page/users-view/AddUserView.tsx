// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {TextField, Box, Button, Typography, Container} from '@mui/material';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import * as yup from 'yup';
import {Form, Formik, FormikProps} from 'formik';

import {useAddUser} from '../../../hooks/useApi';

export default function AddUserView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const addUser = useAddUser();
  async function submitAddUser(values: {email: string}): Promise<void> {
    values.email;
    addUser.mutate(values.email, {
      onSuccess: () => {
        navigate('/', {replace: true});
      },
    });
  }
  return (
    <>
      <Typography variant="h1" sx={{flexGrow: 1, mb: 4}}>
        {'Add a user'}
      </Typography>
      <Container maxWidth="sm" sx={{textAlign: 'right'}}>
        <Formik
          initialValues={{email: ''}}
          onSubmit={submitAddUser}
          validationSchema={yup.object({
            email: yup
              .string()
              .email('Please input valid email address')
              .notRequired(),
          })}
        >
          {(form: FormikProps<{email: string}>): JSX.Element => (
            <Form>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  boxShadow: 2,
                  borderRadius: 2,
                  my: 2,
                  p: 2,
                }}
              >
                <TextField
                  id="email"
                  name={'email'}
                  type={'text'}
                  fullWidth
                  value={form.values.email}
                  disabled={form.isSubmitting}
                  onChange={form.handleChange}
                  label="Email"
                  InputLabelProps={{shrink: true}}
                  helperText={
                    'enter Aalto email e.g. firstname.lastname@aalto.fi'
                  }
                  error={Boolean(form.errors.email)}
                ></TextField>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: 6,
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={(): void => {
                    navigate(-1);
                  }}
                  disabled={form.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  id="add_user"
                  size="medium"
                  variant="contained"
                  type="submit"
                  disabled={form.isSubmitting}
                >
                  Add User
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Container>
    </>
  );
}
