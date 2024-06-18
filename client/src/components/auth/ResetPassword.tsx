// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Visibility, VisibilityOff} from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {JSX, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {AaltoEmailSchema, PasswordSchema} from '@/common/types';
import {useResetPassword} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
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
const initialValues = {
  email: '',
  oldPassword: '',
  newPassword: '',
  repeatPassword: '',
};

type ShowPassword = {
  old: boolean;
  new: boolean;
  repeat: boolean;
};
const ResetPassword = (): JSX.Element => {
  const navigate = useNavigate();
  const {setAuth} = useAuth();
  const resetPassword = useResetPassword();

  const [showPassword, setShowPassword] = useState<ShowPassword>({
    old: false,
    new: false,
    repeat: false,
  });

  const handleSubmit = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    const auth = await resetPassword
      .mutateAsync({
        email: values.email,
        password: values.oldPassword,
        newPassword: values.newPassword,
      })
      .catch(() => {
        setSubmitting(false);
      });
    if (auth === undefined) return;

    enqueueSnackbar('Password reset successfully', {variant: 'success'});
    setSubmitting(false);
    resetForm();

    setAuth(auth);
    navigate('/', {replace: true});
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
    <InputAdornment position="start">
      <IconButton
        aria-label="toggle password visibility"
        onClick={() =>
          setShowPassword(oldShowPassword => ({
            ...oldShowPassword,
            [type]: !oldShowPassword[type],
          }))
        }
        onMouseDown={event => event.preventDefault()}
        edge="end"
      >
        <Tooltip
          placement="top"
          title={
            showPassword[type]
              ? 'Click to hide password from view'
              : 'Click to show password'
          }
        >
          {showPassword[type] ? <VisibilityOff /> : <Visibility />}
        </Tooltip>
      </IconButton>
    </InputAdornment>
  );

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
                value="email"
                label="Email*"
                helperText="Email"
                type={'email'}
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="oldPassword"
                label="Old Password*"
                helperText="Old password"
                type={showPassword.old ? 'text' : 'password'}
                InputProps={{endAdornment: <ShowPasswordButton type="old" />}}
              />
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
              <Button
                variant="contained"
                onClick={form.submitForm}
                disabled={form.isSubmitting}
              >
                Reset password
              </Button>
            </>
          )}
        </Formik>
      </Box>
    </Grid>
  );
};
export default ResetPassword;
