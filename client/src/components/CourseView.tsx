// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, useTheme} from '@mui/material';
import {UseQueryResult} from '@tanstack/react-query';
import {JSX, useEffect} from 'react';
import {Outlet, Params, useParams} from 'react-router-dom';

import {CourseData} from '@/common/types';
import SideMenu from './course-view/SideMenu';
import {useGetCourse} from '../hooks/useApi';
import useAuth, {AuthContextType} from '../hooks/useAuth';

const CourseView = (): JSX.Element => {
  const theme = useTheme();
  const {courseId}: Params = useParams();
  const course: UseQueryResult<CourseData> = useGetCourse(courseId!, {
    enabled: Boolean(courseId),
  });
  const {auth, setIsTeacherInCharge, setIsAssistant}: AuthContextType =
    useAuth();

  useEffect(() => {
    if (auth && course.data) {
      const teacherInCharge = course.data.teachersInCharge.filter(
        teacher => teacher.id === auth.id
      );
      setIsTeacherInCharge(teacherInCharge.length > 0);

      const assistant = course.data.assistants.filter(
        user => user.id === auth.id
      );
      setIsAssistant(assistant.length > 0);
    }
  }, [auth, course.data, setIsTeacherInCharge, setIsAssistant]);

  return (
    <>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <Box
          sx={{
            gridArea: 'side',

            '--side-menu-width': '200px',
            display: courseId ? 'block' : 'none',
            width: courseId ? 'var(--side-menu-width)' : '0px',
            minWidth: courseId ? 'var(--side-menu-width)' : '0px',
            // transition: 'all 0.3s',
            overflow: 'clip',
            viewTransitionName: 'side-menu',
            // mr: 2,
            boxSizing: 'border-box',
            '& *': {
              '--side-menu-width': '200px',
            },
          }}
        >
          <SideMenu />
        </Box>

        <Box
          sx={{
            // gridArea: courseId ? 'inherit' : 'content',

            width: '100%',
            overflow: 'auto',
            backgroundColor: theme.vars.palette.background.paper,
            borderRadius: '15px',
            // padding: 3,
            px: 2,
            pt: 1,
            viewTransitionName: 'content',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default CourseView;
