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
import mockAssignments from '../mock-data/mockAssignments';

//const dummyAssignments = [{ type: 'Exercises', name: '4 mandatory exercises', points: 20, weight: 0.2, id: 1, expiryDate: new Date(2024, 8, 14), 
//  subAssignments: [{ type: 'Exercises', name: 'Exercise 1', points: 5, weight: 0.2, id: 11 }, 
//    { type: 'Exercises', name: 'Exercise 2', points: 5, weight: 0.2, id: 12 }, 
//    { type: 'Exercises', name: 'Exercise 3', points: 5, weight: 0.2, id: 13, 
//      subAssignments: [{ type: 'Exercises', name: 'Exercise 3.1', points: 5, weight: 0.2, id: 111 }, 
//        { type: 'Exercises', name: 'Exercise 3.2', points: 5, weight: 0.2, id: 112 }] }, 
//    { type: 'Exercises', name: 'Exercise 4', points: 5, weight: 0.2, id: 14 }] },
//{ type: 'Exercises', name: '3 optional exercises', points: 20, weight: 0.2, id: 4, expiryDate: new Date(2024, 8, 14), 
//  subAssignments: [{ type: 'Exercises', name: 'Exercise 5', points: 5, weight: 0.2, id: 15 }, 
//    { type: 'Exercises', name: 'Exercise 6', points: 5, weight: 0.2, id: 16 }, 
//    { type: 'Exercises', name: 'Exercise 7', points: 5, weight: 0.2, id: 17 },] },
//{ type: 'Projects', name: '1 mandatory project', points: 30, weight: 0.20, id: 2, expiryDate: new Date(2024, 8, 14) },
//{ type: 'Exams', name: '1 mandatory exam', points: 40, weight: 0.55, id: 3, expiryDate: new Date(2024, 8, 14) }];

//const dummyPastInstances = [{ period: '2020-2021 Autumn I-II', startDate: new Date(2020, 8, 8), endDate: new Date(2020, 11, 7), type: 'Lecture', id: 1 },
//  { period: '2019-2020 Autumn I-II', startDate: new Date(2019, 8, 9), endDate: new Date(2019, 11, 8), type: 'Lecture', id: 2 }];

const mockCurrentInstance = mockInstances[0];
const mockPastInstances = mockInstances
  .filter( instance => instance.courseData.id === mockCurrentInstance.courseData.id )
  .filter( instance => instance.id != mockCurrentInstance.id );

//const groupAssignments = (assignmentArray) => {
//  const map = new Map();
//  assignmentArray.forEach(assignment => {
//    if (map.has(assignment.type)) {
//      map.get(assignment.type).push(assignment);
//    } else {
//      map.set(assignment.type, [assignment]);
//    }
//  });
//
//  console.log([...map.values()]);
//  return [...map.values()];
//};

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
          <Assignments assignments={mockAssignments} formula={'Weighted Average'} />
        }
      </Box>
      <Typography variant='h4' align='left' sx={{ fontWeight: 'light', mt: 8, mb: 3 }}>Past Instances</Typography>
      <InstancesTable data={mockPastInstances} />
    </Box>
  );
};

export default CourseView;