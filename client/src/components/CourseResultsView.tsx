// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box} from '@mui/material';
import {JSX, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {StudentRow} from '@common/types';
import {batchCalculateGraph} from '@common/util/calculateGraph';
import {enqueueSnackbar} from 'notistack';
import {useAddFinalGrades} from '../hooks/api/finalGrade';
import {useGetAllAssessmentModels, useGetGrades} from '../hooks/useApi';
import {findBestGradeOption} from '../utils';
import CourseResultsTableToolbar from './course-results-view/CourseResultsTableToolbar';
import CourseResultsTanTable from './course-results-view/CourseResultsTanTable';

export default function CourseResultsView(): JSX.Element {
  const {courseId} = useParams() as {courseId: string};
  const addFinalGrades = useAddFinalGrades(courseId);
  const assesmentModels = useGetAllAssessmentModels(courseId);

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

  const findLatestGrade = (row: StudentRow): Date => {
    let latestDate = new Date(1970, 0, 1);
    for (const att of row.attainments) {
      for (const grade of att.grades) {
        const gradeDate = new Date(grade.date!);
        if (gradeDate.getTime() > latestDate.getTime()) latestDate = gradeDate;
      }
    }
    return latestDate;
  };

  // Triggers the calculation of final grades
  const handleCalculateFinalGrades = async (
    assessmentModelId: number,
    dateOverride: boolean,
    gradingDate: Date
  ): Promise<boolean> => {
    const model = assesmentModels.data?.find(
      assesmentModel => assesmentModel.id === assessmentModelId
    );
    if (model === undefined) return false;

    enqueueSnackbar('Calculating final grades...', {
      variant: 'info',
    });

    const finalGrades = batchCalculateGraph(
      model.graphStructure,
      selectedRows.map(selectedRow => ({
        userId: selectedRow.user.id,
        attainments: selectedRow.attainments.map(att => ({
          attainmentId: att.attainmentId,
          grade: findBestGradeOption(att.grades)!.grade, // TODO: Manage expired attainments
        })),
      }))
    );
    await addFinalGrades.mutateAsync(
      selectedRows.map(selectedRow => ({
        userId: selectedRow.user.id,
        assessmentModelId,
        grade: finalGrades[selectedRow.user.id].finalGrade,
        date: dateOverride ? gradingDate : findLatestGrade(selectedRow),
      }))
    );
    enqueueSnackbar('Final grades calculated successfully.', {
      variant: 'success',
    });
    studentsRefetch();
    return true;
  };

  return (
    <Box textAlign="left" alignItems="left">
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
    </Box>
  );
}
