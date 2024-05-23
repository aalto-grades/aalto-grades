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
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {Form, Formik, FormikHelpers, FormikProps} from 'formik';
import {enqueueSnackbar} from 'notistack';
import {
  HTMLInputTypeAttribute,
  JSX,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import {useBlocker, useParams} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  EditCourseData,
  GradingScale,
  Language,
} from '@/common/types';
import {useEditCourse, useGetCourse} from '../../hooks/useApi';
import {sisuLanguageOptions} from '../../utils';
import {convertToClientGradingScale} from '../../utils/textFormat';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

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
    departmentEn: z
      .string({
        required_error:
          'Please input the organizing department of the course in English',
      })
      .min(1),
    departmentFi: z
      .string({
        required_error:
          'Please input the organizing department of the course in Finnish',
      })
      .min(1),
    departmentSv: z
      .string({
        required_error:
          'Please input the organizing department of the course in Swedish',
      })
      .min(1),
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
  departmentEn: string;
  departmentFi: string;
  departmentSv: string;
  languageOfInstruction: Language;
  nameEn: string;
  nameFi: string;
  nameSv: string;
};

const FormField = ({
  form,
  value,
  label,
  helperText,
  select,
  type,
  children,
}: {
  form: FormikProps<FormData>;
  value: keyof FormData;
  label: string;
  helperText: string;
  select?: boolean;
  type?: HTMLInputTypeAttribute;
} & PropsWithChildren): JSX.Element => (
  <TextField
    id={value}
    name={value}
    type={type ?? 'text'}
    fullWidth
    value={form.values[value]}
    disabled={form.isSubmitting}
    label={label}
    InputLabelProps={{shrink: true}}
    margin="normal"
    helperText={form.errors[value] ? form.errors[value] : helperText}
    error={form.touched[value] && form.errors[value] !== undefined}
    onChange={form.handleChange}
    select={select}
    // SelectProps={{native: true}}
    sx={{textAlign: 'left'}}
  >
    {children}
  </TextField>
);

const languages = [
  {value: 'En', name: 'English'},
  {value: 'Fi', name: 'Finnish'},
  {value: 'Sv', name: 'Swedish'},
];
const FormLanguagesField = ({
  form,
  valueFormat,
  labelFormat,
  helperTextFormat,
}: {
  form: FormikProps<FormData>;
  valueFormat: string;
  labelFormat: string;
  helperTextFormat: string;
}): JSX.Element => (
  <>
    {languages.map(language => (
      <FormField
        key={language.value}
        form={form}
        value={valueFormat.replace('%', language.value) as keyof FormData}
        label={labelFormat.replace('%', language.name)}
        helperText={helperTextFormat.replace('%', language.name)}
      />
    ))}
  </>
);

const EditCourseView = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const editCourse = useEditCourse();
  const course = useGetCourse(courseId);

  const [initTeachersInCharge, setInitTeachersInCharge] = useState<string[]>(
    []
  );
  const [teachersInCharge, setTeachersInCharge] = useState<string[]>([]);
  const [initAssistants, setInitAssistants] = useState<string[]>([]);
  const [assistants, setAssistants] = useState<string[]>([]);
  const [initialValues, setInitialValues] = useState<FormData | null>(null);

  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState<boolean>(false);

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
      departmentEn: course.data.department.en,
      departmentFi: course.data.department.fi,
      departmentSv: course.data.department.sv,
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
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: values.languageOfInstruction,
      department: {
        fi: values.departmentFi,
        sv: values.departmentSv,
        en: values.departmentEn,
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

  const changed = (formData: FormData): boolean => {
    if (initialValues === null) return false;
    return (
      JSON.stringify(initTeachersInCharge) !==
        JSON.stringify(teachersInCharge) ||
      !Object.keys(initialValues)
        .filter(key => key !== 'teacherEmail')
        .every(
          key =>
            JSON.stringify(initialValues[key as keyof FormData]) ===
            JSON.stringify(formData[key as keyof FormData])
        )
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

  if (!initialValues) return <Typography>Loading</Typography>;

  return (
    <>
      <Formik
        initialValues={initialValues}
        validate={validateForm}
        onSubmit={handleSubmit}
      >
        {form => (
          <>
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
            <Form>
              <Grid container justifyContent="space-around">
                <Grid item xs={5.5}>
                  <FormField
                    form={form}
                    value="courseCode"
                    label="Course Code*"
                    helperText="Give code for the new course."
                  />
                  <FormLanguagesField
                    form={form}
                    valueFormat="name%"
                    labelFormat="Course Name in %*"
                    helperTextFormat="Give the name of the course in %."
                  />
                  <FormLanguagesField
                    form={form}
                    valueFormat="department%"
                    labelFormat="Organizing department in %*"
                    helperTextFormat="Give the organizing department of the new course in %."
                  />
                  <FormField
                    form={form}
                    value="minCredits"
                    label="Minimum Course Credits (ECTS)*"
                    helperText="Input minimum credits."
                    type="number"
                  />
                  <FormField
                    form={form}
                    value="maxCredits"
                    label="Maximum Course Credits (ECTS)*"
                    helperText="Input maximum credits."
                    type="number"
                  />
                  <FormField
                    form={form}
                    value="gradingScale"
                    label="Grading Scale*"
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
                    form={form}
                    value="languageOfInstruction"
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
                <Grid item xs={5.5}>
                  <TextField
                    id="teacherEmail"
                    type="text"
                    fullWidth
                    value={form.values.teacherEmail}
                    disabled={form.isSubmitting}
                    label="Teachers In Charge*"
                    margin="normal"
                    InputLabelProps={{shrink: true}}
                    helperText={
                      form.errors.teacherEmail ?? teachersInCharge.length === 0
                        ? 'Input the email address of at least one teacher in charge of the course'
                        : teachersInCharge.includes(form.values.teacherEmail)
                          ? 'Email already on list.'
                          : 'Add emails of the teachers in charge of the course.'
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
                    id="assistantEmail"
                    type="text"
                    fullWidth
                    value={form.values.assistantEmail}
                    disabled={form.isSubmitting}
                    label="Assistants"
                    margin="normal"
                    InputLabelProps={{shrink: true}}
                    helperText={
                      form.errors.assistantEmail ??
                      assistants.includes(form.values.assistantEmail)
                        ? 'Email already on list.'
                        : 'Add emails of the assistants of the course.'
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
                <Grid item xs={12}>
                  <Button
                    id="ag_create_course_btn"
                    variant={'contained'}
                    type="submit"
                    disabled={form.isSubmitting}
                    sx={{float: 'right'}}
                  >
                    Save
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
                  {changed(form.values) && (
                    <Button
                      variant="outlined"
                      disabled={form.isSubmitting}
                      sx={{float: 'right', mr: 2}}
                      color="error"
                      onClick={() => setUnsavedDialogOpen(true)}
                    >
                      Discard changes
                    </Button>
                  )}
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
