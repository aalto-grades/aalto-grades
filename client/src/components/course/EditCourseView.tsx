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
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {Form, Formik, FormikHelpers, FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useRef, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker, useParams} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  EditCourseData,
  GradingScale,
  Language,
  SystemRole,
} from '@/common/types';
import FormField from '@/components/shared/FormikField';
import FormLanguagesField from '@/components/shared/FormikLanguageField';
import SaveBar from '@/components/shared/SaveBar';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {useGetFinalGrades} from '@/hooks/api/finalGrade';
import {useEditCourse, useGetCourse} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {useLocalize} from '@/hooks/useLocalize';
import {convertToClientGradingScale} from '@/utils/textFormat';
import {departments, sisuLanguageOptions} from '@/utils/utils';

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

const EditCourseView = (): JSX.Element => {
  const {t} = useTranslation();
  const localize = useLocalize();
  const {courseId} = useParams() as {courseId: string};
  const {auth} = useAuth();

  const course = useGetCourse(courseId);
  const editCourse = useEditCourse();
  const finalGrades = useGetFinalGrades(courseId);

  const [initTeachersInCharge, setInitTeachersInCharge] = useState<string[]>(
    []
  );
  const [teachersInCharge, setTeachersInCharge] = useState<string[]>([]);
  const [initAssistants, setInitAssistants] = useState<string[]>([]);
  const [assistants, setAssistants] = useState<string[]>([]);
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
      if (changes || formChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [changes, formChanges]);

  const formRef = useRef<FormikProps<FormData>>(null);

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
        department: departments.findIndex(
          department =>
            department.en === course.data.department.en ||
            department.fi === course.data.department.fi ||
            department.sv === course.data.department.sv
        ),
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
        course.data.assistants.map(assistant => assistant.email)
      );
      setAssistants(course.data.assistants.map(assistant => assistant.email));
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
    const courseData: EditCourseData = {
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
  };

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
      gradingScale: z.nativeEnum(GradingScale),
      languageOfInstruction: z.nativeEnum(Language),
      teacherEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      assistantEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      department: z
        .number()
        .min(0, t('course.edit.department-select'))
        .max(departments.length - 1, t('course.edit.department-select')),
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

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    setFormChanges(formChanged(values)); // Hacky workaround to get form data
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
      resetForm();
      setTeachersInCharge(initTeachersInCharge);
      setAssistants(initAssistants);
      setFormChanges(false);
    }
  };

  if (!initialValues || finalGrades.data === undefined)
    return <Typography>{t('general.loading')}</Typography>;

  return (
    <>
      <Formik
        initialValues={initialValues}
        validate={validateForm}
        onSubmit={handleSubmit}
        innerRef={formRef}
      >
        {form => (
          <>
            <Form>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Typography width={'fit-content'} variant="h2">
                  {t('course.edit.title')}
                </Typography>
                <SaveBar
                  show={changes || formChanges}
                  handleDiscard={() => confirmDiscard(form)}
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
                <Grid md={5}>
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="courseCode"
                    disabled={auth?.role !== SystemRole.Admin}
                    label={`${t('general.course-code')}*`}
                    helperText={t('course.edit.course-code-help')}
                  />
                  <FormLanguagesField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    disabled={auth?.role !== SystemRole.Admin}
                    valueFormat="name%"
                    labelFormat={`${t('course.edit.course-name-in-format')}*`}
                    helperTextFormat={t(
                      'course.edit.course-name-in-help-format'
                    )}
                  />
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="department"
                    disabled={auth?.role !== SystemRole.Admin}
                    label={`${t('general.organizing-department')}*`}
                    helperText={t('course.edit.organizing-department-help')}
                    select
                  >
                    {departments.map((department, i) => (
                      <MenuItem key={i} value={i}>
                        {localize(department)}
                      </MenuItem>
                    ))}
                  </FormField>
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="minCredits"
                    disabled={auth?.role !== SystemRole.Admin}
                    label={`${t('course.edit.min-credits')}*`}
                    helperText={t('course.edit.min-credits-help')}
                    type="number"
                  />
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="maxCredits"
                    disabled={auth?.role !== SystemRole.Admin}
                    label={`${t('course.edit.max-credits')}*`}
                    helperText={t('course.edit.max-credits-help')}
                    type="number"
                  />
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="gradingScale"
                    disabled={
                      auth?.role !== SystemRole.Admin &&
                      finalGrades.data.length > 0
                    }
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
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="languageOfInstruction"
                    disabled={auth?.role !== SystemRole.Admin}
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
                <Grid md={5}>
                  <TextField
                    id="teacherEmail" // Must be in camelCase to match data
                    type="text"
                    fullWidth
                    value={form.values.teacherEmail}
                    disabled={
                      auth?.role !== SystemRole.Admin || form.isSubmitting
                    }
                    label={`${t('course.edit.teachers-in-charge')}*`}
                    margin="normal"
                    InputLabelProps={{shrink: true}}
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
                      auth?.role !== SystemRole.Admin ||
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
                    sx={{mt: 1, float: 'left'}}
                  >
                    Add
                  </Button>
                  <Box sx={{mt: 8, mb: 2, width: '50%'}}>
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
                    InputLabelProps={{shrink: true}}
                    helperText={
                      form.errors.assistantEmail ??
                      (assistants.includes(form.values.assistantEmail)
                        ? t('course.edit.email-in-list')
                        : t('course.edit.add-assistant-emails'))
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
                      // Allow submit of email only if validation passes and not on list.
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
                    sx={{mt: 1, float: 'left'}}
                  >
                    {t('general.add')}
                  </Button>
                  <Box sx={{mt: 8, mb: 2, width: '50%'}}>
                    {assistants.length === 0 ? (
                      t('course.edit.no-assistants')
                    ) : (
                      <List dense>
                        {assistants.map(emailAssistant => (
                          <ListItem
                            key={emailAssistant}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                disabled={form.isSubmitting}
                                aria-label="delete"
                                onClick={() => removeAssistant(emailAssistant)}
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
                </Grid>
              </Grid>
            </Form>
          </>
        )}
      </Formik>
    </>
  );
};

export default EditCourseView;
