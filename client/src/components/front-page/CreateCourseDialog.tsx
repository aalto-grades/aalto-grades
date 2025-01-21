// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Delete as DeleteIcon,
  HelpOutlined,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Alert,
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
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import {Formik, type FormikHelpers, type FormikProps} from 'formik';
import {type JSX, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  Department,
  GradingScale,
  GradingScaleSchema,
  Language,
  LanguageSchema,
  type NewCourseData,
} from '@/common/types';
import FormField from '@/components/shared/FormikField';
import FormLanguagesField from '@/components/shared/FormikLanguageField';
import {useAddCourse, useVerifyEmail} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {useLocalize} from '@/hooks/useLocalize';
import {type AssistantData, nullableDateSchema} from '@/types';
import {
  convertToClientGradingScale,
  departments,
  sisuLanguageOptions,
} from '@/utils';

type FormData = {
  courseCode: string;
  department: Department;
  minCredits: number;
  maxCredits: number;
  gradingScale: GradingScale;
  teacherEmail: string;
  assistantEmail: string;
  assistantExpiryDate: string;
  languageOfInstruction: Language;
  nameEn: string;
  nameFi: string;
  nameSv: string;
};

const initialValues = {
  courseCode: '',
  department: Department.ComputerScience,
  minCredits: 0,
  maxCredits: 0,
  gradingScale: GradingScale.Numerical,
  languageOfInstruction: Language.English,
  teacherEmail: '',
  assistantEmail: '',
  assistantExpiryDate: '',
  nameEn: '',
  nameFi: '',
  nameSv: '',
};

