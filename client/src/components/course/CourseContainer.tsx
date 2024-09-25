// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, useTheme} from '@mui/material';
import {type JSX, useEffect} from 'react';
import {Outlet, useParams} from 'react-router-dom';

import {useGetCourse} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import SideMenu from './SideMenu';

const CourseContainer = (): JSX.Element => {
  const {auth, setIsTeacherInCharge, setIsAssistant} = useAuth();
  const {courseId} = useParams();
  const theme = useTheme();
  const course = useGetCourse(courseId!, {enabled: Boolean(courseId)});

  useEffect(() => {
    if (auth && course.data) {
      const isTeacherInCharge = course.data.teachersInCharge.some(
        teacher => teacher.id === auth.id
      );
      setIsTeacherInCharge(isTeacherInCharge);

      const isAssistant = course.data.assistants.some(
        user => user.id === auth.id
      );
      setIsAssistant(isAssistant);
    }
  }, [auth, course.data, setIsTeacherInCharge, setIsAssistant]);

  return (
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
          overflow: 'clip',
          viewTransitionName: 'side-menu',
          boxSizing: 'border-box',
          '& *': {'--side-menu-width': '200px'},
        }}
      >
        <SideMenu />
      </Box>

      <Box
        sx={{
          width: '100%',
          overflow: 'auto',
          backgroundColor: theme.vars.palette.background.paper,
          borderRadius: '15px',
          px: 2,
          pt: 1,
          viewTransitionName: 'content',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default CourseContainer;
