// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AssessmentModelData,
  CourseData,
  SystemRole,
  UserData,
} from '@common/types';
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

import {useGetAllAssessmentModels, useGetCourse} from '../hooks/useApi';
import useAuth, {AuthContextType} from '../hooks/useAuth';
import {State} from '../types';
import SideMenu from './course-view/SideMenu';
import UploadDialog from './course-view/UploadDialog';

export default function CourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const {courseId}: Params = useParams() as {courseId: string};
  const {
    auth,
    isTeacherInCharge: _,
    setIsTeacherInCharge,
  }: AuthContextType = useAuth();

  const [_animation, setAnimation]: State<boolean> = useState(false);
  const [uploadOpen, setUploadOpen] = useState<boolean>(false);
  // const [
  //   createAssessmentModelOpen,
  //   setCreateAssessmentModelOpen,
  // ]: State<boolean> = useState(false);

  const course: UseQueryResult<CourseData> = useGetCourse(courseId);

  useEffect(() => {
    if (auth && course.data) {
      const teacherInCharge: Array<UserData> =
        course.data.teachersInCharge.filter(
          (teacher: UserData) => teacher.id === auth.id
        );
      setIsTeacherInCharge(teacherInCharge.length !== 0);
    }
  }, [auth, course.data, setIsTeacherInCharge]);

  const assessmentModels: UseQueryResult<Array<AssessmentModelData>> =
    useGetAllAssessmentModels(courseId);

  const [
    currentAssessmentModel,
    setCurrentAssessmentModel,
  ]: State<AssessmentModelData | null> = useState<AssessmentModelData | null>(
    null
  );

  useEffect(() => {
    if (currentAssessmentModel) return;
    if (assessmentModels.data && assessmentModels.data.length > 0)
      setCurrentAssessmentModel(assessmentModels.data[0]);
    else setCurrentAssessmentModel(null);
  }, [assessmentModels.data, currentAssessmentModel]);

  useEffect(() => {
    setAnimation(true);
  }, [currentAssessmentModel]);

  // function onChangeAssessmentModel(assessmentModel: AssessmentModelData): void {
  //   if (
  //     assessmentModel.id &&
  //     assessmentModel.id !== currentAssessmentModel?.id
  //   ) {
  //     setAnimation(false);
  //     setCurrentAssessmentModel(assessmentModel);
  //   }
  // }

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
      <Box
        style={{
          display: 'flex',
        }}
      >
        <SideMenu onUpload={() => setUploadOpen(true)} />
        <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
        <Box
          sx={{
            marginLeft: 2,
            width: '100%',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
}
