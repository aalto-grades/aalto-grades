// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {JSX, useState} from 'react';
import {z} from 'zod';

import {PasswordSchema} from '@/common/types';
import BaseShowPasswordButton from './ShowPasswordButton';
import {useChangePassword} from '../../hooks/useApi';
import FormField from '../shared/FormikField';

const ValidationSchema = z
  .object({
    newPassword: PasswordSchema,
    repeatPassword: PasswordSchema,
  })
  .refine(val => val.newPassword === val.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords must match',
  });
type FormData = {
  newPassword: string;
  repeatPassword: string;
};
const initialValues = {newPassword: '', repeatPassword: ''};

type ShowPassword = {
  new: boolean;
  repeat: boolean;
};

type PropsType = {open: boolean; onClose: () => void};
const ChangePasswordDialog = ({open, onClose}: PropsType): JSX.Element => {
  const changePassword = useChangePassword();

  const [showPassword, setShowPassword] = useState<ShowPassword>({
    new: false,
    repeat: false,
  });

  const handleSubmit = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    try {
      await changePassword.mutateAsync({newPassword: values.newPassword});
    } catch (e) {
      setSubmitting(false);
      return;
    }
    enqueueSnackbar('Password changed successfully', {variant: 'success'});
    setSubmitting(false);
    resetForm();
    onClose();
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

  type ButtonPropsType = {type: keyof ShowPassword};
  const ShowPasswordButton = ({type}: ButtonPropsType): JSX.Element => (
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <Formik
        initialValues={initialValues}
        validate={validateForm}
        onSubmit={handleSubmit}
      >
        {form => (
          <>
            <DialogTitle>Change password</DialogTitle>
            <DialogContent>
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
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <Link
                sx={{mb: 1, ml: 1.5}}
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
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};
export default ChangePasswordDialog;
