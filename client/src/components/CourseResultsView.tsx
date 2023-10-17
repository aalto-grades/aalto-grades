// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, FinalGrade } from 'aalto-grades-common/types';
import { Box, Typography } from '@mui/material';
import { JSX, useEffect, useState } from 'react';
import { Params, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import AlertSnackbar from './alerts/AlertSnackbar';
import CourseResultsTable from './course-results-view/CourseResultsTable';

import {
  useCalculateFinalGrades, UseCalculateFinalGradesResult,
  useDownloadCsvTemplate, UseDownloadCsvTemplateResult,
  useGetFinalGrades, useGetRootAttainment
} from '../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../hooks/useSnackPackAlerts';
import { State } from '../types';

export default function CourseResultsView(): JSX.Element {
  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  const snackPack: SnackPackAlertState = useSnackPackAlerts();
  const [hasPendingStudents, setHasPendingStudents]: State<boolean> = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents]: State<Array<FinalGrade>> =
    useState<Array<FinalGrade>>([]);

  useEffect(() => {
    setHasPendingStudents(Boolean(
      selectedStudents.find((student: FinalGrade) => student.grades.length === 0)
    ));
  }, [selectedStudents]);

  const attainmentTree: UseQueryResult<AttainmentData> = useGetRootAttainment(
    courseId, assessmentModelId, 'descendants'
  );

  // Does not contain root attainment
  const attainmentList: Array<AttainmentData> = [];

  function constructAttainmentList(attainment: AttainmentData): void {
    if (attainment.subAttainments) {
      for (const subAttainment of attainment.subAttainments) {
        attainmentList.push(subAttainment);
        constructAttainmentList(subAttainment);
      }
    }
  }

  if (attainmentTree.data)
    constructAttainmentList(attainmentTree.data);

  const students: UseQueryResult<Array<FinalGrade>> = useGetFinalGrades(
    courseId, assessmentModelId
  );

  const calculateFinalGrades: UseCalculateFinalGradesResult = useCalculateFinalGrades();

  // If asking for a refetch then it also update the selectedStudents
  async function studentsRefetch():Promise<void> {
    students.refetch().then((students: UseQueryResult<Array<FinalGrade>>) => {
      if (students.data) {
        const newSelectedStudents: Array<FinalGrade> = [];
        // Refresh selectedStudents for updating childrens state
        selectedStudents.forEach((student: FinalGrade) => {
          const found: FinalGrade | undefined =
            students.data.find((element: FinalGrade) => element.userId == student.userId);

          if (found) {
            newSelectedStudents.push(found);
          }
        });
        setSelectedStudents(newSelectedStudents);
      }
    });
  }

  // Triggers the calculation of final grades
  async function handleCalculateFinalGrades(): Promise<void> {
    if (courseId && assessmentModelId && selectedStudents.length > 0) {
      snackPack.push({
        msg: 'Calculating final grades...',
        severity: 'info'
      });

      calculateFinalGrades.mutate(
        {
          courseId: courseId,
          assessmentModelId: assessmentModelId,
          studentNumbers: selectedStudents.map(
            (student: FinalGrade) => student.studentNumber
          )
        },
        {
          onSuccess: () => {
            snackPack.push({
              msg: 'Final grades calculated successfully.',
              severity: 'success'
            });
            // We need to refetch the students to get the new grades
            students.refetch().then((students: UseQueryResult<Array<FinalGrade>>) => {
              if (students.data) {
                const newSelectedStudents: Array<FinalGrade> = [];
                // Refresh selectedStudents for updating childrens state
                selectedStudents.forEach((student: FinalGrade) => {
                  const found: FinalGrade | undefined =
                    students.data.find((element: FinalGrade) => element.userId == student.userId);

                  if (found) {
                    newSelectedStudents.push(found);
                  }
                });
                setSelectedStudents(newSelectedStudents);
              }
            });
          }
        }
      );
    }
  }

  const downloadCsvTemplate: UseDownloadCsvTemplateResult = useDownloadCsvTemplate({
    onSuccess: (csvTemplate: string) => {
      const blob: Blob = new Blob([csvTemplate], { type: 'text/csv' });
      const link: HTMLAnchorElement = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = 'template.csv'; // TODO: Get filename from Content-Disposition
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();
    }
  });

  async function handleDownloadCsvTemplate(): Promise<void> {
    if (courseId && assessmentModelId) {
      snackPack.push({
        msg: 'Downloading CSV template',
        severity: 'info'
      });

      downloadCsvTemplate.mutate({
        courseId: courseId,
        assessmentModelId: assessmentModelId
      });
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
        attainmentList={attainmentList}
        loading={students.isLoading}
        calculateFinalGrades={handleCalculateFinalGrades}
        downloadCsvTemplate={handleDownloadCsvTemplate}
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
        hasPendingStudents={hasPendingStudents}
        refetch={studentsRefetch}
      />
    </Box>
  );
}
