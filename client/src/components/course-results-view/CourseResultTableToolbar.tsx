// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import { Params, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import MenuButton, { MenuButtonOption } from '../course-view/MenuButton';
import FileLoadDialog from '../course-view/FileLoadDialog';
import SisuExportDialog from './SisuExportDialog';
import { State } from '../../types';

function CourseResultsTableToolbar(props: {
  search: string,
  setSearch: (search: string) => void,
  calculateFinalGrades: () => Promise<void>,
  downloadCsvTemplate: () => Promise<void>
}): JSX.Element {
  const { instanceId }: Params = useParams();

  const [showFileDialog, setShowFileDialog]: State<boolean> = useState(false);
  const [showSisuDialog, setShowSisuDialog]: State<boolean> = useState(false);

  const actionOptions: Array<MenuButtonOption> = [
    {
      description: 'Import from file',
      handleClick: () => setShowFileDialog(true)
    },
    {
      description: 'Import from A+',
      handleClick: () => {
        console.error('Importing from A+ is not implemented');
      }
    }
  ];

  function handleCloseFileDialog(): void {
    setShowFileDialog(false);
  }

  function handleCloseSisuDialog(): void {
    setShowSisuDialog(false);
  }

  return (
    <Toolbar
      sx={{
        mx: 1,
        pt: 2,
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
            onChange={({ target }) => props.setSearch(target.value)}
            InputLabelProps={{ shrink: true }}
            margin='normal'
          />
          <Tooltip title="Filter" >
            <IconButton size='large' sx={{ m: 1.5, mb: 1, mr: 0 }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download results" >
            <IconButton size='large' sx={{ m: 1, mt: 1.5, ml: 0 }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
          alignItems: 'center', gap: 2
        }}>
          <Button variant='outlined' onClick={() => setShowSisuDialog(true)}>
            Export to Sisu CSV
          </Button>
          <Button variant='outlined' onClick={() => props.calculateFinalGrades()}>
            Calculate final grades
          </Button>
          <Button variant='outlined' onClick={() => props.downloadCsvTemplate()}>
            Download CSV template
          </Button>
          <MenuButton label='Import grades' options={actionOptions} />
          <SisuExportDialog
            open={showSisuDialog}
            handleClose={handleCloseSisuDialog}
          />
          <FileLoadDialog
            instanceId={Number(instanceId)}
            open={showFileDialog}
            handleClose={handleCloseFileDialog}
          />
        </Box>
      </Box>
    </Toolbar>
  );
}

CourseResultsTableToolbar.propTypes = {
  search: PropTypes.string,
  setSearch: PropTypes.func,
  calculateFinalGrades: PropTypes.func,
  downloadCsvTemplate: PropTypes.func
};

export default CourseResultsTableToolbar;
