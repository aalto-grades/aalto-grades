// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AssessmentModelData,
  AttainmentData,
  CourseData,
  SystemRole,
  UserData,
} from '@common/types';
import {
  Box,
  Button,
  CircularProgress,
  Fade,
  Tooltip,
  Typography,
} from '@mui/material';
import {JSX, useState, useEffect} from 'react';
import {
  NavigateFunction,
  Outlet,
  Params,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {UseQueryResult} from '@tanstack/react-query';

import Attainments from './course-view/Attainments';
import CreateAssessmentModelDialog from './course-view/CreateAssessmentModelDialog';
import CourseDetails from './course-view/CourseDetails';

import {
  useGetAllAssessmentModels,
  useGetAttainments,
  useGetCourse,
  useGetRootAttainment,
} from '../hooks/useApi';
import useAuth, {AuthContextType} from '../hooks/useAuth';
import {State} from '../types';
import AssessmentModelsPicker from './course-view/AssessmentModelsPicker';
import InstancesWidget from './course-view/InstancesWidget';
import SideMenu from './course-view/SideMenu';

export default function CourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const {courseId}: Params = useParams() as {courseId: string};
  const {auth, isTeacherInCharge, setIsTeacherInCharge}: AuthContextType =
    useAuth();

  const [animation, setAnimation]: State<boolean> = useState(false);
  const [
    createAssessmentModelOpen,
    setCreateAssessmentModelOpen,
  ]: State<boolean> = useState(false);

  const course: UseQueryResult<CourseData> = useGetCourse(courseId);

  if (auth && course.data) {
    const teacherInCharge: Array<UserData> =
      course.data.teachersInCharge.filter(
        (teacher: UserData) => teacher.id == auth.id
      );
    setIsTeacherInCharge(teacherInCharge.length != 0);
  }

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

  function onChangeAssessmentModel(assessmentModel: AssessmentModelData): void {
    if (
      assessmentModel.id &&
      assessmentModel.id !== currentAssessmentModel?.id
    ) {
      setAnimation(false);
      setCurrentAssessmentModel(assessmentModel);
    }
  }

  return (
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
            {auth?.role == SystemRole.Admin && (
              <Button
                size="large"
                variant="contained"
                onClick={(): void => navigate(`/course/edit/${courseId}`)}
              >
                Edit Course
              </Button>
            )}
          </Box>
          <div
            style={{
              display: 'flex',
            }}
          >
            <SideMenu />
            <Outlet />
          </div>
        </>
      )}
    </Box>
  );
}
