// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { JSX, useState, useEffect } from 'react';
import { NavigateFunction, Params, useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';
import FileLoadDialog from './course-view/FileLoadDialog';
import CourseDetails from './course-view/CourseDetails';
import Attainments from './course-view/Attainments';
import CreateAssessmentModelDialog from './course-view/CreateAssessmentModelDialog';
import InstancesTable from './course-view/InstancesTable';
import assessmentModelsService from '../services/assessmentModels';
import attainmentService from '../services/attainments';
import coursesService from '../services/courses';
import useAuth, { AuthContextType } from '../hooks/useAuth';
import {
  AssessmentModelData, AttainmentData, CourseData, SystemRole, UserData
} from 'aalto-grades-common/types';
import { State } from '../types';
import CircularProgress from '@mui/material/CircularProgress';

function CourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId }: Params = useParams();
  const { auth, isTeacherInCharge, setIsTeacherInCharge }: AuthContextType = useAuth();

  const [course, setCourse]: State<CourseData | null> =
    useState<CourseData | null>(null);

  const [currentAssessmentModel, setCurrentAssessmentModel]: State<AssessmentModelData | null> =
    useState<AssessmentModelData | null>(null);
  const [assessmentModels, setAssessmentModels]: State<Array<AssessmentModelData>> =
    useState<Array<AssessmentModelData>>([]);

  /**
   * Tree set to undefined when fetching the data from API, display loading.
   * If no assessment models exists, set to null to display "no attainments" message,
   * otherwise render attainmentTree.
   */
  const [attainmentTree, setAttainmentTree]: State<AttainmentData | null | undefined> =
    useState<AttainmentData | null | undefined>(undefined);

  const [animation, setAnimation]: State<boolean> = useState(false);
  const [fileLoadOpen, setFileLoadOpen]: State<boolean> = useState(false);
  const [createAssessmentModelOpen, setCreateAssessmentModelOpen]: State<boolean> = useState(false);

  useEffect(() => {
    if (courseId) {
      coursesService.getCourse(courseId)
        .then((course: CourseData) => {
          setCourse(course);

          if (auth) {
            const teacherInCharge: Array<UserData> = course.teachersInCharge.filter(
              (teacher: UserData) => teacher.id == auth.id
            );
            setIsTeacherInCharge(teacherInCharge.length != 0);
          }
        })
        .catch((e: Error) => console.log(e.message));

      assessmentModelsService.getAllAssessmentModels(courseId)
        .then((assessmentModels: Array<AssessmentModelData>) => {
          setAssessmentModels(assessmentModels);

          /**
           * Newly created courses do not have assessment models assigned.
           * Set tree to null so proper message can be displayed.
           */
          if (assessmentModels.length === 0) {
            setAttainmentTree(null);
          } else {
            setCurrentAssessmentModel(assessmentModels[0]);

            if (assessmentModels[0].id) {
              attainmentService.getAllAttainments(courseId, assessmentModels[0].id)
                .then((attainmentTree: AttainmentData) => {
                  setAttainmentTree(attainmentTree);
                })
                .catch((e: Error) => console.log(e.message));
            }
          }
        })
        .catch((e: Error) => console.log(e.message));
    }
  }, []);

  useEffect(() => {
    setAnimation(true);
  }, [currentAssessmentModel]);

  function onChangeAssessmentModel(assessmentModel: AssessmentModelData): void {
    if (courseId && assessmentModel.id && assessmentModel.id !== currentAssessmentModel?.id) {
      setAnimation(false);
      setAttainmentTree(undefined);
      setCurrentAssessmentModel(assessmentModel);

      attainmentService.getAllAttainments(courseId, assessmentModel.id)
        .then((attainmentTree: AttainmentData) => {
          setAttainmentTree(attainmentTree);
        })
        .catch((e: Error) => console.log(e.message));
    }
  }

  function onCreateAssessmentModel(): void {
    if (courseId) {
      assessmentModelsService.getAllAssessmentModels(courseId)
        .then((assessmentModels: Array<AssessmentModelData>) => {
          setAssessmentModels(assessmentModels);
        })
        .catch((e: Error) => console.log(e.message));
    }
  }

  return (
    <Box sx={{ mx: -2.5 }}>
      {
        course &&
        <>
          <Typography variant='h1' align='left'>{course.courseCode}</Typography>
          <Box sx={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', mb: 4, columnGap: 6
          }}>
            <Typography variant='h2' align='left'>{course.name.en}</Typography>
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
              {
                (currentAssessmentModel && currentAssessmentModel.id) &&
                <CourseDetails
                  course={course}
                  assessmentModels={assessmentModels}
                  currentAssessmentModelId={currentAssessmentModel.id}
                  onChangeAssessmentModel={onChangeAssessmentModel}
                />
              }
            </div>
            {
              /* a different attainment component will be created for students */
              (auth?.role == SystemRole.Admin || isTeacherInCharge) &&
              <div style={{ width: '100%' }}>
                {attainmentTree ?
                  <Grow
                    in={animation}
                    style={{ transformOrigin: '0 0 0' }}
                    {...(animation ? { timeout: 1000 } : { timeout: 0 })}
                  >
                    <div style={{ width: '100%' }}>
                      {
                        (courseId && currentAssessmentModel) &&
                        <Attainments
                          attainmentTree={attainmentTree}
                          courseId={courseId}
                          formula={'Weighted Average'} /* TODO: Retrieve real formula */
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
                  navigate(`/${courseId}/fetch-instances/${course.courseCode}`);
                }}
              >
                New instance
              </Button>
            }
          </Box>
          {
            courseId &&
            <InstancesTable courseId={courseId} />
          }
          <FileLoadDialog
            instanceId={0} // TODO: Should not be instance?
            open={fileLoadOpen}
            handleClose={(): void => setFileLoadOpen(false)}
          />
          <CreateAssessmentModelDialog
            open={createAssessmentModelOpen}
            handleClose={(): void => setCreateAssessmentModelOpen(false)}
            onSubmit={onCreateAssessmentModel}
          />
        </>
      }
    </Box>
  );
}

export default CourseView;
