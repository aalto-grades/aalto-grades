// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

const Assignment = ({ assignment, attributes, handleAttributeChange, assignmentIndex }) => {

  const attributeTextFields = () => {
    return (
      attributes.map((attribute, attributeIndex) => (
        <TextField
          type='text'
          key={attribute}
          variant='standard' 
          label={attribute}
          InputLabelProps={{ shrink: true }}
          margin='normal'
          sx={{
            marginTop: 0,
            width: '100%'
          }}
          onChange={event => handleAttributeChange(assignmentIndex, attributeIndex, event)}
        />
      ))
    );
  };

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 2, 
      borderRadius: 2,
      px: 3,
      py: 1,
      width: 1,
      mx: 1.5,
      mb: 2
    }}>
      <Typography sx={{ fontWeight: 'bold', my: 1 }} align='left'>
        {assignment.name}
      </Typography>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gridTemplateRows: 'auto',
        columnGap: 3,
        rowGap: 1,
        mt: 2,
      }}>
        { attributeTextFields() }
      </Box>
    </Box>
  );
};

Assignment.propTypes = {
  assignment: PropTypes.object,
  attributes: PropTypes.array,
  handleAttributeChange: PropTypes.func,
  assignmentIndex: PropTypes.number
};

export default Assignment;