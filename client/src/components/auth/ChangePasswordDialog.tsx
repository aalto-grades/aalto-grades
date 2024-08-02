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
import {useTranslation} from 'react-i18next';
import {z} from 'zod';

import {PasswordSchema} from '@/common/types';
import BaseShowPasswordButton from './ShowPasswordButton';
import {useResetOwnAuth} from '../../hooks/useApi';
import FormField from '../shared/FormikField';

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
  const {t} = useTranslation();
  const resetOwnAuth = useResetOwnAuth();

  const [showPassword, setShowPassword] = useState<ShowPassword>({
    new: false,
    repeat: false,
  });

  const ValidationSchema = z
    .object({
      newPassword: PasswordSchema,
      repeatPassword: PasswordSchema,
    })
    .refine(val => val.newPassword === val.repeatPassword, {
      path: ['repeatPassword'],
      message: t('auth.password.match'),
    });

  const handleSubmit = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    try {
      await resetOwnAuth.mutateAsync({
        resetPassword: true,
        resetMfa: false,
        newPassword: values.newPassword,
      });
    } catch (e) {
      setSubmitting(false);
      return;
    }
    enqueueSnackbar(t('auth.password.changed'), {variant: 'success'});
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
            <DialogTitle>{t('auth.change-password')}</DialogTitle>
            <DialogContent>
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="newPassword"
                label={`${t('auth.password.new')}*`}
                type={showPassword.new ? 'text' : 'password'}
                InputProps={{endAdornment: <ShowPasswordButton type="new" />}}
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="repeatPassword"
                label={`${t('auth.password.repeat')}*`}
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
                {t('auth.password.requirements')}
              </Link>
              <Button
                variant="contained"
                onClick={form.submitForm}
                disabled={form.isSubmitting}
              >
                {t('auth.password.reset')}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};
export default ChangePasswordDialog;
