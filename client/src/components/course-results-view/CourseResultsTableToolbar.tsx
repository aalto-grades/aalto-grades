// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FinalGrade} from '@common/types';
// import DownloadIcon from '@mui/icons-material/Download';
// import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  // IconButton,
  // TextField,
  Toolbar,
  Tooltip,
} from '@mui/material';
import {JSX, useState} from 'react';
import {
  NavigateFunction,
  Params,
  useNavigate,
  useParams,
} from 'react-router-dom';

import FileLoadDialog from './FileLoadDialog';
import {MenuButtonOption} from './MenuButton';
import SisuDownloadDialog from './SisuDownloadDialog';

import {State} from '../../types';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

export default function CourseResultsTableToolbar(props: {
  // search: string;
  // setSearch: (search: string) => void;
  calculateFinalGrades: () => Promise<void>;
  downloadCsvTemplate: () => Promise<void>;
  selectedStudents: Array<FinalGrade>;
  hasPendingStudents: boolean;
  refetch: () => void;
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const {assessmentModelId}: Params = useParams();

  const [showFileDialog, setShowFileDialog]: State<boolean> = useState(false);
  const [showSisuDialog, setShowSisuDialog]: State<boolean> = useState(false);
  const [showDialog, setShowDialog]: State<boolean> = useState(false);

  const actionOptions: Array<MenuButtonOption> = [
    {
      description: 'Import from A+',
      handleClick: (): void => {
        alert('Importing from A+ is not implemented');
      },
    },
    {
      description: 'Import from MyCourses',
      handleClick: (): void => {
        alert('Importing from MyCourses is not implemented');
      },
    },
  ];

  function handleCloseFileDialog(): void {
    setShowFileDialog(false);
    props.refetch();
  }

  function handleCloseSisuDialog(): void {
    setShowSisuDialog(false);
  }
  // Firing the refetch after the transition for closingis finished
  // to avoid abrupt layout changes in the dialog
  function handleExitedSisuDialog(): void {
    props.refetch(); // Should not be necessary, but selectedStudent is not updated otherwise
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
          {/* <MenuButton label="Import grades" options={actionOptions} /> */}
          {/* <Tooltip
            title="Download grading template with attainment names and student numbers."
            placement="top"
          >
            <Button
              variant="outlined"
              onClick={(): Promise<void> => props.downloadCsvTemplate()}
            >
              Download CSV template
            </Button>
          </Tooltip> */}
          {/* <Tooltip title="Upload grades from a CSV file." placement="top">
            <Button
              variant="outlined"
              onClick={(): void => setShowFileDialog(true)}
            >
              Upload Grade CSV
            </Button>
          </Tooltip> */}
          <Tooltip
            title={
              props.selectedStudents.length === 0
                ? 'Select at least one student number for grade calculation.'
                : 'Calculate course final grades for selected students.'
            }
            placement="top"
          >
            <span>
              <Button
                variant="outlined"
                onClick={(): Promise<void> => props.calculateFinalGrades()}
                disabled={props.selectedStudents.length === 0}
              >
                Calculate final grades
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            title={
              props.selectedStudents.length === 0
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
                disabled={props.selectedStudents.length === 0}
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
          <SisuDownloadDialog
            open={showSisuDialog}
            handleClose={handleCloseSisuDialog}
            handleExited={handleExitedSisuDialog}
            selectedStudents={props.selectedStudents}
          />
          <FileLoadDialog
            assessmentModelId={Number(assessmentModelId)}
            open={showFileDialog}
            handleClose={handleCloseFileDialog}
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
        setOpen={setShowDialog}
        open={showDialog}
        handleDiscard={(): void => navigate(-1)}
      />
    </Toolbar>
  );
}
