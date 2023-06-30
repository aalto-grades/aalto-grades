/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import { CourseData } from 'aalto-grades-common/types';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import {
  Box, TextField, Container, Button, Avatar,
  IconButton, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { State } from '../../types';

export interface NewCourseData extends Omit<
CourseData, 'teachersInCharge' | 'id' | 'evaluationInformation'
> {
  teachersInCharge: Array<string>;
}

function CreateCourseForm(params: {
  addCourse: (course: NewCourseData) => Promise<void>
}): JSX.Element {

  const theme: Theme = useTheme();
  const [teachersInCharge, setTeachersInCharge]: State<Array<string>> = useState([]);
  const [email, setEmail]: State<string> = useState('');

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
          department: '',
          name: ''
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
          department: yup.string()
            .min(1)
            .required('Please input the course organizer information'),
          name: yup.string()
            .min(1)
            .required('Please input a valid course name')
        })}
        onSubmit={async (values, { resetForm }) => {
          try {
            const courseObject: NewCourseData = ({
              courseCode: values.courseCode,
              minCredits: values.minCredits,
              maxCredits: values.maxCredits,
              department: {
                fi: '',
                sv: '',
                en: values.department,
              },
              name: {
                fi: '',
                sv: '',
                en: values.name,
              },
              teachersInCharge
            });
            await params.addCourse(courseObject);
            resetForm();
            setTeachersInCharge([]);
          } catch (exception) {
            console.log(exception);
          }
        }}
      >
        {({ errors, touched, values, handleChange, isValid }) => (
          <Form>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
              boxShadow: 2,
              borderRadius: 2,
              my: 2,
              p: 2
            }}>
              <TextField
                id="courseCode"
                type="text"
                value={values.courseCode}
                label="Course Code"
                variant='standard'
                color='primary'
                sx={{ my: 1 }}
                InputLabelProps={{
                  shrink: true,
                  style: {
                    fontSize: theme.typography.h2.fontSize
                  }
                }}
                InputProps={{
                  style: {
                    margin: '32px 0px 0px 0px'
                  }
                }}
                helperText={errors.courseCode ?
                  errors.courseCode :
                  'Give the code that the new course is going to have.'
                }
                error={touched.courseCode && Boolean(errors.courseCode)}
                onChange={handleChange}
              >
              </TextField>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
              boxShadow: 2,
              borderRadius: 2,
              my: 2,
              p: 2
            }}>
              <TextField
                id="name"
                type="text"
                value={values.name}
                label="Course Name"
                variant='standard'
                color='primary'
                sx={{ my: 1 }}
                InputLabelProps={{
                  shrink: true,
                  style: {
                    fontSize: theme.typography.h2.fontSize
                  }
                }}
                InputProps={{
                  style: {
                    margin: '32px 0px 0px 0px'
                  }
                }}
                helperText={errors.name ?
                  errors.name :
                  'Give the name of the course the new course is going to have.'
                }
                error={touched.name && Boolean(errors.name)}
                onChange={handleChange}
              >
              </TextField>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
              boxShadow: 2,
              borderRadius: 2,
              my: 2,
              p: 2
            }}>
              <TextField
                id="department"
                type="text"
                value={values.department}
                label="Organizer"
                variant='standard'
                color='primary'
                sx={{ my: 1 }}
                InputLabelProps={{
                  shrink: true,
                  style: {
                    fontSize: theme.typography.h2.fontSize
                  }
                }}
                InputProps={{
                  style: {
                    margin: '32px 0px 0px 0px'
                  }
                }}
                helperText={errors.department ?
                  errors.department :
                  'Give the organizer of the new course.'
                }
                error={touched.department && Boolean(errors.department)}
                onChange={handleChange}
              >
              </TextField>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              boxShadow: 2,
              borderRadius: 2,
              my: 2,
              p: 2
            }}>
              <TextField
                id="minCredits"
                type="number"
                value={values.minCredits}
                label="Minimum Credits"
                variant='standard'
                color='primary'
                sx={{ my: 1, mr: 10 }}
                InputLabelProps={{
                  shrink: true,
                  style: {
                    fontSize: theme.typography.h2.fontSize
                  }
                }}
                InputProps={{
                  style: {
                    margin: '32px 0px 0px 0px'
                  }
                }}
                helperText={errors.minCredits ?
                  errors.minCredits :
                  'Input minimum credits'
                }
                error={touched.minCredits && Boolean(errors.minCredits)}
                onChange={handleChange}
              >
              </TextField>
              <TextField
                id="maxCredits"
                type="number"
                value={values.maxCredits}
                label="Max Credits"
                variant='standard'
                color='primary'
                sx={{ my: 1 }}
                InputLabelProps={{
                  shrink: true,
                  style: {
                    fontSize: theme.typography.h2.fontSize
                  }
                }}
                InputProps={{
                  style: {
                    margin: '32px 0px 0px 0px'
                  }
                }}
                helperText={errors.maxCredits ?
                  errors.maxCredits :
                  'Input maximum credits'
                }
                error={touched.maxCredits && Boolean(errors.maxCredits)}
                onChange={handleChange}
              >
              </TextField>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
              boxShadow: 2,
              borderRadius: 2,
              my: 2,
              p: 2
            }}>
              <TextField
                id="teacherEmail"
                type="text"
                value={values.teacherEmail}
                label="Teachers In Charge"
                variant='standard'
                color='primary'
                sx={{ my: 1, width: 410 }}
                InputLabelProps={{
                  shrink: true,
                  style: {
                    fontSize: theme.typography.h2.fontSize
                  }
                }}
                InputProps={{
                  style: {
                    margin: '32px 0px 0px 0px'
                  }
                }}
                helperText={errors.teacherEmail ?
                  errors.teacherEmail :
                  teachersInCharge.length === 0 ?
                    'Input the email address of at least one teacher in charge of the course' :
                    'Emails of the teachers in charge of the course.'
                }
                error={touched.teacherEmail && Boolean(errors.teacherEmail)}
                onChange={(e): void => {
                  setEmail(e.currentTarget.value);
                  handleChange(e);
                }}
              >
              </TextField>
              <Button
                variant="outlined"
                startIcon={<PersonAddAlt1Icon />}
                disabled={Boolean(errors.teacherEmail) || values.teacherEmail.length === 0}
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
            <Button
              id='ag_create_course_btn'
              size='medium'
              variant='contained'
              type='submit'
              disabled={!isValid || teachersInCharge.length === 0}>
              Create Course
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
}

CreateCourseForm.propTypes = {
  addCourse: PropTypes.func
};

export default CreateCourseForm;
