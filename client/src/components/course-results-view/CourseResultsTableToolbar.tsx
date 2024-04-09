// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Toolbar, Tooltip} from '@mui/material';
import {JSX, useState} from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';

import {StudentRow} from '@common/types';
import {State} from '../../types';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import CalculateFinalGradesDialog from './CalculateFinalGradesDialog';
import SisuDownloadDialog from './SisuDownloadDialog';

export default function CourseResultsTableToolbar(props: {
  // search: string;
  // setSearch: (search: string) => void;
  calculateFinalGrades: (
    modelId: number,
    dateOverride: boolean,
    gradingDate: Date
  ) => Promise<boolean>;
  selectedRows: StudentRow[];
  hasPendingStudents: boolean;
  refreshFinalGrades: () => void;
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  const [showCalculateDialog, setShowCalculateDialog] =
    useState<boolean>(false);
  const [showSisuDialog, setShowSisuDialog]: State<boolean> = useState(false);
  const [showDialog, setShowDialog]: State<boolean> = useState(false);

  function handleCloseSisuDialog(): void {
    setShowSisuDialog(false);
  }
  // Firing the refetch after the transition for closingis finished
  // to avoid abrupt layout changes in the dialog
  function handleExitedSisuDialog(): void {
    props.refreshFinalGrades(); // Should not be necessary, but selectedStudent is not updated otherwise
  }

  return (
    <Toolbar
      sx={{
        mx: 1,
        py: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
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
              props.selectedRows.length === 0
                ? 'Select at least one student number for grade calculation.'
                : 'Calculate course final grades for selected students.'
            }
            placement="top"
          >
            <span>
              <Button
                variant="outlined"
                onClick={() => setShowCalculateDialog(true)}
                disabled={props.selectedRows.length === 0}
              >
                Calculate final grades
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            title={
              props.selectedRows.length === 0
                ? 'Select at least one student number for downloading grades.'
                : props.hasPendingStudents
                ? 'Grades with status "PENDING" cannot be downloaded, ' +
                  'unselect or calculate grades for these.'
                : 'Download final course grades as a Sisu compatible CSV file.'
            }
            placement="top"
          >
            <span>
              <Button
                variant="outlined"
                color={props.hasPendingStudents ? 'error' : 'primary'}
                onClick={(): void => {
                  if (!props.hasPendingStudents) {
                    setShowSisuDialog(true);
                  }
                }}
                disabled={props.selectedRows.length === 0}
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
            selectedRows={props.selectedRows}
            calculateFinalGrades={props.calculateFinalGrades}
          />
          <SisuDownloadDialog
            open={showSisuDialog}
            handleClose={handleCloseSisuDialog}
            handleExited={handleExitedSisuDialog}
            selectedRows={props.selectedRows}
          />
        </Box>
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
    </Toolbar>
  );
}
