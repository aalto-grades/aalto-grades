// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, useTheme} from '@mui/material';
import {UseQueryResult} from '@tanstack/react-query';
import {JSX, useEffect, useState} from 'react';
import {Outlet, Params, useParams} from 'react-router-dom';

import {CourseData} from '@common/types';
import {useGetCourse} from '../hooks/useApi';
import useAuth, {AuthContextType} from '../hooks/useAuth';
import SideMenu from './course-view/SideMenu';
import UploadDialog from './course-view/UploadDialog';

export default function CourseView(): JSX.Element {
  const theme = useTheme();
  const {courseId}: Params = useParams();
  const course: UseQueryResult<CourseData> = useGetCourse(courseId!, {
    enabled: !!courseId,
  });
  const {
    auth,
    isTeacherInCharge: _,
    setIsTeacherInCharge,
    setIsAssistant,
  }: AuthContextType = useAuth();

  const [uploadOpen, setUploadOpen] = useState<boolean>(false);

  useEffect(() => {
    if (auth && course.data) {
      const teacherInCharge = course.data.teachersInCharge.filter(
        teacher => teacher.id === auth.id
      );
      setIsTeacherInCharge(teacherInCharge.length !== 0);

      const assistant = course.data.assistants.filter(
        user => user.id === auth.id
      );
      setIsAssistant(assistant.length !== 0);
    }
  }, [auth, course.data, setIsTeacherInCharge, setIsAssistant]);

  return (
    <>
      <Box style={{display: 'flex', height: '100%'}}>
        <Box
          sx={{
            display: courseId ? 'block' : 'none',
            width: courseId ? '204px' : '0px',
            minWidth: courseId ? '204px' : '0px',
            // transition: 'all 0.3s',
            overflow: 'clip',
            viewTransitionName: 'side-menu',
            mr: 2,
            boxSizing: 'border-box',
          }}
        >
          <SideMenu onUpload={() => setUploadOpen(true)} />
        </Box>

        <Box
          sx={{
            width: '100%',
            overflow: 'auto',
            backgroundColor: theme.vars.palette.background.paper,
            borderRadius: '15px',
            padding: 2,
            viewTransitionName: 'content',
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
