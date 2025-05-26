// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ContentCopy, Done} from '@mui/icons-material';
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import {Formik, type FormikHelpers, type FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';

import {NewUserSchema} from '@/common/types';
import FormField from '@/components/shared/FormikField';
import {useAddUser} from '@/hooks/useApi';

type FormData = {
  admin: boolean;
  email: string;
  name: string;
};
const ValidationSchema = NewUserSchema;
const initialValues: FormData = {
  admin: false,
  email: '',
  name: '',
};
type NewUserData = FormData & {temporaryPassword: string};

type PropsType = {open: boolean; onClose: () => void};
const AddUserDialog = ({open, onClose}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const addUser = useAddUser();
  const [userData, setUserData] = useState<NewUserData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const submitAddUser = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    const res = await addUser
      .mutateAsync(
        values.admin
          ? {admin: true, email: values.email, name: values.name}
          : {admin: false, email: values.email}
      )
      .catch(() => {
        setSubmitting(false);
      });
    if (res === undefined) return;

    enqueueSnackbar(t('front-page.user-added'), {variant: 'success'});
    setSubmitting(false);
    if (!values.admin) {
      resetForm();
      onClose();
      return;
    }

    setUserData({...values, temporaryPassword: res.temporaryPassword!});
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

  const FormContent = ({form}: {form: FormikProps<FormData>}): JSX.Element => (
    <>
      <FormControlLabel
        control={
          <Switch
            name="admin"
            checked={form.values.admin}
            disabled={form.isSubmitting}
            onChange={form.handleChange}
          />
        }
        label={t('general.admin')}
      />
      <FormField
        form={form as unknown as FormikProps<{[key: string]: unknown}>}
        value="email"
        label={`${t('general.email')}*`}
        helperText={t('front-page.email-help')}
        type="email"
      />
      <Collapse in={form.values.admin}>
        <FormField
          form={form as unknown as FormikProps<{[key: string]: unknown}>}
          value="name"
          label={`${t('general.name')}*`}
          helperText={t('front-page.admin-name-help')}
          type="string"
        />
      </Collapse>
    </>
  );
  const UserContent = (): JSX.Element => (
    <Grid container spacing={2}>
      <Grid size={6}>
        <Typography>{t('general.email')}</Typography>
      </Grid>
      <Grid size={6}>
        <Typography>{userData!.email}</Typography>
      </Grid>

      <Grid size={6}>
        <Typography>{t('general.name')}</Typography>
      </Grid>
      <Grid size={6}>
        <Typography>{userData!.name}</Typography>
      </Grid>

      <Grid size={6}>
        <Typography>{t('front-page.temporary-password')}</Typography>
      </Grid>
      <Grid size={6}>
        <Typography sx={{display: 'inline'}}>
          {userData!.temporaryPassword}
        </Typography>
        <Tooltip
          title={t('general.copy')}
          placement="top"
          sx={{my: -1, ml: 1, mr: -2}}
        >
          <IconButton
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(userData!.temporaryPassword);
              setCopied(true);
              enqueueSnackbar(t('front-page.password-copied'), {
                variant: 'success',
              });
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {!copied ? (
              <ContentCopy fontSize="small" />
            ) : (
              <Done fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );

  const confirmDiscard = async ({
    resetForm,
  }: FormikHelpers<FormData>): Promise<void> => {
    if (await AsyncConfirmationModal({confirmNavigate: true})) {
      onClose();
      resetForm();
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={submitAddUser}
    >
      {form => (
        <Dialog
          open={open}
          onClose={() => {
            onClose();
            if (userData !== null) {
              setUserData(null);
              form.resetForm();
            }
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            {userData === null
              ? t('front-page.add-user')
              : t('front-page.admin-added')}
          </DialogTitle>
          <DialogContent>
            {userData === null ? <FormContent form={form} /> : <UserContent />}
          </DialogContent>
          <DialogActions>
            {userData === null && (
              <Button
                variant="outlined"
                onClick={async () => confirmDiscard(form)}
                disabled={form.isSubmitting}
              >
                {t('general.cancel')}
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => {
                if (userData === null) {
                  form.submitForm();
                } else {
                  form.resetForm();
                  onClose();
                  setUserData(null);
                }
              }}
              disabled={form.isSubmitting}
            >
              {userData === null
                ? t('front-page.add-user')
                : t('general.close')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Formik>
  );
};

export default AddUserDialog;
