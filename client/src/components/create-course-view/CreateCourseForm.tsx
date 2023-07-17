// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import { Form, Formik } from 'formik';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import {
  Avatar, Box, Button, CircularProgress, Container, IconButton,
  List, ListItem, ListItemAvatar, ListItemText, TextField
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

import { State } from '../../types';

function CreateCourseForm(props: {
  addCourse: (course: CourseData) => Promise<void>
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  const [teachersInCharge, setTeachersInCharge]: State<Array<string>> =
    useState<Array<string>>([]);
  const [email, setEmail]: State<string> = useState('');
  const [showDialog, setShowDialog]: State<boolean> = useState(false);

  function removeTeacher(value: string): void {
    setTeachersInCharge(teachersInCharge.filter((teacher: string) => teacher !== value));
  }

  function addTeacher(): void {
    setTeachersInCharge([...teachersInCharge, email]);
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
      <Formik
        initialValues={{
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
        }}
        validationSchema={yup.object({
          courseCode: yup.string()
            .min(1)
            .required('Course code is required (e.g. CS-A1111)'),
          minCredits: yup.number()
            .min(0, 'Minimum credits cannot be negative')
            .required('Minimum credits is required'),
          maxCredits: yup.number()
            .min(yup.ref('minCredits'), 'Maximum credits cannot be lower than minimum credits')
            .required('Maximum credits is required'),
          teacherEmail: yup.string()
            .email('Please input valid email address')
            .notRequired(),
          departmentEn: yup.string()
            .min(1)
            .required('Please input the course organizer information in English'),
          departmentFi: yup.string()
            .min(1)
            .required('Please input the course organizer information in Finnish'),
          departmentSv: yup.string()
            .min(1)
            .required('Please input the course organizer information in Swedish'),
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
        onSubmit={async function (values): Promise<void> {
          const courseObject: CourseData = ({
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
          });
          await props.addCourse(courseObject);
        }}
      >
        {({ errors, handleChange, isSubmitting, isValid, touched, values, initialValues }) => (
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
              <TextField
                id="courseCode"
                type="text"
                fullWidth
                value={values.courseCode}
                disabled={isSubmitting}
                label="Course Code*"
                InputLabelProps={{ shrink: true }}
                margin='normal'
                helperText={errors.courseCode ?
                  errors.courseCode :
                  'Give code for the new course.'
                }
                error={touched.courseCode && Boolean(errors.courseCode)}
                onChange={handleChange}
              />
              <TextField
                id="nameEn"
                type="text"
                fullWidth
                value={values.nameEn}
                disabled={isSubmitting}
                label="Course Name in English*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.nameEn ?
                  errors.nameEn :
                  'Give the name of the course in English.'
                }
                error={touched.nameEn && Boolean(errors.nameEn)}
                onChange={handleChange}
              />
              <TextField
                id="nameFi"
                type="text"
                fullWidth
                value={values.nameFi}
                disabled={isSubmitting}
                label="Course Name in Finnish*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.nameFi ?
                  errors.nameFi :
                  'Give the name of the course in Finnish.'
                }
                error={touched.nameFi && Boolean(errors.nameFi)}
                onChange={handleChange}
              />
              <TextField
                id="nameSv"
                type="text"
                fullWidth
                value={values.nameSv}
                disabled={isSubmitting}
                label="Course Name in Swedish*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.nameSv ?
                  errors.nameSv :
                  'Give the name of the course in Swedish.'
                }
                error={touched.nameSv && Boolean(errors.nameSv)}
                onChange={handleChange}
              />
              <TextField
                id="departmentEn"
                type="text"
                fullWidth
                value={values.departmentEn}
                disabled={isSubmitting}
                label="Organizer in English*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.departmentEn ?
                  errors.departmentEn :
                  'Give the organizer of the new course in English.'
                }
                error={touched.departmentEn && Boolean(errors.departmentEn)}
                onChange={handleChange}
              />
              <TextField
                id="departmentFi"
                type="text"
                fullWidth
                value={values.departmentFi}
                disabled={isSubmitting}
                label="Organizer in Finnish*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.departmentFi ?
                  errors.departmentFi :
                  'Give the organizer of the new course in Finnish.'
                }
                error={touched.departmentFi && Boolean(errors.departmentFi)}
                onChange={handleChange}
              />
              <TextField
                id="departmentSv"
                type="text"
                fullWidth
                value={values.departmentSv}
                disabled={isSubmitting}
                label="Organizer in Swedish*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.departmentSv ?
                  errors.departmentSv :
                  'Give the organizer of the new course in Swedish.'
                }
                error={touched.departmentSv && Boolean(errors.departmentSv)}
                onChange={handleChange}
              />
              <TextField
                id="minCredits"
                type="number"
                fullWidth
                value={values.minCredits}
                disabled={isSubmitting}
                label="Minimum Course Credits (ECTS)*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.minCredits ?
                  errors.minCredits :
                  'Input minimum credits'
                }
                error={touched.minCredits && Boolean(errors.minCredits)}
                onChange={handleChange}
              />
              <TextField
                id="maxCredits"
                type="number"
                fullWidth
                value={values.maxCredits}
                disabled={isSubmitting}
                label="Maximum Course Credits (ECTS)*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.maxCredits ?
                  errors.maxCredits :
                  'Input maximum credits'
                }
                error={touched.maxCredits && Boolean(errors.maxCredits)}
                onChange={handleChange}
              />
              <TextField
                id="teacherEmail"
                type="text"
                fullWidth
                value={values.teacherEmail}
                disabled={isSubmitting}
                label="Teachers In Charge*"
                margin='normal'
                InputLabelProps={{ shrink: true }}
                helperText={errors.teacherEmail ?
                  errors.teacherEmail :
                  teachersInCharge.length === 0 ?
                    'Input the email address of at least one teacher in charge of the course' :
                    teachersInCharge.includes(email) ?
                      'Email already on list.' :
                      'Add emails of the teachers in charge of the course.'
                }
                error={touched.teacherEmail && Boolean(errors.teacherEmail)}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
                  setEmail(e.currentTarget.value);
                  handleChange(e);
                }}
              />
              <Button
                variant="outlined"
                startIcon={<PersonAddAlt1Icon />}
                disabled={
                  // Allow submit of email only if validation passes and not on list.
                  Boolean(errors.teacherEmail) ||
                  values.teacherEmail.length === 0 ||
                  teachersInCharge.includes(email) ||
                  isSubmitting
                }
                onClick={(): void => addTeacher()}
                sx={{ mt: 1 }}
              >
                Add
              </Button>
              <Box sx={{ mt: 3, mb: 2 }}>
                {teachersInCharge.length === 0 ?
                  'Add at least one teacher in charge to the course'
                  :
                  <List dense={true}>
                    {teachersInCharge.map((teacherEmail: string) => {
                      return (
                        <ListItem
                          key={teacherEmail}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              disabled={isSubmitting}
                              aria-label="delete"
                              onClick={(): void => {
                                removeTeacher(teacherEmail);
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
                          <ListItemText
                            primary={teacherEmail}
                          />
                        </ListItem>);
                    })}
                  </List>
                }
              </Box>
            </Box>
            <Box sx={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
              alignItems: 'center', pb: 6
            }}>
              <Button
                size='medium'
                variant='outlined'
                disabled={isSubmitting}
                onClick={(): void => {
                  if (initialValues != values) {
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
                disabled={!isValid || teachersInCharge.length === 0 || isSubmitting}
                endIcon={<SendIcon />}
              >
                Create Course
                {isSubmitting && (
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
      <UnsavedChangesDialog setOpen={setShowDialog} open={showDialog} navigateDir='/' />
    </Container>
  );
}

CreateCourseForm.propTypes = {
  addCourse: PropTypes.func
};

export default CreateCourseForm;
