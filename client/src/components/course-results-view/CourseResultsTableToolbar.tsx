// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Tooltip} from '@mui/material';
import {JSX, useEffect, useMemo, useState} from 'react';
import {NavigateFunction, useNavigate, useParams} from 'react-router-dom';

import {StudentRow, SystemRole} from '@common/types';
import {batchCalculateGraph} from '@common/util/calculateGraph';
import {enqueueSnackbar} from 'notistack';
import {useTableContext} from '../../context/GradesTableProvider';
import {useAddFinalGrades} from '../../hooks/api/finalGrade';
import {useGetAllAssessmentModels, useGetGrades} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {State} from '../../types';
import {findBestGrade} from '../../utils';
import {findLatestGrade} from '../../utils/table';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import CalculateFinalGradesDialog from './CalculateFinalGradesDialog';
import SisuDownloadDialog from './SisuDownloadDialog';

function toggleString(arr: string[], str: string): string[] {
  const index = arr.indexOf(str);
  if (index > -1) {
    arr.splice(index, 1);
  } else {
    arr.push(str);
  }
  return arr;
}

export default function CourseResultsTableToolbar(): JSX.Element {
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge} = useAuth();
  const {table} = useTableContext();
  const navigate: NavigateFunction = useNavigate();

  const assessmentModels = useGetAllAssessmentModels(courseId);
  const addFinalGrades = useAddFinalGrades(courseId);
  const getGrades = useGetGrades(courseId);

  const [showCalculateDialog, setShowCalculateDialog] =
    useState<boolean>(false);
  const [showSisuDialog, setShowSisuDialog]: State<boolean> = useState(false);
  const [showDialog, setShowDialog]: State<boolean> = useState(false);
  const [missingFinalGrades, setMissingFinalGrades] = useState<boolean>(false);

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

  useEffect(() => {
    setMissingFinalGrades(
      // Prevent exporting sisu csv if students without final grades found
      Boolean(
        table
          .getSelectedRowModel()
          .rows.find(
            selectedRow =>
              selectedRow.original.finalGrades === undefined ||
              selectedRow.original.finalGrades.length === 0
          )
      )
    );
    console.log('missingFinalGrades', missingFinalGrades);
    console.log(
      table
        .getSelectedRowModel()
        .rows.find(
          selectedRow =>
            selectedRow.original.finalGrades === undefined ||
            selectedRow.original.finalGrades.length === 0
        )
    );
  }, [table.getSelectedRowModel().rows]);

  function handleCloseSisuDialog(): void {
    setShowSisuDialog(false);
  }

  // // If asking for a refetch then it also update the selectedRows
  // // Refresh selectedRows for updating childrens state
  // const refreshFinalGrades = (): void => {
  //   getFinalGrades.refetch().then(newFinalGrades => {
  //     if (!newFinalGrades.data) return;
  //     setSelectedRows(oldSelectedRows =>
  //       oldSelectedRows.map(oldSelectedRow => ({
  //         ...oldSelectedRow,
  //         finalGrades: [
  //           ...newFinalGrades.data.filter(
  //             element => element.userId === oldSelectedRow.user.id
  //           ),
  //         ],
  //       }))
  //     );
  //   });
  // };

  // Firing the refetch after the transition for closing is finished
  // to avoid abrupt layout changes in the dialog
  function handleExitedSisuDialog(): void {
    getGrades.refetch();
  }

  // Triggers the calculation of final grades
  const handleCalculateFinalGrades = async (
    selectedRows: StudentRow[],
    assessmentModelId: number,
    dateOverride: boolean,
    gradingDate: Date
  ): Promise<boolean> => {
    const model = assessmentModels.data?.find(
      assessmentModel => assessmentModel.id === assessmentModelId
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
          grade: findBestGrade(att.grades)!.grade, // TODO: Manage expired attainments
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
    // refreshFinalGrades();
    return true;
  };

  return (
    <Box
      sx={{
        mx: 1,
        display: 'flex',
      }}
    >
      <button
        onClick={() =>
          table.setGrouping(old => {
            const res = [...toggleString(old, 'grouping')];
            return res;
          })
        }
      >
        Group by Date
      </button>
      <input
        type="text"
        value={
          (table.getColumn('user_studentNumber')?.getFilterValue() ??
            '') as string
        }
        onChange={e => {
          table.getColumn('user_studentNumber')?.setFilterValue(e.target.value);
        }}
        placeholder={'Search...'}
        className="w-36 border shadow rounded"
      />

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {editRights && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Tooltip
              title={
                table.getSelectedRowModel().rows.length === 0
                  ? 'Select at least one student number for grade calculation.'
                  : 'Calculate course final grades for selected students.'
              }
              placement="top"
            >
              <span>
                <Button
                  variant="outlined"
                  onClick={() => setShowCalculateDialog(true)}
                  disabled={table.getSelectedRowModel().rows.length === 0}
                >
                  Calculate final grades
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                table.getSelectedRowModel().rows.length === 0
                  ? 'Select at least one student number for downloading grades.'
                  : missingFinalGrades
                    ? 'Grades with status "PENDING" cannot be downloaded, ' +
                      'unselect or calculate grades for these.'
                    : 'Download final course grades as a Sisu compatible CSV file.'
              }
              placement="top"
            >
              <span>
                <Button
                  variant="outlined"
                  color={missingFinalGrades ? 'error' : 'primary'}
                  onClick={(): void => {
                    if (!missingFinalGrades) {
                      setShowSisuDialog(true);
                    }
                  }}
                  disabled={table.getSelectedRowModel().rows.length === 0}
                >
                  Download Sisu CSV
                </Button>
              </span>
            </Tooltip>
            {/* <Button
              variant="outlined"
              color={props.selectedStudents.length != 0 ? 'error' : 'primary'}
              onClick={(): void => {
                if (props.selectedStudents.length != 0) {
                  setShowDialog(true);
                } else {
                  navigate(-1);
                }
              }}
            >
              Return to course view
            </Button> */}
            <CalculateFinalGradesDialog
              open={showCalculateDialog}
              onClose={() => setShowCalculateDialog(false)}
              selectedRows={table
                .getSelectedRowModel()
                .rows.map(r => r.original)}
              calculateFinalGrades={handleCalculateFinalGrades}
            />
            <SisuDownloadDialog
              open={showSisuDialog}
              handleClose={handleCloseSisuDialog}
              handleExited={handleExitedSisuDialog}
              selectedRows={table
                .getSelectedRowModel()
                .rows.map(r => r.original)}
            />
          </Box>
        )}
        {/* <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            value={props.search}
            name="search"
            label="Search by Student Number"
            onChange={({
              target,
            }: {
              target: EventTarget & (HTMLInputElement | HTMLTextAreaElement);
            }): void => props.setSearch(target.value)}
            InputLabelProps={{shrink: true}}
            margin="normal"
          />
          <Tooltip title="Filter" placement="top">
            <IconButton size="large" sx={{m: 1.5, mb: 1, mr: 0}}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download results" placement="top">
            <IconButton size="large" sx={{m: 1, mt: 2, ml: 0}}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box> */}
      </Box>
      <UnsavedChangesDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        handleDiscard={() => navigate(-1)}
      />
    </Box>
  );
}
