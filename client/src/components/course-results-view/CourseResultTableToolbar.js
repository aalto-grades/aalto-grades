// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';

const CourseResultsTableToolbar = ({ search, setSearch, calculateFinalGrades }) => {

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
            label='Search by Student ID'
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Button variant='outlined' onClick={() => calculateFinalGrades()}>Calculate final grades</Button>
        </Box>
      </Box>
    </Toolbar>
  );
};

CourseResultsTableToolbar.propTypes = {
  search: PropTypes.string,
  setSearch: PropTypes.func,
  calculateFinalGrades: PropTypes.func
};

export default CourseResultsTableToolbar;