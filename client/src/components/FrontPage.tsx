// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography, useTheme} from '@mui/material';
import {JSX, useState} from 'react';

import {SystemRole} from '@/common/types';
import CourseTable from './front-page/CourseTable';
import CreateCourseDialog from './front-page/CreateCourseDialog';
import UsersView from './front-page/users-view/UsersView';
import {useGetAllCourses, useGetCoursesOfUser} from '../hooks/useApi';
import useAuth from '../hooks/useAuth';

const FrontPage = (): JSX.Element => {
  const theme = useTheme();
  const {auth} = useAuth();
  const courses = useGetAllCourses({
    enabled: auth !== null && auth.role === SystemRole.Admin,
  });
  const coursesOfUser = useGetCoursesOfUser(auth!.id);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);

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
            backgroundColor: theme.vars.palette.hoverGrey2,
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
          <CreateCourseDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
          />
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
              <Button
                id="ag_new_course_btn"
                size="large"
                variant="contained"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create New Course
              </Button>
            }
          </Box>
          {courses.data && <CourseTable courses={courses.data} />}
          <UsersView />
        </>
      )}
    </>
  );
};

export default FrontPage;
