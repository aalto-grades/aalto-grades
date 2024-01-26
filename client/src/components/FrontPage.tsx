// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData, LoginResult, SystemRole} from '@common/types';
import {Box, Button, Theme, Typography, useTheme} from '@mui/material';
import {JSX} from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {UseQueryResult} from '@tanstack/react-query';

import CourseTable from './front-page/CourseTable';
import UsersView from './front-page/users-view/UsersView';

import {useGetAllCourses, useGetCoursesOfUser} from '../hooks/useApi';
import useAuth, {AuthContextType} from '../hooks/useAuth';

export default function FrontPage(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const {auth}: AuthContextType = useAuth();

  const theme: Theme = useTheme();

  const courses: UseQueryResult<Array<CourseData>> = useGetAllCourses();
  const coursesOfUser: UseQueryResult<Array<CourseData>> = useGetCoursesOfUser(
    (auth as LoginResult).id
  );

  return (
    <>
      <Box
        component="span"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <Typography variant="h2" align="left" sx={{flexGrow: 1}}>
          Your Courses
        </Typography>
      </Box>
      {coursesOfUser.data && coursesOfUser.data.length > 0 ? (
        <CourseTable courses={coursesOfUser.data} />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            backgroundColor: `${theme.vars.palette.hoverGrey2}`,
            flexDirection: 'row',
          }}
        >
          <p>
            You have no courses. Please contact support to have your course
            added.
          </p>
        </Box>
      )}
      {auth?.role === SystemRole.Admin && (
        <>
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
              mt: 5,
            }}
          >
            <Typography variant="h2" align="left" sx={{flexGrow: 1}}>
              Courses
            </Typography>
            {
              /* Admins are shown the button for creating a new course */
              auth?.role == SystemRole.Admin && (
                <Button
                  id="ag_new_course_btn"
                  size="large"
                  variant="contained"
                  onClick={(): void => {
                    navigate('/course/create');
                  }}
                >
                  Create New Course
                </Button>
              )
            }
          </Box>
          {courses.data && <CourseTable courses={courses.data} />}
          <UsersView />
        </>
      )}
    </>
  );
}
