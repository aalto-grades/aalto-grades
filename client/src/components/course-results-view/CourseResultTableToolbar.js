// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';

const CourseResultsTableToolbar = ({ search, setSearch }) => {

  return (
    <Toolbar
      sx={{
        mx: 1,
        pt: 2,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
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
          <IconButton size='large' sx={{ m: 1, mt: 1.5 }}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ alignSelf: 'flex-end',display: 'flex', lexDirection: 'column', }}>

        </Box>
      </Box>
    </Toolbar>
  );
};

CourseResultsTableToolbar.propTypes = {
  search: PropTypes.string,
  setSearch: PropTypes.func,
};

export default CourseResultsTableToolbar;