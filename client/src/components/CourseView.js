// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import OngoingInstanceInfo from './course-view/OngoingInstanceInfo';
import Assignments from './course-view/Assignments';
import InstancesTable from './course-view/InstancesTable';
import instancesService from '../services/instances';
import sortingServices from '../services/sorting';
import useAuth from '../hooks/useAuth';
import mockInstances from '../mock-data/mockInstances';
import mockAssignmentsClient from '../mock-data/mockAssignmentsClient';

const mockCurrentInstance = mockInstances[0];
/*const mockPastInstances = mockInstances
  .filter( instance => instance.courseData.id === mockCurrentInstance.courseData.id )
  .filter( instance => instance.id != mockCurrentInstance.id );*/

const CourseView = () => {
  let navigate = useNavigate();
  let { courseId } = useParams();
  const courseCode = 'CS-A1150';    // Temp!!!!
  const { auth } = useAuth();

  const [currentInstance, setCurrentInstance] = useState(null);
  const [pastInstances, setPastInstances] = useState([]);

  useEffect(() => {
    instancesService.getInstances(courseId)
      .then((data) => {
        console.log(data);
        const sortedInstances = data.courseInstances.sort((a, b) => sortingServices.sortByDate(a.startDate, b.startDate));
        setCurrentInstance(sortedInstances[0]);
        setPastInstances(sortedInstances.slice(1));
        console.log(sortedInstances[0]);
      })
      .catch((e) => console.log(e.message));
  }, []);

  return(
    <Box sx={{ mr: -4, ml: -4 }}>
      {currentInstance && pastInstances ?
        <> 
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant='h3' sx={{ fontWeight: 'light' }}>{courseCode + ' – ' + currentInstance.courseData.name.en}</Typography>
            { /* Only admins and teachers are allowed to create a new instance */
              (auth.role == 'SYSADMIN' || auth.role == 'TEACHER') && 
            <Button size='large' variant='contained' onClick={() => { navigate('/fetch-instances/' + courseCode); }}>  {/* TODO: Check path */}
              New instance
            </Button>
            }
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 3 }}>
            <OngoingInstanceInfo info={mockCurrentInstance} />
            { /* a different assignment component will be created for students */
              (auth.role == 'SYSADMIN' || auth.role == 'TEACHER') && 
            <Assignments assignments={mockAssignmentsClient} formula={'Weighted Average'} instance={mockCurrentInstance} /> /* TODO: Retrieve real formula */
            }
          </Box>
          <Typography variant='h4' align='left' sx={{ fontWeight: 'light', mt: 8, mb: 3 }}>Past Instances</Typography>
          <InstancesTable data={pastInstances} />
        </>
        : <LinearProgress sx={{ margin: '200px 50px 0px 50px' }}/>
      }
    </Box>
  );
};

export default CourseView;