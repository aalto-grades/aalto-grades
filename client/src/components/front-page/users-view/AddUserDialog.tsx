// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
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
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {JSX, useState} from 'react';

import {NewUserSchema} from '@/common/types';
import {useAddUser} from '../../../hooks/useApi';
import UnsavedChangesDialog from '../../alerts/UnsavedChangesDialog';
import FormField from '../../shared/FormikField';

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
  const addUser = useAddUser();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState<boolean>(false);
  const [userData, setUserData] = useState<NewUserData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const submitAddUser = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    const res = await addUser
      .mutateAsync({
        admin: values.admin,
        email: values.email,
        name: values.name,
      })
      .catch(() => {
        setSubmitting(false);
      });
    if (res === undefined) return;

    enqueueSnackbar('User added successfully', {variant: 'success'});
    setSubmitting(false);
    if (!values.admin) {
      resetForm();
      onClose();
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
            id="admin"
            name="admin"
            checked={form.values.admin}
            disabled={form.isSubmitting}
            onChange={form.handleChange}
          />
        }
        label="Admin"
      />
      <FormField
        form={form as unknown as FormikProps<{[key: string]: unknown}>}
        value="email"
        label="Email*"
        helperText="Aalto email e.g. firstname.lastname@aalto.fi."
        type="email"
      />
      <Collapse in={form.values.admin}>
        <FormField
          form={form as unknown as FormikProps<{[key: string]: unknown}>}
          value="name"
          label="Name*"
          helperText="Name of the admin"
          type="string"
        />
      </Collapse>
    </>
  );
  const UserContent = (): JSX.Element => (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography>Email</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography>{userData!.email}</Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography>Name</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography>{userData!.name}</Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography>Temporary password</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography sx={{display: 'inline'}}>
          {userData!.temporaryPassword}
        </Typography>
        <Tooltip title="Copy" placement="top" sx={{my: -1, ml: 1, mr: -2}}>
          <IconButton
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(userData!.temporaryPassword);
              setCopied(true);
              enqueueSnackbar('Password copied to clipboard', {
                variant: 'success',
              });
              setTimeout(() => {
                setCopied(false);
              }, 1500);
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

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={submitAddUser}
    >
      {form => (
        <>
          <UnsavedChangesDialog
            open={showUnsavedDialog}
            onClose={() => setShowUnsavedDialog(false)}
            handleDiscard={() => {
              onClose();
              form.resetForm();
            }}
          />

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
              {userData === null ? 'Add a user' : 'Admin added'}
            </DialogTitle>
            <DialogContent>
              {userData === null ? (
                <FormContent form={form} />
              ) : (
                <UserContent />
              )}
            </DialogContent>
            <DialogActions>
              {userData === null && (
                <Button
                  variant="outlined"
                  onClick={() => setShowUnsavedDialog(true)}
                  disabled={form.isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                id="add-user"
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
                {userData === null ? 'Add user' : 'Close'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Formik>
  );
};

export default AddUserDialog;
