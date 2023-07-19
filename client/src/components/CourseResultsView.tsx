// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade } from 'aalto-grades-common/types';
import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { Params, useParams } from 'react-router-dom';

import AlertSnackbar from './alerts/AlertSnackbar';
import CourseResultsTable from './course-results-view/CourseResultsTable';

/*import {
  calculateFinalGrades as calculateFinalGradesApi,
  downloadCsvTemplate as downloadCsvTemplateApi, getFinalGrades
  } from '../services/grades';*/
import {
  useCalculateFinalGrades, UseCalculateFinalGradesResult,
  useGetFinalGrades
} from '../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../hooks/useSnackPackAlerts';
import { State } from '../types';
import { sleep } from '../utils';
import { UseQueryResult } from '@tanstack/react-query';

export default function CourseResultsView(): JSX.Element {
  const { courseId, assessmentModelId }: Params = useParams();

  if (!courseId || !assessmentModelId)
    return (<></>);

  const snackPack: SnackPackAlertState = useSnackPackAlerts();
  const [selectedStudents, setSelectedStudents]: State<Array<FinalGrade>> =
    useState<Array<FinalGrade>>([]);

  const students: UseQueryResult<Array<FinalGrade>> = useGetFinalGrades(
    courseId, assessmentModelId
  );

  const calculateFinalGrades: UseCalculateFinalGradesResult = useCalculateFinalGrades();

  // Triggers the calculation of final grades
  async function handleCalculateFinalGrades(): Promise<void> {
    try {
      snackPack.push({
        msg: 'Calculating final grades...',
        severity: 'info'
      });
      await sleep(2000);
      if (courseId && assessmentModelId && selectedStudents.length !== 0) {
        /*await calculateFinalGradesApi(
          courseId,
          assessmentModelId,
          selectedStudents.map((student: FinalGrade) => student.studentNumber)
        );

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
          await getFinalGrades(courseId, assessmentModelId);
        setSelectedStudents([]);
        setStudents(data);*/
      }
    } catch (err: unknown) {
      console.log(err);
      snackPack.push({
        msg: 'Import student grades before calculating the final grade.',
        severity: 'error'
      });
    }
  }

  async function updateGrades(newGrades: Array<FinalGrade>): Promise<void> {
    snackPack.push({
      msg: 'Importing grades...',
      severity: 'info'
    });
    await sleep(2000);
    try {
      // TODO: connect to backend
      /*snackPack.push({
        msg: 'Grades imported successfully.',
        severity: 'success'
      });
      setStudents(newGrades);
      await sleep(3000);
      snackPack.setAlertOpen(false);*/

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
      if (courseId && assessmentModelId) {
        /*const res: string = await downloadCsvTemplateApi(courseId, assessmentModelId);
        const blob: Blob = new Blob([res], { type: 'text/csv' });
        const link: HTMLAnchorElement = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = 'template.csv'; // TODO: Get filename from Content-Disposition
        link.click();
        URL.revokeObjectURL(link.href);
        link.remove();

        snackPack.push({
          msg: 'CSV template downloaded successfully.',
          severity: 'success'
        });*/
      }
    } catch (err: unknown) {
      console.log(err);
      snackPack.push({
        msg: 'Downloading CSV template failed. Make sure there are attainments in the instance.',
        severity: 'error'
      });
    } finally {
      //snackPack.setAlertOpen(false);
    }
  }

  return (
    <Box textAlign='left' alignItems='left'>
      <AlertSnackbar snackPack={snackPack} />
      <Typography variant="h1" sx={{ flexGrow: 1, my: 4 }}>
        Course Results
      </Typography>
      <CourseResultsTable
        students={students.data ?? []}
        loading={students.isLoading}
        calculateFinalGrades={handleCalculateFinalGrades}
        downloadCsvTemplate={downloadCsvTemplate}
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
      />
    </Box>
  );
}
