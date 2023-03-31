// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect }from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CourseResultsTable from './course-results-view/CourseResultsTable';
import AlertSnackbar from './alerts/AlertSnackbar';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';
import mockStudentGrades from '../mock-data/mockStudentGrades';
import mockStudentGradesFinal from '../mock-data/mockStudentGradesFinal';

const CourseResultsView = () => {

  const [attainments, setAttainments] = useState([]);
  const [students, setStudents] = useState([]);
  // TODO: get instance ID from props

  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

    
  useEffect(() => {
    // TODO: get attainments from backend
    setAttainments(mockAttainmentsClient);
    // TODO: get student grades from backend
    // modify the grades to fit the row structure
    setStudents(mockStudentGrades);
  }, []);

  // useEffect in charge of handling the back-to-back alerts
  // makes the previous disappear before showing the new one
  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      setAlertOpen(false);
    }
  }, [snackPack, messageInfo, alertOpen]);

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Triggers the calculation of final grades
  const calculateFinalGrades = async () => {
    setSnackPack((prev) => [...prev,
      { msg: 'Calculating final grades...', severity: 'info' }
    ]);
    await sleep(4000);
    try {
      // TODO: connect to backend
      setSnackPack((prev) => [...prev,
        { msg: 'Final grades calculated.', severity: 'success' }
      ]);
      setStudents(mockStudentGradesFinal);
      await sleep(4000);
      setAlertOpen(false);

    } catch (exception) {
      console.log(exception);
      setSnackPack((prev) => [...prev,
        { msg: 'Calculating the final grades failed.', severity: 'error' }
      ]);
    }
  };

  return (
    <Box textAlign='left' alignItems='left'>
      <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
      <Typography variant="h3" component="div" sx={{ flexGrow: 1, mt: 8, mb: 4 }}>
        Course Results
      </Typography>
      <CourseResultsTable
        attainments={attainments}
        students={students}
        calculateFinalGrades={calculateFinalGrades}
      />
    </Box>
    
  );

};

export default CourseResultsView;