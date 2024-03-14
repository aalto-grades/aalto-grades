// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box} from '@mui/material';
import {JSX, useEffect, useState} from 'react';
import {Params, useParams} from 'react-router-dom';

import {StudentRow} from '@common/types';
import {
  UseCalculateFinalGradesResult,
  useCalculateFinalGrades,
  useGetGrades,
} from '../hooks/useApi';
import useSnackPackAlerts, {
  SnackPackAlertState,
} from '../hooks/useSnackPackAlerts';
import AlertSnackbar from './alerts/AlertSnackbar';
import CourseResultsTableToolbar from './course-results-view/CourseResultsTableToolbar';
import CourseResultsTanTable from './course-results-view/CourseResultsTanTable';

export default function CourseResultsView(): JSX.Element {
  const {courseId}: Params = useParams() as {courseId: string};

  const snackPack: SnackPackAlertState = useSnackPackAlerts();
  const [missingFinalGrades, setMissingFinalGrades] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<StudentRow[]>([]);

  useEffect(() => {
    setMissingFinalGrades(
      false
      // Check if there are any students without final grade to prevent exporting sisu csv
      // Currently final grade doesn't exist in the type so waiting for that.
      // TODO: fix
      // Boolean(
      //   selectedRows.find(selectedRow => selectedRow.grades?.length === 0)
      // )
    );
  }, [selectedRows]);

  const calculateFinalGrades: UseCalculateFinalGradesResult =
    useCalculateFinalGrades();

  const gradesQuery = useGetGrades(courseId);

  // If asking for a refetch then it also update the selectedRows
  // Refresh selectedRows for updating childrens state
  const studentsRefetch = (): void => {
    // TODO: Uncomment code when finalGrades api endpoint exists
    // finalGrades.refetch().then((finalGrades: UseQueryResult<FinalGrade[]>) => {
    //   if (!finalGrades.data) return;
    //   setSelectedRows(oldSelectedRows =>
    //     oldSelectedRows.map(oldSelectedRow => ({
    //       ...oldSelectedRow,
    //       finalGrades: [
    //         ...(oldSelectedRow.finalGrades ?? []),
    //         finalGrades.data.find(
    //           element => element.userId === oldSelectedRow.user.id
    //         ) as FinalGrade,
    //       ],
    //     }))
    //   );
    // });
  };

  // Triggers the calculation of final grades
  const handleCalculateFinalGrades = (
    assessmentModelId: number,
    gradingDate: Date
  ): void => {
    console.log(JSON.stringify(selectedRows, null, 4));
    if (courseId && selectedRows.length > 0) {
      snackPack.push({
        msg: 'Calculating final grades...',
        severity: 'info',
      });

      // TODO: Also send gradingDate to backend
      calculateFinalGrades.mutate(
        {
          courseId: courseId,
          assessmentModelId,
          studentNumbers: selectedRows.map(
            selectedRow => selectedRow.user.studentNumber as string
          ),
        },
        {
          onSuccess: () => {
            snackPack.push({
              msg: 'Final grades calculated successfully.',
              severity: 'success',
            });
            // We need to refetch the students to get the new grades
            studentsRefetch();
          },
        }
      );
    }
  };

  return (
    <Box textAlign="left" alignItems="left">
      <AlertSnackbar snackPack={snackPack} />
      {/* <Typography variant="h1" sx={{flexGrow: 1, my: 4}}>
        Course Results
      </Typography> */}
      {/* <CourseResultsGrid /> */}
      <CourseResultsTableToolbar
        calculateFinalGrades={handleCalculateFinalGrades}
        selectedRows={selectedRows}
        hasPendingStudents={missingFinalGrades}
        refetch={studentsRefetch}
      />
      {gradesQuery.data && (
        <CourseResultsTanTable
          data={gradesQuery.data}
          selectedStudents={selectedRows}
          setSelectedStudents={setSelectedRows}
        />
      )}
      {/* <CourseResultsTable
        students={students.data ?? []}
        attainmentList={attainmentList}
        loading={students.isLoading}
        calculateFinalGrades={handleCalculateFinalGrades}
        downloadCsvTemplate={handleDownloadCsvTemplate}
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
        hasPendingStudents={hasPendingStudents}
        refetch={studentsRefetch}
      /> */}
    </Box>
  );
}
