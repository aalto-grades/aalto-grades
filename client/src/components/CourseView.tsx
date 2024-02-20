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

  const attainmentTree: UseQueryResult<AttainmentData> = useGetRootAttainment(
    courseId,
    currentAssessmentModel?.id ?? -1,
    'descendants',
    {enabled: Boolean(currentAssessmentModel && currentAssessmentModel.id)}
  );

  const attainments: UseQueryResult<Array<AttainmentData>> = useGetAttainments(
    courseId,
    {enabled: Boolean(currentAssessmentModel && currentAssessmentModel.id)}
  );

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
          <p>{attainments.data?.toString()}</p>
          <Box>
            {
              /* a different attainment component will be created for students */
              (auth?.role == SystemRole.Admin || isTeacherInCharge) && (
                <div style={{flexGrow: 3}}>
                  <Typography variant="h3" align="left" sx={{pt: 1.5, pb: 1}}>
                    Assessment Models
                    {(auth?.role === SystemRole.Admin || isTeacherInCharge) && (
                      <Tooltip title="New assessment model" placement="right">
                        <Button
                          onClick={(): void =>
                            setCreateAssessmentModelOpen(true)
                          }
                        >
                          New
                        </Button>
                      </Tooltip>
                    )}
                  </Typography>

                  <div style={{display: 'flex', gap: 0}}>
                    <div
                      style={{display: 'flex', flexDirection: 'column', gap: 0}}
                    >
                      <AssessmentModelsPicker
                        course={course.data}
                        assessmentModels={assessmentModels.data}
                        currentAssessmentModelId={currentAssessmentModel?.id}
                        onChangeAssessmentModel={onChangeAssessmentModel}
                        onNewAssessmentModel={(): void =>
                          setCreateAssessmentModelOpen(true)
                        }
                      />
                      <div style={{marginRight: '20px', maxWidth: '300px'}}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0,
                          }}
                        >
                          <CourseDetails
                            course={course.data}
                            assessmentModels={assessmentModels.data}
                            currentAssessmentModelId={
                              currentAssessmentModel?.id
                            }
                            onChangeAssessmentModel={onChangeAssessmentModel}
                            onNewAssessmentModel={(): void =>
                              setCreateAssessmentModelOpen(true)
                            }
                          />
                          <InstancesWidget />
                        </Box>
                      </div>
                    </div>
                    <div style={{width: '100%'}}>
                      {attainmentTree.data ? (
                        <Fade
                          in={animation}
                          style={{transformOrigin: '0 0 0'}}
                          {...(animation ? {timeout: 1000} : {timeout: 0})}
                        >
                          <div style={{width: '100%'}}>
                            {currentAssessmentModel && (
                              <Attainments
                                attainmentTree={attainmentTree.data}
                                courseId={Number(courseId)}
                                assessmentModel={currentAssessmentModel}
                              />
                            )}
                          </div>
                        </Fade>
                      ) : attainmentTree.isLoading &&
                        assessmentModels.data &&
                        assessmentModels.data.length !== 0 ? (
                        <div>
                          <Box
                            sx={{
                              margin: 'auto',
                              alignItems: 'center',
                              justifyContent: 'center',
                              display: 'flex',
                              mt: 25,
                              mb: 5,
                            }}
                          >
                            <CircularProgress />
                          </Box>
                          Loading attainments...
                        </div>
                      ) : (
                        <Box sx={{mt: 9}}>No assessment models found.</Box>
                      )}
                    </div>
                  </div>
                </div>
              )
            }
          </Box>
          <CreateAssessmentModelDialog
            open={createAssessmentModelOpen}
            handleClose={(): void => setCreateAssessmentModelOpen(false)}
            onSubmit={assessmentModels.refetch}
            assessmentModels={assessmentModels.data}
          />
        </>
      )}
    </Box>
  );
}
