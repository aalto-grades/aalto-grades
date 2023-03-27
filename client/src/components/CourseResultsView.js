// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect }from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CourseResultsTable from './course-results-view/CourseResultsTable';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';
import mockStudentGrades from '../mock-data/mockStudentGrades';

const CourseResultsView = () => {

  const [attainments, setAttainments] = useState([]);
  const [students, setStudents] = useState([]);
  // TODO: get instance ID from props
    
  useEffect(() => {
    // TODO: get attainments from backend
    setAttainments(mockAttainmentsClient);
    // TODO: get student grades from backend
    // modify the grades to fit the row structure
    setStudents(mockStudentGrades);
  }, []);

  return (
    <Box textAlign='left' alignItems='left'>
      <Typography variant="h3" component="div" sx={{ flexGrow: 1, mt: 8, mb: 4 }}>
        Course Results
      </Typography>
      <CourseResultsTable attainments={attainments} students={students}></CourseResultsTable>
    </Box>
    
  );

};

export default CourseResultsView;