// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

const Assignment = ({ assignment }) => {

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 2, 
      borderRadius: 2,
      px: 3,
      py: 1,
      mb: 1
    }}>
      <p>hello {assignment.id}</p>
    </Box>
  );
};

Assignment.propTypes = {
  assignment: PropTypes.array,
};

export default Assignment;