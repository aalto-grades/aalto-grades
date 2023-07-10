// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { JSX, useState, useEffect } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CourseTable from './front-page/CourseTable';
import courseServices from '../services/courses';
import useAuth, { AuthContextType } from '../hooks/useAuth';
import { CourseData, SystemRole } from 'aalto-grades-common/types';
import { State } from '../types';

function FrontPage(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  const [coursesOfUser, setCoursesOfUser]: State<Array<CourseData>> =
    useState<Array<CourseData>>([]);
  const [courses, setCourses]: State<Array<CourseData>> =
    useState<Array<CourseData>>([]);

  const { auth }: AuthContextType = useAuth();

  useEffect(() => {
    if (auth) {
      courseServices.getCoursesOfUser(auth.id)
        .then((data: Array<CourseData>) => {
          setCoursesOfUser(data);
        })
        .catch((e) => console.log(e.message));
    }

    courseServices.getAllCourses()
      .then((data: Array<CourseData>) => {
        setCourses(data);
      })
      .catch((e) => console.log(e.message));
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
          <Button id='ag_new_course_btn' size='large' variant='contained' onClick={() => {
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

export default FrontPage;
