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
import {useBlocker, useParams} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  EditCourseData,
  GradingScale,
  Language,
  SystemRole,
} from '@/common/types';
import {useGetFinalGrades} from '../../hooks/api/finalGrade';
import {useEditCourse, useGetCourse} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {convertToClientGradingScale} from '../../utils/textFormat';
import {departments, sisuLanguageOptions} from '../../utils/utils';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import FormField from '../shared/FormikField';
import FormLanguagesField from '../shared/FormikLanguageField';
import SaveBar from '../shared/SaveBar';

const ValidationSchema = z
  .object({
    courseCode: z
      .string({required_error: 'Course code is required (e.g. CS-A1111)'})
      .min(1),
    minCredits: z
      .number({required_error: 'Minimum credits is required'})
      .min(0, 'Minimum credits cannot be negative'),
    maxCredits: z.number({required_error: 'Maximum credits is required'}),
    gradingScale: z.nativeEnum(GradingScale),
    languageOfInstruction: z.nativeEnum(Language),
    teacherEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
    assistantEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
    department: z
      .number()
      .min(0, 'Please select the organizing department of the course')
      .max(
        departments.length - 1,
        'Please select the organizing department of the course'
      ),
    nameEn: z
      .string({required_error: 'Please input a valid course name in English'})
      .min(1),
    nameFi: z
      .string({required_error: 'Please input a valid course name in Finnish'})
      .min(1),
    nameSv: z
      .string({required_error: 'Please input a valid course name in Swedish'})
      .min(1),
  })
  .refine(val => val.maxCredits >= val.minCredits, {
    path: ['maxCredits'],
    message: 'Maximum credits cannot be lower than minimum credits',
  });

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

  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState<boolean>(false);

  const formRef = useRef<FormikProps<FormData>>(null);

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      unsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Warning if leaving with unsaved
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsavedChanges]);

  useEffect(() => {
    if (initialValues || !course.data) return;
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
    setInitAssistants(course.data.assistants.map(assistant => assistant.email));
    setAssistants(course.data.assistants.map(assistant => assistant.email));
  }, [course.data]); // eslint-disable-line react-hooks/exhaustive-deps

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
          enqueueSnackbar('Course details saved.', {variant: 'success'});
          setSubmitting(false);
          setInitialValues(values);
          setInitTeachersInCharge(teachersInCharge);
          setInitAssistants(assistants);
          setUnsavedChanges(false);
        },
        onError: () => {
          setSubmitting(false);
        },
      }
    );
  };

  const changed = (formData?: FormData): boolean => {
    if (initialValues === null) return false;
    return (
      JSON.stringify(initTeachersInCharge) !==
        JSON.stringify(teachersInCharge) ||
      JSON.stringify(initAssistants) !== JSON.stringify(assistants) ||
      (formData
        ? !Object.keys(initialValues)
            .filter(key => key !== 'teacherEmail' && key !== 'assistantEmail')
            .every(
              key =>
                JSON.stringify(initialValues[key as keyof FormData]) ===
                JSON.stringify(formData[key as keyof FormData])
            )
        : false)
    );
  };

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    setUnsavedChanges(changed(values)); // Hacky workaround to get form data
    const result = ValidationSchema.safeParse(values);
    if (result.success) return;
    const fieldErrors = result.error.formErrors.fieldErrors;
    return Object.fromEntries(
      Object.entries(fieldErrors).map(([key, val]) => [key, val[0]]) // Only the first error
    );
  };

  useEffect(() => {
    setUnsavedChanges(changed());
  }, [assistants, teachersInCharge, initTeachersInCharge, initAssistants]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialValues || finalGrades.data === undefined)
    return <Typography>Loading</Typography>;

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
                  Edit course
                </Typography>
                <SaveBar
                  show={unsavedChanges}
                  handleDiscard={() => setUnsavedDialogOpen(true)}
                  loading={form.isSubmitting}
                  disabled={!form.isValid}
                />
              </div>
              <UnsavedChangesDialog
                open={unsavedDialogOpen || blocker.state === 'blocked'}
                onClose={() => {
                  setUnsavedDialogOpen(false);
                  if (blocker.state === 'blocked') blocker.reset();
                }}
                handleDiscard={() => {
                  form.resetForm();
                  setTeachersInCharge(initTeachersInCharge);
                  setAssistants(initAssistants);

                  if (blocker.state === 'blocked') {
                    blocker.proceed();
                  }
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
                    label="Course code*"
                    helperText="Give code for the course."
                  />
                  <FormLanguagesField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    disabled={auth?.role !== SystemRole.Admin}
                    valueFormat="name%"
                    labelFormat="Course name in %*"
                    helperTextFormat="Give the name of the course in %."
                  />
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="department"
                    disabled={auth?.role !== SystemRole.Admin}
                    label="Organizing department*"
                    helperText="Select the organizing department of the course"
                    select
                  >
                    {departments.map((department, i) => (
                      <MenuItem key={i} value={i}>
                        {department.en}
                      </MenuItem>
                    ))}
                  </FormField>
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="minCredits"
                    disabled={auth?.role !== SystemRole.Admin}
                    label="Minimum course credits (ECTS)*"
                    helperText="Input minimum credits."
                    type="number"
                  />
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="maxCredits"
                    disabled={auth?.role !== SystemRole.Admin}
                    label="Maximum course credits (ECTS)*"
                    helperText="Input maximum credits."
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
                    label="Grading scale*"
                    helperText="Grading scale of the course, e.g., 0-5 or pass/fail."
                    select
                  >
                    {Object.values(GradingScale).map(value => (
                      <MenuItem key={value} value={value}>
                        {convertToClientGradingScale(value)}
                      </MenuItem>
                    ))}
                  </FormField>
                  <FormField
                    form={
                      form as unknown as FormikProps<{[key: string]: unknown}>
                    }
                    value="languageOfInstruction"
                    disabled={auth?.role !== SystemRole.Admin}
                    label="Course language*"
                    helperText="Language in which the course will be conducted."
                    select
                  >
                    {sisuLanguageOptions.map(option => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.language}
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
                    label="Teachers in charge*"
                    margin="normal"
                    InputLabelProps={{shrink: true}}
                    helperText={
                      form.errors.teacherEmail ??
                      (teachersInCharge.length === 0
                        ? 'Input the email address of at least one teacher in charge of the course'
                        : teachersInCharge.includes(form.values.teacherEmail)
                          ? 'Email already on list.'
                          : 'Add emails of the teachers in charge of the course.')
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
                      'Add at least one teacher in charge to the course'
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
                    label="Assistants"
                    margin="normal"
                    InputLabelProps={{shrink: true}}
                    helperText={
                      form.errors.assistantEmail ??
                      (assistants.includes(form.values.assistantEmail)
                        ? 'Email already on list.'
                        : 'Add emails of the assistants of the course.')
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
                    Add
                  </Button>
                  <Box sx={{mt: 8, mb: 2, width: '50%'}}>
                    {assistants.length === 0 ? (
                      'No assistants'
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
