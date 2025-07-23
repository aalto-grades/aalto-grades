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
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {Form, Formik, type FormikHelpers, type FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useEffect, useRef, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker, useParams} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  type Department,
  DepartmentSchema,
  type EditCourseData,
  GradingScale,
  GradingScaleSchema,
  type Language,
  LanguageSchema,
  SystemRole,
} from '@/common/types';
import FormField from '@/components/shared/FormikField';
import FormLanguagesField from '@/components/shared/FormikLanguageField';
import SaveBar from '@/components/shared/SaveBar';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {
  useEditCourse,
  useGetCourse,
  useGetFinalGrades,
  useVerifyEmail,
} from '@/hooks/useApi';
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

const EditCourseView = (): JSX.Element => {
  const {t} = useTranslation();
  const {auth} = useAuth();
  const {courseId} = useParams() as {courseId: string};
  const localize = useLocalize();

  const course = useGetCourse(courseId);
  const editCourse = useEditCourse();
  const finalGrades = useGetFinalGrades(courseId);
  const emailExisted = useVerifyEmail();

  const [initTeachersInCharge, setInitTeachersInCharge] = useState<string[]>(
    []
  );
  const [nonExistingEmails, setNonExistingEmails] = useState<Set<string>>(
    new Set<string>()
  );
  const [teachersInCharge, setTeachersInCharge] = useState<string[]>([]);
  const [initAssistants, setInitAssistants] = useState<AssistantData[]>([]);
  const [assistants, setAssistants] = useState<AssistantData[]>([]);
  const [initialValues, setInitialValues] = useState<FormData | null>(null);
  const [formChanges, setFormChanges] = useState<boolean>(false);

  const changes =
    JSON.stringify(initTeachersInCharge) !== JSON.stringify(teachersInCharge) ||
    JSON.stringify(initAssistants) !== JSON.stringify(assistants);

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      (changes || formChanges) &&
      currentLocation.pathname !== nextLocation.pathname
  );

  // Warning if leaving with unsaved
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (changes) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [changes, formChanges]);

  const formRef = useRef<FormikProps<FormData>>(null);

  // Initialize when course data becomes available
  const [oldCourseData, setOldCourseData] =
    useState<typeof course.data>(undefined);
  if (course.data !== oldCourseData) {
    setOldCourseData(course.data);

    if (initialValues === null && course.data !== undefined) {
      setInitialValues({
        courseCode: course.data.courseCode,
        minCredits: course.data.minCredits,
        maxCredits: course.data.maxCredits,
        gradingScale: course.data.gradingScale,
        languageOfInstruction: course.data.languageOfInstruction,
        teacherEmail: '',
        assistantEmail: '',
        assistantExpiryDate: '',
        department: course.data.department,
        nameEn: course.data.name.en,
        nameFi: course.data.name.fi,
        nameSv: course.data.name.sv,
      });

      setInitTeachersInCharge(
        course.data.teachersInCharge.map(teacher => teacher.email)
      );
      setTeachersInCharge(
        course.data.teachersInCharge.map(teacher => teacher.email)
      );
      setInitAssistants(
        course.data.assistants.map(assistant => ({
          email: assistant.email,
          expiryDate: assistant.expiryDate
            ? new Date(assistant.expiryDate)
            : null,
        }))
      );
      setAssistants(
        course.data.assistants.map(assistant => ({
          email: assistant.email,
          expiryDate: assistant.expiryDate
            ? new Date(assistant.expiryDate)
            : null,
        }))
      );
      setFormChanges(false);
    }
  }

  const formChanged = (formData: FormData): boolean => {
    if (initialValues === null) return false;

    return !Object.keys(initialValues)
      .filter(key => key !== 'teacherEmail' && key !== 'assistantEmail')
      .every(
        key =>
          JSON.stringify(initialValues[key as keyof FormData]) ===
          JSON.stringify(formData[key as keyof FormData])
      );
  };

  const AssistantValidationSchema = z.strictObject({
    email: z.email(),
    expiryDate: nullableDateSchema(t),
  });

  const removeTeacher = (value: string): void => {
    setTeachersInCharge(teachersInCharge.filter(teacher => teacher !== value));
  };

  const removeAssistant = (value: string): void => {
    setAssistants(assistants.filter(assistant => assistant.email !== value));
  };

  const handleSubmit = (
    values: FormData,
    {setSubmitting}: FormikHelpers<FormData>
  ): void => {
    const courseData: EditCourseData = {
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
      teachersInCharge: teachersInCharge.map(teacherEmail => teacherEmail),
      assistants: assistants.map(assistant => assistant),
    };

    editCourse.mutate(
      {courseId: courseId, course: courseData},
      {
        onSuccess: () => {
          enqueueSnackbar(t('course.edit.saved'), {variant: 'success'});
          setSubmitting(false);
          setInitialValues(values);
          setInitTeachersInCharge(teachersInCharge);
          setInitAssistants(assistants);
          setFormChanges(false);
        },
        onError: () => setSubmitting(false),
      }
    );

    setNonExistingEmails(new Set<string>());
  };

  const ValidationSchema = z
    .strictObject({
      courseCode: z
        .string({
          error: t('course.edit.course-code-required'),
        })
        .min(1, t('course.edit.course-code-required')),
      minCredits: z
        .number({
          error: t('course.edit.min-credits-required'),
        })
        .min(0, t('course.edit.min-credits-negative')),
      maxCredits: z.number({
        error: t('course.edit.max-credits-required'),
      }),
      gradingScale: GradingScaleSchema,
      languageOfInstruction: LanguageSchema,
      teacherEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      assistantEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      department: DepartmentSchema,
      nameEn: z
        .string({error: t('course.edit.name-english')})
        .min(1, t('course.edit.name-english')),
      nameFi: z
        .string({error: t('course.edit.name-finnish')})
        .min(1, t('course.edit.name-finnish')),
      nameSv: z
        .string({error: t('course.edit.name-swedish')})
        .min(1, t('course.edit.name-swedish')),
    })
    .refine(val => val.maxCredits >= val.minCredits, {
      path: ['maxCredits'],
      message: t('course.edit.max-below-min'),
    });

  const sortedDepartments = [...departments].sort((a, b) =>
    localize(a.department).localeCompare(localize(b.department))
  );

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    setFormChanges(formChanged(values)); // Hacky workaround to get form data

    const result = ValidationSchema.safeParse(values);
    if (result.success) return;

    const treeifiedError = z.treeifyError(result.error);
    const fieldErrors = treeifiedError.properties || {};
    return Object.fromEntries(
      Object.entries(fieldErrors).map(([key, val]) => [key, val.errors[0]]) // Only the first error
    );
  };

  const confirmDiscard = async ({
    resetForm,
  }: FormikHelpers<FormData>): Promise<void> => {
    if (await AsyncConfirmationModal({confirmNavigate: true})) {
      resetForm();
      setTeachersInCharge(initTeachersInCharge);
      setAssistants(initAssistants);
      setFormChanges(false);
    }
  };

  const isDisabled = (): boolean => {
    if (auth?.role === SystemRole.Admin) {
      return false;
    } else {
      return !(auth?.email && initTeachersInCharge.includes(auth.email));
    }
  };

  if (!initialValues || finalGrades.data === undefined)
    return <Typography>{t('general.loading')}</Typography>;

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={handleSubmit}
      innerRef={formRef}
    >
      {form => (
        <Form>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Typography width="fit-content" variant="h2">
              {t('course.edit.title')}
            </Typography>
            <SaveBar
              show={changes || formChanges}
              handleDiscard={async () => confirmDiscard(form)}
              loading={form.isSubmitting}
              disabled={!form.isValid}
            />
          </div>
          <UnsavedChangesDialog
            blocker={blocker}
            handleDiscard={() => {
              form.resetForm();
              setTeachersInCharge(initTeachersInCharge);
              setAssistants(initAssistants);
            }}
          />

          <Grid
            container
            justifyContent="flex-start"
            gap={5}
            sx={{overflow: 'auto', height: '100%'}}
          >
            <Grid size={{xs: 12, md: 5.5}}>
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="courseCode"
                disabled={isDisabled()}
                label={`${t('general.course-code')}*`}
                helperText={t('course.edit.course-code-help')}
              />
              <FormLanguagesField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                disabled={isDisabled()}
                valueFormat="name%"
                labelFormat={`${t('course.edit.course-name-in-format')}*`}
                helperTextFormat={t('course.edit.course-name-in-help-format')}
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="department"
                disabled={isDisabled()}
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
                disabled={isDisabled()}
                label={`${t('course.edit.min-credits')}*`}
                helperText={t('course.edit.min-credits-help')}
                type="number"
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="maxCredits"
                disabled={isDisabled()}
                label={`${t('course.edit.max-credits')}*`}
                helperText={t('course.edit.max-credits-help')}
                type="number"
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="gradingScale"
                disabled={isDisabled() && finalGrades.data.length > 0}
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
                disabled={isDisabled()}
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
            </Grid>
            <Grid size={{xs: 12, md: 5.5}}>
              <TextField
                id="teacherEmail" // Must be in camelCase to match data
                type="text"
                fullWidth
                value={form.values.teacherEmail}
                disabled={isDisabled() || form.isSubmitting}
                label={`${t('course.edit.teachers-in-charge')}*`}
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
                  isDisabled() ||
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
                sx={{mt: 1, float: 'left'}}
              >
                {t('general.add')}
              </Button>
              <Box sx={{mt: 8, mb: 2}}>
                {teachersInCharge.length === 0 ? (
                  t('course.edit.add-at-least-one-teacher')
                ) : (
                  <List dense>
                    {teachersInCharge.map(teacherEmail => (
                      <ListItem
                        key={teacherEmail}
                        secondaryAction={
                          auth?.role === SystemRole.Admin && (
                            <IconButton
                              edge="end"
                              disabled={form.isSubmitting}
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
                label={`${t('general.assistants')}*`}
                margin="normal"
                slotProps={{inputLabel: {shrink: true}}}
                helperText={
                  form.errors.assistantEmail ??
                  (assistants
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
                  // Allow submit of email only if validation passes and not on list.
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
                sx={{mt: 1, float: 'left'}}
              >
                {t('general.add')}
              </Button>
              <Box sx={{mt: 8, mb: 2}}>
                {assistants.length === 0 ? (
                  t('course.edit.no-assistants')
                ) : (
                  <List dense>
                    {assistants.map(assistant => (
                      <ListItem
                        key={assistant.email}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            disabled={form.isSubmitting}
                            aria-label="delete"
                            onClick={() => removeAssistant(assistant.email)}
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
                          <div style={{display: 'flex', marginLeft: '0.5em'}}>
                            <ListItemText
                              secondary={t(
                                assistant.expiryDate.getDate() >=
                                  new Date().getDate()
                                  ? 'course.edit.assistant-expiry-date-info'
                                  : 'course.edit.assistant-expired-at',
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
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default EditCourseView;
