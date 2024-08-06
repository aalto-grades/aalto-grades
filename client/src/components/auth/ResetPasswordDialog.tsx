// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {JSX, useState} from 'react';
import {z} from 'zod';

import {PasswordSchema} from '@/common/types';
import BaseShowPasswordButton from './ShowPasswordButton';
import {useResetOwnPassword} from '../../hooks/useApi';
import FormField from '../shared/FormikField';

const ValidationSchema = z
  .object({
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
  newPassword: string;
  repeatPassword: string;
};

type ShowPassword = {
  new: boolean;
  repeat: boolean;
};

type PropsType = {
  open: boolean;
  email: string;
  password: string;
  onCancel: () => void;
  onReset: (newPassword: string) => void;
};
const ResetPasswordDialog = ({
  open,
  email,
  password,
  onCancel,
  onReset,
}: PropsType): JSX.Element => {
  const resetPassword = useResetOwnPassword();

  const [showPassword, setShowPassword] = useState<ShowPassword>({
    new: false,
    repeat: false,
  });

  const initialValues = {
    newPassword: '',
    repeatPassword: '',
  };

  const handleResetPassword = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    try {
      await resetPassword.mutateAsync({
        email: email,
        password: password,
        newPassword: values.newPassword,
      });
    } catch (e) {
      setSubmitting(false);
      return;
    }

    enqueueSnackbar('Password reset successfully', {variant: 'success'});
    onReset(values.newPassword);
    resetForm();
  };

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    const result = ValidationSchema.safeParse({
      ...values,
      oldPassword: password,
    });
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
    // No onClose on purpose to make accidental closing harder
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>Reset password</DialogTitle>
      <Formik
        initialValues={initialValues}
        validate={validateForm}
        onSubmit={handleResetPassword}
      >
        {form => (
          <>
            <DialogContent>
              <Grid
                container
                direction="column"
                alignItems="center"
                justifyContent="center"
              >
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="newPassword"
                  label="New Password*"
                  helperText="New password"
                  type={showPassword.new ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: <ShowPasswordButton type="new" />,
                  }}
                />
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
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
                </Box>
                {/* </Box> */}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                color="error"
                variant="contained"
                onClick={onCancel}
                disabled={form.isSubmitting}
              >
                Cancel
              </Button>
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
export default ResetPasswordDialog;
