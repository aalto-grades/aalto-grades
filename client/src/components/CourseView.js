// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';
import InstanceDetails from './course-view/InstanceDetails';
import Assignments from './course-view/Assignments';
import InstancesTable from './course-view/InstancesTable';
import courseService from '../services/courses';
import instancesService from '../services/instances';
import sortingServices from '../services/sorting';
import useAuth from '../hooks/useAuth';
import mockAssignmentsClient from '../mock-data/mockAssignmentsClient';

const mockInstitution = 'Aalto University';   // REPLACE SOME DAY? currently this info can't be fetched from database

const CourseView = () => {
  let navigate = useNavigate();
  let { courseId } = useParams();
  const { auth } = useAuth();

  const [courseDetails, setCourseDetails] = useState(null);
  const [currentInstance, setCurrentInstance] = useState(null);
  const [instances, setInstances] = useState([]);

  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    instancesService.getInstances(courseId)
      .then((data) => {
        const sortedInstances = data.courseInstances.sort((a, b) => sortingServices.sortByDate(a.startDate, b.startDate));
        setInstances(sortedInstances);
        setCurrentInstance(sortedInstances[0]);
      })
      .catch((e) => console.log(e.message));
    
    courseService.getCourse(courseId)
      .then((data) => {
        setCourseDetails(data.course);
      })
      .catch((e) => console.log(e.message));
  }, []);

  useEffect(() => {
    setAnimation(true);
  }, [currentInstance]);

  const onChangeInstance = (instance) => {
    if(instance.id !== currentInstance.id) {
      setAnimation(false);
      setCurrentInstance(instance);
    }
  };

  return(
    <Box sx={{ mr: -4, ml: -4 }}>
      {courseDetails && currentInstance && instances &&
        <> 
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant='h3' sx={{ fontWeight: 'light' }}>{courseDetails.courseCode + ' – ' + courseDetails.name.en}</Typography>
            { /* Only admins and teachers are allowed to create a new instance */
              (auth.role == 'SYSADMIN' || auth.role == 'TEACHER') && 
            <Button size='large' variant='contained' onClick={() => { navigate(`/fetch-instances/${courseId}/${courseDetails.courseCode}`); }}>  {/* TODO: Check path */}
              New instance
            </Button>
            }
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 3 }}>
            <Grow in={animation} style={{ transformOrigin: '50% 0 0' }} {...(animation? { timeout: 500 } : { timeout: 0 })}>
              <div>
                <InstanceDetails info={ { ...currentInstance, department: courseDetails.department, institution: mockInstitution } } />
              </div>
            </Grow>
            { /* a different assignment component will be created for students */
              (auth.role == 'SYSADMIN' || auth.role == 'TEACHER') && 
              <Grow in={animation} style={{ transformOrigin: '0 0 0' }} {...(animation? { timeout: 1000 } : { timeout: 0 })}>
                <div>
                  <Assignments assignments={mockAssignmentsClient} formula={'Weighted Average'} instance={currentInstance} /> {/* TODO: Retrieve real formula */}
                </div>
              </Grow>
            }
          </Box>
          <Typography variant='h4' align='left' sx={{ fontWeight: 'light', mt: 6, mb: 3 }}>All Instances</Typography>
          <InstancesTable data={instances} current={currentInstance.id} onClick={onChangeInstance} />
        </>
      }
    </Box>
  );
};

export default CourseView;