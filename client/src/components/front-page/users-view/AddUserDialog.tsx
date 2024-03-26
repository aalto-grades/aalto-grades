// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import {Formik, FormikHelpers} from 'formik';
import {JSX, useState} from 'react';
import * as yup from 'yup';

import {enqueueSnackbar} from 'notistack';
import {useAddUser} from '../../../hooks/useApi';
import UnsavedChangesDialog from '../../alerts/UnsavedChangesDialog';

type FormData = {email: string};
const validationSchema = yup.object({
  email: yup
    .string()
    .matches(/^.*@aalto\.fi$/, 'Email must be a valid aalto email')
    .email('Email must be a valid aalto email')
    .required('Email is required'),
});
const initialValues = {email: ''};

type PropsType = {open: boolean; onClose: () => void};
const AddUserDialog = ({open, onClose}: PropsType): JSX.Element => {
  const addUser = useAddUser();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState<boolean>(false);

  const submitAddUser = (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): void => {
    values.email;
    addUser.mutate(values.email, {
      onSuccess: () => {
        enqueueSnackbar('User added succesfully', {variant: 'success'});
        resetForm();
        onClose();
        setSubmitting(false);
      },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
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

          <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{'Add a user'}</DialogTitle>
            <DialogContent>
              <TextField
                id="email"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={form.values.email}
                disabled={form.isSubmitting}
                onChange={form.handleChange}
                label="Email"
                InputLabelProps={{shrink: true}}
                helperText={
                  form.errors['email']
                    ? form.errors['email']
                    : 'Aalto email e.g. firstname.lastname@aalto.fi'
                }
                error={form.touched['email'] && Boolean(form.errors['email'])}
              />
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => setShowUnsavedDialog(true)}
                disabled={form.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                id="add_user"
                variant="contained"
                onClick={form.submitForm}
                disabled={form.isSubmitting}
              >
                Add User
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Formik>
  );
};

export default AddUserDialog;
