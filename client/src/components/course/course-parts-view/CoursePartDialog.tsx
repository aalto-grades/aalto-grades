// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import {Formik, type FormikHelpers, type FormikProps} from 'formik';
import {type JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {z} from 'zod';

import type {CoursePartData} from '@/common/types';
import FormField from '@/components/shared/FormikField';
import {useAddCoursePart, useEditCoursePart} from '@/hooks/useApi';
import {nullableDateSchema} from '@/types';

const getDates = (): string[] => {
  try {
    const data = localStorage.getItem('lastDates');
    const parsed = data ? (JSON.parse(data) as string[]) : [];
    return Array.isArray(parsed)
      ? parsed.filter(item => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

const addDate = (newDate: string): void => {
  const uniqueDates = [newDate, ...getDates().filter(date => date !== newDate)];
  localStorage.setItem('lastDates', JSON.stringify(uniqueDates.slice(0, 5)));
};

type FormData = {name: string; expiryDate: string | null};

type PropsType = {
  open: boolean;
  onClose: () => void;
  type: 'edit' | 'new';
  coursePart?: CoursePartData | null;
};
const CoursePartDialog = ({
  open,
  onClose,
  type,
  coursePart = null,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const addCoursePart = useAddCoursePart(courseId);
  const editCoursePart = useEditCoursePart(courseId);
  const lastUsedDates = getDates();

  const initialValues: FormData = {
    name: coursePart?.name ?? '',
    expiryDate: coursePart?.expiryDate?.toISOString().split('T')[0] ?? null,
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
      if (type === 'edit') {
        await editCoursePart.mutateAsync({
          coursePartId: coursePart!.id,
          coursePart: {
            name: parsedValues.name,
            expiryDate: parsedValues.expiryDate,
          },
        });
      } else {
        await addCoursePart.mutateAsync({
          name: parsedValues.name,
          expiryDate: parsedValues.expiryDate,
        });
      }
    } catch {
      setSubmitting(false);
      return;
    } finally {
      onClose();
      resetForm();
      if (values.expiryDate !== null) {
        addDate(values.expiryDate);
      }
    }
  };

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    // Set to null if empty
    if (values.expiryDate === '') values.expiryDate = null;

    const result = ValidationSchema.safeParse(values);
    if (result.success) return;

    const treeifiedError = z.treeifyError(result.error);
    const fieldErrors = treeifiedError.properties || {};
    return Object.fromEntries(
      Object.entries(fieldErrors).map(([key, val]) => [key, val?.errors[0]]) // Only the first error
    );
  };

  const setDate = (form: FormikProps<FormData>, date: string | null): void => {
    form.setFieldValue('expiryDate', date);
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={onSubmit}
      enableReinitialize={type === 'edit'}
    >
      {form => (
        <Dialog
          open={open}
          onClose={() => {
            onClose();
            form.resetForm();
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {type === 'edit'
              ? t('course.parts.create.edit-title', {name: coursePart?.name})
              : t('course.parts.create.create-title')}
          </DialogTitle>
          <DialogContent>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="name"
              label={`${t('general.name')}*`}
              helperText={t('course.parts.create.name-help')}
              type="string"
            />
            <Box
              sx={{
                width: '100%',
                alignContent: 'center',
                alignItems: 'center',
                gap: {xs: 0, sm: 2},
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{width: {xs: '100%', sm: '60%'}}}>
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="expiryDate"
                  label={t('general.expiry-date')}
                  helperText={t('course.parts.create.expiry-date-valid-help')}
                  type="date"
                />
              </Box>
              <Box>
                <Button
                  type="button"
                  onClick={() => setDate(form, null)}
                  variant="outlined"
                >
                  {t('course.parts.no-expiry-date')}
                </Button>
              </Box>
            </Box>
            {lastUsedDates.length > 0 && (
              <>
                <Typography variant="subtitle2">
                  {t('course.parts.create.previously-used-dates')}
                </Typography>
                <Box
                  sx={{
                    gap: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                  }}
                >
                  {lastUsedDates.map(date => (
                    <Chip
                      key={date}
                      clickable
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={new Date(date).toLocaleDateString('fi')}
                      onClick={() => setDate(form, date)}
                    />
                  ))}
                </Box>
              </>
            )}
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

export default CoursePartDialog;
