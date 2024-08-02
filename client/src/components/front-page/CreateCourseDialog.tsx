// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Delete as DeleteIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {JSX, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  GradingScale,
  Language,
  NewCourseData,
} from '@/common/types';
import {useAddCourse} from '../../hooks/useApi';
import {convertToClientGradingScale} from '../../utils/textFormat';
import {departments, sisuLanguageOptions} from '../../utils/utils';
import FormField from '../shared/FormikField';
import FormLanguagesField from '../shared/FormikLanguageField';

type FormData = {
  courseCode: string;
  minCredits: number;
  maxCredits: number;
  gradingScale: GradingScale;
  teacherEmail: string;
  assistantEmail: string;
  department: number;
  languageOfInstruction: Language;
  nameEn: string;
  nameFi: string;
  nameSv: string;
};

const initialValues = {
  courseCode: '',
  minCredits: 0,
  maxCredits: 0,
  gradingScale: GradingScale.Numerical,
  languageOfInstruction: Language.English,
  teacherEmail: '',
  assistantEmail: '',
  department: -1,
  nameEn: '',
  nameFi: '',
  nameSv: '',
};

type PropsType = {open: boolean; onClose: () => void};
const CreateCourseDialog = ({open, onClose}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const addCourse = useAddCourse();

  const [teachersInCharge, setTeachersInCharge] = useState<string[]>([]);
  const [assistants, setAssistants] = useState<string[]>([]);

  const ValidationSchema = z
    .object({
      courseCode: z
        .string({required_error: t('front-page.create-course.course-code-required')})
        .min(1),
      minCredits: z
        .number({required_error: t('front-page.create-course.min-credits-required')})
        .min(0, t('front-page.create-course.min-credits-negative')),
      maxCredits: z.number({required_error: t('front-page.create-course.max-credits-required')}),
      gradingScale: z.nativeEnum(GradingScale),
      languageOfInstruction: z.nativeEnum(Language),
      teacherEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      assistantEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      department: z
        .number()
        .min(0, t('front-page.create-course.department-select'))
        .max(
          departments.length - 1,
          t('front-page.create-course.department-select')
        ),
      nameEn: z
        .string({required_error: t('front-page.create-course.name-english')})
        .min(1),
      nameFi: z
        .string({required_error: t('front-page.create-course.name-finnish')})
        .min(1),
      nameSv: z
        .string({required_error: t('front-page.create-course.name-swedish')})
        .min(1),
    })
    .refine(val => val.maxCredits >= val.minCredits, {
      path: ['maxCredits'],
      message: t('front-page.create-course.max-below-min'),
    });

  const removeTeacher = (value: string): void => {
    setTeachersInCharge(teachersInCharge.filter(teacher => teacher !== value));
  };

  const removeAssistant = (value: string): void => {
    setAssistants(assistants.filter(assistant => assistant !== value));
  };

  const handleSubmit = (
    values: FormData,
    {setSubmitting}: FormikHelpers<FormData>
  ): void => {
    const courseData: NewCourseData = {
      courseCode: values.courseCode,
      minCredits: values.minCredits,
      maxCredits: values.maxCredits,
      gradingScale: values.gradingScale,
      languageOfInstruction: values.languageOfInstruction,
      department: {
        fi: departments[values.department].fi,
        sv: departments[values.department].sv,
        en: departments[values.department].en,
      },
      name: {
        fi: values.nameFi,
        sv: values.nameSv,
        en: values.nameEn,
      },
      teachersInCharge,
      assistants,
    };

    addCourse.mutate(courseData, {
      onSuccess: newCourseId => {
        navigate(`/${newCourseId}`, {replace: true});
      },
      onError: () => setSubmitting(false),
    });
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

  const confirmDiscard = async ({
    resetForm,
  }: FormikHelpers<FormData>): Promise<void> => {
    if (await AsyncConfirmationModal({confirmNavigate: true})) {
      onClose();
      resetForm();
      setTeachersInCharge([]);
      setAssistants([]);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={handleSubmit}
    >
      {form => (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          <DialogTitle>Create a new course</DialogTitle>
          <DialogContent dividers>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="courseCode"
              label={`${t('general.course-code')}*`}
              helperText={t('front-page.create-course.course-code-help')}
            />
            <FormLanguagesField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              valueFormat="name%"
              labelFormat="Course name in %*"
              helperTextFormat="Give the name of the course in %."
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="department"
              label={`${t('general.organizing-department')}*`}
              helperText={t('front-page.create-course.organizing-department-help')}
              select
            >
              {departments.map((department, i) => (
                <MenuItem key={i} value={i}>
                  {department.en}
                </MenuItem>
              ))}
            </FormField>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="minCredits"
              label={`${t('front-page.create-course.min-credits')}*`}
              helperText={t('front-page.create-course.min-credits-help')}
              type="number"
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="maxCredits"
              label={`${t('front-page.create-course.max-credits')}*`}
              helperText={t('front-page.create-course.max-credits-help')}
              type="number"
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="gradingScale"
              label={`${t('front-page.create-course.grading-scale')}*`}
              helperText={t('front-page.create-course.grading-scale-help')}
              select
            >
              {Object.values(GradingScale).map(value => (
                <MenuItem key={value} value={value}>
                  {convertToClientGradingScale(value)}
                </MenuItem>
              ))}
            </FormField>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="languageOfInstruction"
              label={`${t('front-page.create-course.language')}*`}
              helperText={t('front-page.create-course.language-help')}
              select
            >
              {sisuLanguageOptions.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  {option.language}
                </MenuItem>
              ))}
            </FormField>
            <TextField
              id="teacherEmail" // Must be in camelCase to match data
              type="text"
              fullWidth
              value={form.values.teacherEmail}
              disabled={form.isSubmitting}
              label={`${t('front-page.create-course.teachers-in-charge')}*`}
              margin="normal"
              InputLabelProps={{shrink: true}}
              helperText={
                form.errors.teacherEmail ??
                (teachersInCharge.length === 0
                  ? t('front-page.create-course.input-at-least-one-teacher')
                  : teachersInCharge.includes(form.values.teacherEmail)
                    ? t('front-page.create-course.email-in-list')
                    : t('front-page.create-course.add-teacher-emails'))
              }
              error={
                form.touched.teacherEmail &&
                form.errors.teacherEmail !== undefined
              }
              onChange={form.handleChange}
            />
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              disabled={
                form.errors.teacherEmail !== undefined ||
                form.values.teacherEmail.length === 0 ||
                teachersInCharge.includes(form.values.teacherEmail) ||
                form.isSubmitting
              }
              onClick={() => {
                setTeachersInCharge(oldTeachers =>
                  oldTeachers.concat(form.values.teacherEmail)
                );
                form.setFieldValue('teacherEmail', '');
              }}
              sx={{mt: 1}}
            >
              Add
            </Button>
            <Box sx={{mt: 3, mb: 2}}>
              {teachersInCharge.length === 0 ? (
                t('front-page.create-course.add-at-least-one-teacher')
              ) : (
                <List dense>
                  {teachersInCharge.map(teacherEmail => (
                    <ListItem
                      key={teacherEmail}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          disabled={form.isSubmitting}
                          aria-label="delete"
                          onClick={() => removeTeacher(teacherEmail)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={teacherEmail} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            <TextField
              id="assistantEmail" // Must be in camelCase to match data
              type="text"
              fullWidth
              value={form.values.assistantEmail}
              disabled={form.isSubmitting}
              label={`${t('general.assistant.plural')}*`}
              margin="normal"
              InputLabelProps={{shrink: true}}
              helperText={
                form.errors.assistantEmail ??
                  (assistants.length === 0
                    ? t('front-page.create-course.input-at-least-one-assistant')
                    : assistants.includes(form.values.assistantEmail)
                      ? t('front-page.create-course.email-in-list')
                      : t('front-page.create-course.add-assistant-emails'))
              }
              error={
                form.touched.assistantEmail &&
                form.errors.assistantEmail !== undefined
              }
              onChange={form.handleChange}
            />
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              disabled={
                form.errors.assistantEmail !== undefined ||
                form.values.assistantEmail.length === 0 ||
                assistants.includes(form.values.assistantEmail) ||
                form.isSubmitting
              }
              onClick={() => {
                setAssistants(oldAssistants =>
                  oldAssistants.concat(form.values.assistantEmail)
                );
                form.setFieldValue('assistantEmail', '');
              }}
              sx={{mt: 1}}
            >
              Add
            </Button>
            <Box sx={{mt: 3, mb: 2}}>
              {assistants.length === 0 ? (
                t('front-page.create-course.no-assistants')
              ) : (
                <List dense={true}>
                  {assistants.map((emailAssistant: string) => (
                    <ListItem
                      key={emailAssistant}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          disabled={form.isSubmitting}
                          aria-label="delete"
                          onClick={(): void => {
                            removeAssistant(emailAssistant);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={emailAssistant} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              color={
                JSON.stringify(initialValues) !== JSON.stringify(form.values)
                  ? 'error'
                  : 'primary'
              }
              disabled={form.isSubmitting}
              onClick={() => {
                if (
                  JSON.stringify(initialValues) !== JSON.stringify(form.values)
                ) {
                  confirmDiscard(form);
                } else {
                  onClose();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              id="ag-create-course-btn"
              variant="contained"
              onClick={form.submitForm}
              disabled={form.isSubmitting}
            >
              {t('general.submit')}
              {form.isSubmitting && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Formik>
  );
};

export default CreateCourseDialog;
