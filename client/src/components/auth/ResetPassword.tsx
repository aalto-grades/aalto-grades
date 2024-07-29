// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Grid, Link, Typography} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {JSX, useState} from 'react';
import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {AaltoEmailSchema, PasswordSchema} from '@/common/types';
import BaseShowPasswordButton from './ShowPasswordButton';
import {useResetOwnPassword} from '../../hooks/useApi';
import FormField from '../shared/FormikField';

const ValidationSchema = z
  .object({
    email: AaltoEmailSchema,
    oldPassword: z.string(),
    newPassword: PasswordSchema,
    repeatPassword: PasswordSchema,
  })
  .refine(val => val.newPassword === val.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords must match',
  })
  .refine(val => val.oldPassword !== val.newPassword, {
    path: ['newPassword'],
    message: 'New password cannot be the same as the old password',
  });
type FormData = {
  email: string;
  oldPassword: string;
  newPassword: string;
  repeatPassword: string;
};

type ShowPassword = {
  old: boolean;
  new: boolean;
  repeat: boolean;
};
const ResetPassword = (): JSX.Element => {
  const navigate = useNavigate();
  const resetPassword = useResetOwnPassword();
  const {state} = useLocation() as {
    state: {
      email: string;
      password: string;
      resetPassword: boolean;
      resetMfa: boolean;
    } | null;
  };

  const [showPassword, setShowPassword] = useState<ShowPassword>({
    old: false,
    new: false,
    repeat: false,
  });

  const initialValues = {
    email: state?.email ?? '',
    oldPassword: state?.password ?? '',
    newPassword: '',
    repeatPassword: '',
  };

  const handleSubmit = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    const mfaSecret = await resetPassword
      .mutateAsync({
        email: values.email,
        password: values.oldPassword,
        newPassword: values.newPassword,
      })
      .catch(() => setSubmitting(false));
    if (mfaSecret === undefined) return;

    enqueueSnackbar('Password reset successfully', {variant: 'success'});
    setSubmitting(false);
    resetForm();

    navigate('/login', {replace: true});
  };

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    const result = ValidationSchema.safeParse(values);
    if (result.success) return;

    const fieldErrors = result.error.formErrors.fieldErrors;
    return Object.fromEntries(
      Object.entries(fieldErrors).map(([key, val]) => [key, val[0]]) // Only the first error
    );
  };

  type PropsType = {type: keyof ShowPassword};
  const ShowPasswordButton = ({type}: PropsType): JSX.Element => (
    <BaseShowPasswordButton
      shown={showPassword[type]}
      onClick={() =>
        setShowPassword(oldShowPassword => ({
          ...oldShowPassword,
          [type]: !oldShowPassword[type],
        }))
      }
    />
  );

  // TODO: Redirect if no auth data
  if (state === null) return <Navigate to="/login" />;

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="h2">Reset password</Typography>
      <Box
        sx={{
          width: 1 / 2,
          border: 1,
          borderRadius: '8px',
          borderColor: 'gray',
          p: 2,
          mt: 1,
        }}
      >
        <Formik
          initialValues={initialValues}
          validate={validateForm}
          onSubmit={handleSubmit}
        >
          {form => (
            <>
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="newPassword"
                label="New Password*"
                helperText="New password"
                type={showPassword.new ? 'text' : 'password'}
                InputProps={{endAdornment: <ShowPasswordButton type="new" />}}
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="repeatPassword"
                label="Repeat Password*"
                helperText="Repeat password"
                type={showPassword.repeat ? 'text' : 'password'}
                InputProps={{
                  endAdornment: <ShowPasswordButton type="repeat" />,
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <Link
                  href="https://www.aalto.fi/en/services/password-guidelines"
                  target="_blank"
                >
                  Aalto password requirements
                </Link>
                <Button
                  variant="contained"
                  onClick={form.submitForm}
                  disabled={form.isSubmitting}
                >
                  Reset password
                </Button>
              </Box>
            </>
          )}
        </Formik>
      </Box>
    </Grid>
  );
};
export default ResetPassword;
