// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { Params, useParams } from 'react-router-dom';

import AlertSnackbar from './alerts/AlertSnackbar';
import CourseResultsTable from './course-results-view/CourseResultsTable';

import gradeServices from '../services/grades';
import { Message, State } from '../types';
import { sleep } from '../utils';

function CourseResultsView(): JSX.Element {
  const { courseId, instanceId }: Params = useParams();

  const [students, setStudents] = useState([]);
  const [snackPack, setSnackPack]: State<Array<Message>> = useState<Array<Message>>([]);
  const [alertOpen, setAlertOpen]: State<boolean> = useState(false);
  const [loading, setLoading]: State<boolean> = useState(false);
  const [messageInfo, setMessageInfo]: State<Message | null> =
    useState<Message | null>(null);

  useEffect(() => {
    if (courseId && instanceId) {
      setLoading(true);
      gradeServices.getFinalGrades(courseId, instanceId)
        .then(data => {
          setStudents(data.finalGrades);
        })
        .catch(exception => {
          console.log(exception);
          snackPackAdd({
            msg: 'Fetching final grades failed, make sure grades are imported and calculated.',
            severity: 'error'
          });
        }).finally(() => {
          setLoading(false);
          setAlertOpen(false);
        });
    }
  }, []);

  function snackPackAdd(msg: Message): void {
    setSnackPack((prev: Array<Message>): Array<Message> => [...prev, msg]);
  }

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

  // Triggers the calculation of final grades
  async function calculateFinalGrades(): Promise<void> {
    try {
      snackPackAdd({
        msg: 'Calculating final grades...',
        severity: 'info'
      });
      await sleep(2000);
      if (courseId && instanceId) {
        const success = await gradeServices.calculateFinalGrades(courseId, instanceId);

        if (success) {
          snackPackAdd({
            msg: 'Final grades calculated successfully.',
            severity: 'success'
          });
          await sleep(2000);

          setLoading(true);
          snackPackAdd({
            msg: 'Fetching final grades...',
            severity: 'info'
          });
          const data = await gradeServices.getFinalGrades(courseId, instanceId);
          setStudents(data.finalGrades);
        }
      }
    } catch (exception) {
      console.log(exception);
      snackPackAdd({
        msg: 'Import student grades before calculating the final grade.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateGrades(newGrades: any): Promise<void> {
    snackPackAdd({
      msg: 'Importing grades...',
      severity: 'info'
    });
    await sleep(2000);
    try {
      // TODO: connect to backend
      snackPackAdd({
        msg: 'Grades imported successfully.',
        severity: 'success'
      });
      setStudents(newGrades);
      await sleep(3000);
      setAlertOpen(false);

    } catch (exception) {
      console.log(exception);
      snackPackAdd({
        msg: 'Grade import failed.',
        severity: 'error'
      });
    }
  }

  async function downloadCsvTemplate(): Promise<void> {
    snackPackAdd({
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

        snackPackAdd({
          msg: 'CSV template downloaded successfully.',
          severity: 'success'
        });
      }
    } catch (e) {
      console.log(e);
      snackPackAdd({
        msg: 'Downloading CSV template failed. Make sure there are attainments in the instance.',
        severity: 'error'
      });
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
        students={students}
        loading={loading}
        calculateFinalGrades={calculateFinalGrades}
        downloadCsvTemplate={downloadCsvTemplate}
      />
    </Box>
  );
}

export default CourseResultsView;
