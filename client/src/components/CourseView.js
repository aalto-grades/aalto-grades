// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import OngoingInstanceInfo from './course-view/OngoingInstanceInfo';
import Assignments from './course-view/Assignments';
import InstancesTable from './course-view/InstancesTable';

const dummyInfo = {period: '2021-2022 Autumn I-II', startDate: new Date(2021, 8, 14), endDate: new Date(2021, 11, 13), type: 'Lecture', credits: 5, scale: 'General scale, 0-5', organizer: 'Department of computer science', institution: 'Aalto University' };

const dummyAssignments = [{type: 'Exercises', description: '10 mandatory exercises', points: 30, weight: 0.2, id: 1},
  {type: 'Projects', description: '1 mandatory project', points: 30, weight: 0.20, id: 2},
  {type: 'Exams', description: '1 mandatory exam', points: 40, weight: 0.55, id: 3}];

const dummyPastInstances = [{period: '2020-2021 Autumn I-II', startDate: new Date(2020, 8, 8), endDate: new Date(2020, 11, 7), type: 'Lecture', id: 1},
  {period: '2019-2020 Autumn I-II', startDate: new Date(2019, 8, 9), endDate: new Date(2019, 11, 8), type: 'Lecture', id: 2}];

const CourseView = () => {
  let { courseCode } = useParams();

  return(
    <Box sx={{ mr: -4, ml: -4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h3' sx={{ fontWeight: 'light' }}>{courseCode + ' – Human-Computer Interaction'}</Typography>
        <Button size='large' variant='contained'>New instance</Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 3 }}>
        <OngoingInstanceInfo info={dummyInfo} />
        <Assignments assignments={dummyAssignments} />
      </Box>
      <Typography variant='h4' align='left' sx={{ fontWeight: 'light', mt: 8, mb: 3 }}>Past Instances</Typography>
      <InstancesTable data={dummyPastInstances} />
    </Box>
  );
};

export default CourseView;