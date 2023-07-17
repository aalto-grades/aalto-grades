// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { Params, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import CourseResultsTable from './course-results-view/CourseResultsTable';
import AlertSnackbar from './alerts/AlertSnackbar';
import gradeServices from '../services/grades';
import useSnackPackAlerts, { SnackPackAlertState } from '../hooks/useSnackPackAlerts';
import { sleep } from '../utils';
import { State } from '../types';

function CourseResultsView(): JSX.Element {
  const { courseId, instanceId }: Params = useParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading]: State<boolean> = useState(false);

  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  useEffect(() => {
    if (courseId && instanceId) {
      setLoading(true);
      gradeServices.getFinalGrades(courseId, instanceId)
        .then(data => {
          setStudents(data.finalGrades);
        })
        .catch(exception => {
          console.log(exception);
          snackPack.push({
            msg: 'Fetching final grades failed, make sure grades are imported and calculated.',
            severity: 'error'
          });
        }).finally(() => {
          setLoading(false);
          snackPack.setAlertOpen(false);
        });
    }
  }, []);

  // Triggers the calculation of final grades
  async function calculateFinalGrades(): Promise<void> {
    try {
      snackPack.push({
        msg: 'Calculating final grades...',
        severity: 'info'
      });
      await sleep(2000);
      if (courseId && instanceId) {
        const success = await gradeServices.calculateFinalGrades(courseId, instanceId);

        if (success) {
          snackPack.push({
            msg: 'Final grades calculated successfully.',
            severity: 'success'
          });
          await sleep(2000);

          setLoading(true);
          snackPack.push({
            msg: 'Fetching final grades...',
            severity: 'info'
          });
          const data = await gradeServices.getFinalGrades(courseId, instanceId);
          setStudents(data.finalGrades);
        }
      }
    } catch (exception) {
      console.log(exception);
      snackPack.push({
        msg: 'Import student grades before calculating the final grade.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateGrades(newGrades: any): Promise<void> {
    snackPack.push({
      msg: 'Importing grades...',
      severity: 'info'
    });
    await sleep(2000);
    try {
      // TODO: connect to backend
      snackPack.push({
        msg: 'Grades imported successfully.',
        severity: 'success'
      });
      setStudents(newGrades);
      await sleep(3000);
      snackPack.setAlertOpen(false);

    } catch (exception) {
      console.log(exception);
      snackPack.push({
        msg: 'Grade import failed.',
        severity: 'error'
      });
    }
  }

  async function downloadCsvTemplate(): Promise<void> {
    snackPack.push({
      msg: 'Downloading CSV template',
      severity: 'info'
    });

    try {
      if (courseId && instanceId) {
        const res = await gradeServices.downloadCsvTemplate(courseId, instanceId);

        const blob = new Blob([res.data], { type: 'text/csv' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'template.csv'; // TODO: Get filename from Content-Disposition
        link.click();

        snackPack.push({
          msg: 'CSV template downloaded successfully.',
          severity: 'success'
        });
      }
    } catch (e) {
      console.log(e);
      snackPack.push({
        msg: 'Downloading CSV template failed. Make sure there are attainments in the instance.',
        severity: 'error'
      });
    } finally {
      snackPack.setAlertOpen(false);
    }
  }

  return (
    <Box textAlign='left' alignItems='left'>
      <AlertSnackbar snackPack={snackPack} />
      <Typography variant="h1" sx={{ flexGrow: 1, mt: 8, mb: 4 }}>
        Course Results
      </Typography>
      <CourseResultsTable
        students={students}
        loading={loading}
        calculateFinalGrades={calculateFinalGrades}
        downloadCsvTemplate={downloadCsvTemplate}
      />
    </Box>
  );
}

export default CourseResultsView;
