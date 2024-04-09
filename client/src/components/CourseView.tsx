// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, useTheme} from '@mui/material';
import {UseQueryResult} from '@tanstack/react-query';
import {JSX, useEffect, useState} from 'react';
import {
  NavigateFunction,
  Outlet,
  Params,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {CourseData, UserData} from '@common/types';
import {useGetCourse} from '../hooks/useApi';
import useAuth, {AuthContextType} from '../hooks/useAuth';
import SideMenu from './course-view/SideMenu';
import UploadDialog from './course-view/UploadDialog';

export default function CourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
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
      const teacherInCharge: Array<UserData> =
        course.data.teachersInCharge.filter(
          (teacher: UserData) => teacher.id === auth.id
        );
      setIsTeacherInCharge(teacherInCharge.length !== 0);
      if (course.data.assistants !== undefined) {
        const assistant: Array<UserData> = course.data.assistants.filter(
          (assistant: UserData) => assistant.id === auth.id
        );
        setIsAssistant(assistant.length !== 0);
      }
    }
  }, [auth, course.data, setIsTeacherInCharge, setIsAssistant]);

  return (
    <>
      <Box style={{display: 'flex'}}>
        <SideMenu onUpload={() => setUploadOpen(true)} />

        <Box
          sx={{
            marginLeft: 2,
            width: '100%',
            overflow: 'auto',
            backgroundColor: theme.vars.palette.background.paper,
            borderRadius: '15px',
            padding: 2,
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
