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
import {enqueueSnackbar} from 'notistack';
import {JSX, useState} from 'react';
import {z} from 'zod';

import {AaltoEmailSchema} from '@/common/types';
import {useAddUser} from '../../../hooks/useApi';
import UnsavedChangesDialog from '../../alerts/UnsavedChangesDialog';

type FormData = {email: string};
const ValidationSchema = z.object({
  email: AaltoEmailSchema,
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
    addUser.mutate(
      {email: values.email},
      {
        onSuccess: () => {
          enqueueSnackbar('User added successfully', {variant: 'success'});
          resetForm();
          onClose();
          setSubmitting(false);
        },
      }
    );
  };

  const validateForm = (values: {
    email: string;
  }): {email?: string[]} | undefined => {
    const result = ValidationSchema.safeParse(values);
    if (result.success) return;
    const fieldErrors = result.error.formErrors.fieldErrors;
    return Object.fromEntries(
      Object.entries(fieldErrors).map(([key, val]) => [key, val[0]]) // Only the first error
    );
  };

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

          <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Add a User</DialogTitle>
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
                  form.errors.email
                    ? form.errors.email
                    : 'Aalto email e.g. firstname.lastname@aalto.fi'
                }
                error={form.touched.email && Boolean(form.errors.email)}
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
                id="add-user"
                variant="contained"
                onClick={form.submitForm}
                disabled={form.isSubmitting}
              >
                Add user
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Formik>
  );
};

export default AddUserDialog;
