// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {Formik, type FormikHelpers, type FormikProps} from 'formik';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {z} from 'zod';

import type {CoursePartData} from '@/common/types';
import FormField from '@/components/shared/FormikField';
import {useEditCoursePart} from '@/hooks/useApi';
import {nullableDateSchema} from '@/types';

type FormData = {name: string; expiryDate: string | null};

type PropsType = {
  open: boolean;
  onClose: () => void;
  coursePart: CoursePartData | null;
};
const EditCoursePartDialog = ({
  open,
  onClose,
  coursePart,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const editCoursePart = useEditCoursePart(courseId);

  const initialValues: FormData = {
    name: coursePart?.name ?? '',
    expiryDate: coursePart?.expiryDate?.toISOString().split('T')[0] ?? '',
  };
  const ValidationSchema = z.strictObject({
    name: z.string().min(1),
    expiryDate: nullableDateSchema(t),
  });

  const onSubmit = async (
    values: FormData,
    {resetForm, setSubmitting}: FormikHelpers<FormData>
  ): Promise<void> => {
    const parsedValues = ValidationSchema.parse(values);
    try {
      await editCoursePart.mutateAsync({
        coursePartId: coursePart!.id,
        coursePart: {
          name: parsedValues.name,
          expiryDate: parsedValues.expiryDate,
        },
      });
    } catch {
      setSubmitting(false);
      return;
    }
    onClose();
    resetForm();
  };

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    // Set to null if empty
    if (values.expiryDate === '') values.expiryDate = null;

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
      enableReinitialize
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
              label={t('general.expiry-date')}
              helperText={t('course.parts.create.expiry-date-valid-help')}
              type="date"
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

export default EditCoursePartDialog;
