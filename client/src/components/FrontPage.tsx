// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData, SystemRole } from 'aalto-grades-common/types';
import { Box, Button, Typography } from '@mui/material';
import { JSX, useState, useEffect } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import CourseTable from './front-page/CourseTable';

import useAuth, { AuthContextType } from '../hooks/useAuth';
import { getAllCourses, getCoursesOfUser } from '../services/courses';
import { State } from '../types';

export default function FrontPage(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  const [coursesOfUser, setCoursesOfUser]: State<Array<CourseData>> =
    useState<Array<CourseData>>([]);
  const [courses, setCourses]: State<Array<CourseData>> =
    useState<Array<CourseData>>([]);

  const { auth }: AuthContextType = useAuth();

  useEffect(() => {
    if (auth) {
      getCoursesOfUser(auth.id)
        .then((data: Array<CourseData>) => {
          setCoursesOfUser(data);
        })
        .catch((e: unknown) => console.log(e));
    }

    getAllCourses()
      .then((data: Array<CourseData>) => {
        setCourses(data);
      })
      .catch((e: unknown) => console.log(e));
  }, []);

  return (
    <>
      <Box component="span" sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexDirection: 'row'
      }}>
        <Typography variant="h2" align="left" sx={{ flexGrow: 1 }}>
          Your Courses
        </Typography>
      </Box>
      {
        coursesOfUser.length > 0
          ?
          <CourseTable courses={coursesOfUser} />
          :
          <Box sx={{
            display: 'flex', alignItems: 'left',
            justifyContent: 'space-between', flexDirection: 'row'
          }}>
            <p>
              You have no courses.
            </p>
          </Box>
      }
      <Box component="span" sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexDirection: 'row',
        mt: 5
      }}>
        <Typography variant="h2" align="left" sx={{ flexGrow: 1 }}>
          Courses
        </Typography>
        { /* Admins are shown the button for creating a new course */
          auth?.role == SystemRole.Admin &&
          <Button id='ag_new_course_btn' size='large' variant='contained' onClick={(): void => {
            navigate('/create-course');
          }}>
            Create New Course
          </Button>
        }
      </Box>
      <CourseTable courses={courses} />
    </>
  );
}
