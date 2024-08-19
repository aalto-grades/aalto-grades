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
import {z} from 'zod';

import FormField from '@/components/shared/FormikField';
import {nullableIntSchema} from '@/types';

type FormData = {
  name: string;
  daysValid: number | '' | null;
  maxGrade: number | '' | null;
};

const initialValues: FormData = {name: '', daysValid: null, maxGrade: null};

type PropsType = {
  open: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    daysValid: number | null,
    maxGrade: number | null
  ) => void;
};
const AddCourseTaskDialog = ({
  open,
  onClose,
  onSave,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  const ValidationSchema = z.strictObject({
    name: z.string().min(1),
    daysValid: nullableIntSchema(t),
    maxGrade: nullableIntSchema(t),
  });

  const onSubmit = (
    values: FormData,
    {resetForm}: FormikHelpers<FormData>
  ): void => {
    const parsedValues = ValidationSchema.parse(values);
    onSave(parsedValues.name, parsedValues.daysValid, parsedValues.maxGrade);
    onClose();
    resetForm();
  };

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    if (values.daysValid === '') values.daysValid = null;
    if (values.maxGrade === '') values.maxGrade = null;

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
          <DialogTitle>{t('course.parts.create-task.title')}</DialogTitle>
          <DialogContent>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="name"
              label={`${t('general.name')}*`}
              helperText={t('course.parts.create-task.name-help')}
              type="string"
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="daysValid"
              label={t('general.days-valid')}
              helperText={t('course.parts.create-task.days-valid-help')}
              type="string"
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="maxGrade"
              label={t('general.max-grade')}
              helperText={t('course.parts.create-task.max-grade-valid-help')}
              type="string"
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

export default AddCourseTaskDialog;
