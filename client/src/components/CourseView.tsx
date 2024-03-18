// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography} from '@mui/material';
import {UseQueryResult} from '@tanstack/react-query';
import {JSX, useEffect, useState} from 'react';
import {
  NavigateFunction,
  Outlet,
  Params,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {CourseData, SystemRole, UserData} from '@common/types';
import {useGetCourse} from '../hooks/useApi';
import useAuth, {AuthContextType} from '../hooks/useAuth';
import SideMenu from './course-view/SideMenu';
import UploadDialog from './course-view/UploadDialog';

export default function CourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const {courseId}: Params = useParams() as {courseId: string};
  const course: UseQueryResult<CourseData> = useGetCourse(courseId);
  const {
    auth,
    isTeacherInCharge: _,
    setIsTeacherInCharge,
  }: AuthContextType = useAuth();

  const [uploadOpen, setUploadOpen] = useState<boolean>(false);

  useEffect(() => {
    if (auth && course.data) {
      const teacherInCharge: Array<UserData> =
        course.data.teachersInCharge.filter(
          (teacher: UserData) => teacher.id === auth.id
        );
      setIsTeacherInCharge(teacherInCharge.length !== 0);
    }
  }, [auth, course.data, setIsTeacherInCharge]);

  return (
    <>
      <Box sx={{mx: -2.5}}>
        {course.data && (
          <>
            <Typography variant="h1" align="left">
              {course.data.courseCode}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                mb: 4,
                columnGap: 6,
              }}
            >
              <Typography variant="h2" align="left">
                {course.data.name.en}
              </Typography>
              {auth?.role === SystemRole.Admin && (
                <Button
                  size="large"
                  variant="contained"
                  onClick={(): void => navigate(`/course/edit/${courseId}`)}
                >
                  Edit Course
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
      <Box style={{display: 'flex'}}>
        <SideMenu onUpload={() => setUploadOpen(true)} />
        <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
        <Box
          sx={{
            marginLeft: 2,
            width: '100%',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
}
