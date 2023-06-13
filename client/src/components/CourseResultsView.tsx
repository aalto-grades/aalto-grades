// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect }from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CourseResultsTable from './course-results-view/CourseResultsTable';
import AlertSnackbar from './alerts/AlertSnackbar';
import gradesService from '../services/grades';
import { useParams } from 'react-router-dom';


const CourseResultsView = () => {

  const [students, setStudents] = useState([]);
  const { courseId, instanceId } = useParams();

  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

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

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Triggers the calculation of final grades
  const calculateFinalGrades = async () => {
    try {
      setSnackPack((prev) => [...prev,
        { msg: 'Calculating final grades...', severity: 'info' }
      ]);
      await sleep(2000);
      const success = await gradesService.calculateFinalGrades(courseId, instanceId);

      if (success) {
        setSnackPack((prev) => [...prev,
          { msg: 'Final grades calculated successfully.', severity: 'success' }
        ]);
        await sleep(2000);

        setSnackPack((prev) => [...prev,
          { msg: 'Fething final grades...', severity: 'info' }
        ]);
        const data = await gradesService.getFinalGrades(courseId, instanceId);
        setStudents(data.finalGrades);
        setAlertOpen(false);
      }
    } catch (exception) {
      console.log(exception);
      setSnackPack((prev) => [...prev,
        { msg: 'Import student grades before calculating the final grade.', severity: 'error' }
      ]);
    }
  };

  const updateGrades = async (newGrades) => {
    setSnackPack((prev) => [...prev,
      { msg: 'Importing grades...', severity: 'info' }
    ]);
    await sleep(3000);
    try {
      // TODO: connect to backend
      setSnackPack((prev) => [...prev,
        { msg: 'Grades imported successfully.', severity: 'success' }
      ]);
      setStudents(newGrades);
      await sleep(3000);
      setAlertOpen(false);

    } catch (exception) {
      console.log(exception);
      setSnackPack((prev) => [...prev,
        { msg: 'Grade import failed.', severity: 'error' }
      ]);
    }
  };

  return (
    <Box textAlign='left' alignItems='left'>
      <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
      <Typography variant="h1" sx={{ flexGrow: 1, mt: 8, mb: 4 }}>
        Course Results
      </Typography>
      <CourseResultsTable
        students={students}
        calculateFinalGrades={calculateFinalGrades}
        updateGrades={updateGrades}
      />
    </Box>
  );
};

export default CourseResultsView;