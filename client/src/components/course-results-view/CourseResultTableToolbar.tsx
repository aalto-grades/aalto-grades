// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade, Status } from 'aalto-grades-common/types';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Button, IconButton, TextField, Toolbar, Tooltip } from '@mui/material';
import { useState } from 'react';
import { Params, useParams } from 'react-router-dom';

import FileLoadDialog from './FileLoadDialog';
import MenuButton, { MenuButtonOption } from './MenuButton';
import SisuDownloadDialog from './SisuDownloadDialog';

import { State } from '../../types';

export default function CourseResultsTableToolbar(props: {
  search: string,
  setSearch: (search: string) => void,
  calculateFinalGrades: () => Promise<void>,
  downloadCsvTemplate: () => Promise<void>,
  selectedStudents: Array<FinalGrade>
}): JSX.Element {
  const { assessmentModelId }: Params = useParams();

  const [showFileDialog, setShowFileDialog]: State<boolean> = useState(false);
  const [showSisuDialog, setShowSisuDialog]: State<boolean> = useState(false);

  const actionOptions: Array<MenuButtonOption> = [
    {
      description: 'Import from A+',
      handleClick: (): void => {
        alert('Importing from A+ is not implemented');
      }
    },
    {
      description: 'Import from MyCourses',
      handleClick: (): void => {
        alert('Importing from MyCourses is not implemented');
      }
    }
  ];

  function handleCloseFileDialog(): void {
    setShowFileDialog(false);
  }

  function handleCloseSisuDialog(): void {
    setShowSisuDialog(false);
  }

  function hasPendingStudents(): boolean {
    return props.selectedStudents.filter((student: FinalGrade) => {
      return student.grade === Status.Pending;
    }).length !== 0;
  }

  return (
    <Toolbar
      sx={{
        mx: 1,
        py: 2,
      }}
    >
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', width: '100%'
      }}>
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
          <TextField
            size='small'
            type='strig'
            value={props.search}
            name='search'
            label='Search by Student Number'
            onChange={(
              { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
            ): void => props.setSearch(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
          <Tooltip title="Filter" placement="top">
            <IconButton size='large' sx={{ m: 1.5, mb: 1, mr: 0 }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download results" placement="top">
            <IconButton size='large' sx={{ m: 1, mt: 1.5, ml: 0 }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
          alignItems: 'center', gap: 2
        }}>
          <Tooltip
            title={props.selectedStudents.length === 0 ?
              'Select at least one student number for downloading grades.' :
              hasPendingStudents() ?
                'Grades with status "PENDING" cannot be downloaded, ' +
                'unselect or calculate grades for these.' :
                'Download final course grades as a Sisu compatible CSV file.'
            }
            placement="top"
          >
            <span>
              <Button
                variant='outlined'
                color={hasPendingStudents() ? 'error' : 'primary'}
                onClick={(): void => {
                  if (!hasPendingStudents()) {
                    setShowSisuDialog(true);
                  }
                }}
                disabled={props.selectedStudents.length === 0}
              >
                Download Sisu CSV
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            title={props.selectedStudents.length === 0 ?
              'Select at least one student number for grade calculation.' :
              'Calculate course final grades for selected students.'
            }
            placement="top"
          >
            <span>
              <Button
                variant='outlined'
                onClick={(): Promise<void> => props.calculateFinalGrades()}
                disabled={props.selectedStudents.length === 0}
              >
                Calculate final grades
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            title="Download grading template with attainment tags and student numbers."
            placement="top"
          >
            <Button variant='outlined' onClick={(): Promise<void> => props.downloadCsvTemplate()}>
              Download CSV template
            </Button>
          </Tooltip>
          <Tooltip
            title="Upload grades from a CSV file."
            placement="top"
          >
            <Button variant='outlined' onClick={(): void => setShowFileDialog(true)}>
              Upload Grades
            </Button>
          </Tooltip>
          <MenuButton label='Import grades' options={actionOptions} />
          <SisuDownloadDialog
            open={showSisuDialog}
            handleClose={handleCloseSisuDialog}
            selectedStudents={props.selectedStudents}
          />
          <FileLoadDialog
            assessmentModelId={Number(assessmentModelId)}
            open={showFileDialog}
            handleClose={handleCloseFileDialog}
          />
        </Box>
      </Box>
    </Toolbar>
  );
}
