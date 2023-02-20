// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import OngoingInstanceInfo from './course-view/OngoingInstanceInfo';
import Assignments from './course-view/Assignments';
import InstancesTable from './course-view/InstancesTable';
import useAuth from '../hooks/useAuth';
import mockInstances from '../mock-data/mockInstances';
import mockSuggestedAssignments from '../mock-data/mockSuggestedAssignments';

const mockCurrentInstance = mockInstances[0];
const mockPastInstances = mockInstances
  .filter( instance => instance.courseData.id === mockCurrentInstance.courseData.id )
  .filter( instance => instance.id != mockCurrentInstance.id );

const CourseView = () => {
  let navigate = useNavigate();
  let { courseCode } = useParams();

  const { auth } = useAuth();

  return(
    <Box sx={{ mr: -4, ml: -4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h3' sx={{ fontWeight: 'light' }}>{courseCode + ' – ' + mockCurrentInstance.courseData.name.en}</Typography>
        { /* Only admins and teachers are allowed to create a new instance */
          (auth.role == 'SYSADMIN' || auth.role == 'TEACHER') && 
          <Button size='large' variant='contained' onClick={() => { navigate('/fetch-instances/' + courseCode); }}>
            New instance
          </Button>
        }
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 3 }}>
        <OngoingInstanceInfo info={mockCurrentInstance} />
        { /* a different assignment component will be created for students */
          (auth.role == 'SYSADMIN' || auth.role == 'TEACHER') && 
          <Assignments assignments={mockSuggestedAssignments} formula={'Weighted Average'} instance={mockCurrentInstance} /> /* TODO: Retrieve real formula */
        }
      </Box>
      <Typography variant='h4' align='left' sx={{ fontWeight: 'light', mt: 8, mb: 3 }}>Past Instances</Typography>
      <InstancesTable data={mockPastInstances} />
    </Box>
  );
};

export default CourseView;