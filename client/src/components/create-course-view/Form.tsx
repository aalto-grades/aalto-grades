/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/no-unused-vars */
// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import { CourseData } from 'aalto-grades-common/types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box, TextField, Container, Button, Avatar,
  IconButton, List, ListItem, ListItemAvatar, ListItemText, InputAdornment
} from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { State } from '../../types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface NewCourseData extends Omit<
CourseData, 'teachersInCharge' | 'id' | 'evaluationInformation'
> {
  teachersInCharge: Array<string>;
}

export const localizedStringSchema: yup.AnyObjectSchema = yup.object().shape({
  fi: yup.string(),
  en: yup.string(),
  sv: yup.string()
});

function CreateCourseForm(params: {
  addCourse: (course: NewCourseData) => Promise<void>
}): JSX.Element {

  const theme: Theme = useTheme();
  const [teachersInCharge, setTeachersInCharge]: State<Array<string>> = useState([]);

  const formik = useFormik({
    initialValues: {
      courseCode: '',
      minCredits: 0,
      maxCredits: 0,
      teacherEmail: '',
      department: {
        fi: '',
        sv: '',
        en: '',
      },
      name: {
        fi: '',
        sv: '',
        en: '',
      },
    },
    validationSchema: yup.object({
      courseCode: yup.string().required(),
      minCredits: yup.number().min(0).required(),
      maxCredits: yup.number().min(yup.ref('minCredits')).required(),
      teacherEmail: yup.string().email('Please input valid email addressl').notRequired(),
      department: localizedStringSchema.required(),
      name: localizedStringSchema.required()
    }),
    onSubmit: async (values, { resetForm }): Promise<void> => {
      try {
        const courseObject: NewCourseData = ({
          courseCode: values.courseCode,
          minCredits: values.minCredits,
          maxCredits: values.maxCredits,
          department: {
            fi: values.department.fi,
            sv: values.department.sv,
            en: values.department.en,
          },
          name: {
            fi: values.name.fi,
            sv: values.name.sv,
            en: values.name.en,
          },
          teachersInCharge
        });

        await params.addCourse(courseObject);
        resetForm();
      } catch (exception) {
        console.log(exception);
      }
    },
  });

  console.log(formik.touched.courseCode === true);

  function removeTeacher(value: string): void {
    setTeachersInCharge(teachersInCharge.filter((teacher: string) => teacher !== value));
  }

  function addTeacher(): void {
    setTeachersInCharge([...teachersInCharge, formik.values.teacherEmail]);
    formik.setFieldValue('teacherEmail', '');
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
      <form onSubmit={formik.handleSubmit}>
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
            value={formik.values.courseCode}
            label="Course Code"
            variant='standard'
            color={((formik.touched.courseCode === true) && Boolean(!formik.errors.courseCode)) ? 'success' : 'primary'}
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
              },
              endAdornment: (
                <InputAdornment position="end">
                  <CheckCircleIcon />
                </InputAdornment>
              )
            }}
            helperText={formik.errors.courseCode ?
              formik.errors.courseCode :
              'Give the code that the new course is going to have.'
            }
            error={(formik.touched.courseCode === true) && Boolean(formik.errors.courseCode)}
            onChange={formik.handleChange}
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
            id="name.en"
            type="text"
            value={formik.values.name.en}
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
            helperText={formik.errors.name ?
              formik.errors.name.en :
              'Give the name of the course the new course is going to have.'
            }
            //error={(formik.touched.name.en === true) && Boolean(formik.errors.name)}
            onChange={formik.handleChange}
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
            id="department.en"
            type="text"
            value={formik.values.department.en}
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
            helperText={formik.errors.department ?
              'Course name invalid' :
              'Give the organizer of the new course.'
            }
            //error={(formik.touched.department.en === true) && Boolean(formik.errors.department)}
            onChange={formik.handleChange}
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
            value={formik.values.teacherEmail}
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
            helperText={formik.errors.teacherEmail ?
              formik.errors.teacherEmail :
              teachersInCharge.length === 0 ?
                'Input the email address of at least one teacher in charge of the course' :
                'Emails of the teachers in charge of the course.'
            }
            error={(formik.touched.teacherEmail === true) && Boolean(formik.errors.teacherEmail)}
            onChange={formik.handleChange}
          >
          </TextField>
          <Button
            variant="outlined"
            startIcon={<PersonAddAlt1Icon />}
            disabled={Boolean(formik.errors.teacherEmail) || formik.values.teacherEmail.length === 0}
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
          disabled={!formik.isValid || teachersInCharge.length === 0}>
          Create Course
        </Button>
      </form>
    </Container>
  );
}

CreateCourseForm.propTypes = {
  addCourse: PropTypes.func
};

export default CreateCourseForm;
