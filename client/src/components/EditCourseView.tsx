// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData, UserData } from 'aalto-grades-common/types';
import { Form, Formik, FormikProps } from 'formik';
import {
  Delete as DeleteIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  Avatar, Box, Button, CircularProgress, Container, IconButton,
  List, ListItem, ListItemAvatar, ListItemText, TextField, Typography
} from '@mui/material';
import { ChangeEvent, HTMLInputTypeAttribute, useState } from 'react';
import { NavigateFunction, Params, useNavigate, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';
import * as yup from 'yup';

import UnsavedChangesDialog from './alerts/UnsavedChangesDialog';
import NotFound from './NotFound';

import {
  useAddCourse, UseAddCourseResult,
  useEditCourse, UseEditCourseResult,
  useGetCourse
} from '../hooks/useApi';
import { State } from '../types';

interface FormData {
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  teacherEmail: string,
  departmentEn: string,
  departmentFi: string,
  departmentSv: string,
  nameEn: string,
  nameFi: string,
  nameSv: string
}

function EditCourseTextField(props: {
  form: FormikProps<FormData>,
  onChange: (e: React.ChangeEvent<Element>) => void,
  value: keyof FormData,
  label: string,
  helperText: string,
  type?: HTMLInputTypeAttribute
}): JSX.Element {
  return (
    <TextField
      id={props.value}
      type={props.type ?? 'text'}
      fullWidth
      value={props.form.values[props.value]}
      disabled={props.form.isSubmitting}
      label={props.label}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      helperText={props.form.errors[props.value]
        ? props.form.errors[props.value]
        : props.helperText
      }
      error={props.form.touched[props.value] && Boolean(props.form.errors[props.value])}
      onChange={props.onChange}
    />
  );
}

function EditCourseLanguageTextFields(props: {
  form: FormikProps<FormData>,
  onChange: (e: React.ChangeEvent<Element>) => void,
  valueFormat: string,
  labelFormat: string,
  helperTextFormat: string
}): JSX.Element {

  interface TextFieldLanguage {
    value: string,
    name: string
  }

  const languages: Array<TextFieldLanguage> = [
    { value: 'En', name: 'English' },
    { value: 'Fi', name: 'Finnish' },
    { value: 'Sv', name: 'Swedish' }
  ];

  return (
    <>
      {
        languages.map((language: TextFieldLanguage) => (
          <EditCourseTextField
            key={language.value}
            form={props.form}
            onChange={props.form.handleChange}
            value={props.valueFormat.replace('%', language.value) as keyof FormData}
            label={props.labelFormat.replace('%', language.name)}
            helperText={props.helperTextFormat.replace('%', language.name)}
          />
        ))
      }
    </>
  );
}

export default function EditCourseView(): JSX.Element {

  const navigate: NavigateFunction = useNavigate();
  const { modification, courseId }: Params = useParams();

  // Check for invalid paths
  if (
    (modification === 'create' && courseId)
      || (modification === 'edit' && !courseId)
      || (modification !== 'create' && modification !== 'edit')
  ) {
    return (
      <NotFound/>
    );
  }

  const addCourse: UseAddCourseResult = useAddCourse();

  const editCourse: UseEditCourseResult = useEditCourse({
    onSuccess: () => {
      navigate(`/course-view/${courseId}`, { replace: true });
    }
  });

  const course: UseQueryResult<CourseData> = useGetCourse(
    courseId ?? -1, { enabled: Boolean(modification === 'edit' && courseId) }
  );

  const [teachersInCharge, setTeachersInCharge]: State<Array<string>> =
    useState<Array<string>>([]);
  const [email, setEmail]: State<string> = useState('');
  const [showDialog, setShowDialog]: State<boolean> = useState(false);
  const [initialValues, setInitialValues]: State<FormData | null> =
    useState<FormData | null>(null);

  if (!initialValues) {
    if (modification === 'edit' && course.data) {
      setInitialValues({
        courseCode: course.data.courseCode,
        minCredits: course.data.minCredits,
        maxCredits: course.data.maxCredits,
        teacherEmail: '',
        departmentEn: course.data.department.en,
        departmentFi: course.data.department.fi,
        departmentSv: course.data.department.sv,
        nameEn: course.data.name.en,
        nameFi: course.data.name.fi,
        nameSv: course.data.name.sv
      });

      if (course.data.teachersInCharge) {
        setTeachersInCharge(
          course.data.teachersInCharge.map((teacher: UserData) => teacher.email ?? '')
        );
      }
    } else if (modification === 'create') {
      setInitialValues({
        courseCode: '',
        minCredits: 0,
        maxCredits: 0,
        teacherEmail: '',
        departmentEn: '',
        departmentFi: '',
        departmentSv: '',
        nameEn: '',
        nameFi: '',
        nameSv: ''
      });
    }
  }

  function removeTeacher(value: string): void {
    setTeachersInCharge(teachersInCharge.filter((teacher: string) => teacher !== value));
  }

  function addTeacher(): void {
    setTeachersInCharge([...teachersInCharge, email]);
  }

  async function handleSubmit(values: FormData): Promise<void> {
    const courseData: CourseData = {
      courseCode: values.courseCode,
      minCredits: values.minCredits,
      maxCredits: values.maxCredits,
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
      teachersInCharge: teachersInCharge.map((email: string) => {
        return {
          email
        };
      })
    };

    if (modification === 'create') {
      addCourse.mutate(courseData, {
        onSuccess: (courseId: number) => {
          navigate(`/course-view/${courseId}`, { replace: true });
        }
      });
    } else if (modification === 'edit' && courseId) {
      editCourse.mutate({ courseId: courseId, course: courseData });
    }
  }

  return (
    <>
      <Typography variant="h1" sx={{ flexGrow: 1, mb: 4 }}>
        {(modification === 'create') ? 'Create a New Course' : 'Edit a Course'}
      </Typography>
      <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
        {
          (initialValues) ? (
            <Formik
              initialValues={initialValues}
              validationSchema={yup.object({
                courseCode: yup.string()
                  .min(1)
                  .required('Course code is required (e.g. CS-A1111)'),
                minCredits: yup.number()
                  .min(0, 'Minimum credits cannot be negative')
                  .required('Minimum credits is required'),
                maxCredits: yup.number()
                  .min(
                    yup.ref('minCredits'),
                    'Maximum credits cannot be lower than minimum credits'
                  )
                  .required('Maximum credits is required'),
                teacherEmail: yup.string()
                  .email('Please input valid email address')
                  .notRequired(),
                departmentEn: yup.string()
                  .min(1)
                  .required('Please input the organizing department of the course in English'),
                departmentFi: yup.string()
                  .min(1)
                  .required('Please input the organizing department of the course in Finnish'),
                departmentSv: yup.string()
                  .min(1)
                  .required('Please input the organizing department of the course in Swedish'),
                nameEn: yup.string()
                  .min(1)
                  .required('Please input a valid course name in English'),
                nameFi: yup.string()
                  .min(1)
                  .required('Please input a valid course name in Finnish'),
                nameSv: yup.string()
                  .min(1)
                  .required('Please input a valid course name in Swedish')
              })}
              onSubmit={handleSubmit}
            >
              {(form: FormikProps<FormData>): JSX.Element => (
                <Form>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    boxShadow: 2,
                    borderRadius: 2,
                    my: 2,
                    p: 2
                  }}>
                    <EditCourseTextField
                      onChange={form.handleChange}
                      form={form}
                      value='courseCode'
                      label='Course Code*'
                      helperText='Give code for the new course.'
                    />
                    <EditCourseLanguageTextFields
                      form={form}
                      onChange={form.handleChange}
                      valueFormat='name%'
                      labelFormat='Course Name in %*'
                      helperTextFormat='Give the name of the course in %.'
                    />
                    <EditCourseLanguageTextFields
                      form={form}
                      onChange={form.handleChange}
                      valueFormat='department%'
                      labelFormat='Organizing department in %*'
                      helperTextFormat='Give the organizing department of the new course in %.'
                    />
                    <EditCourseTextField
                      form={form}
                      onChange={form.handleChange}
                      value='minCredits'
                      label='Minimum Course Credits (ECTS)*'
                      helperText='Input minimum credits.'
                      type='number'
                    />
                    <EditCourseTextField
                      form={form}
                      onChange={form.handleChange}
                      value='maxCredits'
                      label='Maximum Course Credits (ECTS)*'
                      helperText='Input maximum credits.'
                      type='number'
                    />
                    <TextField
                      id="teacherEmail"
                      type="text"
                      fullWidth
                      value={form.values.teacherEmail}
                      disabled={form.isSubmitting}
                      label="Teachers In Charge*"
                      margin='normal'
                      InputLabelProps={{ shrink: true }}
                      helperText={form.errors.teacherEmail ? (
                        form.errors.teacherEmail
                      ) : (
                        (teachersInCharge.length === 0) ? (
                          'Input the email address of at least one teacher in charge of the course'
                        ) : (
                          teachersInCharge.includes(email)
                            ? 'Email already on list.'
                            : 'Add emails of the teachers in charge of the course.'
                        )
                      )}
                      error={form.touched.teacherEmail && Boolean(form.errors.teacherEmail)}
                      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
                        setEmail(e.currentTarget.value);
                        form.handleChange(e);
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<PersonAddAlt1Icon />}
                      disabled={
                        // Allow submit of email only if validation passes and not on list.
                        Boolean(form.errors.teacherEmail) ||
                        form.values.teacherEmail.length === 0 ||
                        teachersInCharge.includes(email) ||
                        form.isSubmitting
                      }
                      onClick={(): void => addTeacher()}
                      sx={{ mt: 1 }}
                    >
                      Add
                    </Button>
                    <Box sx={{ mt: 3, mb: 2 }}>
                      {teachersInCharge.length === 0 ? (
                        'Add at least one teacher in charge to the course'
                      ) : (
                        <List dense={true}>
                          {teachersInCharge.map((teacherEmail: string) => (
                            <ListItem
                              key={teacherEmail}
                              secondaryAction={(
                                <IconButton
                                  edge="end"
                                  disabled={form.isSubmitting}
                                  aria-label="delete"
                                  onClick={(): void => {
                                    removeTeacher(teacherEmail);
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            >
                              <ListItemAvatar>
                                <Avatar>
                                  <PersonIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={teacherEmail}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                    alignItems: 'center', pb: 6
                  }}>
                    <Button
                      size='medium'
                      variant='outlined'
                      color={initialValues != form.values ? 'error' : 'primary'}
                      disabled={form.isSubmitting}
                      onClick={(): void => {
                        if (initialValues != form.values) {
                          setShowDialog(true);
                        } else {
                          navigate(-1);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      id='ag_create_course_btn'
                      size='medium'
                      variant='contained'
                      type='submit'
                      disabled={form.isSubmitting}
                    >
                      Submit
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
                  </Box>
                </Form>
              )}
            </Formik>
          ) : (
            <></>
          )
        }
        <UnsavedChangesDialog
          setOpen={setShowDialog}
          open={showDialog}
          handleDiscard={(): void => navigate('/')}
        />
      </Container>
    </>
  );
}
