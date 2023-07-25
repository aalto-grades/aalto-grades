// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade } from 'aalto-grades-common/types';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { Params, useParams } from 'react-router-dom';

import AlertSnackbar from './alerts/AlertSnackbar';
import CourseResultsTable from './course-results-view/CourseResultsTable';

import {
  useCalculateFinalGrades, UseCalculateFinalGradesResult,
  useDownloadCsvTemplate,
  useGetFinalGrades
} from '../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../hooks/useSnackPackAlerts';
import { State } from '../types';
import { UseQueryResult } from '@tanstack/react-query';

export default function CourseResultsView(): JSX.Element {
  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  const snackPack: SnackPackAlertState = useSnackPackAlerts();
  const [selectedStudents, setSelectedStudents]: State<Array<FinalGrade>> =
    useState<Array<FinalGrade>>([]);

  const students: UseQueryResult<Array<FinalGrade>> = useGetFinalGrades(
    courseId, assessmentModelId
  );

  const calculateFinalGrades: UseCalculateFinalGradesResult = useCalculateFinalGrades({
    onSuccess: () => {
      snackPack.push({
        msg: 'Final grades calculated successfully.',
        severity: 'success'
      });

      students.refetch();
    }
  });

  // Triggers the calculation of final grades
  async function handleCalculateFinalGrades(): Promise<void> {
    if (courseId && assessmentModelId && selectedStudents.length > 0) {
      snackPack.push({
        msg: 'Calculating final grades...',
        severity: 'info'
      });

      calculateFinalGrades.mutate({
        courseId: courseId,
        assessmentModelId: assessmentModelId,
        studentNumbers: selectedStudents.map(
          (student: FinalGrade) => student.studentNumber
        )
      });
    }
  }

  const downloadCsvTemplate: UseQueryResult<string> = useDownloadCsvTemplate(
    courseId, assessmentModelId,
    { enabled: false }
  );

  async function handleDownloadCsvTemplate(): Promise<void> {
    snackPack.push({
      msg: 'Downloading CSV template',
      severity: 'info'
    });

    downloadCsvTemplate.refetch();

    if (!downloadCsvTemplate.isLoading && downloadCsvTemplate.data) {
      const blob: Blob = new Blob([downloadCsvTemplate.data], { type: 'text/csv' });
      const link: HTMLAnchorElement = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = 'template.csv'; // TODO: Get filename from Content-Disposition
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();
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
        downloadCsvTemplate={handleDownloadCsvTemplate}
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
      />
    </Box>
  );
}
