// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CourseResultsTable from './course-results-view/CourseResultsTable';
import AlertSnackbar from './alerts/AlertSnackbar';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';
import mockStudentGradesFinal from '../mock-data/mockStudentGradesFinal';
import gradesService from '../services/grades';

const CourseResultsView = (): JSX.Element => {
  let { courseId, instanceId }: any = useParams();

  const [attainments, setAttainments] = useState([]);
  const [students, setStudents] = useState([]);
  // TODO: get instance ID from props

  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [messageInfo, setMessageInfo] = useState(undefined);


  useEffect(() => {
    // TODO: get attainments from backend
    setAttainments(mockAttainmentsClient);
    // TODO: get student grades from backend
    // modify the grades to fit the row structure
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

  function sleep(ms: number): Promise<any> {
    return new Promise(r => setTimeout(r, ms));
  }

  // Triggers the calculation of final grades
  async function calculateFinalGrades(): Promise<void> {
    setSnackPack((prev) => [
      ...prev,
      {
        msg: 'Calculating final grades...',
        severity: 'info'
      }
    ]);
    await sleep(3000);
    // Throw error if no grades have been added
    if (students.length === 0) {
      setSnackPack((prev) => [
        ...prev,
        {
          msg: 'Import student grades before calculating the final grade.',
          severity: 'error'
        }
      ]);
    } else {
      try {
        // TODO: connect to backend
        setSnackPack((prev) => [
          ...prev,
          {
            msg: 'Final grades calculated successfully.',
            severity: 'success'
          }
        ]);
        setStudents(mockStudentGradesFinal);

      } catch (exception) {
        console.log(exception);
        setSnackPack((prev) => [
          ...prev,
          {
            msg: 'Calculating the final grades failed.',
            severity: 'error'
          }
        ]);
      }
    }
    await sleep(4000);
    setAlertOpen(false);
  }

  async function updateGrades(newGrades): Promise<void> {
    setSnackPack((prev) => [
      ...prev,
      {
        msg: 'Importing grades...',
        severity: 'info'
      }
    ]);
    await sleep(3000);
    try {
      // TODO: connect to backend
      setSnackPack((prev) => [
        ...prev,
        {
          msg: 'Grades imported successfully.',
          severity: 'success'
        }
      ]);
      setStudents(newGrades);
      await sleep(3000);
      setAlertOpen(false);

    } catch (exception) {
      console.log(exception);
      setSnackPack((prev) => [
        ...prev,
        {
          msg: 'Grade import failed.',
          severity: 'error'
        }
      ]);
    }
  }

  async function downloadCsvTemplate(): Promise<void> {
    setSnackPack((prev) => [
      ...prev,
      {
        msg: 'Downloading CSV template',
        severity: 'info'
      }
    ]);

    try {
      const res = await gradesService.downloadCsvTemplate(courseId, instanceId);

      const blob = new Blob([res.data], { type: 'text/csv' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'template.csv'; // TODO: Get filename from Content-Disposition
      link.click();

      setSnackPack((prev) => [
        ...prev,
        {
          msg: 'CSV template downloaded successfully.',
          severity: 'success'
        }
      ]);
    } catch (e) {
      console.log(e);
      setSnackPack((prev) => [
        ...prev,
        {
          msg: 'Downloading CSV template failed. Make sure there are attainments in the instance.',
          severity: 'error'
        }
      ]);
    } finally {
      setAlertOpen(false);
    }
  }

  return (
    <Box textAlign='left' alignItems='left'>
      <AlertSnackbar
        messageInfo={messageInfo} setMessageInfo={setMessageInfo}
        open={alertOpen} setOpen={setAlertOpen}
      />
      <Typography variant="h1" sx={{ flexGrow: 1, mt: 8, mb: 4 }}>
        Course Results
      </Typography>
      <CourseResultsTable
        attainments={attainments}
        students={students}
        calculateFinalGrades={calculateFinalGrades}
        updateGrades={updateGrades}
        downloadCsvTemplate={downloadCsvTemplate}
      />
    </Box>
  );

};

export default CourseResultsView;
