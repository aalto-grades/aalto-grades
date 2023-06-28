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
import InstancesTable from './course-view/InstancesTable';
import assessmentModelsService from '../services/assessmentModels';
import coursesService from '../services/courses';
import instancesService from '../services/instances';
import sortingServices from '../services/sorting';
import useAuth, { AuthContextType } from '../hooks/useAuth';
import {
  AssessmentModelData, AttainmentData, CourseData, CourseInstanceData, SystemRole
} from 'aalto-grades-common/types';
import { State } from '../types';
import CircularProgress from '@mui/material/CircularProgress';

function CourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId }: Params = useParams();
  const { auth }: AuthContextType = useAuth();

  const [course, setCourse]: State<CourseData | null> = useState(null);

  const [currentAssessmentModel, setCurrentAssessmentModel]: State<AssessmentModelData | null> =
    useState(null);
  const [assessmentModels, setAssessmentModels]: State<Array<AssessmentModelData>> =
    useState([]);
  const [attainmentTree, setAttainmentTree]: State<AttainmentData | null> =
    useState(null);

  const [instances, setInstances]: State<Array<CourseInstanceData>> = useState([]);

  const [animation, setAnimation]: State<boolean> = useState(false);
  const [open, setOpen]: State<boolean> = useState(false);

  useEffect(() => {
    coursesService.getCourse(courseId)
      .then((course: CourseData) => {
        setCourse(course);
      })
      .catch((e: Error) => console.log(e.message));

    assessmentModelsService.getAllAssessmentModels(courseId)
      .then((assessmentModels: Array<AssessmentModelData>) => {
        setAssessmentModels(assessmentModels);
        setCurrentAssessmentModel(assessmentModels[0]);

        assessmentModelsService.getAllAttainments(courseId, assessmentModels[0].id)
          .then((attainmentTree: AttainmentData) => {
            setAttainmentTree(attainmentTree);
          })
          .catch((e: Error) => console.log(e.message));
      })
      .catch((e: Error) => console.log(e.message));


    instancesService.getInstances(courseId)
      .then((courseInstances: Array<CourseInstanceData>) => {
        const sortedInstances: Array<CourseInstanceData> = courseInstances.sort(
          (a: CourseInstanceData, b: CourseInstanceData) => {
            return sortingServices.sortByDate(a.startDate, b.startDate);
          }
        );
        setInstances(sortedInstances);
      })
      .catch((e: Error) => console.log(e.message));
  }, []);

  useEffect(() => {
    setAnimation(true);
  }, [currentAssessmentModel]);

  function handleClickOpen(): void {
    setOpen(true);
  }

  function handleClose(): void {
    setOpen(false);
  }

  function onChangeAssessmentModel(assessmentModel: AssessmentModelData): void {
    if (assessmentModel.id !== currentAssessmentModel?.id) {
      setAnimation(false);
      setAttainmentTree(null);
      setCurrentAssessmentModel(assessmentModel);

      assessmentModelsService.getAllAttainments(courseId, assessmentModel.id)
        .then((attainmentTree: AttainmentData) => {
          setAttainmentTree(attainmentTree);
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
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <div>
              <CourseDetails
                course={course}
                assessmentModels={assessmentModels}
                currentAssessmentModelId={currentAssessmentModel?.id}
                onChangeAssessmentModel={onChangeAssessmentModel}
              />
            </div>
            {
              /* a different attainment component will be created for students */
              auth.role == SystemRole.Admin &&
              <div style={{ width: '100%' }}>
                { attainmentTree != null ?
                  <Grow
                    in={animation}
                    style={{ transformOrigin: '0 0 0' }}
                    {...(animation ? { timeout: 1000 } : { timeout: 0 })}
                  >
                    <div style={{ width: '100%' }}>
                      <Attainments
                        attainmentTree={attainmentTree}
                        courseId={courseId}
                        formula={'Weighted Average'} /* TODO: Retrieve real formula */
                        assessmentModel={currentAssessmentModel}
                        handleAddPoints={handleClickOpen}
                      />
                    </div>
                  </Grow>
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
              auth.role == SystemRole.Admin &&
              <Button
                id='ag_new_instance_btn'
                size='large'
                sx={{ mt: 6, mb: 3 }}
                onClick={(): void => {
                  navigate(`/${courseId}/fetch-instances/${course.courseCode}`);
                }}
              >  {/* TODO: Check path */}
                New instance
              </Button>
            }
          </Box>
          <InstancesTable
            data={instances}
          />
          <FileLoadDialog
            //instanceId={currentInstance.id}
            open={open}
            handleClose={handleClose}
          />
        </>
      }
    </Box>
  );
}

export default CourseView;
