// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Add} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  useTheme,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {StudentRow, SystemRole} from '@/common/types';
import {batchCalculateGraph} from '@/common/util/calculateGraph';
import CalculateFinalGradesDialog from './CalculateFinalGradesDialog';
import SisuDownloadDialog from './SisuDownloadDialog';
import {useTableContext} from '../../context/useTableContext';
import {useAddFinalGrades} from '../../hooks/api/finalGrade';
import {useGetAllAssessmentModels, useGetGrades} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {GradeSelectOption, findBestGrade} from '../../utils';
import {findLatestGrade} from '../../utils/table';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import UploadDialog from '../course-view/UploadDialog';

/**
 * Toggle a string in an array: Adds it if not present, removes it if already
 * present.
 */
const toggleString = (arr: string[], str: string): string[] => {
  const index = arr.indexOf(str);
  if (index > -1) arr.splice(index, 1);
  else arr.push(str);

  return arr;
};

const CourseResultsTableToolbar = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge} = useAuth();
  const {
    table,
    gradeSelectOption,
    setGradeSelectOption,
    selectedAssessmentModel,
    setSelectedAssessmentModel,
  } = useTableContext();
  const navigate = useNavigate();
  const theme = useTheme();

  const assessmentModels = useGetAllAssessmentModels(courseId);
  const addFinalGrades = useAddFinalGrades(courseId);
  const getGrades = useGetGrades(courseId);

  const [showCalculateDialog, setShowCalculateDialog] =
    useState<boolean>(false);
  const [showSisuDialog, setShowSisuDialog] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [missingFinalGrades, setMissingFinalGrades] = useState<boolean>(false);

  const [uploadOpen, setUploadOpen] = useState<boolean>(false);

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
  }, [table.getSelectedRowModel().rows]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const handleExitedSisuDialog = (): void => {
    getGrades.refetch();
  };

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

    enqueueSnackbar('Calculating final grades...', {variant: 'info'});

    const finalGrades = batchCalculateGraph(
      model.graphStructure,
      selectedRows.map(selectedRow => ({
        userId: selectedRow.user.id,
        attainments: selectedRow.attainments.map(att => ({
          attainmentId: att.attainmentId,
          grade: findBestGrade(att.grades, {gradeSelectOption})!.grade, // TODO: Manage expired attainments
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
        // mx: 1,
        p: 1,
        borderRadius: 1,
        display: 'flex',
        backgroundColor: theme.vars.palette.hoverGrey2,
      }}
    >
      <Button
        variant="outlined"
        onClick={() => setUploadOpen(true)}
        startIcon={<Add />}
      >
        Add Grades
      </Button>
      <Divider orientation="vertical" sx={{mx: 1}} flexItem />
      <FormControl>
        <InputLabel id="select-grade-select-option">
          Grade selection criterion
        </InputLabel>
        <Select
          labelId="select-grade-select-option"
          value={gradeSelectOption}
          label="Grade selection criterion"
          onChange={e =>
            setGradeSelectOption(e.target.value as GradeSelectOption)
          }
        >
          <MenuItem value="best">Select best grade</MenuItem>
          <MenuItem value="latest">Select latest grade</MenuItem>
        </Select>
      </FormControl>
      <FormControl>
        <InputLabel id="select-assessment-model-option">
          Assessment Model
        </InputLabel>
        <Select
          labelId="select-assessment-model-option"
          value={selectedAssessmentModel}
          label="Assessment Model"
          onChange={e =>
            setSelectedAssessmentModel(e.target.value as 'any' | number)
          }
        >
          <MenuItem value="any">Any</MenuItem>
          {(assessmentModels.data ?? []).map(model => (
            <MenuItem
              key={`assessment-model-select-${model.id}`}
              value={model.id}
            >
              {model.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider orientation="vertical" sx={{mx: 1}} flexItem />
      <button
        onClick={() =>
          table.setGrouping(old =>
            structuredClone(toggleString(old, 'grouping'))
          )
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
      <Divider orientation="vertical" sx={{mx: 1}} flexItem />

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
            selectedRows={table.getSelectedRowModel().rows.map(r => r.original)}
            gradeSelectOption={gradeSelectOption}
            calculateFinalGrades={handleCalculateFinalGrades}
          />
          <SisuDownloadDialog
            open={showSisuDialog}
            handleClose={() => setShowSisuDialog(false)}
            handleExited={handleExitedSisuDialog}
            selectedRows={table.getSelectedRowModel().rows.map(r => r.original)}
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

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <UnsavedChangesDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        handleDiscard={() => navigate(-1)}
      />
    </Box>
  );
};

export default CourseResultsTableToolbar;
