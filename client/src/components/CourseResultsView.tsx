// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { Params, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CourseResultsTable from './course-results-view/CourseResultsTable';
import AlertSnackbar from './alerts/AlertSnackbar';
import gradeServices from '../services/grades';
import { sleep } from '../utils';
import { FinalGrade, Message, State } from '../types';

function CourseResultsView(): JSX.Element {
  const { courseId, assessmentModelId }: Params = useParams();

  const [students, setStudents]: State<Array<FinalGrade>> = useState<Array<FinalGrade>>([]);
  const [snackPack, setSnackPack]: State<Array<Message>> = useState<Array<Message>>([]);
  const [alertOpen, setAlertOpen]: State<boolean> = useState(false);
  const [loading, setLoading]: State<boolean> = useState(false);
  const [messageInfo, setMessageInfo]: State<Message | null> =
    useState<Message | null>(null);

  useEffect(() => {
    if (courseId && assessmentModelId) {
      setLoading(true);
      gradeServices.getFinalGrades(courseId, assessmentModelId)
        .then((data: Array<FinalGrade>) => {
          setStudents(data);
        })
        .catch((error: unknown) => {
          console.log(error);
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
      setSnackPack((prev: Array<Message>) => prev.slice(1));
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
      if (courseId && assessmentModelId) {
        await gradeServices.calculateFinalGrades(courseId, assessmentModelId);

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
        const data: Array<FinalGrade> =
          await gradeServices.getFinalGrades(courseId, assessmentModelId);
        setStudents(data);

      }
    } catch (err: unknown) {
      console.log(err);
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
      if (courseId && assessmentModelId) {
        const res: BlobPart = await gradeServices.downloadCsvTemplate(courseId, assessmentModelId);
        const blob: Blob = new Blob([res], { type: 'text/csv' });
        const link: HTMLAnchorElement = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = 'template.csv'; // TODO: Get filename from Content-Disposition
        link.click();

        snackPackAdd({
          msg: 'CSV template downloaded successfully.',
          severity: 'success'
        });
      }
    } catch (err: unknown) {
      console.log(err);
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
