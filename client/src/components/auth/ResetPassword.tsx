// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Grid, Link, Typography} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {AaltoEmailSchema, PasswordSchema} from '@/common/types';
import OtpAuthDialog from './OtpAuthDialog';
import BaseShowPasswordButton from './ShowPasswordButton';
import {useResetOwnPassword} from '../../hooks/useApi';
import FormField from '../shared/FormikField';

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
  const {t} = useTranslation();
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
  const [otpAuth, setOtpAuth] = useState<string | null>(null);

  const ValidationSchema = z
    .object({
      email: AaltoEmailSchema,
      oldPassword: z.string(),
      newPassword: PasswordSchema,
      repeatPassword: PasswordSchema,
    })
    .refine(val => val.newPassword === val.repeatPassword, {
      path: ['repeatPassword'],
      message: t('auth.password.match'),
    })
    .refine(val => val.oldPassword !== val.newPassword, {
      path: ['newPassword'],
      message: t('auth.password.old'),
    });

  const initialValues = {
    email: state?.email ?? '',
    oldPassword: state?.password ?? '',
    newPassword: '',
    repeatPassword: '',
  };

  const handleResetPassword = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    const otpAuthRes = await resetPassword
      .mutateAsync({
        email: values.email,
        password: values.oldPassword,
        newPassword: values.newPassword,
      })
      .catch(() => setSubmitting(false));
    if (otpAuthRes === undefined) return;

    enqueueSnackbar(t('auth.password.reset-done'), {variant: 'success'});
    setSubmitting(false);
    resetForm();
    if (!state?.resetMfa) return navigate('/login', {replace: true});

    setOtpAuth(otpAuthRes.otpAuth);
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
    <>
      <OtpAuthDialog
        otpAuth={otpAuth}
        onClose={() => {
          setOtpAuth(null);
          navigate('/login', {replace: true});
        }}
      />
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h2">{t('auth.password.reset')}</Typography>
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
            onSubmit={handleResetPassword}
          >
            {form => (
              <>
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="newPassword"
                  label={`${t('auth.password.new')}*`}
                  type={showPassword.new ? 'text' : 'password'}
                  InputProps={{endAdornment: <ShowPasswordButton type="new" />}}
                />
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="repeatPassword"
                  label={`${t('auth.password.repeat')}*`}
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
                    {t('auth.password.requirements')}
                  </Link>
                  <Button
                    variant="contained"
                    onClick={form.submitForm}
                    disabled={form.isSubmitting}
                  >
                    {t('auth.password.reset')}
                  </Button>
                </Box>
              </>
            )}
          </Formik>
        </Box>
      </Grid>
    </>
  );
};
export default ResetPassword;
