// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {useTranslation} from 'react-i18next';

import {NewCoursePartDataSchema} from '@/common/types';
import FormField from '@/components/shared/FormikField';

type FormData = {name: string; expiryDate: Date | null};
const ValidationSchema = NewCoursePartDataSchema;
const initialValues: FormData = {name: '', expiryDate: null};

type PropsType = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, expiryDate: Date | null) => void;
};
const AddCoursePartDialog = ({
  open,
  onClose,
  onSave,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  const onSubmit = (
    values: FormData,
    {resetForm}: FormikHelpers<FormData>
  ): void => {
    onSave(values.name, values.expiryDate);
    onClose();
    resetForm();
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

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={onSubmit}
    >
      {form => (
        <Dialog
          open={open}
          onClose={() => {
            onClose();
            form.resetForm();
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>{t('course.parts.create.title')}</DialogTitle>
          <DialogContent>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="name"
              label={`${t('general.name')}*`}
              helperText={t('course.parts.create.name-help')}
              type="string"
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="expiryDate"
              label={`${t('general.expiry-date')}*`}
              helperText={t('course.parts.create.expiry-date-valid-help')}
              type="number"
            />
          </DialogContent>
          <DialogActions>
            <Button
              disabled={form.isSubmitting}
              variant="outlined"
              onClick={() => {
                onClose();
                form.resetForm();
              }}
            >
              {t('general.cancel')}
            </Button>
            <Button
              variant="contained"
              disabled={form.isSubmitting}
              onClick={form.submitForm}
            >
              {t('general.save')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Formik>
  );
};

export default AddCoursePartDialog;
