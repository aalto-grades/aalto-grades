// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import MenuButton from '../course-view/MenuButton';
import FileLoadDialog from '../course-view/FileLoadDialog';
import SisuExportDialog from './SisuExportDialog';

const CourseResultsTableToolbar = (
  { search, setSearch, calculateFinalGrades, updateGrades }
) => {
  let { instanceId } = useParams();

  const [showFileDialog, setShowFileDialog] = useState<any>(false);
  const [showSisuDialog, setShowSisuDialog] = useState<any>(false);

  const actionOptions = [
    { description: 'Import from file', handleClick: () => setShowFileDialog(true) },
    { description: 'Import from A+', handleClick: () => {} }
  ];

  const handleCloseFileDialog = () => {
    setShowFileDialog(false);
  };

  const handleCloseSisuDialog = () => {
    setShowSisuDialog(false);
  };

  return (
    <Toolbar
      sx={{
        mx: 1,
        pt: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' }}>
          <TextField
            size='small'
            type='strig'
            value={search}
            name='search'
            label='Search by Student Number'
            onChange={({ target }) => setSearch(target.value)}
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
          <Button variant='outlined' onClick={() => setShowSisuDialog(true)}>Export to Sisu CSV</Button>
          <Button variant='outlined' onClick={() => calculateFinalGrades()}>Calculate final grades</Button>
          <MenuButton label='Import grades' options={actionOptions} />
          <SisuExportDialog
            open={showSisuDialog}
            handleClose={handleCloseSisuDialog}
          />
          <FileLoadDialog
            instanceId={Number(instanceId)}
            open={showFileDialog}
            handleClose={handleCloseFileDialog}
            returnImportedGrades={updateGrades}
          />
        </Box>
      </Box>
    </Toolbar>
  );
};

CourseResultsTableToolbar.propTypes = {
  search: PropTypes.string,
  setSearch: PropTypes.func,
  calculateFinalGrades: PropTypes.func,
  updateGrades: PropTypes.func
};

export default CourseResultsTableToolbar;
