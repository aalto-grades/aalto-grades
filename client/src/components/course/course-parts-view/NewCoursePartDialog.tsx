// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {NewCoursePartDataSchema} from '@/common/types';
import FormField from '@/components/shared/FormikField';

type FormData = {name: string; daysValid: number; maxGrade: number};
const ValidationSchema = NewCoursePartDataSchema;
const initialValues: FormData = {name: '', daysValid: 365, maxGrade: 0};

type PropsType = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, daysValid: number, maxGrade: number | null) => void;
};
const AddCoursePartDialog = ({
  open,
  onClose,
  onSave,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const [showMaxGrade, setShowMaxGrade] = useState<boolean>(false);

  const onSubmit = (
    values: FormData,
    {resetForm}: FormikHelpers<FormData>
  ): void => {
    onSave(
      values.name,
      values.daysValid,
      showMaxGrade ? values.maxGrade : null
    );
    onClose();
    resetForm();
    setShowMaxGrade(false);
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
          <DialogTitle>{t('course.create-part.title')}</DialogTitle>
          <DialogContent>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="name"
              label={`${t('general.name')}*`}
              helperText={t('course.create-part.name-help')}
              type="string"
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="daysValid"
              label={`${t('general.days-valid')}*`}
              helperText={t('course.create-part.days-valid-help')}
              type="number"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showMaxGrade}
                  onChange={e => setShowMaxGrade(e.target.checked)}
                />
              }
              label={t('course.create-part.set-max-grade')}
            />
            <Collapse in={showMaxGrade}>
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="maxGrade"
                label={`${t('general.max-grade')}*`}
                helperText={t('course.create-part.max-grade-help')}
                type="number"
              />
            </Collapse>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={form.isSubmitting}
              variant="outlined"
              onClick={() => {
                onClose();
                form.resetForm();
                setShowMaxGrade(false);
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
