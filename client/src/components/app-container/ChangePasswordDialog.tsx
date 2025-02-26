// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
import {Formik, type FormikHelpers, type FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {z} from 'zod';

import {PasswordSchema} from '@/common/types';
import FormField from '@/components/shared/FormikField';
import BaseShowPasswordButton from '@/components/shared/auth/ShowPasswordButton';
import {useResetOwnAuth} from '@/hooks/useApi';

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
      message: t('shared.auth.password.match'),
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
    } catch {
      setSubmitting(false);
      return;
    }
    enqueueSnackbar(t('shared.auth.password.changed'), {variant: 'success'});
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

  // Wrapper for ShowPasswordButton
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
            <DialogTitle>{t('shared.auth.change-password')}</DialogTitle>
            <DialogContent>
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="newPassword"
                label={`${t('shared.auth.password.new')}*`}
                type={showPassword.new ? 'text' : 'password'}
                InputProps={{endAdornment: <ShowPasswordButton type="new" />}}
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="repeatPassword"
                label={`${t('shared.auth.password.repeat')}*`}
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
                {t('shared.auth.password.requirements')}
              </Link>
              <Button
                variant="contained"
                onClick={form.submitForm}
                disabled={form.isSubmitting}
              >
                {t('shared.auth.password.reset')}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};
export default ChangePasswordDialog;
