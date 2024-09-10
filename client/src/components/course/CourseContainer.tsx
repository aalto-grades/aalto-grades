// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, useTheme} from '@mui/material';
import type {UseQueryResult} from '@tanstack/react-query';
import {type JSX, useEffect} from 'react';
import {Outlet, type Params, useParams} from 'react-router-dom';

import type {CourseData} from '@/common/types';
import {useGetCourse} from '@/hooks/useApi';
import useAuth, {type AuthContextType} from '@/hooks/useAuth';
import SideMenu from './SideMenu';

const CourseContainer = (): JSX.Element => {
  const theme = useTheme();
  const {courseId}: Params = useParams();
  const course: UseQueryResult<CourseData> = useGetCourse(courseId!, {
    enabled: Boolean(courseId),
  });
  const {auth, setIsTeacherInCharge, setIsAssistant}: AuthContextType =
    useAuth();

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
  );
};

export default CourseContainer;
