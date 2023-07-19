// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AssessmentModelData, AttainmentData, CourseData, SystemRole, UserData
} from 'aalto-grades-common/types';
import { Box, Button, CircularProgress, Grow, Typography } from '@mui/material';
import { JSX, useState, useEffect } from 'react';
import { NavigateFunction, Params, useNavigate, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import Attainments from './course-view/Attainments';
import CreateAssessmentModelDialog from './course-view/CreateAssessmentModelDialog';
import CourseDetails from './course-view/CourseDetails';
import FileLoadDialog from './course-view/FileLoadDialog';
import InstancesTable from './course-view/InstancesTable';

import {
  useGetAllAssessmentModels, useGetCourse, useGetRootAttainment
} from '../hooks/useApi';
import useAuth, { AuthContextType } from '../hooks/useAuth';
import { State } from '../types';

export default function CourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId }: Params = useParams();
  const { auth, isTeacherInCharge, setIsTeacherInCharge }: AuthContextType = useAuth();

  const [animation, setAnimation]: State<boolean> = useState(false);
  const [fileLoadOpen, setFileLoadOpen]: State<boolean> = useState(false);
  const [createAssessmentModelOpen, setCreateAssessmentModelOpen]: State<boolean> = useState(false);

  if (!courseId)
    return (<></>);

  const course: UseQueryResult<CourseData> = useGetCourse(courseId);

  if (auth && course.data) {
    const teacherInCharge: Array<UserData> = course.data.teachersInCharge.filter(
      (teacher: UserData) => teacher.id == auth.id
    );
    setIsTeacherInCharge(teacherInCharge.length != 0);
  }

  const assessmentModels: UseQueryResult<Array<AssessmentModelData>> =
    useGetAllAssessmentModels(courseId);

  const [currentAssessmentModel, setCurrentAssessmentModel]: State<AssessmentModelData | null> =
    useState<AssessmentModelData | null>(null);

  useEffect(() => {
    if (assessmentModels.data && assessmentModels.data.length > 0)
      setCurrentAssessmentModel(assessmentModels.data[0]);
    else
      setCurrentAssessmentModel(null);
  }, [assessmentModels.data]);

  const attainmentTree: UseQueryResult<AttainmentData> = useGetRootAttainment(
    courseId,
    currentAssessmentModel?.id ?? -1,
    'descendants',
    { enabled: Boolean(currentAssessmentModel && currentAssessmentModel.id) }
  );

  useEffect(() => {
    setAnimation(true);
  }, [currentAssessmentModel]);

  function onChangeAssessmentModel(assessmentModel: AssessmentModelData): void {
    if (assessmentModel.id && assessmentModel.id !== currentAssessmentModel?.id) {
      setAnimation(false);
      setCurrentAssessmentModel(assessmentModel);
    }
  }

  return (
    <Box sx={{ mx: -2.5 }}>
      {
        (course.data) &&
        <>
          <Typography variant='h1' align='left'>{course.data.courseCode}</Typography>
          <Box sx={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', mb: 4, columnGap: 6
          }}>
            <Typography variant='h2' align='left'>{course.data.name.en}</Typography>
            {
              /* Only admins and teachers in charge are allowed to create assessment models */
              (auth?.role == SystemRole.Admin || isTeacherInCharge) &&
              <Button
                id='ag_new_assessment_model_btn'
                size='large'
                variant='contained'
                onClick={(): void => setCreateAssessmentModelOpen(true)}
              >
                New Assessment Model
              </Button>
            }
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <div>
              <CourseDetails
                course={course.data}
                assessmentModels={assessmentModels.data}
                currentAssessmentModelId={currentAssessmentModel?.id}
                onChangeAssessmentModel={onChangeAssessmentModel}
              />
            </div>
            {
              /* a different attainment component will be created for students */
              (auth?.role == SystemRole.Admin || isTeacherInCharge) &&
              <div style={{ width: '100%' }}>
                {(attainmentTree.data) ?
                  <Grow
                    in={animation}
                    style={{ transformOrigin: '0 0 0' }}
                    {...(animation ? { timeout: 1000 } : { timeout: 0 })}
                  >
                    <div style={{ width: '100%' }}>
                      {
                        (currentAssessmentModel) &&
                        <Attainments
                          attainmentTree={attainmentTree.data}
                          courseId={Number(courseId)}
                          assessmentModel={currentAssessmentModel}
                          handleAddPoints={(): void => setFileLoadOpen(true)}
                        />
                      }
                    </div>
                  </Grow>
                  :
                  attainmentTree === null ?
                    <Box sx={{
                      margin: 'auto',
                      alignItems: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                      mt: 25,
                      mb: 5
                    }}>
                      No attainments found, please select at least one assessment model or
                      create a new one.
                    </Box>
                    :
                    <div>
                      <Box sx={{
                        margin: 'auto',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        mt: 25,
                        mb: 5
                      }}>
                        <CircularProgress />
                      </Box>
                      Loading attainments...
                    </div>
                }
              </div>
            }
          </Box>
          <Box sx={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', columnGap: 6
          }}>
            <Typography variant='h2' align='left' sx={{ mt: 6, mb: 3 }}>
              Course Instances
            </Typography>
            {
              /* Only admins and teachers are allowed to create a new instance */
              (auth?.role == SystemRole.Admin || isTeacherInCharge) &&
              <Button
                id='ag_new_instance_btn'
                size='large'
                variant='contained'
                sx={{ mt: 6, mb: 3 }}
                onClick={(): void => {
                  navigate(`/${courseId}/fetch-instances/${course.data.courseCode}`);
                }}
              >
                New instance
              </Button>
            }
          </Box>
          <InstancesTable courseId={courseId} />
          {
            currentAssessmentModel != null &&
            <FileLoadDialog
              assessmentModelId={currentAssessmentModel.id as number}
              open={fileLoadOpen}
              handleClose={(): void => setFileLoadOpen(false)}
            />
          }
          <CreateAssessmentModelDialog
            open={createAssessmentModelOpen}
            handleClose={(): void => setCreateAssessmentModelOpen(false)}
            onSubmit={assessmentModels.refetch}
          />
        </>
      }
    </Box>
  );
}
