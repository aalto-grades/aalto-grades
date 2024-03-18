// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box} from '@mui/material';
import {JSX, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {StudentRow} from '@common/types';
import {batchCalculateGraph} from '@common/util/calculateGraph';
import {useAddFinalGrades} from '../hooks/api/finalGrade';
import {useGetAllAssessmentModels, useGetGrades} from '../hooks/useApi';
import useSnackPackAlerts from '../hooks/useSnackPackAlerts';
import {findBestGradeOption} from '../utils';
import AlertSnackbar from './alerts/AlertSnackbar';
import CourseResultsTableToolbar from './course-results-view/CourseResultsTableToolbar';
import CourseResultsTanTable from './course-results-view/CourseResultsTanTable';

export default function CourseResultsView(): JSX.Element {
  const {courseId} = useParams() as {courseId: string};
  const addFinalGrades = useAddFinalGrades(courseId);
  const assesmentModels = useGetAllAssessmentModels(courseId);
  const snackPack = useSnackPackAlerts();

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

  // Triggers the calculation of final grades
  const handleCalculateFinalGrades = async (
    assessmentModelId: number,
    gradingDate: Date
  ): Promise<boolean> => {
    const model = assesmentModels.data?.find(
      assesmentModel => assesmentModel.id === assessmentModelId
    );
    if (model === undefined) return false;

    snackPack.push({
      msg: 'Calculating final grades...',
      severity: 'info',
    });

    const finalGrades = batchCalculateGraph(
      model.graphStructure!,
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
        date: gradingDate,
      }))
    );
    snackPack.push({
      msg: 'Final grades calculated successfully.',
      severity: 'success',
    });
    studentsRefetch();
    return true;
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
