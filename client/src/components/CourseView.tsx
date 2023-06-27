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
import InstanceDetails from './course-view/InstanceDetails';
import Attainments from './course-view/Attainments';
import AssessmentModelsTable from './course-view/AssessmentModelsTable';
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

// REPLACE SOME DAY? currently this info can't be fetched from database
const mockInstitution: string = 'Aalto University';

function CourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId }: Params = useParams();
  const { auth }: AuthContextType = useAuth();

  const [course, setCourse]: State<CourseData> = useState(null);

  const [currentAssessmentModel, setCurrentAssessmentModel]: State<AssessmentModelData> =
    useState(null);
  const [assessmentModels, setAssessmentModels]: State<Array<AssessmentModelData>> =
    useState([]);
  const [attainmentTree, setAttainmentTree]: State<AttainmentData> =
    useState(null);

  const [currentInstance, setCurrentInstance]: State<CourseInstanceData> = useState(null);
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
        setCurrentInstance(sortedInstances[0]);
      })
      .catch((e: Error) => console.log(e.message));
  }, []);

  useEffect(() => {
    setAnimation(true);
  }, [currentInstance, currentAssessmentModel]);

  function handleClickOpen(): void {
    setOpen(true);
  }

  function handleClose(): void {
    setOpen(false);
  }

  function onChangeAssessmentModel(assessmentModel: AssessmentModelData): void {
    if (assessmentModel.id !== currentAssessmentModel.id) {
      setAnimation(false);
      setCurrentAssessmentModel(assessmentModel);

      assessmentModelsService.getAllAttainments(courseId, assessmentModel.id)
        .then((attainmentTree: AttainmentData) => {
          setAttainmentTree(attainmentTree);
        })
        .catch((e: Error) => console.log(e.message));
    }
  }

  function onChangeInstance(instance: CourseInstanceData): void {
    if (instance.id !== currentInstance.id) {
      setAnimation(false);
      setCurrentInstance(instance);
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
          {
            currentInstance && instances &&
            <>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Grow
                  in={animation}
                  style={{ transformOrigin: '50% 0 0' }}
                  {...(animation ? { timeout: 500 } : { timeout: 0 })}
                >
                  <div>
                    <InstanceDetails info={{
                      ...currentInstance,
                      department: course.department,
                      institution: mockInstitution
                    }} />
                  </div>
                </Grow>
                {
                  /* a different attainment component will be created for students */
                  auth.role == SystemRole.Admin && attainmentTree &&
                  <Grow
                    in={animation}
                    style={{ transformOrigin: '0 0 0' }}
                    {...(animation ? { timeout: 1000 } : { timeout: 0 })}
                  >
                    <div style={{ width: '100%' }}>
                      <Attainments
                        attainmentTree={attainmentTree}
                        courseId={courseId}
                        formula={'Weighted Average'}
                        assessmentModel={currentAssessmentModel}
                        handleAddPoints={handleClickOpen}
                      /> {/* TODO: Retrieve real formula */}
                    </div>
                  </Grow>
                }
              </Box>
              <Typography variant='h2' align='left' sx={{ mt: 6, mb: 3 }}>
                Assessment Models
              </Typography>
              <AssessmentModelsTable
                data={assessmentModels}
                current={currentAssessmentModel.id}
                onClick={onChangeAssessmentModel}
              />
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
                    variant='contained'
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
                current={currentInstance.id}
                onClick={onChangeInstance}
              />
              <FileLoadDialog
                instanceId={currentInstance.id}
                open={open}
                handleClose={handleClose}
              />
            </>
            ||
            <Typography variant='h3'>
              This course has no instances. <a href={
                `/${courseId}/fetch-instances/${course.courseCode}`
              }>
                Add a new instance.
              </a>
            </Typography>
          }
        </>
      }
    </Box>
  );
}

export default CourseView;