type PropsType = {open: boolean; forceEmail?: string; onClose: () => void};
const CreateCourseDialog = ({
  open,
  onClose,
  forceEmail,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {auth} = useAuth();
  const localize = useLocalize();
  const navigate = useNavigate();
  const addCourse = useAddCourse();
  const emailExisted = useVerifyEmail();

  const [teachersInCharge, setTeachersInCharge] = useState<string[]>(
    forceEmail ? [forceEmail] : []
  );
  const [nonExistingEmails, setNonExistingEmails] = useState<Set<string>>(
    new Set<string>()
  );
  const [assistants, setAssistants] = useState<AssistantData[]>([]);

  const ValidationSchema = z
    .object({
      courseCode: z
        .string({
          required_error: t('course.edit.course-code-required'),
        })
        .min(1, t('course.edit.course-code-required')),
      minCredits: z
        .number({
          required_error: t('course.edit.min-credits-required'),
        })
        .min(0, t('course.edit.min-credits-negative')),
      maxCredits: z.number({
        required_error: t('course.edit.max-credits-required'),
      }),
      gradingScale: GradingScaleSchema,
      languageOfInstruction: LanguageSchema,
      teacherEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      assistantEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      assistantExpiryDate: z.string().or(z.date().nullable()),
      department: z.nativeEnum(Department),
      nameEn: z
        .string({required_error: t('course.edit.name-english')})
        .min(1, t('course.edit.name-english')),
      nameFi: z
        .string({required_error: t('course.edit.name-finnish')})
        .min(1, t('course.edit.name-finnish')),
      nameSv: z
        .string({required_error: t('course.edit.name-swedish')})
        .min(1, t('course.edit.name-swedish')),
    })
    .refine(val => val.maxCredits >= val.minCredits, {
      path: ['maxCredits'],
      message: t('course.edit.max-below-min'),
    });

  const AssistantValidationSchema = z.strictObject({
    email: z.string().email(),
    expiryDate: nullableDateSchema(t),
  });

  const removeTeacher = (value: string): void => {
    setTeachersInCharge(teachersInCharge.filter(teacher => teacher !== value));
  };

  const removeAssistant = (value: AssistantData): void => {
    setAssistants(
      assistants.filter(assistant => assistant.email !== value.email)
    );
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
      department: values.department,
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
        navigate(`/${newCourseId}`);
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

  const sortedDepartments = [...departments].sort((a, b) =>
    localize(a.department).localeCompare(localize(b.department))
  );

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={handleSubmit}
    >
      {form => (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          <DialogTitle>{t('front-page.create-course')}</DialogTitle>
          <DialogContent dividers>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="courseCode"
              label={`${t('general.course-code')}*`}
              helperText={t('course.edit.course-code-help')}
            />
            <FormLanguagesField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              valueFormat="name%"
              labelFormat={`${t('course.edit.course-name-in-format')}*`}
              helperTextFormat={t('course.edit.course-name-in-help-format')}
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="department"
              label={`${t('general.organizing-department')}*`}
              helperText={t('course.edit.organizing-department-help')}
              select
            >
              {sortedDepartments.map(department => (
                <MenuItem key={department.id} value={department.id}>
                  {localize(department.department)}
                </MenuItem>
              ))}
            </FormField>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="minCredits"
              label={`${t('course.edit.min-credits')}*`}
              helperText={t('course.edit.min-credits-help')}
              type="number"
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="maxCredits"
              label={`${t('course.edit.max-credits')}*`}
              helperText={t('course.edit.max-credits-help')}
              type="number"
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="gradingScale"
              label={`${t('course.edit.grading-scale')}*`}
              helperText={t('course.edit.grading-scale-help')}
              select
            >
              {Object.values(GradingScale).map(value => (
                <MenuItem key={value} value={value}>
                  {convertToClientGradingScale(t, value)}
                </MenuItem>
              ))}
            </FormField>
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="languageOfInstruction"
              label={`${t('course.edit.language')}*`}
              helperText={t('course.edit.language-help')}
              select
            >
              {sisuLanguageOptions.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  {localize(option.language)}
                </MenuItem>
              ))}
            </FormField>
            <TextField
              id="teacherEmail" // Must be in camelCase to match data
              type="text"
              fullWidth
              value={form.values.teacherEmail}
              disabled={form.isSubmitting}
              label={t('course.edit.teachers-in-charge')}
              margin="normal"
              slotProps={{inputLabel: {shrink: true}}}
              helperText={
                form.errors.teacherEmail ??
                (teachersInCharge.length === 0
                  ? t('course.edit.input-at-least-one-teacher')
                  : teachersInCharge.includes(form.values.teacherEmail)
                    ? t('course.edit.email-in-list')
                    : t('course.edit.add-teacher-emails'))
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
              onClick={async () => {
                const teacherEmail = form.values.teacherEmail;
                const isEmailExisted = await emailExisted.mutateAsync({
                  email: teacherEmail,
                });
                if (!isEmailExisted.exists) {
                  setNonExistingEmails(oldNonExistingEmail =>
                    oldNonExistingEmail.add(teacherEmail)
                  );
                }
                setTeachersInCharge(oldTeachers =>
                  oldTeachers.concat(teacherEmail)
                );
                form.setFieldValue('teacherEmail', '');
              }}
              sx={{mt: 1}}
            >
              Add
            </Button>
            <Box sx={{mt: 3, mb: 2}}>
              {teachersInCharge.length === 0 ? (
                t('course.edit.add-at-least-one-teacher')
              ) : (
                <List dense>
                  {teachersInCharge.map(teacherEmail => (
                    <ListItem
                      key={teacherEmail}
                      secondaryAction={
                        teacherEmail !== auth?.email && (
                          <IconButton
                            edge="end"
                            disabled={
                              form.isSubmitting || teacherEmail === auth?.email
                            }
                            aria-label="delete"
                            onClick={() => removeTeacher(teacherEmail)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={teacherEmail} />
                      {nonExistingEmails.has(teacherEmail) && (
                        <Alert severity="warning">
                          {t('course.edit.user-not-exist')}
                        </Alert>
                      )}
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
              label={t('general.assistants')}
              margin="normal"
              slotProps={{inputLabel: {shrink: true}}}
              helperText={
                form.errors.assistantEmail ??
                (assistants.length === 0
                  ? t('course.edit.input-at-least-one-assistant')
                  : assistants
                        .map(assistant => assistant.email)
                        .includes(form.values.assistantEmail)
                    ? t('course.edit.email-in-list')
                    : t('course.edit.add-assistant-emails'))
              }
              error={
                form.touched.assistantEmail &&
                form.errors.assistantEmail !== undefined
              }
              onChange={form.handleChange}
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="assistantExpiryDate"
              label={t('course.edit.assistant-expiry-date')}
              helperText={t('course.edit.assistant-expiry-date-helper')}
              type="date"
              InputProps={{
                inputProps: {min: new Date().toISOString().slice(0, 10)},
              }}
            />
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              disabled={
                form.errors.assistantEmail !== undefined ||
                form.values.assistantEmail.length === 0 ||
                assistants
                  .map(assistant => assistant.email)
                  .includes(form.values.assistantEmail) ||
                form.isSubmitting
              }
              onClick={async () => {
                const assistantEmail = form.values.assistantEmail;
                const assistantExpiryDate =
                  form.values.assistantExpiryDate === ''
                    ? null
                    : form.values.assistantExpiryDate;
                const isEmailExisted = await emailExisted.mutateAsync({
                  email: assistantEmail,
                });
                if (!isEmailExisted.exists) {
                  setNonExistingEmails(oldNonExistingEmail =>
                    oldNonExistingEmail.add(assistantEmail)
                  );
                }
                setAssistants(oldAssistants =>
                  oldAssistants.concat(
                    AssistantValidationSchema.parse({
                      email: assistantEmail,
                      expiryDate: assistantExpiryDate,
                    })
                  )
                );
                form.setFieldValue('assistantEmail', '');
                form.setFieldValue('assistantExpiryDate', '');
              }}
              sx={{mt: 1}}
            >
              {t('general.add')}
            </Button>
            <Box sx={{mt: 3, mb: 2}}>
              {assistants.length === 0 ? (
                t('course.edit.no-assistants')
              ) : (
                <List dense>
                  {assistants.map((assistant: AssistantData) => (
                    <ListItem
                      key={assistant.email}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          disabled={form.isSubmitting}
                          aria-label="delete"
                          onClick={(): void => {
                            removeAssistant(assistant);
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
                      <ListItemText primary={assistant.email} />
                      {assistant.expiryDate && (
                        <div style={{display: 'flex'}}>
                          <ListItemText
                            secondary={t(
                              'course.edit.assistant-expiry-date-info',
                              {
                                expiryDate: assistant.expiryDate
                                  .toISOString()
                                  .slice(0, 10),
                              }
                            )}
                            sx={{
                              marginRight: '0.5em',
                            }}
                          />
                          <Tooltip
                            placement="top"
                            title={t(
                              'course.edit.assistant-expiry-date-change'
                            )}
                          >
                            <ListItemIcon>
                              <HelpOutlined
                                sx={{
                                  width: '0.6em',
                                }}
                              />
                            </ListItemIcon>
                          </Tooltip>
                        </div>
                      )}
                      {nonExistingEmails.has(assistant.email) && (
                        <Alert severity="warning">
                          {t('course.edit.user-not-exist')}
                        </Alert>
                      )}
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
